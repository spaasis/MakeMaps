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
var LayerMenu_1 = require('./LayerMenu');
var ColorMenu_1 = require('./ColorMenu');
var SymbolMenu_1 = require('./SymbolMenu');
var FilterMenu_1 = require('./FilterMenu');
var LegendMenu_1 = require('./LegendMenu');
var ClusterMenu_1 = require('./ClusterMenu');
var PopUpMenu_1 = require('./PopUpMenu');
var ExportMenu_1 = require('./ExportMenu');
var Layer_1 = require('../../stores/Layer');
var mobx_react_1 = require('mobx-react');
var MenuEntry_1 = require('./MenuEntry');
var Select = require('react-select');
var MakeMapsMenu = (function (_super) {
    __extends(MakeMapsMenu, _super);
    function MakeMapsMenu() {
        var _this = this;
        _super.apply(this, arguments);
        this.onActiveMenuChange = function (item) {
            _this.props.state.visibleMenu = _this.props.state.visibleMenu === item ? 0 : item;
        };
    }
    MakeMapsMenu.prototype.componentWillMount = function () {
        this.props.state.visibleMenu = 0;
        this.props.state.editingLayer = this.props.state.layers ? this.props.state.layers[this.props.state.layers.length - 1] : null;
    };
    MakeMapsMenu.prototype.getActiveMenu = function () {
        switch (this.props.state.visibleMenu) {
            case 0:
                return;
            case 1:
                return React.createElement(LayerMenu_1.LayerMenu, {state: this.props.state});
            case 2:
                return React.createElement(ColorMenu_1.ColorMenu, {state: this.props.state});
            case 3:
                return React.createElement(SymbolMenu_1.SymbolMenu, {state: this.props.state});
            case 4:
                return React.createElement(FilterMenu_1.FilterMenu, {state: this.props.state});
            case 5:
                return React.createElement(LegendMenu_1.LegendMenu, {state: this.props.state});
            case 6:
                return React.createElement(ClusterMenu_1.ClusterMenu, {state: this.props.state});
            case 7:
                return React.createElement(PopUpMenu_1.PopUpMenu, {state: this.props.state});
            case 8:
                return React.createElement(ExportMenu_1.ExportMenu, {state: this.props.state});
        }
    };
    MakeMapsMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        var layers = [];
        if (this.props.state.layers) {
            for (var _i = 0, _a = this.props.state.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                layers.push({ value: layer, label: layer.name });
            }
        }
        var menuStyle = {
            float: 'right',
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 999
        };
        var visibleMenu = this.props.state.visibleMenu;
        var visibleMenuName;
        switch (visibleMenu) {
            case 1:
                visibleMenuName = strings.layerMenuTitle;
                break;
            case 2:
                visibleMenuName = strings.colorMenuTitle;
                break;
            case 3:
                visibleMenuName = strings.symbolMenuTitle;
                break;
            case 4:
                visibleMenuName = strings.filterMenuTitle;
                break;
            case 5:
                visibleMenuName = strings.legendMenuTitle;
                break;
            case 6:
                visibleMenuName = strings.clusterMenuTitle;
                break;
            case 7:
                visibleMenuName = strings.popupMenuTitle;
                break;
            case 8:
                visibleMenuName = strings.downloadMenuTitle;
                break;
        }
        return (!this.props.state.menuShown ? null :
            React.createElement("div", {style: menuStyle, className: 'menu'}, 
                React.createElement("div", {style: { float: 'left', display: 'flex', flexFlow: 'column', height: '100%' }}, 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.layerMenuTitle, id: 1, active: visibleMenu == 1, fa: 'bars', onClick: this.onActiveMenuChange}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.colorMenuTitle, id: 2, active: visibleMenu == 2, fa: 'paint-brush', onClick: this.onActiveMenuChange, hide: !this.props.state.editingLayer}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.symbolMenuTitle, id: 3, active: visibleMenu == 3, fa: 'map-marker', onClick: this.onActiveMenuChange, hide: !this.props.state.editingLayer || this.props.state.editingLayer.pointFeatureCount == 0 || this.props.state.editingLayer.layerType === Layer_1.LayerTypes.HeatMap}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.filterMenuTitle, id: 4, active: visibleMenu == 4, fa: 'sliders', onClick: this.onActiveMenuChange}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.legendMenuTitle, id: 5, active: visibleMenu == 5, fa: 'map-o', onClick: this.onActiveMenuChange}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.clusterMenuTitle, id: 6, active: visibleMenu == 6, fa: 'asterisk', onClick: this.onActiveMenuChange, hide: this.props.state.editingLayer.pointFeatureCount == 0 || this.props.state.editingLayer.layerType === Layer_1.LayerTypes.HeatMap}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.popupMenuTitle, id: 7, active: visibleMenu == 7, fa: 'newspaper-o', onClick: this.onActiveMenuChange, hide: !this.props.state.editingLayer || this.props.state.editingLayer.layerType === Layer_1.LayerTypes.HeatMap}), 
                    React.createElement(MenuEntry_1.MenuEntry, {text: strings.downloadMenuTitle, id: 8, active: visibleMenu == 8, fa: 'download', onClick: this.onActiveMenuChange})), 
                React.createElement("div", {className: this.props.state.visibleMenu > 0 ? 'menuOpen' : document.getElementsByClassName('menuOpen').length > 0 ? 'menuClose' : '', style: { float: 'right', width: this.props.state.visibleMenu > 0 ? 250 : 0, height: '100%', overflowY: 'auto', background: '#ededed' }}, 
                    React.createElement("h3", null, visibleMenuName), 
                    this.props.state.visibleMenu !== 0 && this.props.state.visibleMenu !== 1 && this.props.state.visibleMenu !== 4 && this.props.state.visibleMenu !== 5 && this.props.state.visibleMenu !== 8 ?
                        React.createElement("div", null, 
                            React.createElement("label", null, strings.editingLayerSelection), 
                            React.createElement(Select, {options: layers, onChange: function (val) {
                                _this.props.state.editingLayer = val.value;
                            }, value: this.props.state.editingLayer, valueRenderer: function (option) {
                                return option ? option.name : '';
                            }, clearable: false}), 
                            React.createElement("br", null))
                        :
                            null, 
                    this.getActiveMenu())));
    };
    MakeMapsMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], MakeMapsMenu);
    return MakeMapsMenu;
}(React.Component));
exports.MakeMapsMenu = MakeMapsMenu;
