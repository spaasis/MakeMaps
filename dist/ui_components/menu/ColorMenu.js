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
var Select = require('react-select');
var ColorPicker = require('react-color');
var ColorScheme_1 = require('./ColorScheme');
var Modal = require('react-modal');
var chroma = require('chroma-js');
var Layer_1 = require('../../stores/Layer');
var common_1 = require("../../common_items/common");
var mobx_react_1 = require('mobx-react');
var ColorMenu = (function (_super) {
    __extends(ColorMenu, _super);
    function ColorMenu() {
        var _this = this;
        _super.apply(this, arguments);
        this.onColorSelect = function (color) {
            var layer = _this.props.state.editingLayer;
            var isChart = layer.symbolOptions.symbolType === Layer_1.SymbolTypes.Chart;
            var hex = color.hex;
            var editing = _this.props.state.colorMenuState.editing;
            if (editing.indexOf('step') !== -1) {
                layer.colorOptions.colors[editing.substring(4)] = hex;
            }
            else if (isChart && editing.indexOf('chartfield') !== -1) {
                layer.colorOptions.chartColors[editing.substring(10)] = hex;
            }
            else {
                switch (_this.props.state.colorMenuState.editing) {
                    case 'fillColor':
                        layer.colorOptions.fillColor = hex;
                        break;
                    case 'borderColor':
                        layer.colorOptions.color = hex;
                        break;
                    case 'iconTextColor':
                        layer.colorOptions.iconTextColor = hex;
                        break;
                }
            }
            if (_this.props.state.autoRefresh)
                layer.refresh();
            _this.props.state.colorMenuState.startColor = hex;
        };
        this.onCustomSchemeChange = function (e) {
            var use = e.target.checked;
            var layer = _this.props.state.editingLayer;
            var steps = use ? layer.colorOptions.steps : layer.colorOptions.steps > 10 ? 10 : layer.colorOptions.steps;
            layer.colorOptions.useCustomScheme = use;
            layer.colorOptions.steps = steps;
            _this.calculateValues();
        };
        this.onCustomLimitBlur = function (step, e) {
            var layer = _this.props.state.editingLayer;
            var limits = layer.colorOptions.limits;
            var val = e.currentTarget.valueAsNumber;
            if (limits[step + 1] !== undefined && limits[step + 1] <= val) {
                limits = _this.increaseLimitStep(limits, val, step);
            }
            else if (limits[step - 1] !== undefined && limits[step - 1] >= val) {
                limits = _this.decreaseLimitStep(limits, val, step);
            }
            if (_this.props.state.autoRefresh)
                layer.refresh();
        };
        this.onCustomLimitChange = function (step, e) {
            var layer = _this.props.state.editingLayer;
            var val = e.currentTarget.valueAsNumber;
            if (step === 0 && val > layer.values[layer.colorOptions.colorField.value][0])
                return;
            else
                layer.colorOptions.limits[step] = val;
        };
        this.increaseLimitStep = function (limits, val, step) {
            limits[step] = val;
            if (step < limits.length - 1 && limits[step + 1] <= val) {
                return _this.increaseLimitStep(limits, val + 1, step + 1);
            }
            else {
                return limits;
            }
        };
        this.decreaseLimitStep = function (limits, val, step) {
            limits[step] = val;
            if (step > 0 && limits[step - 1] >= val) {
                return _this.decreaseLimitStep(limits, val - 1, step - 1);
            }
            else {
                return limits;
            }
        };
        this.toggleColorPick = function (property) {
            var state = _this.props.state.colorMenuState;
            var col = _this.props.state.editingLayer.colorOptions;
            state.colorSelectOpen = state.editing !== property ? true : !state.colorSelectOpen;
            state.startColor = property.indexOf('step') !== -1 ? col.colors[property.substring(4)] : property.indexOf('chartfield') !== -1 ? col.chartColors[property.substring(10)] : "";
            state.editing = property;
        };
        this.renderScheme = function (option) {
            return React.createElement(ColorScheme_1.ColorScheme, {gradientName: option.value, revert: _this.props.state.editingLayer.colorOptions.revert, width: '109%'});
        };
        this.calculateValues = function () {
            var lyr = _this.props.state.editingLayer;
            var field = lyr.colorOptions.colorField;
            var limits = [];
            if (field.type == 'number') {
                var steps = Math.min(lyr.uniqueValues[field.value].length, lyr.colorOptions.steps);
                if (!lyr.colorOptions.useCustomScheme) {
                    limits = chroma.limits(lyr.values[field.value], lyr.colorOptions.mode, steps);
                    limits.splice(limits.length - 1, 1);
                    limits = limits.filter(function (e, i, arr) {
                        return arr.lastIndexOf(e) === i;
                    });
                }
                else {
                    if (steps >= lyr.uniqueValues[field.value].length) {
                        limits = lyr.uniqueValues[field.value];
                    }
                    else
                        limits = common_1.CalculateLimits(lyr.values[field.value][0], lyr.values[field.value][lyr.values[field.value].length - 1], steps, field.decimalAccuracy);
                }
            }
            else {
                limits = lyr.uniqueValues[field.value];
            }
            var colors;
            if (!lyr.colorOptions.useCustomScheme) {
                colors = chroma.scale(lyr.colorOptions.colorScheme).colors(limits.length);
            }
            else {
                colors = lyr.colorOptions.colors;
                while (colors.length < limits.length) {
                    colors.push(colors[colors.length - 1]);
                }
                while (colors.length > limits.length) {
                    colors.pop();
                }
            }
            lyr.colorOptions.limits = limits;
            lyr.colorOptions.colors = lyr.colorOptions.revert ? colors.reverse() : colors;
            if (_this.props.state.autoRefresh)
                lyr.refresh();
        };
        this.getOppositeColor = function (color) {
            if (!color || color.toLowerCase() === '#fff' || color === '#ffffff' || color === 'white') {
                return '#000';
            }
            else if (color.toLowerCase() === '#000' || color === '#000000' || color === 'black') {
                return '#FFF';
            }
            return '#' + ('000000' + ((0xffffff ^ parseInt(color.substr(1), 16)).toString(16))).slice(-6);
        };
        this.getStepLimits = function () {
            if (!_this.props.state.editingLayer.colorOptions.useMultipleFillColors)
                return [];
            var limits = [];
            for (var i = 0; i < _this.props.state.editingLayer.colorOptions.steps; i++) {
                var step = +document.getElementById(i + 'min').value;
                limits.push(step);
            }
            limits.push(_this.props.state.editingLayer.colorOptions.limits[_this.props.state.editingLayer.colorOptions.limits.length - 1]);
            return limits;
        };
    }
    ColorMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        var layer = this.props.state.editingLayer;
        var col = layer.colorOptions;
        var state = this.props.state.colorMenuState;
        var autoRefresh = this.props.state.autoRefresh;
        var fillColorBlockStyle = {
            background: col.fillColor,
            color: this.getOppositeColor(col.fillColor),
            border: '1px solid ' + col.color,
        };
        var iconTextColorBlockStyle = {
            background: col.iconTextColor,
            color: this.getOppositeColor(col.iconTextColor),
            border: '1px solid ' + col.color,
        };
        var colorSelectStyle = {
            overlay: {
                position: 'fixed',
                height: 600,
                width: 300,
                right: 230,
                bottom: '',
                top: 20,
                left: '',
                backgroundColor: ''
            },
            content: {
                border: '1px solid #cecece',
                borderRadius: '15px',
                padding: '0px',
                height: 650,
                width: 300,
                right: '',
                bottom: '',
                top: '',
                left: '',
            }
        };
        var isChart = layer.layerType == Layer_1.LayerTypes.Standard && layer.symbolOptions.symbolType === Layer_1.SymbolTypes.Chart;
        var isHeat = layer.layerType === Layer_1.LayerTypes.HeatMap;
        var fieldIsString = col.colorField ? col.colorField.type == 'string' : false;
        var colorPicker = React.createElement(Modal, {isOpen: state.colorSelectOpen, style: colorSelectStyle}, 
            React.createElement(ColorPicker.SwatchesPicker, {width: 300, height: 600, overlowY: 'auto', color: state.startColor, onChange: this.onColorSelect}), 
            React.createElement("button", {className: 'primaryButton', onClick: this.toggleColorPick.bind(this, state.editing), style: { position: 'absolute', left: 80 }}, "OK"));
        var stepModes = React.createElement("div", null, 
            strings.selectStepCalculationMode, 
            React.createElement("label", {htmlFor: 'quantiles'}, 
                strings.colorStepQuantiles, 
                React.createElement("input", {type: 'radio', onChange: function () { col.mode = 'q'; _this.calculateValues(); }, checked: col.mode === 'q', name: 'mode', id: 'quantiles'}), 
                React.createElement("br", null)), 
            React.createElement("label", {htmlFor: 'kmeans'}, 
                strings.colorStepKMeans, 
                React.createElement("input", {type: 'radio', onChange: function () { col.mode = 'k'; _this.calculateValues(); }, checked: col.mode === 'k', name: 'mode', id: 'kmeans'}), 
                React.createElement("br", null)), 
            React.createElement("label", {htmlFor: 'equidistant'}, 
                strings.colorStepEquidistant, 
                React.createElement("input", {type: 'radio', onChange: function () { col.mode = 'e'; _this.calculateValues(); }, checked: col.mode === 'e', name: 'mode', id: 'equidistant'}), 
                React.createElement("br", null)));
        var colorBlocks = React.createElement("div", null, 
            col.useMultipleFillColors || isHeat || isChart ?
                null :
                React.createElement("div", {className: 'colorBlock', style: fillColorBlockStyle, onClick: this.toggleColorPick.bind(this, 'fillColor')}, strings.fillColor), 
            isHeat ? null :
                React.createElement("div", {className: 'colorBlock', style: { background: col.color, border: '1px solid ' + col.color, cursor: 'pointer' }, onClick: this.toggleColorPick.bind(this, 'borderColor')}, 
                    strings.border, 
                    React.createElement("input", {type: 'number', min: 0, max: 15, step: 1, value: col.weight.toString(), style: { position: 'absolute', right: 0, width: 50 }, onClick: function (e) { e.stopPropagation(); }, onChange: function (e) {
                        var val = e.currentTarget.valueAsNumber;
                        if (col.weight != val) {
                            col.weight = val;
                            if (autoRefresh)
                                layer.refresh();
                        }
                    }})), 
            !isHeat && layer.symbolOptions.symbolType === Layer_1.SymbolTypes.Icon ?
                React.createElement("div", {className: 'colorBlock', style: iconTextColorBlockStyle, onClick: this.toggleColorPick.bind(this, 'iconTextColor')}, strings.icon)
                : null);
        var colorSchemeOptions = React.createElement("div", null, 
            strings.or, 
            React.createElement("br", null), 
            React.createElement("label", null, strings.selectColorScheme), 
            React.createElement(Select, {clearable: false, searchable: false, options: _gradientOptions, optionRenderer: this.renderScheme, valueRenderer: this.renderScheme, onChange: function (e) {
                if (col.colorScheme != e) {
                    col.colorScheme = e.value;
                    _this.calculateValues();
                }
            }, value: col.colorScheme}), 
            React.createElement("label", {htmlFor: 'revertSelect'}, strings.revert), 
            React.createElement("input", {id: 'revertSelect', type: 'checkbox', onChange: function (e) {
                col.revert = e.target.checked;
                _this.calculateValues();
            }, checked: col.revert}));
        return (React.createElement("div", {className: "makeMaps-options"}, 
            isHeat || isChart ? null :
                React.createElement("label", {htmlFor: 'multipleSelect'}, 
                    strings.useMultipleFillColors, 
                    React.createElement("input", {id: 'multipleSelect', type: 'checkbox', onChange: function (e) {
                        col.useMultipleFillColors = e.target.checked;
                        if (autoRefresh)
                            layer.refresh();
                    }, checked: col.useMultipleFillColors})), 
            colorBlocks, 
            React.createElement("label", null, 
                strings.opacity, 
                React.createElement("input", {type: 'number', max: 1, min: 0, step: 0.1, onChange: function (e) {
                    var val = e.target.valueAsNumber;
                    var layer = _this.props.state.editingLayer;
                    if (layer.colorOptions.opacity != val || layer.colorOptions.fillOpacity != val) {
                        layer.colorOptions.opacity = val;
                        layer.colorOptions.fillOpacity = val;
                        if (_this.props.state.autoRefresh)
                            layer.setOpacity();
                    }
                }, value: col.opacity.toString()})), 
            colorPicker, 
            (col.useMultipleFillColors || isHeat) && !isChart ?
                React.createElement("div", null, 
                    React.createElement("div", null, 
                        React.createElement("label", null, strings.selectColorVariable), 
                        React.createElement(Select, {options: layer.headers.slice(), onChange: function (e) {
                            if (col.colorField != e) {
                                col.colorField = e;
                                _this.calculateValues();
                            }
                        }, value: col.colorField, clearable: false, placeholder: strings.selectPlaceholder})), 
                    col.colorField && !fieldIsString ?
                        React.createElement("div", null, 
                            React.createElement("label", {htmlFor: 'customScale'}, strings.setCustomScheme), 
                            React.createElement("input", {id: 'customScale', type: 'checkbox', onChange: this.onCustomSchemeChange, checked: col.useCustomScheme}), 
                            React.createElement("br", null), 
                            col.useCustomScheme ?
                                null
                                :
                                    colorSchemeOptions, 
                            React.createElement("label", null, strings.steps), 
                            React.createElement("input", {type: 'number', max: layer.uniqueValues[col.colorField.value].length, min: 2, step: 1, onChange: function (e) {
                                var val = e.currentTarget.valueAsNumber;
                                if (col.steps != val) {
                                    col.steps = val;
                                    _this.calculateValues();
                                }
                            }, value: col.steps.toString()}), 
                            col.useCustomScheme ?
                                React.createElement("div", null, 
                                    strings.colorMenuStepHelp, 
                                    this.renderSteps())
                                :
                                    stepModes, 
                            isHeat ?
                                React.createElement("div", null, 
                                    strings.heatMapRadius, 
                                    React.createElement("input", {type: 'number', max: 100, min: 10, step: 1, onChange: function (e) {
                                        var val = e.currentTarget.valueAsNumber;
                                        if (col.heatMapRadius != val) {
                                            col.heatMapRadius = val;
                                            if (autoRefresh)
                                                layer.refresh();
                                        }
                                    }, value: col.heatMapRadius.toString()}))
                                : null)
                        : null)
                : null, 
            isChart || (fieldIsString && col.useMultipleFillColors) ? React.createElement("div", null, this.renderSteps()) : null, 
            autoRefresh ? null :
                React.createElement("button", {className: 'menuButton', onClick: function () {
                    _this.props.state.editingLayer.refresh();
                }}, strings.refreshMap)));
    };
    ColorMenu.prototype.renderSteps = function () {
        var layer = this.props.state.editingLayer;
        var col = layer.colorOptions;
        var limits = col.limits.slice();
        var rows = [];
        var row = 0;
        if (layer.symbolOptions.symbolType === Layer_1.SymbolTypes.Chart) {
            for (var _i = 0, _a = layer.symbolOptions.chartFields; _i < _a.length; _i++) {
                var i = _a[_i];
                rows.push(React.createElement("li", {key: i.label, style: { background: col.chartColors[i.value] || '#FFF', borderRadius: '5px', border: '1px solid ' + col.color, cursor: 'pointer' }, onClick: this.toggleColorPick.bind(this, 'chartfield' + i.value)}, 
                    React.createElement("i", {style: { background: 'white', borderRadius: 5 }}, i.label)
                ));
                row++;
            }
        }
        else if (col.colorField.type == 'string') {
            for (var _b = 0, limits_1 = limits; _b < limits_1.length; _b++) {
                var i = limits_1[_b];
                rows.push(React.createElement("li", {key: row, style: { background: col.colors[row] || '#FFF', borderRadius: '5px', border: '1px solid ' + col.color, cursor: 'pointer', height: 32 }, onClick: this.toggleColorPick.bind(this, 'step' + row)}, 
                    React.createElement("i", {style: { background: 'white', borderRadius: 5 }}, i)
                ));
                row++;
            }
        }
        else {
            for (var _c = 0, limits_2 = limits; _c < limits_2.length; _c++) {
                var i = limits_2[_c];
                rows.push(React.createElement("li", {key: row, style: { background: col.colors[row] || '#FFF', borderRadius: '5px', border: '1px solid ' + col.color, cursor: 'pointer', height: 32 }, onClick: this.toggleColorPick.bind(this, 'step' + row)}, 
                    React.createElement("input", {id: row + 'min', type: 'number', value: limits[row].toString(), onChange: this.onCustomLimitChange.bind(this, row), onBlur: this.onCustomLimitBlur.bind(this, row), style: {
                        width: 100,
                    }, onClick: function (e) { e.stopPropagation(); }, step: 1 * Math.pow(10, (-col.colorField.decimalAccuracy))})
                ));
                row++;
            }
        }
        return React.createElement("div", null, 
            React.createElement("ul", {id: 'customSteps', style: { listStyle: 'none', padding: 0 }}, rows.map(function (r) { return r; }))
        );
    };
    ColorMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], ColorMenu);
    return ColorMenu;
}(React.Component));
exports.ColorMenu = ColorMenu;
var _gradientOptions = [
    { value: 'Greys' },
    { value: 'Reds' },
    { value: 'Blues' },
    { value: 'Greens' },
    { value: 'BuGn' },
    { value: 'OrRd' },
    { value: 'YlOrRd' },
    { value: 'YlOrBr' },
    { value: 'RdPu' },
    { value: 'PuBu' },
    { value: 'YlGn' },
    { value: 'YlGnBu' },
    { value: 'PuBuGn' },
    { value: 'Spectral' },
    { value: 'RdYlGn' },
    { value: 'RdYlBu' },
    { value: 'RdBu' },
    { value: 'PiYG' },
    { value: 'PRGn' },
    { value: 'BrBG' },
    { value: 'Set2' },
    { value: 'Dark2' },
    { value: 'Paired' },
];
