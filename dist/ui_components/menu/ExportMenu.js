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
var domToImage = require('dom-to-image');
var Layer_1 = require('../../stores/Layer');
var Filter_1 = require('../../stores/Filter');
var Legend_1 = require('../../stores/Legend');
var ExportMenu = (function (_super) {
    __extends(ExportMenu, _super);
    function ExportMenu() {
        _super.apply(this, arguments);
    }
    ExportMenu.prototype.saveImage = function () {
        var options = this.props.state.exportMenuState;
        function filter(node) {
            if (!node.className || !node.className.indexOf)
                return true;
            else
                return (node.className.indexOf('menu') === -1
                    && node.className.indexOf('leaflet-control-fullscreen') === -1
                    && node.className.indexOf('leaflet-control-zoom') === -1
                    && (options.showLegend || (!options.showLegend && node.className.indexOf('legend') === -1))
                    && (options.showFilters || (!options.showFilters && node.className.indexOf('filter') === -1)));
        }
        domToImage.toBlob(document.getElementById('content'), { filter: filter })
            .then(function (blob) {
            window.saveAs(blob, 'MakeMaps_map.png');
        });
    };
    ExportMenu.prototype.formSaveJSON = function () {
        var layers = [];
        for (var _i = 0, _a = this.props.state.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            layers.push(new Layer_1.Layer(this.props.state, layer));
        }
        var filters = [];
        for (var _b = 0, _c = this.props.state.filters; _b < _c.length; _b++) {
            var filter = _c[_b];
            filters.push(new Filter_1.Filter(this.props.state, filter));
        }
        var saveData = {
            baseLayerId: this.props.state.activeBaseLayer.id,
            layers: layers,
            legend: new Legend_1.Legend(this.props.state.legend),
            filters: filters,
        };
        saveData.layers.forEach(function (e) {
            delete e.popupHeaderIds;
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
                e.symbolOptions.chartFields.map(function (h) { e.symbolOptions['chartHeaderIds'].push(h.id); });
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
            delete e.appState;
            delete e.displayLayer;
            delete e.values;
            delete e.uniqueValues;
            delete e.pointFeatureCount;
            ;
        });
        saveData.filters.forEach(function (e) {
            delete e.filterValues;
            delete e.filteredIndices;
            delete e.appState;
        });
        return saveData;
    };
    ExportMenu.prototype.saveFile = function () {
        var saveString = JSON.stringify(this.formSaveJSON());
        var blob = new Blob([saveString], { type: "text/plain;charset=utf-8" });
        window.saveAs(blob, 'map.mmap');
    };
    ExportMenu.prototype.saveEmbedCode = function () {
        var script = '<script type="text/javascript">function loadJSON(){var json =' + JSON.stringify(this.formSaveJSON()) + '; var frame =	document.getElementById("MakeMapsEmbed"); frame.contentWindow.postMessage(JSON.stringify(json), "*");}</script>';
        var frame = '<iframe onLoad="loadJSON()" src="https://makemaps.online" id="MakeMapsEmbed" style="height: 100%; width: 100%; border:none;"/>';
        var html = script + frame;
        var blob = new Blob([html], { type: "text/plain;charset=utf-8" });
        window.saveAs(blob, 'MakeMaps_embed.html');
    };
    ExportMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        return (React.createElement("div", null, 
            React.createElement("button", {className: 'menuButton', onClick: function () {
                _this.saveFile();
            }}, strings.saveAsFile), 
            React.createElement("i", null, strings.saveAsFileHelpText), 
            React.createElement("br", null), 
            React.createElement("hr", null), 
            React.createElement("button", {className: 'menuButton', onClick: function () {
                _this.saveEmbedCode();
            }}, strings.saveEmbedCode), 
            React.createElement("i", null, strings.saveEmbedCodeHelpText), 
            React.createElement("br", null), 
            React.createElement("hr", null), 
            this.props.state.legend.visible ?
                React.createElement("div", null, 
                    React.createElement("label", {htmlFor: 'showLegend', style: { marginTop: 0 }}, strings.downloadShowLegend), 
                    React.createElement("input", {id: 'showLegend', type: 'checkbox', checked: this.props.state.exportMenuState.showLegend, onChange: function (e) {
                        _this.props.state.exportMenuState.showLegend = e.currentTarget.checked;
                    }})) : null, 
            this.props.state.filters.length > 0 ?
                React.createElement("div", null, 
                    React.createElement("label", {htmlFor: 'showFilters'}, strings.downloadShowFilters), 
                    React.createElement("input", {id: 'showFilters', type: 'checkbox', checked: this.props.state.exportMenuState.showFilters, onChange: function (e) {
                        _this.props.state.exportMenuState.showFilters = e.currentTarget.checked;
                    }})) : null, 
            React.createElement("button", {className: 'menuButton', onClick: function () {
                _this.saveImage();
            }}, strings.saveAsImage), 
            React.createElement("i", null, strings.saveAsImageHelpText)));
    };
    ExportMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], ExportMenu);
    return ExportMenu;
}(React.Component));
exports.ExportMenu = ExportMenu;
