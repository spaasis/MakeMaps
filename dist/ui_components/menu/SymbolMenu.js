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
var Modal = require('react-modal');
var Select = require('react-select');
var common_1 = require('../../common_items/common');
var Layer_1 = require('../../stores/Layer');
var mobx_react_1 = require('mobx-react');
var SymbolMenu = (function (_super) {
    __extends(SymbolMenu, _super);
    function SymbolMenu() {
        var _this = this;
        _super.apply(this, arguments);
        this.onTypeChange = function (type) {
            var layer = _this.props.state.editingLayer;
            var sym = _this.props.state.editingLayer.symbolOptions;
            sym.symbolType = type;
            if (type === Layer_1.SymbolTypes.Blocks && !sym.blockSizeVar) {
                sym.blockSizeVar = layer.numberHeaders[0];
                sym.blockValue = sym.blockValue == 0 ? Math.ceil(layer.values[sym.blockSizeVar.value][layer.values[sym.blockSizeVar.value].length - 1] / 5) : sym.blockValue;
            }
            if (type === Layer_1.SymbolTypes.Chart) {
                if (sym.chartFields.length == 0)
                    _this.onChartFieldsChange(layer.numberHeaders);
            }
            if (type === Layer_1.SymbolTypes.Icon) {
                if (!sym.iconField)
                    sym.iconField = layer.numberHeaders[0] ? layer.numberHeaders[0] : layer.headers[0];
                if (!sym.icons || sym.icons.length == 0) {
                    sym.icons = [];
                    _this.addRandomIcon();
                }
            }
            if (_this.props.state.autoRefresh)
                layer.refresh();
        };
        this.onXVariableChange = function (val) {
            var layer = _this.props.state.editingLayer;
            var sym = layer.symbolOptions;
            if (sym.symbolType === Layer_1.SymbolTypes.Blocks) {
                sym.blockSizeVar = val ? val : '';
                sym.blockValue = Math.ceil(layer.values[sym.blockSizeVar.value][layer.values[sym.blockSizeVar.value].length - 1] / 5);
            }
            else
                sym.sizeXVar = val ? val : '';
            sym.sizeMultiplier = sym.sizeMultiplier ? sym.sizeMultiplier : 1;
            if (_this.props.state.autoRefresh)
                _this.props.state.editingLayer.refresh();
        };
        this.onYVariableChange = function (val) {
            var sym = _this.props.state.editingLayer.symbolOptions;
            sym.sizeYVar = val ? val : '';
            sym.sizeMultiplier = sym.sizeMultiplier ? sym.sizeMultiplier : 1;
            if (_this.props.state.autoRefresh)
                _this.props.state.editingLayer.refresh();
        };
        this.onFAIconChange = function (e) {
            if (e.currentTarget) {
                e = e.currentTarget.value;
            }
            _this.props.state.editingLayer.symbolOptions.icons[_this.props.state.symbolMenuState.currentIconIndex].fa = e;
            if (_this.props.state.autoRefresh)
                _this.props.state.editingLayer.refresh();
        };
        this.onIconShapeChange = function (shape) {
            _this.props.state.editingLayer.symbolOptions.icons[_this.props.state.symbolMenuState.currentIconIndex].shape = shape;
            if (_this.props.state.autoRefresh)
                _this.props.state.editingLayer.refresh();
        };
        this.onChartFieldsChange = function (e) {
            var headers = _this.props.state.editingLayer.symbolOptions.chartFields;
            var colors = _this.props.state.editingLayer.colorOptions.chartColors;
            if (e === null)
                e = [];
            headers.splice(0, headers.length);
            for (var i in e) {
                if (!colors[e[i].value]) {
                    colors[e[i].value] = defaultChartColors[i] || '#FFF';
                }
                headers.push(e[i]);
            }
            if (_this.props.state.autoRefresh)
                _this.props.state.editingLayer.refresh();
        };
        this.toggleIconSelect = function (index) {
            _this.props.state.symbolMenuState.iconSelectOpen = index !== _this.props.state.symbolMenuState.currentIconIndex ? true : !_this.props.state.symbolMenuState.iconSelectOpen;
            _this.props.state.symbolMenuState.currentIconIndex = index;
        };
        this.onUseIconStepsChange = function (e) {
            var use = e.target.checked;
            var sym = _this.props.state.editingLayer.symbolOptions;
            _this.props.state.editingLayer.symbolOptions.useMultipleIcons = use;
            sym.icons = use ? sym.icons : [sym.icons.slice()[0]];
            sym.iconLimits = use ? sym.iconLimits : [];
            if (use && sym.iconField) {
                _this.calculateIconValues(sym.iconField, sym.iconCount, sym.iconField.decimalAccuracy);
            }
            if (_this.props.state.autoRefresh)
                _this.props.state.editingLayer.refresh();
        };
        this.onIconFieldChange = function (val) {
            var layer = _this.props.state.editingLayer;
            layer.symbolOptions.iconField = val;
            _this.calculateIconValues(val, layer.symbolOptions.iconCount, val.decimalAccuracy);
            if (_this.props.state.autoRefresh)
                layer.refresh();
        };
        this.onIconStepCountChange = function (amount) {
            var layer = _this.props.state.editingLayer;
            var sym = layer.symbolOptions;
            if (amount == 1) {
                if (sym.iconCount >= layer.uniqueValues[sym.iconField.value].length)
                    return;
                _this.addRandomIcon();
            }
            else if (amount == -1 && sym.iconCount > 1) {
                sym.icons.pop();
            }
            if (sym.iconCount > 0) {
                _this.calculateIconValues(sym.iconField, sym.iconCount, sym.iconField.decimalAccuracy);
            }
            if (_this.props.state.autoRefresh)
                layer.refresh();
        };
        this.onStepLimitChange = function (step, e) {
            var layer = _this.props.state.editingLayer;
            var limits = layer.symbolOptions.iconLimits;
            var val = e.currentTarget.valueAsNumber;
            if (limits[step + 1] && limits[step + 1] <= val) {
                var index = step + 1;
                while (index < limits.length) {
                    limits[index]++;
                    if (limits[index + 1] && limits[index + 1] <= limits[index])
                        index++;
                    else
                        break;
                }
            }
            else if (limits[step - 1] && limits[step - 1] >= val) {
                var index = step - 1;
                while (true) {
                    limits[index]--;
                    if (limits[index - 1] && limits[index - 1] >= limits[index])
                        index--;
                    else
                        break;
                }
            }
            layer.symbolOptions.iconLimits[step] = val;
            if (_this.props.state.autoRefresh)
                layer.refresh();
        };
    }
    SymbolMenu.prototype.addRandomIcon = function () {
        var shapes = ['circle', 'square', 'star', 'penta'];
        var shape = shapes[Math.floor(Math.random() * shapes.length)];
        this.props.state.editingLayer.symbolOptions.icons.push({ shape: shape, fa: faIcons[Math.floor(Math.random() * faIcons.length)] });
    };
    SymbolMenu.prototype.getIcon = function (shape, fa, stroke, fill, onClick) {
        var circleIcon = React.createElement("svg", {viewBox: "0 0 69.529271 95.44922", height: "40", width: "40"}, 
            React.createElement("g", {transform: "translate(-139.52 -173.21)"}, 
                React.createElement("path", {fill: fill, stroke: stroke, d: "m174.28 173.21c-19.199 0.00035-34.764 15.355-34.764 34.297 0.007 6.7035 1.5591 12.813 5.7461 18.854l0.0234 0.0371 28.979 42.262 28.754-42.107c3.1982-5.8558 5.9163-11.544 6.0275-19.045-0.0001-18.942-15.565-34.298-34.766-34.297z"})
            )
        );
        var squareIcon = React.createElement("svg", {viewBox: "0 0 69.457038 96.523441", height: "40", width: "40"}, 
            React.createElement("g", {transform: "translate(-545.27 -658.39)"}, 
                React.createElement("path", {fill: fill, stroke: stroke, d: "m545.27 658.39v65.301h22.248l12.48 31.223 12.676-31.223h22.053v-65.301h-69.457z"})
            )
        );
        var starIcon = React.createElement("svg", {height: "40", width: "40", viewBox: "0 0 77.690999 101.4702"}, 
            React.createElement("g", {transform: "translate(-101.15 -162.97)"}, 
                React.createElement("g", {transform: "matrix(1 0 0 1.0165 -65.712 -150.28)"}, 
                    React.createElement("path", {fill: fill, stroke: stroke, d: "m205.97 308.16-11.561 11.561h-16.346v16.346l-11.197 11.197 11.197 11.197v15.83h15.744l11.615 33.693 11.467-33.568 0.125-0.125h16.346v-16.346l11.197-11.197-11.197-11.197v-15.83h-15.83l-11.561-11.561z"})
                )
            )
        );
        var pentaIcon = React.createElement("svg", {viewBox: "0 0 71.550368 96.362438", height: "40", width: "40"}, 
            React.createElement("g", {fill: fill, transform: "translate(-367.08 -289.9)"}, 
                React.createElement("path", {stroke: stroke, d: "m367.08 322.5 17.236-32.604h36.151l18.164 32.25-35.665 64.112z"})
            )
        );
        var activeIcon;
        switch (shape) {
            case ('circle'):
                activeIcon = circleIcon;
                break;
            case ('square'):
                activeIcon = squareIcon;
                break;
            case ('star'):
                activeIcon = starIcon;
                break;
            case ('penta'):
                activeIcon = pentaIcon;
                break;
        }
        return React.createElement("div", {onClick: onClick, style: {
            cursor: 'pointer',
            display: 'inline-block',
            textAlign: 'center',
            verticalAlign: 'middle',
            width: 42,
            height: 42,
        }}, 
            activeIcon, 
            React.createElement("i", {style: { position: 'relative', bottom: 33, width: 18, height: 18 }, className: 'fa ' + fa}));
    };
    SymbolMenu.prototype.calculateIconValues = function (field, steps, accuracy) {
        var layer = this.props.state.editingLayer;
        var values = layer.values;
        var uniqueValues = layer.uniqueValues;
        if (field.type == 'number') {
            if (steps >= uniqueValues[field.value].length) {
                layer.symbolOptions.iconLimits = uniqueValues[field.value];
            }
            else
                layer.symbolOptions.iconLimits = common_1.CalculateLimits(values[field.value][0], values[field.value][values[field.value].length - 1], steps, accuracy);
        }
        else {
            layer.symbolOptions.iconLimits = uniqueValues[field.value];
        }
        while (layer.symbolOptions.iconCount < layer.symbolOptions.iconLimits.slice().length) {
            this.addRandomIcon();
        }
    };
    SymbolMenu.prototype.render = function () {
        var strings = this.props.state.strings;
        var layer = this.props.state.editingLayer;
        var sym = layer.symbolOptions;
        var state = this.props.state.symbolMenuState;
        var autoRefresh = this.props.state.autoRefresh;
        var hasNumberHeaders = layer.numberHeaders.length > 0;
        var iconSelectStyle = {
            overlay: {
                position: 'fixed',
                height: 550,
                width: 280,
                right: 250,
                bottom: '',
                top: 20,
                left: '',
                backgroundColor: ''
            },
            content: {
                border: '1px solid #cecece',
                borderRadius: '15px',
                padding: '0px',
                height: 550,
                width: 280,
                right: '',
                bottom: '',
                top: '',
                left: '',
                textAlign: 'center',
                lineHeight: 1.5
            }
        };
        var iconSelect = (React.createElement(Modal, {isOpen: state.iconSelectOpen, style: iconSelectStyle}, state.iconSelectOpen ? React.createElement("div", null, 
            strings.icon, 
            this.renderIcons.call(this), 
            strings.or, 
            React.createElement("br", null), 
            React.createElement("label", null, 
                strings.symbolMenuUseFAIcon, 
                " ", 
                React.createElement("a", {href: 'http://fontawesome.io/icons/'}, "Font Awesome")), 
            React.createElement("input", {type: "text", onChange: this.onFAIconChange, value: sym.icons[state.currentIconIndex].fa}), 
            React.createElement("br", null), 
            strings.iconShape, 
            React.createElement("br", null), 
            React.createElement("div", {style: { display: 'inline-block' }, onClick: this.onIconShapeChange.bind(this, 'circle')}, this.getIcon('circle', '', '#999999', 'transparent', null)), 
            React.createElement("div", {style: { display: 'inline-block' }, onClick: this.onIconShapeChange.bind(this, 'square')}, this.getIcon('square', '', '#999999', 'transparent', null)), 
            React.createElement("div", {style: { display: 'inline-block' }, onClick: this.onIconShapeChange.bind(this, 'star')}, this.getIcon('star', '', '#999999', 'transparent', null)), 
            React.createElement("div", {style: { display: 'inline-block' }, onClick: this.onIconShapeChange.bind(this, 'penta')}, this.getIcon('penta', '', '#999999', 'transparent', null)), 
            React.createElement("br", null), 
            React.createElement("button", {className: 'primaryButton', onClick: this.toggleIconSelect.bind(this, state.currentIconIndex), style: { position: 'absolute', left: 80 }}, "OK"))
            : null));
        return (React.createElement("div", {className: "makeMaps-options"}, 
            React.createElement("label", null, strings.selectSymbolType), 
            React.createElement("br", null), 
            React.createElement("label", {htmlFor: 'circle'}, 
                React.createElement("i", {style: { margin: 4 }, className: 'fa fa-circle-o'}), 
                strings.symbolTypeSimple, 
                React.createElement("input", {type: 'radio', onChange: this.onTypeChange.bind(this, Layer_1.SymbolTypes.Simple), checked: sym.symbolType === Layer_1.SymbolTypes.Simple, name: 'symboltype', id: 'circle'}), 
                React.createElement("br", null)), 
            React.createElement("label", {htmlFor: 'icon'}, 
                React.createElement("i", {style: { margin: 4 }, className: 'fa fa-map-marker'}), 
                strings.icon, 
                React.createElement("input", {type: 'radio', onChange: this.onTypeChange.bind(this, Layer_1.SymbolTypes.Icon), checked: sym.symbolType === Layer_1.SymbolTypes.Icon, name: 'symboltype', id: 'icon'}), 
                React.createElement("br", null)), 
            React.createElement("label", {htmlFor: 'chart'}, 
                React.createElement("i", {style: { margin: 4 }, className: 'fa fa-pie-chart'}), 
                strings.symbolTypeChart, 
                React.createElement("input", {type: 'radio', onChange: this.onTypeChange.bind(this, Layer_1.SymbolTypes.Chart), checked: sym.symbolType === Layer_1.SymbolTypes.Chart, name: 'symboltype', disabled: !hasNumberHeaders, id: 'chart'}), 
                React.createElement("br", null)), 
            React.createElement("label", {htmlFor: 'blocks'}, 
                React.createElement("i", {style: { margin: 4 }, className: 'fa fa-th-large'}), 
                strings.symbolTypeBlocks, 
                React.createElement("input", {type: 'radio', onChange: this.onTypeChange.bind(this, Layer_1.SymbolTypes.Blocks), checked: sym.symbolType === Layer_1.SymbolTypes.Blocks, name: 'symboltype', disabled: !hasNumberHeaders, id: 'blocks'}), 
                React.createElement("br", null)), 
            sym.symbolType !== Layer_1.SymbolTypes.Icon ?
                React.createElement("div", null, 
                    React.createElement("label", null, strings.symbolMenuScale1 + (sym.symbolType === Layer_1.SymbolTypes.Simple ? strings.width : strings.size) + strings.symbolMenuScale2), 
                    React.createElement(Select, {options: layer.numberHeaders, onChange: this.onXVariableChange, value: sym.symbolType === Layer_1.SymbolTypes.Blocks ? sym.blockSizeVar : sym.sizeXVar, clearable: sym.symbolType !== Layer_1.SymbolTypes.Blocks, placeholder: strings.selectPlaceholder}), 
                    sym.symbolType === Layer_1.SymbolTypes.Simple ? React.createElement("div", null, 
                        React.createElement("label", null, strings.symbolMenuScaleHeight), 
                        React.createElement(Select, {options: layer.numberHeaders, onChange: this.onYVariableChange, value: sym.sizeYVar, placeholder: strings.selectPlaceholder}), 
                        React.createElement("label", null, 
                            strings.borderRadius, 
                            React.createElement("input", {type: 'number', value: sym.borderRadius.toString(), onChange: function (e) {
                                var val = e.currentTarget.valueAsNumber;
                                if (sym.borderRadius != val) {
                                    sym.borderRadius = val;
                                    if (autoRefresh)
                                        layer.refresh();
                                }
                            }, min: 0, max: 100, step: 1}))) : null, 
                    sym.symbolType !== Layer_1.SymbolTypes.Blocks && (sym.sizeXVar || sym.sizeYVar) ?
                        React.createElement("div", null, 
                            React.createElement("label", null, 
                                strings.sizeMultiplier, 
                                React.createElement("input", {type: 'number', value: sym.sizeMultiplier.toString(), onChange: function (e) {
                                    var val = e.currentTarget.valueAsNumber;
                                    if (sym.sizeMultiplier != val) {
                                        sym.sizeMultiplier = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                }, min: 0.1, max: 10, step: 0.1})), 
                            React.createElement("br", null), 
                            React.createElement("label", null, 
                                strings.sizeLowLimit, 
                                React.createElement("input", {type: 'number', value: sym.sizeLowLimit.toString(), onChange: function (e) {
                                    var val = e.currentTarget.valueAsNumber;
                                    if (sym.sizeLowLimit != val) {
                                        sym.sizeLowLimit = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                }, min: 0})), 
                            React.createElement("br", null), 
                            React.createElement("label", null, 
                                strings.sizeUpLimit, 
                                React.createElement("input", {type: 'number', value: sym.sizeUpLimit.toString(), onChange: function (e) {
                                    var val = e.currentTarget.valueAsNumber;
                                    if (sym.sizeUpLimit != val) {
                                        sym.sizeUpLimit = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                }, min: 1})))
                        : null)
                : null, 
            sym.symbolType === Layer_1.SymbolTypes.Icon ?
                React.createElement("div", null, 
                    React.createElement("label", {htmlFor: 'iconSteps'}, strings.useMultipleIcons), 
                    React.createElement("input", {id: 'iconSteps', type: 'checkbox', onChange: this.onUseIconStepsChange, checked: sym.useMultipleIcons}), 
                    sym.useMultipleIcons ?
                        React.createElement("div", null, 
                            React.createElement("label", null, strings.iconField), 
                            React.createElement(Select, {options: layer.headers.slice(), onChange: this.onIconFieldChange, value: sym.iconField, clearable: false, placeholder: strings.selectPlaceholder}), 
                            sym.iconField && sym.iconField.type == 'number' ?
                                React.createElement("div", null, 
                                    strings.iconStepHelp, 
                                    React.createElement("br", null), 
                                    React.createElement("button", {onClick: this.onIconStepCountChange.bind(this, -1)}, "-"), 
                                    React.createElement("button", {onClick: this.onIconStepCountChange.bind(this, 1)}, "+")) : null, 
                            sym.iconField ? this.renderIconSteps.call(this) : null)
                        :
                            React.createElement("div", null, 
                                strings.setIcon, 
                                this.getIcon(sym.icons[0].shape, sym.icons[0].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, 0))), 
                    React.createElement("br", null), 
                    strings.iconColorHelp)
                : null, 
            sym.symbolType === Layer_1.SymbolTypes.Chart ?
                React.createElement("div", null, 
                    React.createElement("label", null, strings.selectHeadersToShow), 
                    React.createElement(Select, {options: layer.numberHeaders, multi: true, onChange: this.onChartFieldsChange, value: sym.chartFields.slice(), backspaceRemoves: false, placeholder: strings.selectPlaceholder}), 
                    strings.chartType, 
                    React.createElement("br", null), 
                    React.createElement("label", {htmlFor: 'pie'}, 
                        strings.chartTypePie, 
                        React.createElement("input", {type: 'radio', onChange: function () {
                            sym.chartType = 'pie';
                            if (autoRefresh)
                                layer.refresh();
                        }, checked: sym.chartType === 'pie', name: 'charttype', id: 'pie'}), 
                        React.createElement("br", null)), 
                    React.createElement("label", {htmlFor: 'donut'}, 
                        strings.chartTypeDonut, 
                        React.createElement("input", {type: 'radio', onChange: function () {
                            sym.chartType = 'donut';
                            if (autoRefresh)
                                layer.refresh();
                        }, checked: sym.chartType === 'donut', name: 'charttype', id: 'donut'}), 
                        React.createElement("br", null)))
                : null, 
            sym.symbolType === Layer_1.SymbolTypes.Blocks ?
                React.createElement("div", null, 
                    React.createElement("label", null, 
                        strings.singleBlockValue, 
                        React.createElement("input", {type: 'number', value: sym.blockValue.toString(), onChange: function (e) {
                            var val = e.currentTarget.valueAsNumber;
                            if (sym.blockValue != val) {
                                sym.blockValue = val;
                                if (autoRefresh)
                                    layer.refresh();
                            }
                        }, min: 1})), 
                    React.createElement("label", null, 
                        strings.singleBlockWidth, 
                        React.createElement("input", {type: 'number', value: sym.blockWidth.toString(), onChange: function (e) {
                            var val = e.currentTarget.valueAsNumber;
                            if (sym.blockWidth != val) {
                                sym.blockWidth = val;
                                if (autoRefresh)
                                    layer.refresh();
                            }
                        }, min: 1})), 
                    React.createElement("label", null, 
                        strings.maxBlockColumns, 
                        React.createElement("input", {type: 'number', value: sym.maxBlockColumns.toString(), onChange: function (e) {
                            var val = e.currentTarget.valueAsNumber;
                            if (sym.maxBlockColumns != val) {
                                sym.maxBlockColumns = val;
                                if (autoRefresh)
                                    layer.refresh();
                            }
                        }, min: 1})), 
                    React.createElement("label", null, 
                        strings.maxBlockRows, 
                        React.createElement("input", {type: 'number', value: sym.maxBlockRows.toString(), onChange: function (e) {
                            var val = e.currentTarget.valueAsNumber;
                            if (sym.maxBlockRows != val) {
                                sym.maxBlockRows = val;
                                if (autoRefresh)
                                    layer.refresh();
                            }
                        }, min: 1})))
                : null, 
            autoRefresh ? null :
                React.createElement("button", {className: 'menuButton', onClick: function () { layer.refresh(); }}, strings.refreshMap), 
            iconSelect));
    };
    SymbolMenu.prototype.renderIcons = function () {
        var arr = [];
        var columnCount = 7;
        for (var i = 0; i < faIcons.length; i += columnCount) {
            arr.push(React.createElement("tr", {key: i}, getColumns.call(this, i).map(function (column) {
                return column;
            })));
        }
        function getColumns(i) {
            var columns = [];
            for (var c = 0; c < columnCount; c++) {
                var style = {
                    width: 30,
                    height: 30,
                    border: this.props.state.editingLayer.symbolOptions.icons[this.props.state.symbolMenuState.currentIconIndex].iconFA === faIcons[i + c] ? '1px solid #000' : '1px solid #FFF',
                    borderRadius: 30,
                    lineHeight: '30px',
                    textAlign: 'center'
                };
                columns.push(React.createElement("td", {style: style, key: i + c, className: 'symbolIcon fa ' + faIcons[i + c], onClick: this.onFAIconChange.bind(this, faIcons[i + c])}));
            }
            return columns;
        }
        return (React.createElement("table", {style: { width: '100%', cursor: 'pointer' }}, 
            React.createElement("tbody", null, arr.map(function (td) {
                return td;
            }))
        ));
    };
    SymbolMenu.prototype.renderIconSteps = function () {
        var layer = this.props.state.editingLayer;
        var limits = layer.symbolOptions.iconLimits.slice();
        var rows = [];
        var row = 0;
        if (layer.symbolOptions.iconField.type == 'number') {
            for (var _i = 0, limits_1 = limits; _i < limits_1.length; _i++) {
                var i = limits_1[_i];
                rows.push(React.createElement("li", {key: i, style: { lineHeight: 0 }}, 
                    React.createElement("input", {id: row + 'min', type: 'number', defaultValue: i.toFixed(layer.symbolOptions.iconField.decimalAccuracy), style: {
                        width: 100,
                    }, onChange: this.onStepLimitChange.bind(this, row), step: 1 * Math.pow(10, (-layer.symbolOptions.iconField.decimalAccuracy))}), 
                    this.getIcon(layer.symbolOptions.icons[row].shape, layer.symbolOptions.icons[row].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, row))));
                row++;
            }
        }
        else {
            for (var _a = 0, _b = layer.uniqueValues[layer.symbolOptions.iconField.value]; _a < _b.length; _a++) {
                var i = _b[_a];
                rows.push(React.createElement("li", {key: i, style: { lineHeight: '30px' }}, 
                    i, 
                    this.getIcon(layer.symbolOptions.icons[row].shape, layer.symbolOptions.icons[row].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, row))));
                row++;
            }
        }
        return React.createElement("ul", {id: 'customSteps', style: { listStyle: 'none', padding: 0 }}, rows.map(function (r) { return r; }));
    };
    SymbolMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], SymbolMenu);
    return SymbolMenu;
}(React.Component));
exports.SymbolMenu = SymbolMenu;
var faIcons = [
    'fa-anchor',
    'fa-asterisk',
    'fa-automobile',
    'fa-motorcycle',
    'fa-ship',
    'fa-bank',
    'fa-shopping-bag',
    'fa-shopping-cart',
    'fa-bed',
    'fa-bell',
    'fa-binoculars',
    'fa-bicycle',
    'fa-bug',
    'fa-paw',
    'fa-camera',
    'fa-cloud',
    'fa-bolt',
    'fa-sun-o',
    'fa-beer',
    'fa-coffee',
    'fa-cutlery',
    'fa-diamond',
    'fa-exclamation',
    'fa-exclamation-triangle',
    'fa-female',
    'fa-male',
    'fa-fire',
    'fa-fire-extinguisher',
    'fa-flag',
    'fa-futbol-o',
    'fa-heart-o',
    'fa-home',
    'fa-info',
    'fa-leaf',
    'fa-tree',
    'fa-map-marker',
    'fa-minus-circle',
    'fa-pencil',
    'fa-question-circle',
    'fa-power-off',
    'fa-recycle',
    'fa-remove',
    'fa-road',
    'fa-rocket',
    'fa-search',
    'fa-star-o',
    'fa-thumb-tack',
    'fa-thumbs-o-up',
    'fa-thumbs-o-down',
    'fa-tint',
    'fa-trash',
    'fa-umbrella',
    'fa-wifi',
    'fa-wrench',
    'fa-life-ring',
    'fa-wheelchair',
];
var defaultChartColors = [
    '#6bbc60', '#e2e236', '#e28c36', '#36a6e2', '#e25636', '#36e2c9', '#364de2', '#e236c9', '#51400e', '#511f0e', '#40510e'
];
