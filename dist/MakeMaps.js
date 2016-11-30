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
var States_1 = require('./stores/States');
var Layer_1 = require('./stores/Layer');
var Legend_1 = require('./stores/Legend');
var Main_1 = require('./stores/Main');
var Map_1 = require('./ui_components/Map');
var Locale_1 = require('./localizations/Locale');
var WelcomeScreen_1 = require('./ui_components/misc/WelcomeScreen');
var LayerImportWizard_1 = require('./ui_components/import_wizard/LayerImportWizard');
var Menu_1 = require('./ui_components/menu/Menu');
var common_1 = require('./common_items/common');
var FilePreProcessModel_1 = require('./models/FilePreProcessModel');
var mobx_react_1 = require('mobx-react');
require('../styles/font_awesome/font-awesome.min.css');
require('../styles/fonts/DejaVuSans-Book.css');
require('../styles/fonts/DejaVuSans-ExtraLight.css');
require('../styles/makeMaps_components.css');
require('../styles/react-select.css');
require('../styles/2-double-bounce.css');
var Modal = require('react-modal');
var state = new States_1.AppState();
var MakeMaps = (function (_super) {
    __extends(MakeMaps, _super);
    function MakeMaps() {
        _super.apply(this, arguments);
    }
    MakeMaps.prototype.componentWillMount = function () {
        if (!this.props.data) {
            var parameters = decodeURIComponent(window.location.search.substring(1)).split('&');
            for (var _i = 0, parameters_1 = parameters; _i < parameters_1.length; _i++) {
                var i = parameters_1[_i];
                if (i.indexOf('mapURL') > -1)
                    state.embed = true;
            }
        }
        if (!this.props.viewOptions)
            this.props.viewOptions = new Main_1.ViewOptions();
        if (!this.props.mapOptions)
            this.props.mapOptions = new Main_1.MapOptions();
        state.mapStartingCenter = this.props.mapOptions.mapCenter || [0, 0];
        state.mapStartingZoom = this.props.mapOptions.zoomLevel || 2;
        state.language = this.props.viewOptions.language || Locale_1.Locale.getLanguage();
        var strings = Locale_1.Locale;
        state.strings = strings;
        state.welcomeShown = this.props.viewOptions.showWelcomeScreen && !this.props.data;
        window.onload = function () {
            state.loaded = true;
        };
    };
    MakeMaps.prototype.componentDidMount = function () {
        var _this = this;
        if (!this.props.data && !state.embed) {
            window.onpopstate = this.onBackButtonEvent.bind(this);
        }
        if (this.props.mapOptions.baseMapName && state.activeBaseLayer.id != this.props.mapOptions.baseMapName) {
            state.map.removeLayer(state.activeBaseLayer.layer);
            state.baseLayers.filter(function (f) { return f.id == _this.props.mapOptions.baseMapName; })[0].layer;
            state.activeBaseLayer = { id: this.props.mapOptions.baseMapName, layer: state.baseLayers.filter(function (f) { return f.id == _this.props.mapOptions.baseMapName; })[0].layer };
            state.map.addLayer(state.activeBaseLayer.layer);
        }
        if (this.props.data) {
            this.loadData(null, this.props.data);
        }
    };
    MakeMaps.prototype.componentWillReceiveProps = function (newProps) {
        var _this = this;
        if (newProps.data && JSON.stringify(newProps.data) !== JSON.stringify(this.props.data)) {
            this.loadData(this.props.data, newProps.data);
        }
        if (state.map) {
            if (newProps.mapOptions.mapCenter && !!newProps.mapOptions.zoomLevel)
                state.map.setView(newProps.mapOptions.mapCenter, newProps.mapOptions.zoomLevel);
        }
        if (JSON.stringify(newProps.viewOptions) !== JSON.stringify(this.props.viewOptions)) {
            state.menuShown = newProps.viewOptions.showMenu;
            state.language = newProps.viewOptions.language;
        }
        if (this.props.mapOptions.baseMapName && state.activeBaseLayer.id != this.props.mapOptions.baseMapName) {
            state.map.removeLayer(state.activeBaseLayer.layer);
            state.activeBaseLayer = { id: this.props.mapOptions.baseMapName, layer: state.baseLayers.filter(function (f) { return f.id == _this.props.mapOptions.baseMapName; })[0].layer };
            state.map.addLayer(state.activeBaseLayer.layer);
        }
    };
    MakeMaps.prototype.loadData = function (oldData, newData) {
        var _loop_1 = function(d) {
            var old = oldData ? oldData.filter(function (f) { return f.id == d.id; })[0] : null;
            if (!old) {
                addData(d);
            }
            if (old && hasDifferentData(old, d)) {
                refreshData(d);
            }
        };
        for (var _i = 0, newData_1 = newData; _i < newData_1.length; _i++) {
            var d = newData_1[_i];
            _loop_1(d);
        }
        if (oldData) {
            var oldIds = oldData.map(function (d) { return d.id; });
            var newIds = newData.map(function (d) { return d.id; });
            for (var _a = 0, oldIds_1 = oldIds; _a < oldIds_1.length; _a++) {
                var id = oldIds_1[_a];
                if (newIds.indexOf(id) == -1)
                    removeData(id);
            }
        }
        state.editingLayer = state.layers[state.layers.length - 1];
        state.legend = new Legend_1.Legend();
        state.menuShown = true;
        function getGeoJSONFromData(d, layer) {
            if (d.type == 'csv') {
                var index_1 = 0, headers = void 0, delim = void 0;
                var res = FilePreProcessModel_1.ParseHeadersFromCSV(d.content);
                headers = res.headers;
                delim = res.delim;
                headers.map(function (h) { layer.headers.push({ id: index_1, value: h.name, label: h.name, type: h.type, decimalAccuracy: 0 }); });
                FilePreProcessModel_1.ParseCSVToGeoJSON(d.content, d.latName, d.lonName, delim, layer.headers, function (geo) { layer.geoJSON = geo; });
            }
            else if (d.type == 'general') {
                FilePreProcessModel_1.ParseTableToGeoJSON(d.data ? d.data : JSON.parse(d.content), function (geo) { layer.geoJSON = FilePreProcessModel_1.SetGeoJSONTypes(geo, layer.headers); });
            }
            else if (d.type != 'geojson') {
                FilePreProcessModel_1.ParseToGeoJSON(d.content, d.type, function (geo) { layer.geoJSON = FilePreProcessModel_1.SetGeoJSONTypes(geo, layer.headers); });
            }
            else {
                layer.geoJSON = FilePreProcessModel_1.SetGeoJSONTypes(d.data ? d.data : JSON.parse(d.content), layer.headers);
            }
        }
        function addData(d) {
            var layer = new Layer_1.Layer(state);
            getGeoJSONFromData(d, layer);
            layer.id = d.id;
            layer.name = d.name;
            state.layers.push(layer);
            layer.init();
        }
        function refreshData(d) {
            var layer = state.layers.filter(function (f) { return f.id == d.id; })[0];
            layer.values = {};
            var oldHeaders = layer.headers;
            layer.headers = [];
            getGeoJSONFromData(d, layer);
            var _loop_2 = function(newHeader) {
                newHeader.id = oldHeaders.filter(function (h) { return h.value == newHeader.value; })[0].id;
            };
            for (var _i = 0, _a = layer.headers; _i < _a.length; _i++) {
                var newHeader = _a[_i];
                _loop_2(newHeader);
            }
            var filters = state.filters.filter(function (f) { return f.layerId == layer.id && layer.headers.map(function (h) { return h.id; }).indexOf(f.filterHeaderId) == -1; });
            for (var _b = 0, filters_1 = filters; _b < filters_1.length; _b++) {
                var filter = filters_1[_b];
                filter.show = false;
                state.filters.splice(state.filters.indexOf(filter), 1);
            }
            layer.reDraw();
            var _loop_3 = function(filter) {
                if (filter.useDistinctValues) {
                    var lyr = state.layers.filter(function (l) { return l.id == filter.layerId; })[0];
                    filter.steps = [];
                    var header = lyr.headers.filter(function (h) { return h.id == filter.filterHeaderId; })[0];
                    var values = lyr.uniqueValues[header.value];
                    if (header.type == 'string') {
                        filter.categories = values;
                        return "break";
                    }
                    for (var i = 0; i < values.length - 1; i++) {
                        var step = [values[i], values[i + 1] - 1];
                        filter.steps.push(step);
                    }
                }
            };
            for (var _c = 0, _d = state.filters; _c < _d.length; _c++) {
                var filter = _d[_c];
                var state_3 = _loop_3(filter);
                if (state_3 === "break") break;
            }
        }
        function removeData(id) {
            var layer = state.layers.filter(function (f) { return f.id == id; })[0];
            if (layer) {
                state.map.removeLayer(layer.displayLayer);
                state.layers.splice(state.layers.indexOf(layer), 1);
                if (state.editingLayer == layer)
                    state.editingLayer = state.layers[0] || null;
                var filters = state.filters.filter(function (f) { return f.layerId = layer.id; });
                for (var _i = 0, filters_2 = filters; _i < filters_2.length; _i++) {
                    var filter = filters_2[_i];
                    filter.show = false;
                    state.filters.splice(state.filters.indexOf(filter), 1);
                }
            }
        }
        function hasDifferentData(oldData, newData) {
            return oldData.name !== newData.name ||
                oldData.type !== newData.type ||
                oldData.content !== newData.content ||
                oldData.data !== newData.data ||
                oldData.columns !== newData.columns ||
                oldData.projection !== newData.projection ||
                oldData.latName !== newData.latName ||
                oldData.lonName !== newData.lonName;
        }
    };
    MakeMaps.prototype.changeLanguage = function (lang) {
        Locale_1.Locale.setLanguage(lang);
        state.language = lang;
    };
    MakeMaps.prototype.reset = function () {
        for (var _i = 0, _a = state.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            state.map.removeLayer(layer.displayLayer);
        }
        for (var _b = 0, _c = state.filters; _b < _c.length; _b++) {
            var filter = _c[_b];
            filter.show = false;
        }
        state.menuShown = false;
        state.layers = [];
        state.filters = [];
        if (state.legend) {
            state.legend.visible = false;
            state.legend = null;
        }
        state.welcomeScreenState = new States_1.WelcomeScreenState();
        state.colorMenuState = new States_1.ColorMenuState();
        state.symbolMenuState = new States_1.SymbolMenuState();
        state.filterMenuState = new States_1.FilterMenuState();
        state.legendMenuState = new States_1.LegendMenuState();
        state.layerMenuState = new States_1.LayerMenuState();
        state.exportMenuState = new States_1.ExportMenuState();
        state.clusterMenuState = new States_1.ClusterMenuState();
        state.editingLayer = undefined;
        state.importWizardShown = false;
        state.welcomeShown = this.props.viewOptions.showWelcomeScreen && !this.props.data;
        state.currentLayerId = 0;
        state.standardLayerOrder = [];
        state.heatLayerOrder = [];
    };
    MakeMaps.prototype.onBackButtonEvent = function (e) {
        if (!state.welcomeShown && !state.importWizardShown) {
            e.preventDefault();
            this.reset();
        }
    };
    MakeMaps.prototype.render = function () {
        var modalStyle = {
            content: {
                border: '1px solid #cecece',
                borderRadius: '15px',
                padding: '0px',
                maxWidth: 1900,
            }
        };
        return React.createElement("div", null, 
            React.createElement(Map_1.Map, {state: state}), 
            !state.loaded || state.embed ? null :
                React.createElement("div", null, 
                    React.createElement(Modal, {isOpen: state.welcomeShown, style: modalStyle}, 
                        React.createElement(WelcomeScreen_1.WelcomeScreen, {state: state.welcomeScreenState, appState: state, changeLanguage: this.changeLanguage.bind(this)})
                    ), 
                    state.importWizardShown ?
                        React.createElement(Modal, {isOpen: state.importWizardShown, style: modalStyle}, 
                            React.createElement(LayerImportWizard_1.LayerImportWizard, {state: state})
                        )
                        : null, 
                    state.menuShown || this.props.viewOptions.showMenu ?
                        React.createElement(Menu_1.MakeMapsMenu, {state: state})
                        : null), 
            React.createElement("div", {className: 'notification', id: 'loading'}, 
                React.createElement("span", {style: { lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}, state.strings.loading), 
                React.createElement("div", {className: "sk-double-bounce"}, 
                    React.createElement("div", {className: "sk-child sk-double-bounce1"}), 
                    React.createElement("div", {className: "sk-child sk-double-bounce2"}))), 
            React.createElement("div", {className: 'notification', id: 'notification'}, 
                React.createElement("span", {id: 'notificationText', style: { lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}, state.strings.notification), 
                React.createElement("br", null), 
                React.createElement("button", {className: 'menuButton', onClick: function () { common_1.HideNotification(); }}, "Ok")));
    };
    MakeMaps = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], MakeMaps);
    return MakeMaps;
}(React.Component));
exports.MakeMaps = MakeMaps;
