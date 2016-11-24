"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var mobx_1 = require('mobx');
var common_1 = require('../common_items/common');
var React = require('react');
var d3 = require('d3');
var mobx = require('mobx');
var reactDOMServer = require('react-dom/server');
var chroma = require('chroma-js');
var Layer = (function () {
    function Layer(state, prev) {
        this.popupHeaderIds = [];
        this.onEachFeature = addPopups.bind(this);
        this.pointFeatureCount = 0;
        this.appState = state;
        this.id = prev && prev.id !== undefined ? prev.id : 0;
        this.name = prev && prev.name || '';
        this.geoJSON = prev && prev.geoJSON || undefined;
        this.layerType = prev && prev.layerType !== undefined ? prev.layerType : LayerTypes.Standard;
        this.showPopUpInPlace = prev && prev.showPopUpInPlace !== undefined ? prev.showPopUpInPlace : true;
        this.showPopUpOnHover = prev && prev.showPopUpOnHover || false;
        this.colorOptions = prev && prev.colorOptions ? new ColorOptions(prev.colorOptions) : new ColorOptions();
        this.symbolOptions = prev && prev.symbolOptions ? new SymbolOptions(prev.symbolOptions) : new SymbolOptions();
        this.clusterOptions = prev && prev.clusterOptions ? new ClusterOptions(prev.clusterOptions) : new ClusterOptions();
        this.bounds = prev && prev.bounds || undefined;
        this.headers = [];
        if (prev && prev.headers) {
            for (var _i = 0, _a = prev.headers; _i < _a.length; _i++) {
                var header = _a[_i];
                this.headers.push(new Header(header));
            }
        }
        this.popupHeaderIds = [];
        if (prev && prev.popupHeaderIds) {
            for (var _b = 0, _c = prev.popupHeaderIds; _b < _c.length; _b++) {
                var id = _c[_b];
                this.popupHeaderIds.push(id);
            }
        }
        this.symbolOptions.chartFields = [];
        if (prev && prev.symbolOptions['chartHeaderIds']) {
            for (var _d = 0, _e = prev.symbolOptions['chartHeaderIds']; _d < _e.length; _d++) {
                var id = _e[_d];
                this.symbolOptions.chartFields.push(this.getHeaderById(id));
            }
        }
        else if (prev && prev.symbolOptions.chartFields) {
            for (var _f = 0, _g = prev.symbolOptions.chartFields; _f < _g.length; _f++) {
                var header = _g[_f];
                this.symbolOptions.chartFields.push(new Header(header));
            }
        }
    }
    Object.defineProperty(Layer.prototype, "numberHeaders", {
        get: function () {
            return this.headers.filter(function (val) { return val.type === 'number'; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Layer.prototype, "categories", {
        get: function () {
            return this.headers.filter(function (val) { return val.type === 'string'; });
        },
        enumerable: true,
        configurable: true
    });
    Layer.prototype.getHeaderById = function (id) {
        return this.headers.filter(function (val) { return val.id === id; })[0];
    };
    Layer.prototype.refresh = function () {
        var col = this.colorOptions;
        var sym = this.symbolOptions;
        var style = function (col, feature) {
            return {
                fillOpacity: col.fillOpacity,
                opacity: col.opacity,
                fillColor: col.colors.slice().length == 0 || !col.useMultipleFillColors ?
                    col.fillColor :
                    col.colorField.type == 'number' ?
                        common_1.GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), feature.properties[col.colorField.value])
                        : col.colors[col.limits.indexOf(feature.properties[col.colorField.value])],
                color: col.color,
                weight: col.weight,
            };
        };
        if (this.layerType !== LayerTypes.HeatMap) {
            var start = Date.now();
            var that = this;
            var path_1 = false;
            this.displayLayer.eachLayer(function (l) {
                if (l.setStyle) {
                    l.setStyle(style(col, l.feature));
                    path_1 = true;
                }
                else {
                    var marker = getMarker(col, sym, l.feature, l.latlng);
                    var icon = marker.options.icon;
                    l.setIcon(icon);
                }
            });
            this.refreshFilters();
            this.refreshCluster();
            var end = Date.now();
            if (end - start > 500) {
                if (this.appState.autoRefresh) {
                    common_1.ShowNotification(this.appState.strings.autoRefreshDisabled);
                    this.appState.autoRefresh = false;
                }
            }
            if (this.layerType.valueOf() !== LayerTypes.HeatMap.valueOf()) {
                if ((this.symbolOptions.sizeXVar || this.symbolOptions.sizeYVar) &&
                    this.symbolOptions.symbolType === SymbolTypes.Simple || this.symbolOptions.symbolType === SymbolTypes.Chart) {
                }
            }
        }
        else {
            this.reDraw();
        }
    };
    Layer.prototype.reDraw = function () {
        this.appState.map.removeLayer(this.displayLayer);
        this.init();
    };
    Layer.prototype.init = function () {
        var col = this.colorOptions;
        var sym = this.symbolOptions;
        var style = function (col, feature) {
            return {
                fillOpacity: col.fillOpacity,
                opacity: col.opacity,
                fillColor: col.colors.slice().length == 0 || !col.useMultipleFillColors ?
                    col.fillColor :
                    col.colorField.type == 'number' ?
                        common_1.GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), feature.properties[col.colorField.value])
                        : col.colors[col.limits.indexOf(feature.properties[col.colorField.value])],
                color: col.color,
                weight: col.weight,
            };
        };
        if (this.geoJSON) {
            this.getValues();
            if (this.layerType === LayerTypes.HeatMap && this.colorOptions.colorField) {
                this.displayLayer = createHeatLayer(this);
                this.appState.map.addLayer(this.displayLayer);
                this.finishDraw();
                return;
            }
            else {
                console.time('start');
                this.displayLayer = L.geoJSON([], {
                    onEachFeature: this.onEachFeature,
                    pointToLayer: getMarker.bind(this, col, sym),
                    style: style.bind(this, col),
                });
                this.batchAdd(0, this.geoJSON, this.displayLayer, this.partialDraw.bind(this), this.finishDraw.bind(this));
            }
        }
        if (this.layerType !== LayerTypes.HeatMap) {
            if ((this.symbolOptions.sizeXVar || this.symbolOptions.sizeYVar) &&
                this.symbolOptions.symbolType === SymbolTypes.Simple || this.symbolOptions.symbolType === SymbolTypes.Chart) {
            }
        }
        if (this.bounds) {
            this.appState.bounds = L.latLngBounds(this.bounds._southWest, this.bounds._northEast);
        }
    };
    Layer.prototype.partialDraw = function (i) {
        if (this.displayLayer) {
            if (this.layerType !== LayerTypes.HeatMap && this.clusterOptions.useClustering) {
                var markers = L.markerClusterGroup({
                    iconCreateFunction: this.createClusteredIcon.bind(this),
                    chunkedLoading: true,
                });
                markers.on('clustermouseover', function (c) {
                    if (c.layer._group._spiderfied)
                        return;
                    if (this.showPopUpInPlace)
                        c.layer.openPopup();
                    else
                        this.appState.infoScreenText = c.layer.getPopup().getContent();
                }, this);
                markers.on('clustermouseout', function (c) {
                    if (this.showPopUpInPlace)
                        c.layer.closePopup();
                    else
                        this.appState.infoScreenText = null;
                }, this);
                markers.on('click', function (c) {
                    c.layer.closePopup();
                });
                markers.on('clusterclick', function (c) {
                    c.layer.closePopup();
                });
                markers.addLayer(this.displayLayer);
                this.displayLayer = markers;
            }
            if (!this.bounds) {
                this.appState.bounds = this.bounds || this.layerType === LayerTypes.HeatMap ? this.displayLayer._latlngs : this.displayLayer.getBounds();
            }
            this.appState.map.addLayer(this.displayLayer);
            var add_1 = this.batchAdd.bind(this);
            var finish_1 = this.finishDraw.bind(this);
            var geoJSON_1 = this.geoJSON;
            var displayLayer_1 = this.displayLayer;
            setTimeout(function () { add_1(i, geoJSON_1, displayLayer_1, null, finish_1); }, 10);
        }
    };
    Layer.prototype.finishDraw = function () {
        this.initFilters();
        this.refreshFilters();
        if (!this.bounds) {
            this.appState.bounds = this.layerType === LayerTypes.HeatMap ? this.displayLayer._latlngs : this.displayLayer.getBounds();
            this.bounds = this.appState.map.getBounds();
        }
        common_1.HideLoading();
        console.timeEnd('start');
    };
    Layer.prototype.initFilters = function () {
        var _this = this;
        var filters = this.appState.filters.filter(function (f) { return f.layerId === _this.id; });
        for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
            var filter = filters_1[_i];
            filter.init();
        }
    };
    Layer.prototype.refreshFilters = function () {
        var _this = this;
        var filters = this.appState.filters.filter(function (f) { return f.layerId === _this.id; });
        for (var _i = 0, filters_2 = filters; _i < filters_2.length; _i++) {
            var filter = filters_2[_i];
            filter.filterLayer();
        }
    };
    Layer.prototype.refreshPopUps = function () {
        if (this.layerType !== LayerTypes.HeatMap) {
            if (this.displayLayer && this.popupHeaderIds) {
                if (this.showPopUpInPlace)
                    this.appState.infoScreenText = null;
                this.displayLayer.eachLayer(function (l) {
                    addPopups.call(this, l.feature, l);
                }, this);
            }
        }
    };
    Layer.prototype.refreshCluster = function () {
        if (this.displayLayer.refreshClusters) {
            this.displayLayer.refreshClusters();
        }
    };
    Layer.prototype.getColors = function () {
        var opts = this.colorOptions;
        if (!opts.colorField) {
            return;
        }
        var values = this.values[opts.colorField.value];
        var colors = [];
        opts.limits = chroma.limits(values, opts.mode, opts.steps);
        opts.limits.splice(opts.limits.length - 1, 1);
        opts.limits = opts.limits.filter(function (e, i, arr) {
            return arr.lastIndexOf(e) === i;
        });
        colors = chroma.scale(opts.colorScheme).colors(opts.limits.length);
        opts.colors = opts.revert ? colors.reverse() : colors;
    };
    Layer.prototype.setOpacity = function () {
        if (this.layerType === LayerTypes.HeatMap) {
            this.reDraw();
            return;
        }
        for (var _i = 0, _a = this.displayLayer.getLayers(); _i < _a.length; _i++) {
            var lyr = _a[_i];
            if (lyr.setOpacity)
                lyr.setOpacity(this.colorOptions.opacity);
            else
                lyr.setStyle({ fillOpacity: this.colorOptions.fillOpacity, opacity: this.colorOptions.opacity });
        }
        this.refreshFilters();
        this.refreshCluster();
    };
    Layer.prototype.getValues = function () {
        console.time('getValues');
        if (!this.values)
            this.values = {};
        if (!this.uniqueValues)
            this.uniqueValues = {};
        var pointCount = 0;
        this.geoJSON.features.map(function (feat) {
            if (feat.geometry.type == 'Point') {
                pointCount++;
            }
            for (var i in feat.properties) {
                if (!this.values[i])
                    this.values[i] = [];
                if (feat.properties[i] != null)
                    this.values[i].push(feat.properties[i]);
            }
        }, this);
        for (var i in this.headers.slice()) {
            var header = this.headers[i].value;
            if (this.values[header]) {
                this.values[header].sort(function (a, b) { return a == b ? 0 : a < b ? -1 : 1; });
                this.uniqueValues[header] = unique(this.values[header]);
            }
        }
        this.pointFeatureCount = pointCount;
        function unique(arr) {
            var u = {}, a = [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                if (u.hasOwnProperty(arr[i])) {
                    continue;
                }
                a.push(arr[i]);
                u[arr[i]] = 1;
            }
            return a;
        }
        console.timeEnd('getValues');
    };
    Layer.prototype.createClusteredIcon = function (cluster) {
        var values = {};
        var avg = {};
        var sum = {};
        var col = this.colorOptions;
        var clu = this.clusterOptions;
        var sym = this.symbolOptions;
        var count = 0;
        var markers = cluster.getAllChildMarkers();
        var relevantHeaders = [];
        if (col.colorField)
            relevantHeaders.push(col.colorField);
        switch (sym.symbolType) {
            case SymbolTypes.Simple:
                if (sym.sizeXVar)
                    relevantHeaders.push(sym.sizeXVar);
                if (sym.sizeYVar)
                    relevantHeaders.push(sym.sizeYVar);
                break;
            case SymbolTypes.Icon:
                relevantHeaders.push(sym.iconField);
                break;
            case SymbolTypes.Blocks:
                relevantHeaders.push(sym.blockSizeVar);
                break;
            case SymbolTypes.Chart:
                sym.chartFields.map(function (f) { relevantHeaders.push(f); });
        }
        for (var _i = 0, _a = clu.hoverHeaders; _i < _a.length; _i++) {
            var h = _a[_i];
            var header = this.getHeaderById(h.headerId);
            if (relevantHeaders.indexOf(header) == -1 && (h.showAvg || h.showSum)) {
                relevantHeaders.push(header);
            }
        }
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.options.icon && marker.options.icon.options.className.indexOf('marker-hidden') > -1)
                continue;
            count++;
            for (var _b = 0, _c = relevantHeaders.slice(); _b < _c.length; _b++) {
                var h = _c[_b];
                var val = marker.feature.properties[h.value];
                if (val !== undefined) {
                    if (!values[h.value])
                        values[h.value] = [];
                    values[h.value].push(val);
                    if (h.type == 'number') {
                        if (sum[h.value] === undefined)
                            sum[h.value] = 0;
                        sum[h.value] += +val;
                        avg[h.value] = values[h.value].length > 0 ? +(sum[h.value] / values[h.value].length).toFixed(h.decimalAccuracy) : 0;
                    }
                }
            }
        }
        if (col.colorField && col.useMultipleFillColors) {
            col.fillColor = common_1.GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), avg[col.colorField.value]);
        }
        var icon;
        if (clu.useSymbolStyle) {
            switch (sym.symbolType) {
                case SymbolTypes.Icon:
                    icon = getFaIcon(sym, col, 0, avg[sym.iconField.value]);
                    break;
                case SymbolTypes.Chart:
                    var vals_1 = [];
                    sym.chartFields.map(function (e) {
                        if (avg[e.value] > 0)
                            vals_1.push({ feat: e, val: avg[e.value], color: col.chartColors[e.value] });
                    });
                    var sizeVal = sym.sizeXVar ? avg[sym.sizeXVar.value] : undefined;
                    icon = getChartSymbol(sym, col, 0, vals_1, sizeVal);
                    break;
                case SymbolTypes.Blocks:
                    icon = getBlockIcon(sym, col, 0, avg[sym.blockSizeVar.value]);
                    break;
                default:
                    var yVal = sym.sizeYVar ? avg[sym.sizeYVar.value] : undefined;
                    var xVal = sym.sizeXVar ? avg[sym.sizeXVar.value] : undefined;
                    icon = getSimpleIcon(sym, col, 0, yVal, xVal);
                    break;
            }
        }
        else {
            var style = {
                background: col.fillColor,
                minWidth: 50,
                minHeight: 50,
                borderRadius: '30px',
                display: count > 0 ? 'flex' : 'none',
                alignItems: 'center',
                border: '1px solid ' + col.color,
                opacity: col.fillOpacity
            };
            var iconElem = React.createElement("div", {style: style}, 
                React.createElement("div", {style: {
                    textAlign: 'center',
                    background: '#FFF',
                    width: '100%',
                    borderRadius: '30px'
                }}, 
                    React.createElement("b", {style: { display: 'block' }}, 
                        " ", 
                        count)
                )
            );
            var html = reactDOMServer.renderToString(iconElem);
            icon = L.divIcon({
                html: html, className: '',
                iconAnchor: L.point(25, 25),
            });
        }
        if (count > 0) {
            var popupContent_1 = (clu.showCount ? '<b>' + clu.countText + '</b> ' + count + '<br/>' : '');
            clu.hoverHeaders.map(function (h) {
                var header = this.getHeaderById(h.headerId);
                popupContent_1 += h.showSum ? '<b>' + h.sumText + '</b> ' + sum[header.value].toFixed(header.decimalAccuracy) + '<br/>' : '';
                popupContent_1 += h.showAvg ? '<b>' + h.avgText + '</b> ' + avg[header.value].toFixed(header.decimalAccuracy) + '<br/>' : '';
            }, this);
            popupContent_1 += 'Click or zoom to expand';
            cluster.bindPopup(L.popup({ closeButton: false }).setContent(popupContent_1));
        }
        return icon;
    };
    Layer.prototype.batchAdd = function (start, source, target, partialCallback, finishedCallback) {
        var i = start;
        var layers = [];
        var time = Date.now();
        while (true) {
            if ((Date.now() - time) < 200 && source.features[i]) {
                if (target.addData) {
                    target.addData(source.features[i]);
                }
                else if (target.addLayer)
                    layers.push(L.geoJSON(source.features[i], {
                        onEachFeature: this.onEachFeature,
                        pointToLayer: getMarker.bind(this, this.colorOptions, this.symbolOptions),
                    }));
                i++;
            }
            else
                break;
        }
        if (layers.length > 0) {
            target.addLayers(layers);
        }
        if (i < source.features.length) {
            if (partialCallback) {
                partialCallback(i);
            }
            else {
                var add_2 = this.batchAdd.bind(this);
                setTimeout(function () { add_2(i, source, target, null, finishedCallback); }, 10);
            }
        }
        else {
            if (start == 0)
                partialCallback(i);
            finishedCallback();
        }
    };
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], Layer.prototype, "name", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Layer.prototype, "layerType", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], Layer.prototype, "headers", void 0);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], Layer.prototype, "numberHeaders", null);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], Layer.prototype, "categories", null);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], Layer.prototype, "popupHeaderIds", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Layer.prototype, "showPopUpOnHover", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Layer.prototype, "showPopUpInPlace", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', ColorOptions)
    ], Layer.prototype, "colorOptions", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', SymbolOptions)
    ], Layer.prototype, "symbolOptions", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', ClusterOptions)
    ], Layer.prototype, "clusterOptions", void 0);
    return Layer;
}());
exports.Layer = Layer;
function getMarker(col, sym, feature, latlng) {
    if (col.colors.slice().length > 0 && col.limits.slice().length > 0 && col.useMultipleFillColors)
        col.fillColor = col.colorField.type == 'number' ?
            common_1.GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), feature.properties[col.colorField.value])
            : col.colors[col.limits.indexOf(feature.properties[col.colorField.value])];
    var icon;
    switch (sym.symbolType) {
        case SymbolTypes.Icon:
            icon = getFaIcon(sym, col, 0, feature.properties[sym.iconField.value]);
            break;
        case SymbolTypes.Chart:
            var vals_2 = [];
            sym.chartFields.map(function (e) {
                if (feature.properties[e.value] > 0)
                    vals_2.push({ val: feature.properties[e.value], color: col.chartColors[e.value] });
            });
            var sizeVal = sym.sizeXVar ? feature.properties[sym.sizeXVar.value] : undefined;
            icon = getChartSymbol(sym, col, 0, vals_2, sizeVal);
            break;
        case SymbolTypes.Blocks:
            icon = getBlockIcon(sym, col, 0, feature.properties[sym.blockSizeVar.value]);
            break;
        default:
            var yVal = sym.sizeYVar ? feature.properties[sym.sizeYVar.value] : undefined;
            var xVal = sym.sizeXVar ? feature.properties[sym.sizeXVar.value] : undefined;
            icon = getSimpleIcon(sym, col, 0, yVal, xVal);
            break;
    }
    return L.marker(latlng, { icon: icon, opacity: col.opacity });
}
function getFaIcon(sym, col, sizeModifier, value) {
    var icon = sym.iconField.type == 'number' ?
        common_1.GetItemBetweenLimits(sym.iconLimits.slice(), sym.icons.slice(), sym.iconField ? value : 0)
        : sym.icons[sym.iconLimits.slice().indexOf(value)];
    return L.ExtraMarkers.icon({
        icon: icon ? icon.fa : sym.icons[0].fa,
        prefix: 'fa',
        markerColor: col.fillColor,
        svg: true,
        svgBorderColor: col.color,
        svgOpacity: 1,
        shape: icon ? icon.shape : sym.icons[0].shape,
        iconColor: col.iconTextColor,
        iconUrl: ''
    });
}
function getChartSymbol(sym, col, sizeModifier, vals, value) {
    var x = value !== undefined ? common_1.GetSymbolRadius(value, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 50;
    x += sizeModifier;
    return L.divIcon({ iconAnchor: L.point(x / 2, x / 2), popupAnchor: L.point(0, -x / 2), html: makeChartSymbol(), className: '' });
    function makeChartSymbol() {
        if (!vals) {
            return '';
        }
        var rInner = x / 3, pathFillFunc = function (d) { return d.data.color; }, origo = (x + col.weight) / 2, w = origo * 2, h = w, pie = d3.pie().value(function (d) { return d.val; })(vals), arc = sym.chartType === 'pie' ? d3.arc().innerRadius(0).outerRadius(x / 2) : d3.arc().innerRadius(x / 5).outerRadius(x / 2);
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var vis = d3.select(svg)
            .attr('width', w)
            .attr('height', h)
            .append('g')
            .attr('transform', 'translate(' + origo + ',' + origo + ')');
        var arcs = vis.selectAll('arc')
            .data(pie)
            .enter().append('g')
            .attr('class', 'arc');
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', pathFillFunc)
            .attr('stroke', col.color)
            .attr('opacity', col.fillOpacity)
            .attr('stroke-width', col.weight);
        if (typeof window.XMLSerializer != "undefined") {
            return (new window.XMLSerializer()).serializeToString(svg);
        }
        else if (typeof svg.xml != "undefined") {
            return svg.xml;
        }
        return '';
    }
}
function getBlockIcon(sym, col, sizeModifier, value) {
    var blockCount = Math.ceil(value / sym.blockValue);
    var columns = Math.min(sym.maxBlockColumns, blockCount);
    var rows = Math.min(sym.maxBlockRows, blockCount);
    var blocks = makeBlockSymbol(col.fillColor, col.color, col.weight, sym.blockWidth + sizeModifier);
    return L.divIcon({
        iconAnchor: L.point((sym.blockWidth + sizeModifier) / 2 * blocks.columns, (sym.blockWidth + sizeModifier) / 2 * blocks.rows),
        popupAnchor: L.point(0, (sym.blockWidth + sizeModifier) / 2 * -blocks.rows),
        html: blocks.html, className: ''
    });
    function makeBlockSymbol(fillColor, borderColor, borderWeight, width) {
        var arr = [];
        var filledBlocks = 0;
        var actualColumns = 0;
        var actualRows = 0;
        var style = {
            height: width,
            width: width,
            backgroundColor: fillColor,
            margin: 0,
            padding: 0,
            border: borderWeight + 'px solid ' + borderColor,
        };
        for (var row = 0; row < rows; row++) {
            if (filledBlocks < blockCount) {
                actualRows++;
                arr.push(React.createElement("tr", {key: row}, getColumns.call(this, row).map(function (column) {
                    return column;
                })));
            }
            else
                break;
        }
        function getColumns(i) {
            var arr = [];
            for (var c = 0; c < columns; c++) {
                var isDrawn = c * rows + (rows - i) <= blockCount;
                if (isDrawn) {
                    arr.push(React.createElement("td", {style: style, key: i + c}));
                    filledBlocks++;
                    actualColumns = Math.max(c + 1, actualColumns);
                }
                else {
                    return arr;
                }
            }
            return arr;
        }
        var table = React.createElement("table", {style: {
            borderCollapse: 'collapse',
            width: actualColumns * width,
        }}, 
            React.createElement("tbody", null, arr.map(function (td) {
                return td;
            }))
        );
        return { html: reactDOMServer.renderToString(table), rows: actualRows, columns: actualColumns };
    }
}
function getSimpleIcon(sym, col, sizeModifier, yValue, xValue) {
    var x = xValue !== undefined ? common_1.GetSymbolRadius(xValue, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    var y = yValue !== undefined ? common_1.GetSymbolRadius(yValue, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    x += sizeModifier;
    y += sizeModifier;
    var rectHtml = '<div style="height: ' + y + 'px; width: ' + x + 'px; background-color:' + col.fillColor + '; border: ' + (col.weight + sizeModifier / 6) + 'px solid ' + col.color + '; border-radius: ' + sym.borderRadius + 'px;"/>';
    return L.divIcon({ iconAnchor: L.point((x + col.weight + sizeModifier / 3) / 2, (y + col.weight + sizeModifier / 3) / 2), popupAnchor: L.point(0, -y / 2), html: rectHtml, className: '' });
}
function createHeatLayer(l) {
    var arr = [];
    var customScheme = l.colorOptions.useCustomScheme;
    var max = customScheme ? l.colorOptions.limits[l.colorOptions.limits.length - 2] : 0;
    l.geoJSON.features.map(function (feat) {
        var pos = [];
        var heatVal = feat.properties[l.colorOptions.colorField.value];
        if (!customScheme && heatVal > max)
            max = heatVal;
        pos.push(feat.geometry.coordinates[1]);
        pos.push(feat.geometry.coordinates[0]);
        pos.push(heatVal);
        arr.push(pos);
    });
    var gradient = l.colorOptions.colors && l.colorOptions.colors.length > 0 ? {} : undefined;
    if (gradient) {
        var limits = l.colorOptions.limits;
        for (var i = 0; i < limits.length - 1; i++) {
            gradient[limits[i] / max] = l.colorOptions.colors[i];
        }
    }
    return L.heatLayer(arr, { relative: false, gradient: gradient, radius: l.colorOptions.heatMapRadius, max: max, minOpacity: l.colorOptions.fillOpacity });
}
function addPopups(feature, layer) {
    var popupContent = '';
    var showInPlace = this.showPopUpInPlace;
    var showOnHover = this.showPopUpOnHover;
    var headers = this.popupHeaderIds.slice();
    var state = this.appState;
    for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
        var h = headers_1[_i];
        var header = this.getHeaderById(h);
        var prop = feature.properties[header.value];
        if (prop !== undefined) {
            popupContent += '<b>' + header.label + '</b>: ' + (header.type == 'number' ? prop == null ? 'null' : prop.toFixed(header.decimalAccuracy) : prop);
            popupContent += '<br />';
        }
    }
    if (popupContent != '' && showInPlace) {
        var popup = L.popup({ closeButton: !showOnHover }).setContent(popupContent);
        layer.bindPopup(popup);
    }
    else
        layer.unbindPopup();
    if (showOnHover) {
        layer.off('click');
        layer.on('mouseover', function (e) { showInPlace ? this.openPopup() : updateInfoScreenText(popupContent); });
        layer.on('mouseout', function (e) { showInPlace ? this.closePopup() : updateInfoScreenText(null); });
    }
    else {
        layer.on('click', function (e) { showInPlace ? this.openPopup() : updateInfoScreenText(popupContent); });
        layer.off('mouseover');
        layer.off('mouseout');
    }
    function updateInfoScreenText(text) {
        state.infoScreenText = text;
    }
}
var ColorOptions = (function () {
    function ColorOptions(prev) {
        this.colorField = prev && prev.colorField || undefined;
        this.useCustomScheme = prev && prev.useCustomScheme || false;
        this.colors = prev && prev.colors || [];
        this.limits = prev && prev.limits || [];
        this.colorScheme = prev && prev.colorScheme || 'RdYlBu';
        this.steps = prev && prev.steps || 5;
        this.revert = prev && prev.revert || false;
        this.mode = prev && prev.mode || 'q';
        this.iconTextColor = prev && prev.iconTextColor || '#FFF';
        this.fillColor = prev && prev.fillColor || '#E0E62D';
        this.color = prev && prev.color || '#000';
        this.weight = prev && prev.weight !== undefined ? prev.weight : 1;
        this.fillOpacity = prev && prev.fillOpacity !== undefined ? prev.fillOpacity : 0.8;
        this.opacity = prev && prev.opacity !== undefined ? prev.opacity : 0.8;
        this.useMultipleFillColors = prev && prev.useMultipleFillColors || false;
        this.heatMapRadius = prev && prev.heatMapRadius || 25;
        this.chartColors = prev && prev.chartColors || {};
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Header)
    ], ColorOptions.prototype, "colorField", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ColorOptions.prototype, "useCustomScheme", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], ColorOptions.prototype, "colors", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], ColorOptions.prototype, "limits", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorOptions.prototype, "colorScheme", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], ColorOptions.prototype, "steps", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ColorOptions.prototype, "revert", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorOptions.prototype, "mode", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorOptions.prototype, "iconTextColor", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorOptions.prototype, "fillColor", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorOptions.prototype, "color", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], ColorOptions.prototype, "weight", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], ColorOptions.prototype, "fillOpacity", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], ColorOptions.prototype, "opacity", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ColorOptions.prototype, "useMultipleFillColors", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], ColorOptions.prototype, "heatMapRadius", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Object)
    ], ColorOptions.prototype, "chartColors", void 0);
    return ColorOptions;
}());
exports.ColorOptions = ColorOptions;
var SymbolOptions = (function () {
    function SymbolOptions(prev) {
        this.symbolType = prev && prev.symbolType || SymbolTypes.Simple;
        this.useMultipleIcons = prev && prev.useMultipleIcons || false;
        this.icons = prev && prev.icons || [];
        this.iconField = prev && prev.iconField || undefined;
        this.iconLimits = prev && prev.iconLimits || [];
        this.sizeXVar = prev && prev.sizeXVar || undefined;
        this.sizeYVar = prev && prev.sizeYVar || undefined;
        this.blockSizeVar = prev && prev.blockSizeVar || undefined;
        this.borderRadius = prev && prev.borderRadius || 30;
        this.sizeLowLimit = prev && prev.sizeLowLimit || 0;
        this.sizeUpLimit = prev && prev.sizeUpLimit || 50;
        this.sizeMultiplier = prev && prev.sizeMultiplier || 1;
        this.chartType = prev && prev.chartType || 'pie';
        this.blockValue = prev && prev.blockValue || 0;
        this.blockWidth = prev && prev.blockWidth || 10;
        this.maxBlockColumns = prev && prev.maxBlockColumns || 2;
        this.maxBlockRows = prev && prev.maxBlockRows || 10;
    }
    Object.defineProperty(SymbolOptions.prototype, "iconCount", {
        get: function () {
            return this.icons.slice().length;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "symbolType", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], SymbolOptions.prototype, "useMultipleIcons", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], SymbolOptions.prototype, "icons", void 0);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], SymbolOptions.prototype, "iconCount", null);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Header)
    ], SymbolOptions.prototype, "iconField", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], SymbolOptions.prototype, "iconLimits", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Header)
    ], SymbolOptions.prototype, "sizeXVar", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Header)
    ], SymbolOptions.prototype, "sizeYVar", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Header)
    ], SymbolOptions.prototype, "blockSizeVar", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "borderRadius", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "sizeLowLimit", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "sizeUpLimit", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "sizeMultiplier", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], SymbolOptions.prototype, "chartFields", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Object)
    ], SymbolOptions.prototype, "chartType", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "blockValue", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "blockWidth", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "maxBlockColumns", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolOptions.prototype, "maxBlockRows", void 0);
    return SymbolOptions;
}());
exports.SymbolOptions = SymbolOptions;
var ClusterOptions = (function () {
    function ClusterOptions(prev) {
        this.useClustering = prev && prev.useClustering || false;
        this.showCount = prev && prev.showCount || true;
        this.countText = prev && prev.countText || 'map points';
        this.useSymbolStyle = prev && prev.useSymbolStyle || false;
        this.hoverHeaders = prev && prev.hoverHeaders || [];
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ClusterOptions.prototype, "useClustering", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ClusterOptions.prototype, "showCount", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ClusterOptions.prototype, "countText", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], ClusterOptions.prototype, "hoverHeaders", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ClusterOptions.prototype, "useSymbolStyle", void 0);
    return ClusterOptions;
}());
exports.ClusterOptions = ClusterOptions;
var Header = (function () {
    function Header(prev) {
        this.value = '';
        this.label = '';
        this.id = prev && prev.id !== undefined ? prev.id : undefined;
        this.value = prev && prev.value || '';
        this.label = prev && prev.label || this.value && this.value[0].toUpperCase() + this.value.slice(1);
        ;
        this.type = prev && prev.type || 'string';
        this.decimalAccuracy = prev && prev.decimalAccuracy || 0;
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], Header.prototype, "value", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], Header.prototype, "label", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Object)
    ], Header.prototype, "type", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Header.prototype, "decimalAccuracy", void 0);
    return Header;
}());
exports.Header = Header;
(function (LayerTypes) {
    LayerTypes[LayerTypes["Standard"] = 0] = "Standard";
    LayerTypes[LayerTypes["HeatMap"] = 1] = "HeatMap";
})(exports.LayerTypes || (exports.LayerTypes = {}));
var LayerTypes = exports.LayerTypes;
(function (SymbolTypes) {
    SymbolTypes[SymbolTypes["Simple"] = 0] = "Simple";
    SymbolTypes[SymbolTypes["Chart"] = 1] = "Chart";
    SymbolTypes[SymbolTypes["Icon"] = 2] = "Icon";
    SymbolTypes[SymbolTypes["Blocks"] = 3] = "Blocks";
})(exports.SymbolTypes || (exports.SymbolTypes = {}));
var SymbolTypes = exports.SymbolTypes;
