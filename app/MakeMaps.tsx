import * as React from 'react';
import { AppState, ImportWizardState, WelcomeScreenState, ColorMenuState, SymbolMenuState, FilterMenuState, LegendMenuState, LayerMenuState, ExportMenuState, ClusterMenuState, SaveState } from './stores/States';
import { Layer, ColorOptions, SymbolOptions, ClusterOptions, Header, LayerTypes } from './stores/Layer';
import { Legend } from './stores/Legend'
import { MakeMapsData, MapOptions, ViewOptions } from './stores/Main';
import { Map } from './ui_components/Map';
import { Locale } from './localizations/Locale';
import { Strings } from './localizations/Strings';
import { WelcomeScreen } from './ui_components/misc/WelcomeScreen';
import { LayerImportWizard } from './ui_components/import_wizard/LayerImportWizard';
import { MakeMapsMenu } from './ui_components/menu/Menu';
import { HideLoading, HideNotification } from './common_items/common';
import { ParseHeadersFromCSV, ParseCSVToGeoJSON, ParseTableToGeoJSON, ParseToGeoJSON, SetGeoJSONTypes } from './models/FilePreProcessModel';
import { observer } from 'mobx-react';

let Modal = require('react-modal');

const state = new AppState();

@observer
export class MakeMaps extends React.Component<{ data: MakeMapsData[], viewOptions: ViewOptions, mapOptions: MapOptions }, {}>{

    componentWillMount() {
        if (!this.props.data) {

            let parameters = decodeURIComponent(window.location.search.substring(1)).split('&');
            for (let i of parameters) {
                if (i.indexOf('mapURL') > -1)
                    state.embed = true;
            }

        }
        if (!this.props.viewOptions)
            this.props.viewOptions = new ViewOptions(); //init with defaults
        if (!this.props.mapOptions)
            this.props.mapOptions = new MapOptions(); //init with defaults

        state.mapStartingCenter = this.props.mapOptions.mapCenter || [0, 0];
        state.mapStartingZoom = this.props.mapOptions.zoomLevel || 2;

        state.language = this.props.viewOptions.language || Locale.getLanguage();
        //Hack - get all the string options visible in the IDE
        let strings: Strings = (Locale as any);
        state.strings = strings;
        state.welcomeShown = this.props.viewOptions.showWelcomeScreen && !this.props.data;

        window.onload = function() {
            state.loaded = true;
        };

    }

    componentDidMount() {
        if (!this.props.data && !state.embed) {
            window.onpopstate = this.onBackButtonEvent.bind(this);
        }
        if (this.props.mapOptions.baseMapName && state.activeBaseLayer.id != this.props.mapOptions.baseMapName) {
            state.map.removeLayer(state.activeBaseLayer.layer);
            state.baseLayers.filter(f => f.id == this.props.mapOptions.baseMapName)[0].layer
            state.activeBaseLayer = { id: this.props.mapOptions.baseMapName, layer: state.baseLayers.filter(f => f.id == this.props.mapOptions.baseMapName)[0].layer };
            state.map.addLayer(state.activeBaseLayer.layer);
        }
        if (this.props.data) {
            this.loadData(null, this.props.data)
        }
    }

    componentWillReceiveProps(newProps: { data: MakeMapsData[], mapOptions: MapOptions, viewOptions: ViewOptions }) {
        if (newProps.data && JSON.stringify(newProps.data) !== JSON.stringify(this.props.data)) {
            this.loadData(this.props.data, newProps.data);
        }
        if (state.map) {
            if (newProps.mapOptions.mapCenter && !!newProps.mapOptions.zoomLevel)
                state.map.setView(newProps.mapOptions.mapCenter, newProps.mapOptions.zoomLevel)
        }
        if (JSON.stringify(newProps.viewOptions) !== JSON.stringify(this.props.viewOptions)) {
            state.menuShown = newProps.viewOptions.showMenu;
            state.language = newProps.viewOptions.language;
        }
        if (this.props.mapOptions.baseMapName && state.activeBaseLayer.id != this.props.mapOptions.baseMapName) {
            state.map.removeLayer(state.activeBaseLayer.layer);
            state.activeBaseLayer = { id: this.props.mapOptions.baseMapName, layer: state.baseLayers.filter(f => f.id == this.props.mapOptions.baseMapName)[0].layer };
            state.map.addLayer(state.activeBaseLayer.layer);
        }
    }

