declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { AppState } from '../stores/States';
import { Filter } from '../stores/Filter';
import { Layer, ColorOptions, SymbolOptions, ClusterOptions, Header, LayerTypes } from '../stores/Layer';
import { Legend } from '../stores/Legend';

import { MapInitModel } from '../models/MapInitModel';
import { FetchSavedMap, LoadSavedMap, ShowLoading, HideLoading, ShowNotification, HideNotification } from '../common_items/common';
import { OnScreenFilter } from './misc/OnScreenFilter';
import { OnScreenLegend } from './misc/OnScreenLegend';
import { OnScreenInfoDisplay } from './misc/OnScreenInfoDisplay';
import 'leaflet';
import 'Leaflet.extra-markers';
import 'leaflet-fullscreen';
import 'leaflet.markercluster';
let d3 = require('d3');
let chroma = require('chroma-js');
let heat = require('leaflet.heat');
let reactDOMServer = require('react-dom/server');
let _mapInitModel = new MapInitModel();
require('../../styles/leaflet.css');
require('../../styles/leaflet.extra-markers.css');
require('../../styles/MarkerCluster.css');


@observer
export class Map extends React.Component<{ state: AppState, onDoubleClick: (layerId: number | null, featureId: number | null, geoJSON) => void }, {}> {


    componentDidMount() {
        _mapInitModel.InitCustomProjections();
        this.initMap();
        let state = this.props.state;
        if (state.embed)
            this.embed();

        // Handle direct JSON embed
        if (window.addEventListener) {
            window.addEventListener('message', function(e) {
                let json = null;
                try{
                    json = JSON.parse(e.data);
                }catch (e){
                    console.log('Error loading data to JSON, data was: ' + e.data);
                }
                if (json != null){
                    state.embed = true;
                    ShowLoading();
                    LoadSavedMap(json, state);
                }
            }, false);
        }
        //   else if ( window.attachEvent ) { //  ie8
        //      window.attachEvent('onmessage', handleMessage);
        //  }
    }

    /** Parse URL parameters and act accordingly */
    embed() {
        let parameters = decodeURIComponent(window.location.search.substring(1)).split('&');
        if (this.getUrlParameter('mapURL', parameters))
            this.props.state.embed = true;

        // URL to get a .makeMaps-file
        let mapURL = this.getUrlParameter('mapURL', parameters);
        if (mapURL) {
            ShowLoading();
            FetchSavedMap(mapURL, this.props.state);
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
    getUrlParameter(sParam: string, parameters: string[]) {
        let sParameterName: string[], i;
        for (i = 0; i < parameters.length; i++) {
            sParameterName = parameters[i].split('=');

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
        let state = this.props.state;
        state.baseLayers = _mapInitModel.InitBaseMaps();
        state.activeBaseLayer = state.baseLayers[0];
        let props: L.MapOptions = {
            layers: (state.activeBaseLayer.layer as any),
            //  fullscreenControl: true,
        };
        state.map = L.map('map', props).setView(state.mapStartingCenter, state.mapStartingZoom);
        state.map.doubleClickZoom.disable();
        state.map.on('contextmenu', function(e) { // disable context menu opening on right-click
            //  map.openTooltip('asd', (e as any).latlng );
            return;
        });
        let onDoubleClick = this.props.onDoubleClick;
        state.map.on('dblclick', function(e) { // disable context menu opening on right-click
            if (onDoubleClick) {
                let feature = state.mouseOverFeature;
                let geoJSON = feature ? feature.featureGeoJSON : { type: 'Feature', geometry: { type: 'Point', coordinates: [(e as any).latlng.lng, (e as any).latlng.lat] }, properties: {} };
                if (feature && geoJSON)
                    onDoubleClick(feature.layerId, feature.featureId, geoJSON);
            }
            return;
        });
    }



    /**
     * getFilters - Gets the currently active filters for rendering
     * @return  Filters in an array
     */
    renderFilters() {
        let arr: JSX.Element[] = [];
        if (this.props.state.filters && this.props.state.filters.length > 0)
            for (let key in this.props.state.filters.slice()) {
                if (this.props.state.filters[key].show) { // if filter has been properly initialized
                    arr.push(<OnScreenFilter
                        state={this.props.state}
                        filter={this.props.state.filters[key]}
                        key={key} />);
                }
            }
        return arr;
    }


    renderLegend() {
        if (this.props.state.legend && this.props.state.legend.visible) {
            return <OnScreenLegend
                state={this.props.state} />;

        }
    }

    render() {

        return (
            <div>
                <div id='map'>
                    {this.renderFilters()}
                    {this.renderLegend()}
                    <OnScreenInfoDisplay
                        state={this.props.state} />
                </div>

            </div>
        );
    }


};
