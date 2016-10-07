declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { AppState, ImportWizardState, WelcomeScreenState, ColorMenuState, SymbolMenuState, FilterMenuState, LegendMenuState, LayerMenuState, ExportMenuState, ClusterMenuState, SaveState } from '../stores/States';
import { Filter } from '../stores/Filter';
import { Layer, ColorOptions, SymbolOptions, ClusterOptions, Header, LayerTypes } from '../stores/Layer';
import { Legend } from '../stores/Legend';
import { LayerImportWizard } from './import_wizard/LayerImportWizard';
import { MakeMapsMenu } from './menu/Menu';
import { MapInitModel } from '../models/MapInitModel';
import { GetSymbolSize, LoadExternalMap, ShowLoading, HideLoading, ShowNotification, HideNotification } from '../common_items/common';
import { OnScreenFilter } from './misc/OnScreenFilter';
import { OnScreenLegend } from './misc/OnScreenLegend';
import { OnScreenInfoDisplay } from './misc/OnScreenInfoDisplay';
import { WelcomeScreen } from './misc/WelcomeScreen';
import { Strings } from '../localizations/strings';
import { locale } from '../localizations/locale';
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

@observer
export class MapMain extends React.Component<{ state: AppState }, {}>{


    componentWillMount() {
        let sPageURL = decodeURIComponent(window.location.search.substring(1));
        _parameters = sPageURL.split('&');
        if (this.getUrlParameter('mapURL') || this.getUrlParameter('mapJSON'))
            this.props.state.embed = true;
    }

