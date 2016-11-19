import * as React from 'react';
import { AppState, ImportWizardState, WelcomeScreenState, ColorMenuState, SymbolMenuState, FilterMenuState, LegendMenuState, LayerMenuState, ExportMenuState, ClusterMenuState, SaveState } from './stores/States';
import { Layer, ColorOptions, SymbolOptions, ClusterOptions, Header, LayerTypes } from './stores/Layer';
import { Legend } from './stores/Legend'
import { AppProps, MakeMapsData } from './stores/Main';
import { Map } from './ui_components/Map';
import { Locale } from './localizations/Locale';
import { Strings } from './localizations/Strings';
import { WelcomeScreen } from './ui_components/misc/WelcomeScreen';
import { LayerImportWizard } from './ui_components/import_wizard/LayerImportWizard';
import { MakeMapsMenu } from './ui_components/menu/Menu';
import { HideLoading, HideNotification } from './common_items/common';
import { ParseHeadersFromCSV, ParseCSVToGeoJSON, ParseToGeoJSON, SetGeoJSONTypes } from './models/FilePreProcessModel';
import { observer } from 'mobx-react';

let Modal = require('react-modal');

const state = new AppState();

@observer
export class MakeMaps extends React.Component<{ settings: AppProps }, {}>{

    componentWillMount() {
        let settings = this.props.settings;
        if (!settings.data) {

            let parameters = decodeURIComponent(window.location.search.substring(1)).split('&');
            for (let i of parameters) {
                if (i.indexOf('mapURL') > -1)
                    state.embed = true;
            }

        }
        if (settings.mapOptions) {
            state.mapStartingCenter = settings.mapOptions.mapCenter || [0, 0];
            state.mapStartingZoom = settings.mapOptions.zoomLevel || 2;
        }
        state.language = settings.viewOptions.language || Locale.getLanguage();
        //Hack - get all the string options visible in the IDE
        let strings: Strings = (Locale as any);
        state.strings = strings;
        state.welcomeShown = !this.props.settings.data;

        window.onload = function() {
            state.loaded = true;
        };

    }

    componentDidMount() {
        if (!this.props.settings.data) {

            if (!state.embed) {
                window.onpopstate = this.onBackButtonEvent.bind(this);
            }
        }
        else {
            this.loadData(null, this.props.settings.data)
        }
    }

    componentWillReceiveProps(newProps: AppProps) {
        //check diff
        if (newProps.data) {
            this.loadData(this.props.settings.data, newProps.data);
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
                removeData(old);
                addData(d);
            }
        }
        state.editingLayer = state.layers[state.layers.length - 1];
        state.legend = new Legend();
        state.menuShown = true;

        function addData(d: MakeMapsData) {
            let layer: Layer = new Layer(state);
            if (d.type == 'csv') {
                let index = 0, headers, delim;
                let res = ParseHeadersFromCSV(d.content);
                headers = res.headers;
                delim = res.delim;
                headers.map(function(h) { layer.headers.push({ id: index, value: h.name, label: h.name, type: h.type, decimalAccuracy: 0 }) });
                ParseCSVToGeoJSON(d.content, d.latName, d.lonName, delim, layer.headers,
                    function(geo) { layer.geoJSON = geo });
            }
            else if (d.type != 'geojson') {
                ParseToGeoJSON(d.content, d.type, function(geo) { layer.geoJSON = SetGeoJSONTypes(geo, layer.headers) });
            }
            else {
                layer.geoJSON = SetGeoJSONTypes(JSON.parse(d.content), layer.headers)
            }
            layer.id = d.id;
            layer.name = d.name;
            state.layers.push(layer);
            layer.init();
        }

        function removeData(d: MakeMapsData) {
            let layer: Layer = state.layers.filter(f => f.id == d.id)[0];
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

        state.welcomeShown = !this.props.settings.data;
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
                    {state.menuShown || this.props.settings.viewOptions.showMenu ?
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
