declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { AppState, ImportWizardState, SaveState } from '../stores/States';
import { Filter } from '../stores/Filter';
import { Layer, ColorOptions, SymbolOptions, ClusterOptions, IHeader, LayerTypes } from '../stores/Layer';
import { Legend } from '../stores/Legend';
import { LayerImportWizard } from './import_wizard/LayerImportWizard';
import { MakeMapsMenu } from './menu/Menu';
import { MapInitModel } from '../models/MapInitModel';
import { GetSymbolSize, LoadExternalMap } from '../common_items/common';
import { OnScreenFilter } from './misc/OnScreenFilter';
import { OnScreenLegend } from './misc/OnScreenLegend';
import { WelcomeScreen } from './misc/WelcomeScreen';
import 'leaflet';
import 'Leaflet.extra-markers';
import 'leaflet-fullscreen';
import 'leaflet.markercluster'

let Modal = require('react-modal');
let d3 = require('d3');
let chroma = require('chroma-js');
let heat = require('leaflet.heat');
let domToImage = require('dom-to-image');
let reactDOMServer = require('react-dom/server');
let _mapInitModel = new MapInitModel();
let _currentLayerId: number = 0;

let _parameters: string[];

L.Icon.Default.imagePath = 'app/images/leaflet-images';
@observer
export class MapMain extends React.Component<{ state: AppState }, {}>{


    componentWillMount() {
        let sPageURL = decodeURIComponent(window.location.search.substring(1));
        _parameters = sPageURL.split('&');

        if (this.getUrlParameter("mapFile") || this.getUrlParameter("mapURL") || this.getUrlParameter("mapGeoJSON"))
            this.props.state.embed = true;
    }

    componentDidMount() {
        _mapInitModel.InitCustomProjections();
        this.initMap();
        if (this.props.state.embed)
            this.embed();

    }

    /** Parse URL parameters and act accordingly */
    embed() {
        //Pure GeoJSON without styling as string
        let mapGeoJSON = this.getUrlParameter("mapGeoJSON");
        if (mapGeoJSON) {

            this.layerImportSubmit(new Layer(this.props.state).geoJSON = mapGeoJSON)
            return;
        }
        //URL to get a .makeMaps-file
        let mapURL = this.getUrlParameter("mapURL");
        if (mapURL) {

            LoadExternalMap(mapURL, this.loadSavedMap.bind(this));
            return;
        }

    }

    /**
     * Get URL parameter value
     *
     * http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js/21903119#21903119
     * @param  sParam   parameter to look for
     * @return false when not found, value when found
     */
    getUrlParameter(sParam: string) {
        var sParameterName, i;
        for (i = 0; i < _parameters.length; i++) {
            sParameterName = _parameters[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? false : sParameterName[1];
            }
        }
    };

    /**
     * initMap - Initializes the map with basic options
     */
    initMap() {
        this.props.state.baseLayers = _mapInitModel.InitBaseMaps();
        this.props.state.activeBaseLayer = this.props.state.baseLayers[0];
        let props = {
            layers: this.props.state.activeBaseLayer,
            fullscreenControl: true,
            worldCopyJump: true,
        };
        this.props.state.map = L.map('map', props).setView([0, 0], 2);

        this.props.state.map.doubleClickZoom.disable();
        this.props.state.map.on('contextmenu', function(e) { //disable context menu opening on right-click
            return;
        });
    }

    startLayerImport() {
        let state = this.props.state;
        state.importWizardState = new ImportWizardState(new Layer(state))
        state.importWizardShown = true;
        state.welcomeShown = false;
        state.menuShown = false;
    }

    cancelLayerImport() {
        this.props.state.importWizardShown = false;
        if (this.props.state.layers.length == 0)
            this.props.state.welcomeShown = true;
        else {
            this.props.state.menuShown = true;
            this.props.state.editingLayer = this.props.state.layers[0];
        }
    }