    componentDidMount() {
        _mapInitModel.InitCustomProjections();
        this.initMap();
        if (!this.props.state.embed)
            window.onpopstate = this.onBackButtonEvent;
        else
            this.embed();

    }
    onBackButtonEvent = (e) => {
        if (!this.props.state.welcomeShown && !this.props.state.importWizardShown) {
            e.preventDefault();
            this.reset();
        }
    }
    /** Parse URL parameters and act accordingly */
    embed() {
        let mapJSON = this.getUrlParameter('mapJSON');
        if (mapJSON) {
            ShowLoading();
            this.loadSavedMap(JSON.parse(mapJSON))
            return;
        }

        //URL to get a .makeMaps-file
        let mapURL = this.getUrlParameter("mapURL");
        if (mapURL) {
            ShowLoading();
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
        var sParameterName: string[], i;
        for (i = 0; i < _parameters.length; i++) {
            sParameterName = _parameters[i].split('=');

            if (sParameterName[0] === sParam) {
                let value: string = '';
                for (let i = 1; i < sParameterName.length; i++) {
                    value += sParameterName[i];
                    if (i < sParameterName.length - 2) value += '=';
                }
                return sParameterName[1] === undefined ? '' : value;
            }
        }
    };

    /**
     * initMap - Initializes the map with basic options
     */
    initMap() {
        this.props.state.baseLayers = _mapInitModel.InitBaseMaps();
        this.props.state.activeBaseLayer = this.props.state.baseLayers[0];
        let props: L.MapOptions = {
            layers: (this.props.state.activeBaseLayer.layer as any),
            doubleClickZoom: false,
            // fullscreenControl: true,
        };
        let map = L.map('map', props).setView([0, 0], 2);

        map.doubleClickZoom.disable();
        map.on('contextmenu', function(e) { //disable context menu opening on right-click
            // map.openTooltip('asd', (e as any).latlng );
            return;
        });
        this.props.state.map = map;
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
        window.location.hash = 'edit';
        l.getValues()
        if (l.layerType !== LayerTypes.HeatMap && l.pointFeatureCount > 500) {
            ShowNotification(strings.clusterTogglePopup);
            l.clusterOptions.useClustering = true;
        }
        l.appState = this.props.state;
        l.id = _currentLayerId++;
        l.colorOptions.colorField = l.numberHeaders[0];
        l.colorOptions.useMultipleFillColors = true;
        l.getColors();
        setTimeout(function() { l.init }, 10);
        this.props.state.map.fitBounds(l.layerType === LayerTypes.HeatMap ? ((l.displayLayer as any)._latlngs as L.LatLngBounds) : l.displayLayer.getBounds(), {}); //leaflet.heat doesn't utilize getBounds, so get it directly
        this.props.state.layers.push(l);
        if (l.layerType === LayerTypes.HeatMap)
            this.props.state.layerMenuState.heatLayerOrder.push({ id: l.id });
        else
            this.props.state.layerMenuState.standardLayerOrder.push({ id: l.id });
        this.props.state.importWizardShown = false;
        this.props.state.editingLayer = l;
        this.props.state.menuShown = true;
        HideLoading();
    }
    /** changeLayerOrder - Redraws the layers in the order given */
    changeLayerOrder() {
        let index = 0;
        for (let i of this.props.state.layerMenuState.standardLayerOrder) {
            reAdd.call(this, i);
        }
        for (let i of this.props.state.layerMenuState.heatLayerOrder) {
            reAdd.call(this, i);
        }


        function reAdd(i: { name: string, id: number }) {
            let layer = this.props.state.layers.filter(lyr => lyr.id == i.id)[0];
            if (layer.displayLayer) {
                this.props.state.map.removeLayer(layer.displayLayer);
                this.props.state.map.addLayer(layer.displayLayer);
                layer.refreshFilters();
            }
            index++;
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
                        filter={this.props.state.filters[key]}
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
                return (node.className.indexOf('menu') === -1
                    && node.className.indexOf('leaflet-control-fullscreen') === -1
                    && node.className.indexOf('leaflet-control-zoom') === -1
                    && (options.showLegend || (!options.showLegend && node.className.indexOf('legend') === -1))
                    && (options.showFilters || (!options.showFilters && node.className.indexOf('filter') === -1))
                );
        }
        domToImage.toBlob(document.getElementById('content'), { filter: filter })
            .then(function(blob) {
                (window as any).saveAs(blob, 'MakeMaps_map.png');
            });
    }

    formSaveJSON() {
        let layers: Layer[] = [];
        for (let layer of this.props.state.layers) {
            layers.push(new Layer(this.props.state, layer))
        }
        let filters: Filter[] = [];
        for (let filter of this.props.state.filters) {
            filters.push(new Filter(this.props.state, filter))
        }
        let saveData: SaveState = {
            baseLayerId: this.props.state.activeBaseLayer.id,
            layers: layers,
            legend: new Legend(this.props.state.legend),
            filters: filters,
        };

        saveData.layers.forEach(function(e) {
            e['popupHeaderIds'] = [];
            e.popupHeaders.map(function(h) { e['popupHeaderIds'].push(h.id) });
            delete e.popupHeaders;
            if (e.colorOptions.colorField) {
                e.colorOptions['colorHeaderId'] = e.colorOptions.colorField.id;
                delete e.colorOptions.colorField;
            }
            if (e.symbolOptions.iconField) {
                e.symbolOptions['iconHeaderId'] = e.symbolOptions.iconField.id;
                delete e.symbolOptions.iconField;
            }
            if (e.symbolOptions.chartFields !== undefined) {
                e.symbolOptions['chartHeaderIds'] = [];
                e.symbolOptions.chartFields.map(function(h) { e.symbolOptions['chartHeaderIds'].push(h.id) });
                delete e.symbolOptions.chartFields;
            }
            if (e.symbolOptions.sizeXVar) {
                e.symbolOptions['xHeaderId'] = e.symbolOptions.sizeXVar.id;
                delete e.symbolOptions.sizeXVar;
            }
            if (e.symbolOptions.sizeYVar) {
                e.symbolOptions['yHeaderId'] = e.symbolOptions.sizeYVar.id;
                delete e.symbolOptions.sizeYVar;
            }
            if (e.symbolOptions.blockSizeVar) {
                e.symbolOptions['blockHeaderId'] = e.symbolOptions.blockSizeVar.id;
                delete e.symbolOptions.blockSizeVar;
            }
            if (e.symbolOptions.icons.length == 0) {
                delete e.symbolOptions.icons;
                delete e.symbolOptions.iconLimits;
            }
            if (e.colorOptions.colors.length == 0) {
                delete e.colorOptions.colors;
                delete e.colorOptions.steps;
            }
            delete e.appState; delete e.displayLayer; delete e.values; delete e.uniqueValues; delete e.pointFeatureCount;;
        });
        saveData.filters.forEach(function(e) {
            if (e.fieldToFilter) {
                e['filterHeaderId'] = e.fieldToFilter.id;
                delete e.fieldToFilter;
            }
            delete e.filterValues; delete e.filteredIndices; delete e.appState;
        });
        return saveData;
    }

    saveFile() {

        let saveString = JSON.stringify(this.formSaveJSON());
        let blob = new Blob([saveString], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'map.mmap');
    }

    saveEmbedCode() {
        let script = '<script type="text/javascript">function setSource(){var json =' + JSON.stringify(this.formSaveJSON()) + '; var frame =	document.getElementById("MakeMapsEmbed"); if (!frame.src || frame.src=="") frame.src = "https://makemaps.online?mapJSON="+encodeURIComponent(JSON.stringify(json));}</script>';
        let frame = '<iframe onLoad="setSource()"  id="MakeMapsEmbed" style="height: 100%; width: 100%; border:none;"/>';

        let html = script + frame;

        let blob = new Blob([html], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'MakeMaps_embed.html');
    }

    loadSavedMap(saved: SaveState) {
        window.location.hash = 'edit';
        console.time("LoadSavedMap")
        let headers: Header[];
        if (saved.baseLayerId) {
            let oldBase = this.props.state.activeBaseLayer;

            if (saved.baseLayerId !== oldBase.id) {
                let newBase = { id: saved.baseLayerId, layer: this.props.state.baseLayers.filter(l => l.id === saved.baseLayerId)[0].layer };
                if (newBase) {
                    this.props.state.map.removeLayer(oldBase.layer);
                    this.props.state.map.addLayer(newBase.layer);
                    this.props.state.activeBaseLayer = newBase;
                }
            }
        }

        for (let lyr of saved.layers) {
            let newLayer = new Layer(this.props.state, lyr);
            newLayer.headers = [];
            for (let j of lyr.headers) {
                newLayer.headers.push(new Header(j));
            }
            newLayer.colorOptions.colorField = newLayer.getHeaderById(lyr.colorOptions['colorHeaderId']);
            newLayer.symbolOptions.iconField = newLayer.getHeaderById(lyr.symbolOptions['iconHeaderId']);
            newLayer.symbolOptions.blockSizeVar = newLayer.getHeaderById(lyr.symbolOptions['blockHeaderId']);
            newLayer.symbolOptions.sizeXVar = newLayer.getHeaderById(lyr.symbolOptions['xHeaderId']);
            newLayer.symbolOptions.sizeYVar = newLayer.getHeaderById(lyr.symbolOptions['yHeaderId']);
            this.props.state.layers.push(newLayer);
            if (newLayer.layerType === LayerTypes.HeatMap)
                this.props.state.layerMenuState.heatLayerOrder.push({ id: newLayer.id });
            else
                this.props.state.layerMenuState.standardLayerOrder.push({ id: newLayer.id });
            _currentLayerId = Math.max(_currentLayerId, lyr.id);
        }
        _currentLayerId++;
        let layers = this.props.state.layers;
        saved.filters.map(function(f) {
            let filter = new Filter(this.props.state, f);
            filter.fieldToFilter = layers.filter(function(f) { return f.id == filter.layerId })[0].getHeaderById(f['filterHeaderId']); //fetch correct header to refer
            this.props.state.filters.push(filter);
        }, this)
        for (let i in this.props.state.layers.slice()) {
            let lyr = this.props.state.layers[i];
            setTimeout(function() { lyr.init(); }, 10);
        }
        this.props.state.legend = new Legend(saved.legend);

        this.props.state.welcomeShown = false;
        this.props.state.editingLayer = this.props.state.layers[0];
        this.props.state.menuShown = !this.props.state.embed;
        console.timeEnd("LoadSavedMap")
    }


    reset() {
        let state = this.props.state;
        for (let l of state.layers) {
            state.map.removeLayer(l.displayLayer);
        }
        state.menuShown = false;
        state.layers = [];
        state.filters = [];
        state.legend.visible = false;
        state.legend = null;
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
        state.welcomeShown = true;
    }

    changeLanguage(lang: string) {
        locale.setLanguage(lang);
        this.props.state.language = lang;
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
        return (
            <div>
                <div id='map'>
                    {this.getFilters()}
                    {this.showLegend()}
                    <OnScreenInfoDisplay
                        state = {this.props.state}/>
                </div>
                {this.props.state.embed ? null :
                    <div>
                        <Modal
                            isOpen={this.props.state.welcomeShown}
                            style = {modalStyle}>
                            <WelcomeScreen
                                strings = {this.props.state.strings}
                                state={this.props.state.welcomeScreenState}
                                loadMap={this.loadSavedMap.bind(this)}
                                openLayerImport={this.startLayerImport.bind(this)}
                                changeLanguage ={this.changeLanguage.bind(this)}
                                language={this.props.state.language}
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
                                saveImage ={this.saveImage.bind(this)}
                                saveFile = {this.saveFile.bind(this)}
                                saveEmbedCode = {this.saveEmbedCode.bind(this)}
                                />
                            : null}
                    </div>
                }

                <div className='notification' id='loading'>
                    <span style={{ lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}>{this.props.state.strings.loading}</span>
                    <div className="sk-double-bounce">
                        <div className="sk-child sk-double-bounce1"></div>
                        <div className="sk-child sk-double-bounce2"></div>
                    </div>
                </div>
                <div className='notification' id='notification'>
                    <span id='notificationText' style={{ lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}>{this.props.state.strings.notification}</span>
                    <br/>
                    <button className='menuButton' onClick={() => { HideNotification() } }>Ok</button>
                </div>
            </div>
        );
    }


};

var Map = MapMain;
const state = new AppState();
state.language = locale.getLanguage();
//Hack - get all the string options visible in the IDE
let strings: Strings = (locale as any);
state.strings = strings;
ReactDOM.render(
    <Map state={state}/>, document.getElementById('content')
);