    /** Load data from parent system based on props     */
    loadData(oldData: MakeMapsData[], newData: MakeMapsData[]) {
        for (let d of newData) {
            let old = oldData ? oldData.filter(f => f.id == d.id)[0] : null;
            if (!old) {
                addData(d);
            }
            if (old && hasDifferentData(old, d)) {
                refreshData(d);
            }
        }
        if (oldData) { //remove layers no longer in newData
            let oldIds = oldData.map(d => d.id);
            let newIds = newData.map(d => d.id);
            for (let id of oldIds) {
                if (newIds.indexOf(id) == -1)
                    removeData(id);
            }
        }
        state.editingLayer = state.layers[state.layers.length - 1];
        state.legend = new Legend();
        state.menuShown = true;

        function getGeoJSONFromData(d: MakeMapsData, layer: Layer) {
            if (d.type == 'csv') {
                let index = 0, headers, delim;
                let res = ParseHeadersFromCSV(d.content);
                headers = res.headers;
                delim = res.delim;
                headers.map(function(h) { layer.headers.push({ id: index, value: h.name, label: h.name, type: h.type, decimalAccuracy: 0 }) });
                ParseCSVToGeoJSON(d.content, d.latName, d.lonName, delim, layer.headers,
                    function(geo) { layer.geoJSON = geo });
            }
            else if (d.type == 'general') {
                ParseTableToGeoJSON(d.data ? d.data : JSON.parse(d.content), function(geo) { layer.geoJSON = SetGeoJSONTypes(geo, layer.headers) });
            }
            else if (d.type != 'geojson') {
                ParseToGeoJSON(d.content, d.type, function(geo) { layer.geoJSON = SetGeoJSONTypes(geo, layer.headers) });
            }
            else {
                layer.geoJSON = SetGeoJSONTypes(d.data ? d.data : JSON.parse(d.content), layer.headers)
            }
        }

        function addData(d: MakeMapsData) {
            let layer: Layer = new Layer(state);
            getGeoJSONFromData(d, layer);
            layer.id = d.id;
            layer.name = d.name;
            state.layers.push(layer);
            layer.init();
        }

        function refreshData(d: MakeMapsData) {
            let layer: Layer = state.layers.filter(f => f.id == d.id)[0];
            layer.values = {};
            let oldHeaders = layer.headers;
            layer.headers = [];
            getGeoJSONFromData(d, layer);
            for (let newHeader of layer.headers) {
                newHeader.id = oldHeaders.filter(h => h.value == newHeader.value)[0].id;
            }

            let filters = state.filters.filter(f => { return f.layerId == layer.id && layer.headers.map(h => h.id).indexOf(f.filterHeaderId) == -1 })//filters from fields that have been removed
            for (let filter of filters) {
                filter.show = false;
                state.filters.splice(state.filters.indexOf(filter), 1); //remove from filters
            }

            layer.reDraw();

            for (let filter of state.filters) {
                if (filter.useDistinctValues) { //refresh distinct values
                    let lyr = state.layers.filter(l => l.id == filter.layerId)[0];
                    filter.steps = [];
                    let header = lyr.headers.filter(h => h.id == filter.filterHeaderId)[0]
                    let values = lyr.uniqueValues[header.value];
                    if (header.type == 'string') {
                        filter.categories = values;
                        break;
                    }
                    for (let i = 0; i < values.length - 1; i++) {
                        let step: [number, number] = [values[i], values[i + 1] - 1];
                        filter.steps.push(step);
                    }
                }
            }
        }

        function removeData(id: number) {
            let layer: Layer = state.layers.filter(f => f.id == id)[0];
            if (layer) {
                state.map.removeLayer(layer.displayLayer);
                state.layers.splice(state.layers.indexOf(layer), 1);
                if (state.editingLayer == layer)
                    state.editingLayer = state.layers[0] || null;
                let filters = state.filters.filter(f => f.layerId = layer.id);
                for (let filter of filters) {
                    filter.show = false;
                    state.filters.splice(state.filters.indexOf(filter), 1);
                }
            }

        }

        function hasDifferentData(oldData: MakeMapsData, newData: MakeMapsData) {
            return oldData.name !== newData.name ||
                oldData.type !== newData.type ||
                oldData.content !== newData.content ||
                oldData.data !== newData.data ||
                oldData.columns !== newData.columns ||
                oldData.projection !== newData.projection ||
                oldData.latName !== newData.latName ||
                oldData.lonName !== newData.lonName;
        }
    }