    /**
     * layerImportSubmit - Layer importing was completed -> draw to map
     */
    layerImportSubmit(l: Layer) {

        l.appState = this.props.state;
        l.id = _currentLayerId++;
        l.colorOptions.colorField = l.numberHeaders[0];
        l.colorOptions.useMultipleFillColors = true;
        l.getColors();
        l.refresh();
        this.props.state.layers.push(l);
        this.props.state.layerMenuState.order.push({ name: l.name, id: l.id });
        this.props.state.importWizardShown = false;
        this.props.state.editingLayer = l;
        this.props.state.menuShown = true;
        this.props.state.map.fitBounds(l.layerType === LayerTypes.HeatMap ? (l.displayLayer as any)._latlngs : l.displayLayer.getBounds()); //leaflet.heat doesn't utilize getBounds, so get it directly

    }
    /** changeLayerOrder - Redraws the layers in the order given */
    changeLayerOrder() {
        for (let i of this.props.state.layerMenuState.order) {
            let layer = this.props.state.layers.filter(lyr => lyr.id == i.id)[0];
            if (layer.displayLayer) {
                if (layer.layerType !== LayerTypes.HeatMap) {
                    (layer.displayLayer as any).bringToFront();

                }
                else {//for some reason this places the heat map to the top and will not come back down
                    this.props.state.map.removeLayer(layer.displayLayer);
                    this.props.state.map.addLayer(layer.displayLayer);

                }
            }
        }
    }

    /**
     * getFilters - Gets the currently active filters for rendering
     * @return  Filters in an array
     */
    getFilters() {
        let arr: JSX.Element[] = [];
        if (this.props.state.filters && this.props.state.filters.length > 0)
            for (let key in this.props.state.filters.slice()) {
                if (this.props.state.filters[key].show) { //if filter has been properly initialized
                    arr.push(<OnScreenFilter
                        state={this.props.state.filters[key]}
                        key={key} />);
                }
            }
        return arr;
    }


    showLegend() {
        if (this.props.state.legend && this.props.state.legend.visible) {
            return <OnScreenLegend
                state={this.props.state}/>

        }
    }

    saveImage() {
        let options = this.props.state.exportMenuState;
        function filter(node) {
            if (!node.className || !node.className.indexOf)
                return true;
            else
                return (node.className.indexOf('impromptu') === -1
                    && node.className.indexOf('leaflet-control') === -1
                    && (options.showLegend || (!options.showLegend && node.className.indexOf('legend') === -1))
                    && (options.showFilters || (!options.showFilters && node.className.indexOf('filter') === -1))
                );
        }
        domToImage.toBlob(document.getElementById('content'), { filter: filter })
            .then(function(blob) {
                (window as any).saveAs(blob, 'MakeMaps_map.png');
            });
    }

    saveFile() {
        let saveData: SaveState = {
            baseLayerId: this.props.state.activeBaseLayer.options.id,
            layers: this.props.state.layers,
            legend: this.props.state.legend,
            filters: this.props.state.filters,
        };
        saveData.layers = saveData.layers.slice();

        saveData.layers.forEach(function(e) { delete e.appState; delete e.displayLayer; delete e.values; });
        saveData.filters.forEach(function(e) { delete e.filterValues; delete e.filteredIndices; delete e.appState; });

        let blob = new Blob([JSON.stringify(saveData)], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'map.mmap');
    }

