"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var React = require('react');
var mobx_react_1 = require('mobx-react');
var MapInitModel_1 = require('../models/MapInitModel');
var common_1 = require('../common_items/common');
var OnScreenFilter_1 = require('./misc/OnScreenFilter');
var OnScreenLegend_1 = require('./misc/OnScreenLegend');
var OnScreenInfoDisplay_1 = require('./misc/OnScreenInfoDisplay');
require('leaflet');
require('Leaflet.extra-markers');
require('leaflet-fullscreen');
require('leaflet.markercluster');
var d3 = require('d3');
var chroma = require('chroma-js');
var heat = require('leaflet.heat');
var reactDOMServer = require('react-dom/server');
var _mapInitModel = new MapInitModel_1.MapInitModel();
var Map = (function (_super) {
    __extends(Map, _super);
    function Map() {
        _super.apply(this, arguments);
    }
    Map.prototype.componentDidMount = function () {
        _mapInitModel.InitCustomProjections();
        this.initMap();
        var state = this.props.state;
        if (state.embed)
            this.embed();
        if (window.addEventListener) {
            window.addEventListener('message', function (e) {
                state.embed = true;
                common_1.ShowLoading();
                common_1.LoadSavedMap(JSON.parse(e.data), state);
            }, false);
        }
    };
    Map.prototype.embed = function () {
        var parameters = decodeURIComponent(window.location.search.substring(1)).split('&');
        if (this.getUrlParameter('mapURL', parameters))
            this.props.state.embed = true;
        var mapURL = this.getUrlParameter("mapURL", parameters);
        if (mapURL) {
            common_1.ShowLoading();
            common_1.FetchSavedMap(mapURL, this.props.state);
            return;
        }
    };
    Map.prototype.getUrlParameter = function (sParam, parameters) {
        var sParameterName, i;
        for (i = 0; i < parameters.length; i++) {
            sParameterName = parameters[i].split('=');
            if (sParameterName[0] === sParam) {
                var value = '';
                for (var i_1 = 1; i_1 < sParameterName.length; i_1++) {
                    value += sParameterName[i_1];
                    if (i_1 < sParameterName.length - 2)
                        value += '=';
                }
                return sParameterName[1] === undefined ? '' : value;
            }
        }
    };
    ;
    Map.prototype.initMap = function () {
        this.props.state.baseLayers = _mapInitModel.InitBaseMaps();
        this.props.state.activeBaseLayer = this.props.state.baseLayers[0];
        var props = {
            layers: this.props.state.activeBaseLayer.layer,
            doubleClickZoom: false,
        };
        this.props.state.map = L.map('map', props).setView(this.props.state.mapStartingCenter, this.props.state.mapStartingZoom);
        this.props.state.map.doubleClickZoom.disable();
        this.props.state.map.on('contextmenu', function (e) {
            return;
        });
    };
    Map.prototype.renderFilters = function () {
        var arr = [];
        if (this.props.state.filters && this.props.state.filters.length > 0)
            for (var key in this.props.state.filters.slice()) {
                if (this.props.state.filters[key].show) {
                    arr.push(React.createElement(OnScreenFilter_1.OnScreenFilter, {state: this.props.state, filter: this.props.state.filters[key], key: key}));
                }
            }
        return arr;
    };
    Map.prototype.renderLegend = function () {
        if (this.props.state.legend && this.props.state.legend.visible) {
            return React.createElement(OnScreenLegend_1.OnScreenLegend, {state: this.props.state});
        }
    };
    Map.prototype.render = function () {
        return (React.createElement("div", null, 
            React.createElement("div", {id: 'map'}, 
                this.renderFilters(), 
                this.renderLegend(), 
                React.createElement(OnScreenInfoDisplay_1.OnScreenInfoDisplay, {state: this.props.state}))
        ));
    };
    Map = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], Map);
    return Map;
}(React.Component));
exports.Map = Map;
;
