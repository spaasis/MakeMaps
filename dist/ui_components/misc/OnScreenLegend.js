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
var common_1 = require('../../common_items/common');
var Layer_1 = require('../../stores/Layer');
var mobx_react_1 = require('mobx-react');
var OnScreenLegend = (function (_super) {
    __extends(OnScreenLegend, _super);
    function OnScreenLegend() {
        _super.apply(this, arguments);
    }
    OnScreenLegend.prototype.createLegend = function (layer, showLayerName, showSeparator) {
        var choroLegend, scaledLegend, chartLegend, iconLegend, blockLegend;
        var options = layer;
        var col = options.colorOptions;
        var sym = options.symbolOptions;
        var isHeat = layer.layerType === Layer_1.LayerTypes.HeatMap;
        var isChart = layer.layerType == Layer_1.LayerTypes.Standard && layer.symbolOptions.symbolType === Layer_1.SymbolTypes.Chart;
        if (col.colors && col.colors.length !== 0 && !isChart && (isHeat || sym.symbolType !== Layer_1.SymbolTypes.Icon || sym.iconField !== col.colorField)) {
            var percentages = this.props.state.legend.showPercentages ? this.getStepPercentages(layer.values[col.colorField.value], col.limits) : [];
            choroLegend = this.createMultiColorLegend(options, percentages);
        }
        if (!isHeat && sym.symbolType === Layer_1.SymbolTypes.Chart && col.chartColors) {
            chartLegend = this.createChartSymbolLegend(col, sym);
        }
        if (!isHeat && (sym.symbolType === Layer_1.SymbolTypes.Simple || sym.symbolType === Layer_1.SymbolTypes.Chart) && (sym.sizeXVar || sym.sizeYVar)) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        if (!isHeat && sym.symbolType === Layer_1.SymbolTypes.Icon) {
            var percentages = this.props.state.legend.showPercentages && sym.iconLimits.length > 1 ? this.getStepPercentages(layer.values[sym.iconField.value], sym.iconLimits) : [];
            iconLegend = this.createIconLegend(options, percentages, layer.name);
        }
        if (!isHeat && sym.symbolType === Layer_1.SymbolTypes.Blocks) {
            blockLegend = this.createBlockLegend(options);
        }
        var hasLegend = choroLegend != null || chartLegend != null || scaledLegend != null || iconLegend != null || blockLegend != null;
        if (!hasLegend)
            return null;
        return React.createElement("div", {key: layer.id, style: { clear: 'both', padding: 10 }}, 
            React.createElement("div", null, showLayerName ? layer.name : null), 
            choroLegend, 
            scaledLegend, 
            chartLegend, 
            iconLegend, 
            blockLegend, 
            showSeparator ? React.createElement("hr", {style: { clear: 'both' }}) : null);
    };
    OnScreenLegend.prototype.createMultiColorLegend = function (layer, percentages) {
        var divs = [];
        var limits = layer.colorOptions.limits;
        var colors = layer.colorOptions.colors;
        var isNumber = layer.colorOptions.colorField.type == 'number';
        var legend = this.props.state.legend;
        for (var _i = 0, limits_1 = limits; _i < limits_1.length; _i++) {
            var i = limits_1[_i];
            var index = limits.indexOf(i);
            var colorStyle = {
                background: colors[index],
                opacity: layer.layerType === Layer_1.LayerTypes.HeatMap ? 1 : layer.colorOptions.fillOpacity,
                minWidth: '20px',
                minHeight: '20px',
            };
            divs.push(React.createElement("div", {key: i, style: { display: legend.horizontal ? 'initial' : 'flex', width: '100%' }}, 
                React.createElement("div", {style: colorStyle}), 
                React.createElement("span", {style: { marginLeft: '3px', marginRight: '3px' }}, 
                    isNumber ? i.toFixed(layer.colorOptions.colorField.decimalAccuracy) + (index < (limits.length - 1) ? '-' : '+') : i, 
                    legend.horizontal ? React.createElement("br", null) : '', 
                    isNumber && index < (limits.length - 1) ? limits[index + 1].toFixed(layer.colorOptions.colorField.decimalAccuracy) : '', 
                    isNumber && legend.showPercentages ? React.createElement("br", null) : null, 
                    isNumber && legend.showPercentages ? percentages[index] ? percentages[index] + '%' : '0%' : null)));
        }
        return React.createElement("div", {style: { margin: '5px', float: '', textAlign: 'center' }}, 
            legend.showVariableNames ? layer.colorOptions.colorField.label : null, 
            React.createElement("div", {style: { display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}, divs.map(function (d) { return d; })));
    };
    OnScreenLegend.prototype.createScaledSizeLegend = function (layer) {
        var symbolType = layer.symbolOptions.symbolType;
        var sym = layer.symbolOptions;
        var xVar = sym.sizeXVar;
        var yVar = sym.sizeYVar;
        var square = (xVar && yVar && xVar === yVar) || (xVar && symbolType === Layer_1.SymbolTypes.Chart);
        var style = {
            float: 'left',
            margin: 5,
            clear: this.props.state.legend.horizontal ? 'both' : ''
        };
        if (square)
            return (React.createElement("div", {style: style}, scaledLegend.call(this, false)));
        else {
            return (React.createElement("div", {style: style}, 
                xVar ? scaledLegend.call(this, false) : null, 
                yVar ? scaledLegend.call(this, true) : null));
        }
        function scaledLegend(y) {
            var divs = [], sides = [], values = [];
            var col = layer.colorOptions;
            var classes = 5;
            var minValue = sym.sizeLowLimit == 0 ? 0 : Math.max((y ? layer.values[yVar.value][0] : layer.values[xVar.value][0]), (Math.pow(sym.sizeLowLimit, 2) / sym.sizeMultiplier));
            var maxValue = Math.max((y ? layer.values[yVar.value][layer.values[yVar.value].length - 1] : layer.values[xVar.value][layer.values[xVar.value].length - 1]), Math.pow(sym.sizeUpLimit, 2) / sym.sizeMultiplier);
            for (var i = minValue; i < maxValue; i += (maxValue - minValue) / classes) {
                var val = i.toFixed(y ? yVar.decimalAccuracy : xVar.decimalAccuracy);
                values.push(val);
                sides.push(common_1.GetSymbolRadius(+val, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit));
            }
            var textWidth = values.length > 0 ? values[values.length - 1].length + 1 : 1;
            for (var i = 0; i < classes; i++) {
                var margin = (sides[sides.length - 1] - sides[i]) / 2;
                var l = sides[i];
                var style_1 = {
                    width: square ? l : y ? 10 : l,
                    height: square ? l : y ? l : 10,
                    backgroundColor: symbolType == Layer_1.SymbolTypes.Chart ? col.chartColors[xVar.value] ? col.chartColors[xVar.value] : '#36e' : col.fillColor,
                    display: this.props.state.legend.horizontal ? '' : 'inline-block',
                    border: col.weight + 'px solid' + col.color,
                    borderRadius: sym.borderRadius,
                    marginLeft: this.props.state.legend.horizontal || y ? 'auto' : margin,
                    marginRight: this.props.state.legend.horizontal || y ? 'auto' : margin,
                    marginTop: this.props.state.legend.horizontal && y ? margin : 'auto',
                    marginBottom: this.props.state.legend.horizontal && y ? margin : 'auto',
                };
                var parentDivStyle = {
                    float: this.props.state.legend.horizontal ? 'left' : '',
                    marginRight: this.props.state.legend.horizontal ? 5 : 0,
                };
                divs.push(React.createElement("div", {key: i, style: parentDivStyle}, 
                    React.createElement("div", {style: style_1}), 
                    React.createElement("span", {style: { display: 'inline-block', width: this.props.state.legend.horizontal ? '' : textWidth * 10 }}, values[i] + (i == 0 ? '-' : i == classes - 1 ? '+' : ''))));
            }
            return React.createElement("div", {style: { float: this.props.state.legend.horizontal ? '' : 'left', textAlign: 'center' }}, 
                y ? sym.sizeYVar.label : sym.sizeXVar.label, 
                React.createElement("div", null, divs.map(function (d) { return d; })));
        }
    };
    OnScreenLegend.prototype.createChartSymbolLegend = function (col, sym) {
        var divs = [];
        var headers = sym.chartFields;
        for (var i = 0; i < headers.length; i++) {
            var colorStyle = {
                background: col.chartColors[headers[i].value],
                minWidth: '20px',
                minHeight: '20px',
            };
            divs.push(React.createElement("div", {key: i, style: { display: this.props.state.legend.horizontal ? 'initial' : 'flex', width: '100%' }}, 
                React.createElement("div", {style: colorStyle}), 
                React.createElement("span", {style: { marginLeft: '3px', marginRight: '3px' }}, headers[i].label)));
        }
        return React.createElement("div", {style: { margin: '5px', float: '' }}, 
            React.createElement("div", {style: { display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}, divs.map(function (d) { return d; }))
        );
    };
    OnScreenLegend.prototype.createIconLegend = function (layer, percentages, layerName) {
        var divs = [];
        var col = layer.colorOptions;
        var sym = layer.symbolOptions;
        var icons = sym.icons.slice();
        var limits = sym.iconField == col.colorField ? this.combineLimits(layer) : sym.iconLimits.slice();
        var isNumber = sym.iconField.type == 'number';
        var legend = this.props.state.legend;
        if (limits && limits.length > 0) {
            for (var _i = 0, limits_2 = limits; _i < limits_2.length; _i++) {
                var i = limits_2[_i];
                var index = limits.indexOf(i);
                var fillColor = col.colorField === layer.symbolOptions.iconField && col.useMultipleFillColors ?
                    isNumber ?
                        common_1.GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), (limits[index] + limits[index]) / 2) :
                        col.colors[index]
                    : col.fillColor;
                var icon = icons.length == 1 ? icons[0] : isNumber ? common_1.GetItemBetweenLimits(sym.iconLimits.slice(), sym.icons.slice(), (i + limits[index]) / 2) : icons[index];
                divs.push(React.createElement("div", {key: i, style: { display: legend.horizontal ? 'initial' : 'flex', width: '100%' }}, 
                    !icon ? '' : getIcon(icon.shape, icon.fa, col.color, fillColor, fillColor != '000' ? layer.colorOptions.iconTextColor : 'FFF'), 
                    React.createElement("span", {style: { marginLeft: '3px', marginRight: '3px' }}, 
                        isNumber ? (i.toFixed(sym.iconField.decimalAccuracy) + (index < (limits.length - 1) ? '-' : '+')) : i, 
                        isNumber ? (legend.horizontal ? React.createElement("br", null) : '') : null, 
                        isNumber ? (index < (limits.length - 1) ? limits[index + 1].toFixed(sym.iconField.decimalAccuracy) : '') : null, 
                        legend.showPercentages ? React.createElement("br", null) : null, 
                        legend.showPercentages ? percentages[i] ? percentages[i] + '%' : '0%' : null)));
            }
            return React.createElement("div", {style: { margin: '5px', float: '', textAlign: 'center' }}, 
                legend.showVariableNames ? layer.symbolOptions.iconField.label : null, 
                React.createElement("div", {style: { display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}, divs.map(function (d) { return d; })));
        }
        else {
            return React.createElement("div", {style: { margin: '5px', float: 'left', textAlign: 'center' }}, 
                layerName, 
                React.createElement("div", {style: { display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}, getIcon(icons[0].shape, icons[0].fa, layer.colorOptions.color, layer.colorOptions.fillColor, layer.colorOptions.iconTextColor)));
        }
        function getIcon(shape, fa, stroke, fill, iconColor) {
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
            }
            return React.createElement("div", {style: {
                textAlign: 'center',
                verticalAlign: 'middle',
                color: iconColor,
                width: 42,
                height: 42,
            }}, 
                activeIcon, 
                React.createElement("i", {style: { position: 'relative', bottom: 33, width: 18, height: 18 }, className: 'fa ' + fa}));
        }
    };
    OnScreenLegend.prototype.createBlockLegend = function (layer) {
        var legend = this.props.state.legend;
        var style = {
            width: 10,
            height: 10,
            backgroundColor: layer.colorOptions.fillColor,
            float: legend.horizontal ? '' : 'left',
            border: '1px solid ' + layer.colorOptions.color,
            margin: 'auto',
        };
        var parentDivStyle = {
            float: legend.horizontal ? 'left' : '',
            minHeight: '15px',
            overflow: legend.horizontal ? 'none' : 'auto',
            lineHeight: legend.horizontal ? '' : 24 + 'px',
        };
        return (React.createElement("div", {style: { margin: '5px', float: 'left' }}, 
            legend.showVariableNames ? layer.symbolOptions.blockSizeVar ? layer.symbolOptions.blockSizeVar.label : '' : null, 
            React.createElement("div", {style: { display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}, 
                React.createElement("div", {style: style}), 
                "=", 
                React.createElement("span", {style: { display: 'inline-block' }}, layer.symbolOptions.blockValue))));
    };
    OnScreenLegend.prototype.getStepPercentages = function (values, limits) {
        var counts = [];
        var step = 0;
        var upperLimit = limits[step + 1];
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var i = values_1[_i];
            if (i >= upperLimit) {
                step++;
                if (step < limits.length - 1)
                    upperLimit = limits[step + 1];
                else
                    upperLimit = Infinity;
            }
            if (!counts[step])
                counts[step] = 0;
            counts[step]++;
        }
        var percentages = [];
        for (var i in counts) {
            percentages[i] = +(counts[i] / values.length * 100).toFixed(2);
        }
        return percentages;
    };
    OnScreenLegend.prototype.combineLimits = function (layer) {
        return layer.symbolOptions.iconLimits.concat(layer.colorOptions.limits.filter(function (item) {
            return layer.symbolOptions.iconLimits.indexOf(item) < 0;
        })).sort(function (a, b) { return a == b ? 0 : a < b ? -1 : 1; });
    };
    OnScreenLegend.prototype.render = function () {
        var state = this.props.state;
        var layers = state.layers;
        var legend = state.legend;
        var layerCount = 0;
        var classExtension = legend.right ? (state.visibleMenu > 0 ? ' legendRightAnimate' : ' legendLeftAnimate') : '';
        return (React.createElement("div", {className: 'legend' + classExtension, onMouseEnter: function (e) { state.map.dragging.disable(); state.map.scrollWheelZoom.disable(); }, onMouseLeave: function (e) { state.map.dragging.enable(); state.map.scrollWheelZoom.enable(); }, style: {
            width: 'auto',
            textAlign: 'center',
            position: 'absolute',
            left: legend.left ? 0 : '',
            right: legend.right ? (state.menuShown ? (state.visibleMenu == 0 ? 30 : 281) : 0) : '',
            bottom: legend.bottom ? 15 : '',
            top: legend.top ? 0 : '',
            background: "#FFF",
            borderRadius: 15,
            zIndex: 600
        }}, 
            React.createElement("h2", {className: 'legendHeader'}, legend.title), 
            React.createElement("div", null, layers.map(function (m) {
                layerCount++;
                return this.createLegend(m, layers.length > 1, layerCount < layers.length);
            }, this)), 
            legend.meta ?
                React.createElement("div", {style: { clear: 'both', padding: 10 }, dangerouslySetInnerHTML: { __html: legend.meta }}) : null));
    };
    OnScreenLegend = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], OnScreenLegend);
    return OnScreenLegend;
}(React.Component));
exports.OnScreenLegend = OnScreenLegend;