    loadSavedMap(saved: SaveState) {
        console.time("LoadSavedMap")
        let headers: IHeader[];
        if (saved.baseLayerId) {
            let oldBase = this.props.state.activeBaseLayer;
            let newBase: L.TileLayer;

            if (saved.baseLayerId !== oldBase.options.id) {
                newBase = this.props.state.baseLayers.filter(l => (l as any).options.id === saved.baseLayerId)[0];
                if (newBase) {
                    this.props.state.map.removeLayer(oldBase);
                    this.props.state.map.addLayer(newBase);
                    this.props.state.activeBaseLayer = newBase;
                }
            }
        }
        this.props.state.legend = new Legend(saved.legend);


        for (let i in saved.layers) {

            let lyr = saved.layers[i];
            let newLayer = new Layer(this.props.state);
            headers = [];
            for (let j in lyr.headers) {
                headers.push(new IHeader(lyr.headers[j]))
            }
            let popupHeaders: IHeader[] = [];
            for (let k in lyr.popupHeaders) {
                popupHeaders.push(getHeaderByValue(lyr.popupHeaders[k].value))
            }
            let chartFields: IHeader[] = [];
            for (let k in lyr.symbolOptions.chartFields) {
                chartFields.push(getHeaderByValue(lyr.popupHeaders[k].value))
            }
            newLayer.id = _currentLayerId++;
            newLayer.name = lyr.name
            newLayer.headers = headers;
            newLayer.popupHeaders = popupHeaders;
            newLayer.layerType = lyr.layerType;
            newLayer.geoJSON = lyr.geoJSON;
            newLayer.colorOptions = new ColorOptions(lyr.colorOptions);
            newLayer.colorOptions.colorField = lyr.colorOptions.colorField ? getHeaderByValue(lyr.colorOptions.colorField.value) : undefined;
            newLayer.symbolOptions = new SymbolOptions(lyr.symbolOptions);
            newLayer.symbolOptions.iconField = lyr.symbolOptions.iconField ? getHeaderByValue(lyr.symbolOptions.iconField.value) : undefined;
            newLayer.symbolOptions.sizeXVar = lyr.symbolOptions.sizeXVar ? getHeaderByValue(lyr.symbolOptions.sizeXVar.value) : undefined;
            newLayer.symbolOptions.sizeYVar = lyr.symbolOptions.sizeYVar ? getHeaderByValue(lyr.symbolOptions.sizeYVar.value) : undefined;
            newLayer.symbolOptions.chartFields = chartFields;
            newLayer.clusterOptions = new ClusterOptions(lyr.clusterOptions);
            this.props.state.layers.push(newLayer);

            this.props.state.layerMenuState.order.push({ name: newLayer.name, id: newLayer.id });
        }
        saved.filters.map(function(f) { this.props.state.filters.push(new Filter(this.props.state, f)) }, this)
        for (let i in this.props.state.layers.slice()) {
            let lyr = this.props.state.layers[i];
            lyr.refresh();
            this.props.state.map.fitBounds(lyr.layerType === LayerTypes.HeatMap ? (lyr.displayLayer as any)._latlngs : lyr.displayLayer.getBounds()); //leaflet.heat doesn't utilize getBounds, so get it directly
        }

        this.props.state.welcomeShown = false;
        this.props.state.editingLayer = this.props.state.layers[0];
        this.props.state.menuShown = !this.props.state.embed;
        console.timeEnd("LoadSavedMap")

        function getHeaderByValue(value: string) {
            return headers.filter(function(h) { return h.value == value })[0]
        }
    }



    render() {
        let modalStyle = {
            content: {
                border: '1px solid #cecece',
                borderRadius: '15px',
                padding: '0px',
            }
        }
        return (
            <div>
                <div id='map'/>
                {this.props.state.embed ? null :
                    <div>
                        <Modal
                            isOpen={this.props.state.welcomeShown}
                            style = {modalStyle}>
                            <WelcomeScreen
                                loadMap={this.loadSavedMap.bind(this)}
                                openLayerImport={this.startLayerImport.bind(this)}
                                />
                        </Modal>
                        {this.props.state.importWizardShown ?
                            <Modal
                                isOpen={this.props.state.importWizardShown}
                                style = {modalStyle}>
                                <LayerImportWizard
                                    state={this.props.state}
                                    submit={this.layerImportSubmit.bind(this)}
                                    cancel={this.cancelLayerImport.bind(this)}
                                    />
                            </Modal>
                            : null}
                        {this.props.state.menuShown ?
                            <MakeMapsMenu
                                state = {this.props.state}
                                addLayer = {this.startLayerImport.bind(this)}
                                changeLayerOrder ={this.changeLayerOrder.bind(this)}
                                saveImage ={this.saveImage}
                                saveFile = {this.saveFile.bind(this)}
                                />
                            : null}
                    </div>
                }
                {this.getFilters()}
                {this.showLegend()}
            </div>
        );
    }


};

var Map = MapMain;
const state = new AppState();
ReactDOM.render(
    <Map state={state}/>, document.getElementById('content')
);
