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
export class Map extends React.Component<{ state: AppState }, {}> {


    componentDidMount() {
        _mapInitModel.InitCustomProjections();
        this.initMap();
        let state = this.props.state;
        if (state.embed)
            this.embed();

        // Handle direct JSON embed
        if (window.addEventListener) {
            window.addEventListener('message', function(e) {
                // TODO: verify JSON before
                state.embed = true;
                ShowLoading();
                LoadSavedMap(JSON.parse(e.data), state);
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
     * http:// stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js/21903119#21903119
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
        this.props.state.baseLayers = _mapInitModel.InitBaseMaps();
        this.props.state.activeBaseLayer = this.props.state.baseLayers[0];
        let props: L.MapOptions = {
            layers: (this.props.state.activeBaseLayer.layer as any),
            doubleClickZoom: false,
            //  fullscreenControl: true,
        };
        this.props.state.map = L.map('map', props).setView(this.props.state.mapStartingCenter, this.props.state.mapStartingZoom);
        this.props.state.map.doubleClickZoom.disable();
        this.props.state.map.on('contextmenu', function(e) { // disable context menu opening on right-click
            //  map.openTooltip('asd', (e as any).latlng );
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
