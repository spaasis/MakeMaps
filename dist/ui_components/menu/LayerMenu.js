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
var Sortable = require('react-sortablejs');
var Layer_1 = require('../../stores/Layer');
var mobx_react_1 = require('mobx-react');
var Select = require('react-select');
var LayerMenu = (function (_super) {
    __extends(LayerMenu, _super);
    function LayerMenu() {
        _super.apply(this, arguments);
    }
    LayerMenu.prototype.handleSort = function (type, items) {
        var arr = [];
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var i = items_1[_i];
            arr.push(this.getLayerById(+i));
        }
        if (type == 'standard')
            this.props.state.standardLayerOrder = arr;
        else
            this.props.state.heatLayerOrder = arr;
        var _loop_1 = function(i) {
            this_1.props.state.layers.filter(function (lyr) { return lyr.id == i.id; })[0].reDraw();
        };
        var this_1 = this;
        for (var _a = 0, _b = this.props.state.standardLayerOrder; _a < _b.length; _a++) {
            var i = _b[_a];
            _loop_1(i);
        }
        var _loop_2 = function(i) {
            this_2.props.state.layers.filter(function (lyr) { return lyr.id == i.id; })[0].reDraw();
        };
        var this_2 = this;
        for (var _c = 0, _d = this.props.state.heatLayerOrder; _c < _d.length; _c++) {
            var i = _d[_c];
            _loop_2(i);
        }
    };
    LayerMenu.prototype.getLayerById = function (id) {
        for (var _i = 0, _a = this.props.state.layers; _i < _a.length; _i++) {
            var lyr = _a[_i];
            if (lyr.id === id) {
                return { name: lyr.name, id: lyr.id };
            }
        }
    };
    LayerMenu.prototype.deleteLayer = function (id) {
        var layerInfo = this.props.state.layers.filter(function (lyr) { return lyr.id == id; })[0];
        if (layerInfo) {
            this.props.state.layers = this.props.state.layers.filter(function (lyr) { return lyr.id != id; });
            this.props.state.map.removeLayer(layerInfo.displayLayer);
            this.props.state.standardLayerOrder = this.props.state.standardLayerOrder.filter(function (l) { return l.id != id; });
        }
    };
    LayerMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        var state = this.props.state;
        var layer = state.layers.filter(function (f) { return f.id === state.layerMenuState.editingLayerId; })[0];
        var layers = [];
        if (this.props.state.layers) {
            for (var _i = 0, _a = this.props.state.layers; _i < _a.length; _i++) {
                var layer_1 = _a[_i];
                layers.push({ value: layer_1, label: layer_1.name });
            }
        }
        var layerStyle = {
            cursor: 'pointer',
            background: 'white',
            color: 'black',
            borderColor: 'white',
            borderWidth: '3px',
            borderStyle: 'double',
            borderRadius: '15px',
            textAlign: 'center',
            lineHeight: '40px',
            border: '1px solid gray'
        };
        return (React.createElement("div", {className: "makeMaps-options"}, 
            React.createElement("label", null, strings.selectBaseMap), 
            React.createElement(Select, {options: this.props.state.obsBaseLayers, onChange: function (e) {
                _this.props.state.map.removeLayer(_this.props.state.activeBaseLayer.layer);
                _this.props.state.activeBaseLayer = { id: e.label, layer: e.value };
                _this.props.state.map.addLayer(_this.props.state.activeBaseLayer.layer);
            }, value: { value: this.props.state.activeBaseLayer, label: this.props.state.activeBaseLayer.id }, clearable: false, placeholder: strings.selectPlaceholder}), 
            React.createElement("hr", null), 
            React.createElement("label", null, strings.layerMenuDragDrop), 
            state.heatLayerOrder.length > 0 ?
                React.createElement("div", null, 
                    React.createElement("label", null, strings.heatLayers), 
                    React.createElement(Sortable, {className: 'layerList', onChange: this.handleSort.bind(this, 'heat')}, state.heatLayerOrder.map(function (item) {
                        return React.createElement("div", {style: layerStyle, key: item.id, "data-id": item.id}, 
                            this.props.state.layers.filter(function (f) { return f.id === item.id; })[0].name, 
                            React.createElement("i", {className: "fa fa-times", onClick: this.deleteLayer.bind(this, item.id), style: { float: 'right', lineHeight: '40px', marginRight: '5px' }}));
                    }, this))) : null, 
            state.standardLayerOrder.length > 0 ?
                React.createElement("div", null, 
                    React.createElement("label", null, strings.standardLayers), 
                    React.createElement(Sortable, {className: 'layerList', onChange: this.handleSort.bind(this, 'standard')}, state.standardLayerOrder.map(function (item) {
                        return React.createElement("div", {style: layerStyle, key: item.id, "data-id": item.id}, 
                            this.props.state.layers.filter(function (f) { return f.id === item.id; })[0].name, 
                            React.createElement("i", {className: "fa fa-times", onClick: this.deleteLayer.bind(this, item.id), style: { float: 'right', lineHeight: '40px', marginRight: '5px' }}));
                    }, this))) : null, 
            React.createElement("button", {className: 'menuButton', onClick: function () {
                _this.props.state.editingLayer = null;
                _this.props.state.visibleMenu = 0;
                _this.props.state.importWizardShown = true;
                _this.props.state.menuShown = false;
            }}, strings.addNewLayer), 
            React.createElement("hr", null), 
            React.createElement("label", null, strings.editLayerProperties), 
            React.createElement(Select, {options: layers, onChange: function (val) {
                state.layerMenuState.editingLayerId = val.value.id;
            }, value: layer, valueRenderer: function (option) {
                return option ? option.name : '';
            }, clearable: false, placeholder: strings.selectLayerPlaceholder}), 
            layer ?
                React.createElement("div", null, 
                    strings.name, 
                    React.createElement("br", null), 
                    React.createElement("input", {type: 'text', style: { width: '100%' }, value: layer.name, onChange: function (e) {
                        layer.name = e.target.value;
                    }}), 
                    strings.layerType, 
                    React.createElement("br", null), 
                    React.createElement("label", {htmlFor: 'standard'}, 
                        strings.layerTypeStandard, 
                        React.createElement("input", {type: 'radio', onChange: function () {
                            if (layer.layerType !== Layer_1.LayerTypes.Standard) {
                                layer.layerType = Layer_1.LayerTypes.Standard;
                                layer.colorOptions.opacity = 0.8;
                                layer.colorOptions.fillOpacity = 0.8;
                                state.heatLayerOrder = state.heatLayerOrder.filter(function (l) { return l.id !== layer.id; });
                                state.standardLayerOrder.push({ id: layer.id });
                                layer.reDraw();
                            }
                        }, checked: layer.layerType === Layer_1.LayerTypes.Standard, name: 'layertype', id: 'standard'}), 
                        React.createElement("br", null)), 
                    React.createElement("label", {htmlFor: 'heat'}, 
                        strings.layerTypeHeat, 
                        React.createElement("input", {type: 'radio', onChange: function () {
                            if (layer.layerType !== Layer_1.LayerTypes.HeatMap) {
                                layer.layerType = Layer_1.LayerTypes.HeatMap;
                                layer.colorOptions.colorField = layer.colorOptions.colorField || layer.numberHeaders[0];
                                layer.colorOptions.opacity = 0.3;
                                layer.colorOptions.fillOpacity = 0.3;
                                state.standardLayerOrder = state.standardLayerOrder.filter(function (l) { return l.id !== layer.id; });
                                state.heatLayerOrder.push({ id: layer.id });
                                layer.reDraw();
                            }
                        }, checked: layer.layerType === Layer_1.LayerTypes.HeatMap, name: 'layertype', id: 'heat'}), 
                        React.createElement("br", null)), 
                    this.renderHeaders.call(this))
                : null));
    };
    LayerMenu.prototype.renderHeaders = function () {
        var state = this.props.state;
        var strings = state.strings;
        var arr = [];
        var layer = state.layers.filter(function (f) { return f.id === state.layerMenuState.editingLayerId; })[0];
        var columnCount = 2;
        var _loop_3 = function(h) {
            arr.push(React.createElement("tr", {key: h.id}, 
                React.createElement("td", null, 
                    React.createElement("input", {type: 'text', style: { width: 120 }, value: h.label, onChange: function (e) { h.label = e.currentTarget.value; }, onBlur: function (e) { layer.refreshPopUps(); }, onKeyPress: function (e) { if (e.charCode == 13) {
                        layer.refreshPopUps();
                    } }})
                ), 
                React.createElement("td", null, 
                    React.createElement("input", {type: 'number', style: { width: 40 }, value: h.decimalAccuracy.toString(), onChange: function (e) { h.decimalAccuracy = e.currentTarget.valueAsNumber; layer.refreshPopUps(); }, min: 0})
                )));
        };
        for (var _i = 0, _a = layer.headers; _i < _a.length; _i++) {
            var h = _a[_i];
            _loop_3(h);
        }
        return (React.createElement("table", {style: { width: '100%' }}, 
            React.createElement("tbody", null, 
                React.createElement("tr", null, 
                    React.createElement("th", null, strings.name), 
                    React.createElement("th", null, strings.decimalAccuracy)), 
                arr.map(function (td) {
                    return td;
                }))
        ));
    };
    LayerMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], LayerMenu);
    return LayerMenu;
}(React.Component));
exports.LayerMenu = LayerMenu;
