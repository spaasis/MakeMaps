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
var Filter_1 = require('../../stores/Filter');
var mobx_react_1 = require('mobx-react');
var Layer_1 = require('../../stores/Layer');
var FilterMenu = (function (_super) {
    __extends(FilterMenu, _super);
    function FilterMenu() {
        var _this = this;
        _super.apply(this, arguments);
        this.onFilterVariableChange = function (val) {
            var filter = _this.props.state.editingFilter;
            filter.filterHeaderId = val.id;
            filter.title = val.label;
            if (val.type === 'string') {
                _this.props.state.filterMenuState.useCustomSteps = true;
                filter.useDistinctValues = true;
                _this.calculateSteps(val);
            }
            else {
                _this.props.state.filterMenuState.useCustomSteps = false;
                filter.useDistinctValues = false;
                _this.getMinMax();
            }
        };
        this.onStepsCountChange = function (amount) {
            var newVal = _this.props.state.filterMenuState.customStepCount + amount;
            if (newVal > 0) {
                _this.props.state.filterMenuState.customStepCount = newVal;
            }
        };
        this.onCreate = function () {
            var filter = new Filter_1.Filter(_this.props.state);
            filter.id = _this.props.state.nextFilterId;
            filter.layerId = _this.props.state.editingLayer.id;
            var header = _this.props.state.editingLayer.headers[0];
            filter.filterHeaderId = header.id;
            filter.title = header.label;
            _this.props.state.filters.push(filter);
            _this.props.state.filterMenuState.selectedFilterId = filter.id;
            if (header.type === 'string') {
                _this.props.state.filterMenuState.useCustomSteps = true;
                filter.useDistinctValues = true;
                _this.calculateSteps(header);
            }
            else {
                _this.props.state.filterMenuState.useCustomSteps = false;
                filter.useDistinctValues = false;
                _this.getMinMax();
            }
        };
        this.onSave = function () {
            var filter = _this.props.state.editingFilter;
            var header = _this.props.state.layers.filter(function (f) { return f.id == filter.layerId; })[0].getHeaderById(filter.filterHeaderId);
            if (!filter.show)
                filter.init();
            if (header.type == 'number' && _this.props.state.filterMenuState.useCustomSteps) {
                filter.steps = _this.getStepValues();
                filter.categories = null;
            }
            else
                filter.steps = null;
        };
        this.onDelete = function () {
            var filter = _this.props.state.editingFilter;
            filter.currentMax = filter.totalMax;
            filter.currentMin = filter.totalMin;
            filter.filterLayer();
            _this.props.state.filters = _this.props.state.filters.filter(function (f) { return f.id !== filter.id; });
            _this.props.state.filterMenuState.selectedFilterId = -1;
        };
    }
    FilterMenu.prototype.getMinMax = function () {
        var filter = this.props.state.editingFilter;
        if (filter) {
            var layer = this.props.state.layers.filter(function (l) { return l.id == filter.layerId; })[0];
            var field = layer.getHeaderById(filter.filterHeaderId).value;
            var minVal = layer.values[field][0];
            var maxVal = layer.values[field][layer.values[field].length - 1];
            filter.totalMin = minVal;
            filter.currentMin = minVal;
            filter.totalMax = maxVal;
            filter.currentMax = maxVal;
        }
    };
    FilterMenu.prototype.calculateSteps = function (header) {
        var state = this.props.state.filterMenuState;
        var filter = this.props.state.editingFilter;
        var layer = this.props.state.layers.filter(function (l) { return l.id == filter.layerId; })[0];
        var steps = [];
        if (state.useCustomSteps) {
            if (filter.useDistinctValues) {
                var values = layer.uniqueValues[header.value];
                if (header.type == 'string') {
                    filter.categories = values;
                    return;
                }
                for (var i = 0; i < values.length - 1; i++) {
                    var step = [values[i], values[i + 1] - 1];
                    steps.push(step);
                }
            }
            else if (this.props.state.editingFilter.steps && this.props.state.editingFilter.steps.length > 0) {
                steps = this.props.state.editingFilter.steps;
            }
            else {
                for (var i = filter.totalMin; i < filter.totalMax; i += (filter.totalMax - filter.totalMin) / state.customStepCount) {
                    var step = [i, i + (filter.totalMax - filter.totalMin) / state.customStepCount - 1];
                    steps.push(step);
                }
            }
        }
        filter.steps = steps;
    };
    FilterMenu.prototype.getStepValues = function () {
        var steps = [];
        for (var i = 0; i < this.props.state.filterMenuState.customStepCount; i++) {
            var step = [+document.getElementById(i + 'min').value,
                +document.getElementById(i + 'max').value];
            steps.push(step);
        }
        return steps;
    };
    FilterMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        var layers = [];
        if (this.props.state.layers) {
            for (var _i = 0, _a = this.props.state.layers; _i < _a.length; _i++) {
                var layer_1 = _a[_i];
                layers.push({ value: layer_1, label: layer_1.name });
            }
        }
        var filters = [];
        for (var i in this.props.state.filters.slice()) {
            filters.push({ value: this.props.state.filters[i].id, label: this.props.state.filters[i].title });
        }
        var filter = this.props.state.editingFilter;
        var layer = filter ? this.props.state.layers.filter(function (l) { return l.id == filter.layerId; })[0] : null;
        var state = this.props.state.filterMenuState;
        var header = layer ? layer.getHeaderById(filter.filterHeaderId) : null;
        return (this.props.state.layers.slice().length == 0 ? null :
            React.createElement("div", {className: "makeMaps-options"}, 
                filters ?
                    React.createElement("div", null, 
                        React.createElement("label", null, strings.selectFilter), 
                        React.createElement(Select, {options: filters, onChange: function (id) {
                            state.selectedFilterId = id != null ? id.value : -1;
                            var filt = _this.props.state.filters.filter(function (f) { return f.id == id.value; })[0];
                            if (filt) {
                                var steps = filt.steps.slice();
                                var categories = filt.categories.slice();
                                state.useCustomSteps = steps.length > 0 || categories.length > 0;
                            }
                        }, value: filter, valueRenderer: function (v) { return v.title; }, placeholder: strings.selectPlaceholder}), 
                        strings.or) : null, 
                React.createElement("button", {className: 'menuButton', onClick: this.onCreate}, strings.createNewFilter), 
                React.createElement("br", null), 
                filter ?
                    React.createElement("div", null, 
                        React.createElement("label", null, strings.selectFilterLayer), 
                        React.createElement(Select, {options: layers, onChange: function (val) {
                            filter.layerId = val.value.id;
                        }, value: layer, valueRenderer: function (option) {
                            return option ? option.name : '';
                        }, clearable: false, placeholder: strings.selectPlaceholder}), 
                        React.createElement("br", null), 
                        React.createElement("label", null, 
                            strings.giveNameToFilter, 
                            React.createElement("input", {type: "text", onChange: function (e) {
                                filter.title = e.target.value;
                            }, value: filter ? filter.title : ''})), 
                        filter.show ? React.createElement("br", null)
                            :
                                React.createElement("div", null, 
                                    React.createElement("label", null, 
                                        strings.selectFilterVariable, 
                                        React.createElement(Select, {options: layer.headers.slice(), onChange: this.onFilterVariableChange, value: header, placeholder: strings.selectPlaceholder, clearable: false}))
                                ), 
                        filter.filterHeaderId != undefined ?
                            React.createElement("div", null, 
                                header.type !== 'string' ?
                                    React.createElement("div", null, 
                                        React.createElement("label", {htmlFor: 'steps'}, 
                                            strings.filterUseSteps, 
                                            React.createElement("input", {type: 'checkbox', onChange: function (e) {
                                                state.useCustomSteps = e.target.checked;
                                                _this.calculateSteps(header);
                                            }, checked: state.useCustomSteps, id: 'steps'}), 
                                            React.createElement("br", null)), 
                                        React.createElement("label", {htmlFor: 'showSlider'}, 
                                            strings.filterShowSlider, 
                                            React.createElement("input", {type: 'checkbox', onChange: function (e) {
                                                filter.showSlider = e.target.checked;
                                            }, checked: filter.showSlider, id: 'showSlider'}), 
                                            React.createElement("br", null)))
                                    :
                                        React.createElement("label", {htmlFor: 'multiSelect'}, 
                                            strings.filterMultiSelect, 
                                            React.createElement("input", {type: 'checkbox', onChange: function (e) {
                                                var val = e.target.checked;
                                                filter.allowCategoryMultiSelect = val;
                                                if (!val && filter.selectedCategories.length > 1)
                                                    filter.selectedCategories.splice(1, filter.selectedCategories.length);
                                            }, checked: filter.allowCategoryMultiSelect, id: 'multiSelect'}), 
                                            React.createElement("br", null)), 
                                header.type !== 'string' && state.useCustomSteps && filter.totalMin !== undefined && filter.totalMax !== undefined ?
                                    React.createElement("div", null, 
                                        React.createElement("label", {htmlFor: 'dist'}, 
                                            strings.filterUseDistinctValues, 
                                            React.createElement("input", {type: 'checkbox', onChange: function (e) {
                                                filter.steps = [];
                                                filter.useDistinctValues = e.target.checked;
                                                state.customStepCount = e.target.checked ? layer.uniqueValues[header.value].length - 1 : 5;
                                                _this.calculateSteps(header);
                                            }, checked: filter.useDistinctValues, id: 'dist'}), 
                                            React.createElement("br", null)), 
                                        this.renderSteps.call(this))
                                    : null, 
                                state.useCustomSteps || header.type === 'string' ?
                                    React.createElement("div", null, 
                                        React.createElement("label", {htmlFor: 'noSelect'}, 
                                            strings.filterAllowNoSelection, 
                                            React.createElement("input", {type: 'checkbox', onChange: function (e) {
                                                var val = e.target.checked;
                                                filter.forceSelection = val;
                                                if (val) {
                                                    filter.selectedStep = filter.selectedStep > -1 ? filter.selectedStep : filter.steps && filter.steps.length > 0 ? 0 : -1;
                                                    filter.selectedCategories = filter.selectedCategories.length > 0 ? filter.selectedCategories : filter.categories.length > 0 ? [filter.categories[0]] : [];
                                                }
                                            }, checked: filter.forceSelection, id: 'noSelect'}), 
                                            React.createElement("br", null))
                                    ) : null)
                            : null, 
                        layer.layerType === Layer_1.LayerTypes.HeatMap ? null :
                            React.createElement("div", null, 
                                React.createElement("label", {htmlFor: 'remove'}, 
                                    strings.filterRemove, 
                                    React.createElement("input", {type: 'radio', onChange: function () {
                                        if (!filter.remove) {
                                            filter.remove = true;
                                            if (filter.show) {
                                                filter.init();
                                                filter.filterLayer();
                                            }
                                        }
                                    }, checked: filter.remove, name: 'filterMethod', id: 'remove'})), 
                                React.createElement("br", null), 
                                strings.or, 
                                React.createElement("br", null), 
                                React.createElement("label", {htmlFor: 'opacity', style: { marginTop: 0 }}, 
                                    strings.filterChangeOpacity, 
                                    React.createElement("input", {type: 'radio', onChange: function () {
                                        if (filter.remove) {
                                            filter.remove = false;
                                            if (filter.show) {
                                                filter.init();
                                                filter.filterLayer();
                                            }
                                        }
                                    }, checked: !filter.remove, name: 'filterMethod', id: 'opacity'}))), 
                        filter.show ?
                            React.createElement("button", {className: 'menuButton', onClick: this.onDelete}, strings.deleteFilter)
                            :
                                React.createElement("button", {className: 'menuButton', onClick: this.onSave}, strings.saveFilter), 
                        React.createElement("br", null), 
                        React.createElement("i", null, strings.filterDragTip))
                    :
                        null));
    };
    FilterMenu.prototype.renderSteps = function () {
        var filter = this.props.state.editingFilter;
        var header = this.props.state.layers.filter(function (f) { return f.id == filter.layerId; })[0].getHeaderById(filter.filterHeaderId);
        var rows = [];
        var inputStyle = {
            display: 'inline',
            width: 100
        };
        var row = 0;
        if (header.type == 'number') {
            filter.steps.map(function (s) {
                rows.push(React.createElement("li", {key: row}, 
                    React.createElement("input", {id: row + 'min', type: 'number', value: s[0].toString(), onChange: function (e) { s[0] = e.currentTarget.valueAsNumber; }, style: inputStyle, step: 'any'}), 
                    "-", 
                    React.createElement("input", {id: row + 'max', type: 'number', value: s[1].toString(), onChange: function (e) { s[1] = e.currentTarget.valueAsNumber; }, style: inputStyle, step: 'any'})));
                row++;
            });
        }
        else {
            filter.categories.map(function (s) {
                rows.push(React.createElement("li", {key: row}, 
                    React.createElement("span", {style: inputStyle, step: 'any'}, s)
                ));
                row++;
            });
        }
        return React.createElement("div", null, 
            React.createElement("button", {onClick: this.onStepsCountChange.bind(this, -1)}, "-"), 
            React.createElement("button", {onClick: this.onStepsCountChange.bind(this, 1)}, "+"), 
            React.createElement("ul", {id: 'customSteps', style: { listStyle: 'none', padding: 0 }}, rows.map(function (r) { return r; })));
    };
    FilterMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], FilterMenu);
    return FilterMenu;
}(React.Component));
exports.FilterMenu = FilterMenu;