    changeLanguage(lang: string) {
        Locale.setLanguage(lang);
        state.language = lang;
    }

    reset() {
        for (let layer of state.layers) {
            state.map.removeLayer(layer.displayLayer);
        }
        for (let filter of state.filters) {
            filter.show = false;
        }
        state.menuShown = false;
        state.layers = [];
        state.filters = [];
        if (state.legend) {
            state.legend.visible = false;
            state.legend = null;
        }
        state.welcomeScreenState = new WelcomeScreenState();
        state.colorMenuState = new ColorMenuState();
        state.symbolMenuState = new SymbolMenuState();
        state.filterMenuState = new FilterMenuState();
        state.legendMenuState = new LegendMenuState();
        state.layerMenuState = new LayerMenuState();
        state.exportMenuState = new ExportMenuState();
        state.clusterMenuState = new ClusterMenuState();
        state.editingLayer = undefined;
        state.importWizardShown = false;

        state.welcomeShown = this.props.viewOptions.showWelcomeScreen && !this.props.data;
        state.currentLayerId = 0;
        state.standardLayerOrder = [];
        state.heatLayerOrder = [];
    }
    onBackButtonEvent(e) {
        if (!state.welcomeShown && !state.importWizardShown) {
            e.preventDefault();
            this.reset();
        }
    }

    render() {
        let modalStyle = {
            content: {
                border: '1px solid #cecece',
                borderRadius: '15px',
                padding: '0px',
                maxWidth: 1900,
            }
        }
        return <div>
            <Map state={state} />
            {!state.loaded || state.embed ? null :
                <div>
                    <Modal
                        isOpen={state.welcomeShown}
                        style={modalStyle}>
                        <WelcomeScreen
                            state={state.welcomeScreenState}
                            appState={state}
                            changeLanguage={this.changeLanguage.bind(this)}
                            />
                    </Modal>
                    {state.importWizardShown ?
                        <Modal
                            isOpen={state.importWizardShown}
                            style={modalStyle}>
                            <LayerImportWizard state={state} />
                        </Modal>
                        : null}
                    {state.menuShown || this.props.viewOptions.showMenu ?
                        <MakeMapsMenu state={state} />
                        : null}
                </div>
            }

            <div className='notification' id='loading'>
                <span style={{ lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}>{state.strings.loading}</span>
                <div className="sk-double-bounce">
                    <div className="sk-child sk-double-bounce1"></div>
                    <div className="sk-child sk-double-bounce2"></div>
                </div>
            </div>
            <div className='notification' id='notification'>
                <span id='notificationText' style={{ lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}>{state.strings.notification}</span>
                <br />
                <button className='menuButton' onClick={() => { HideNotification() } }>Ok</button>
            </div>
        </div>
    }
}
