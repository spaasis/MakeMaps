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
var Slider = require('react-slider');
var Draggable = require('react-draggable');
var mobx_react_1 = require('mobx-react');
require('../../../styles/react-slider.css');
var OnScreenFilter = (function (_super) {
    __extends(OnScreenFilter, _super);
    function OnScreenFilter() {
        var _this = this;
        _super.apply(this, arguments);
        this.advanceSliderWhenLocked = function (lower, upper) {
            var filter = _this.props.filter;
            var minValDiff = filter.currentMin - lower;
            var maxValDiff = filter.currentMax - upper;
            if (minValDiff != 0) {
                if (filter.currentMin - minValDiff >= filter.totalMin &&
                    filter.currentMax - minValDiff <= filter.totalMax) {
                    filter.currentMin -= minValDiff;
                    filter.currentMax -= minValDiff;
                }
                else {
                    if (filter.currentMin - minValDiff < filter.totalMin) {
                        filter.currentMin = filter.totalMin;
                        filter.currentMax = filter.totalMin + filter.lockedDistance;
                    }
                    if (filter.currentMax - minValDiff > filter.totalMax) {
                        filter.currentMax = filter.totalMax;
                        filter.currentMin = filter.totalMax - filter.lockedDistance;
                    }
                }
            }
            else if (maxValDiff != 0) {
                if (filter.currentMin - maxValDiff >= filter.totalMin &&
                    filter.currentMax - maxValDiff <= filter.totalMax) {
                    filter.currentMin -= maxValDiff;
                    filter.currentMax -= maxValDiff;
                }
                else {
                    if (filter.currentMin - maxValDiff < filter.totalMin) {
                        filter.currentMin = filter.totalMin;
                        filter.currentMax = filter.totalMin + filter.lockedDistance;
                    }
                    if (filter.currentMax - maxValDiff > filter.totalMax) {
                        filter.currentMax = filter.totalMax;
                        filter.currentMin = filter.totalMax - filter.lockedDistance;
                    }
                }
            }
            _this.props.filter.filterLayer();
        };
        this.onFilterScaleChange = function (values) {
            if (_this.props.filter.locked) {
                _this.advanceSliderWhenLocked(values[0], values[1]);
            }
            else {
                _this.props.filter.currentMin = values[0];
                _this.props.filter.currentMax = values[1];
            }
            _this.props.filter.filterLayer();
        };
        this.onCurrentMinChange = function (e) {
            var val = e.currentTarget.valueAsNumber;
            _this.props.filter.selectedStep = -1;
            if (_this.props.filter.locked) {
                _this.advanceSliderWhenLocked(val, _this.props.filter.currentMax);
            }
            else {
                _this.props.filter.currentMin = val;
            }
            _this.props.filter.filterLayer();
        };
        this.onCurrentMaxChange = function (e) {
            var val = e.currentTarget.valueAsNumber;
            _this.props.filter.selectedStep = -1;
            if (_this.props.filter.locked) {
                _this.advanceSliderWhenLocked(_this.props.filter.currentMin, val);
            }
            else {
                _this.props.filter.currentMax = val;
            }
            _this.props.filter.filterLayer();
        };
        this.onKeyDown = function (e) {
            var filter = _this.props.filter;
            var up = e.keyCode == 38;
            var down = e.keyCode == 40;
            if (up || down) {
                if (filter.categories.length > 0) {
                    var index = filter.categories.indexOf(filter.selectedCategories[filter.selectedCategories.length - 1]);
                    index += up ? -1 : 1;
                    _this.onCustomCategoryClick(index == -1 ? 0 : index);
                }
                else if (filter.steps.length > 0) {
                    var index = filter.selectedStep + (up ? -1 : 1);
                    if (index > -1 && index < filter.steps.length)
                        _this.onCustomStepClick(index);
                    else
                        _this.onCustomStepClick(0);
                }
            }
        };
        this.onCustomStepClick = function (i) {
            var filter = _this.props.filter;
            if (filter.selectedStep == i) {
                if (!filter.forceSelection) {
                    filter.selectedStep = -1;
                    filter.currentMin = filter.totalMin;
                    filter.currentMax = filter.totalMax;
                }
            }
            else {
                var minVal = filter.steps[i][0];
                var maxVal = filter.steps[i][1];
                filter.currentMin = minVal;
                filter.currentMax = maxVal;
                filter.selectedStep = i;
            }
            filter.filterLayer();
        };
        this.onCustomCategoryClick = function (i) {
            var filter = _this.props.filter;
            var categories = filter.selectedCategories;
            var category = filter.categories[i];
            var index = categories.indexOf(category);
            if (index == -1) {
                if (!filter.allowCategoryMultiSelect)
                    categories.splice(0, categories.length);
                categories.push(category);
            }
            else if (!filter.forceSelection || (filter.forceSelection && categories.length > 1))
                categories.splice(index, 1);
            filter.filterLayer();
        };
    }
    OnScreenFilter.prototype.componentDidMount = function () {
        var filter = this.props.filter;
        setTimeout(function () {
            filter.x = Math.min(filter.x, window.innerWidth - +document.getElementById('filter' + filter.id).offsetWidth);
            filter.y = Math.min(filter.y, window.innerWidth - +document.getElementById('filter' + filter.id).offsetHeight);
        }, 10);
    };
    OnScreenFilter.prototype.render = function () {
        var _this = this;
        var filter = this.props.filter;
        var map = filter.appState.map;
        var header = this.props.state.layers.filter(function (layer) { return layer.id == filter.layerId; })[0].getHeaderById(filter.filterHeaderId);
        return React.createElement(Draggable, {handle: '.filterhead', position: { x: filter.x, y: filter.y }, onStop: function (e, data) {
            filter.x = data.x;
            filter.y = data.y;
        }, bounds: 'parent'}, 
            React.createElement("div", {className: 'filter', id: 'filter' + filter.id, onMouseEnter: function (e) { map.dragging.disable(); map.scrollWheelZoom.disable(); map.keyboard.disable(); document.onkeydown = _this.onKeyDown.bind(_this); }, onMouseLeave: function (e) { map.dragging.enable(); map.scrollWheelZoom.enable(); map.keyboard.enable(); document.onkeydown = null; }, onKeyDown: this.onKeyDown.bind(this)}, 
                React.createElement("div", {className: 'filterhead', style: { position: 'sticky' }}, 
                    React.createElement("h3", null, filter.title)
                ), 
                this.renderSteps.call(this), 
                header.type == 'number' && filter.showSlider ?
                    React.createElement("div", {style: { display: 'inline-flex' }}, 
                        React.createElement("input", {type: 'number', style: { width: '70px' }, value: filter.currentMin.toFixed(0), onChange: this.onCurrentMinChange}), 
                        React.createElement(Slider, {className: 'horizontal-slider', onAfterChange: function (e) { _this.onFilterScaleChange(e); filter.selectedStep = -1; }, value: [filter.currentMin, filter.currentMax], min: filter.totalMin, max: filter.totalMax, withBars: true}, 
                            React.createElement("div", {className: 'minHandle'}), 
                            React.createElement("div", {className: 'maxHandle'})), 
                        React.createElement("input", {type: 'number', style: { width: '70px' }, value: filter.currentMax.toFixed(0), onChange: this.onCurrentMaxChange}), 
                        React.createElement("div", {style: { display: 'inline-block', cursor: 'pointer' }, onClick: function () {
                            filter.locked = !filter.locked;
                            filter.lockedDistance = filter.currentMax - filter.currentMin;
                        }}, 
                            React.createElement("i", {style: { color: 'cecece', fontSize: 20, padding: 4 }, className: !filter.locked ? 'fa fa-unlock-alt' : 'fa fa-lock'})
                        ))
                    : null)
        );
    };
    OnScreenFilter.prototype.renderSteps = function () {
        var rows = [];
        var filter = this.props.filter;
        if (filter.steps && filter.steps.slice().length > 0) {
            var index_1 = 0;
            filter.steps.forEach(function (step) {
                rows.push(React.createElement("div", {style: {
                    borderBottom: '1px solid #6891e2',
                    textAlign: 'center',
                    cursor: 'pointer',
                    height: 40,
                    lineHeight: '40px',
                    fontWeight: filter.selectedStep === index_1 ? 'bold' : 'normal',
                    textDecoration: filter.selectedStep === index_1 ? 'underline' : '',
                }, key: step[0], onClick: this.onCustomStepClick.bind(this, index_1)}, step[0] + (!filter.useDistinctValues ? ('-' + step[1]) : '')));
                index_1++;
            }, this);
        }
        else if (filter.categories && filter.categories.slice().length > 0) {
            var index_2 = 0;
            filter.categories.forEach(function (category) {
                rows.push(React.createElement("div", {style: {
                    borderBottom: '1px solid #6891e2',
                    textAlign: 'center',
                    cursor: 'pointer',
                    width: 200,
                    height: 40,
                    fontWeight: filter.selectedCategories.indexOf(category) > -1 ? 'bold' : 'normal',
                    textDecoration: filter.selectedCategories.indexOf(category) > -1 ? 'underline' : '',
                }, key: category, onClick: this.onCustomCategoryClick.bind(this, index_2)}, 
                    React.createElement("span", {style: {
                        textOverflow: 'ellipsis',
                        display: 'block',
                        width: '100%',
                        lineHeight: '40px',
                    }}, category)
                ));
                index_2++;
            }, this);
        }
        return React.createElement("div", null, 
            " ", 
            rows.map(function (e) { return e; }), 
            " ");
    };
    OnScreenFilter = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], OnScreenFilter);
    return OnScreenFilter;
}(React.Component));
exports.OnScreenFilter = OnScreenFilter;
