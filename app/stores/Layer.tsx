import { observable, computed } from 'mobx';
import { GetSymbolSize, GetItemBetweenLimits, ShowNotification } from '../common_items/common';
import { AppState } from './States';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
let d3 = require('d3');
let mobx = require('mobx');
let reactDOMServer = require('react-dom/server');
let chroma = require('chroma-js');

export class Layer {

    /** The unique identification. Is used for example to delete items*/
    id: number;
    /** The name of the layer. Will be shown in the UI*/
    @observable name: string;
    /** The GeoJSON representation of the data.*/
    geoJSON: { features: any[], type: string };
    /** The type of the layer. Will affect the options available.*/
    @observable layerType: LayerTypes;
    /** The data property names.*/
    @observable headers: Header[] = [];

    @computed get numberHeaders() {
        return this.headers.filter(function(val) { return val.type === 'number' });
    }

    @computed get categories() {
        return this.headers.filter(function(val) { return val.type === 'strings' });
    }

    getHeaderById(id: number) {
        return this.headers.filter(function(val) { return val.id === id })[0];
    }

    @observable popupHeaders: Header[] = [];
    @observable showPopUpOnHover: boolean;
    /** Open popup on top of the layer it is bound to, or in a separate element. Default true*/
    @observable showPopUpInPlace: boolean = true;
    /** The Leaflet layer. Will be modified by changing options*/
    displayLayer: L.GeoJSON;
    /** The function to run on every feature of the layer. Is used to place pop-ups to map features */
    onEachFeature: (feature: any, layer: L.GeoJSON) => void = addPopups.bind(this);
    /** The coloring options of the layer. Contains ie. border color and opacity */
    @observable colorOptions: ColorOptions = new ColorOptions();
    /**  The symbol options for symbol layers. Contains ie. symbol type  */
    @observable symbolOptions: SymbolOptions = new SymbolOptions();
    @observable clusterOptions: ClusterOptions = new ClusterOptions();
    appState: AppState;
    /** Is clustering being toggled on/off? If so, redraw by removing and adding the layer once*/
    toggleRedraw: boolean = true;
    pointFeatureCount: number = 0;
    values: { [field: string]: any[]; } = undefined;
    uniqueValues: { [field: string]: any[]; } = undefined;


    constructor(state: AppState, prev?: Layer) {
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

    }

    /** Update layer based on changed options and properties. */
    refresh() {
        let col: ColorOptions = this.colorOptions;
        let sym: SymbolOptions = this.symbolOptions;
        let style = function(col: ColorOptions, feature) {
            return {
                fillOpacity: col.fillOpacity,
                opacity: col.opacity,
                fillColor: col.colors.slice().length == 0 || !col.useMultipleFillColors ?
                    col.fillColor :
                    col.colorField.type == 'number' ?
                        GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), feature.properties[col.colorField.value])
                        : col.colors[col.limits.indexOf(feature.properties[col.colorField.value])],
                color: col.color,
                weight: col.weight,
            }
        }
        if (this.displayLayer && (this.toggleRedraw || this.layerType === LayerTypes.HeatMap)) {
            this.appState.map.removeLayer(this.displayLayer);
        }
        if (this.displayLayer && this.layerType !== LayerTypes.HeatMap && !this.toggleRedraw) {
            let start = Date.now();
            let that = this;
            let path = false;
            this.displayLayer.eachLayer(function(l: any) {

                if (l.setStyle) {
                    l.setStyle(style(col, l.feature));
                    path = true;
                }
                else {
                    let marker = getMarker(col, sym, l.feature, l.latlng);
                    let icon = (marker as any).options.icon;
                    l.setIcon(icon);
                }
            });
            this.refreshFilters();
            this.refreshCluster();
            let end = Date.now();
            if (end - start > 500) {
                if (this.appState.autoRefresh) {
                    ShowNotification('An update operation seems to be taking too long. Automatic refreshing has been disabled.');
                    this.appState.autoRefresh = false;
                }
            }
        }
        else if (this.geoJSON) {

            if (this.layerType === LayerTypes.HeatMap) {
                if (this.colorOptions.colorField)
                    this.displayLayer = (createHeatLayer(this) as any);
            }
            else {
                let options: L.GeoJSONOptions = {}
                this.displayLayer = L.geoJSON([], {
                    onEachFeature: this.onEachFeature,
                    pointToLayer: getMarker.bind(this, col, sym),
                    style: style.bind(this, col),
                });

                this.batchAdd(0, 500, this.geoJSON, this.displayLayer);

            }
            if (this.displayLayer) {
                if (this.layerType !== LayerTypes.HeatMap && this.pointFeatureCount > 500 && !this.clusterOptions.useClustering) {
                    ShowNotification('The dataset contains a large number of map points. Point clustering has beeen enabled to boost performance. If you wish, you may turn this off in the clustering options');
                    this.clusterOptions.useClustering = true;
                }
                if (this.layerType !== LayerTypes.HeatMap && this.clusterOptions.useClustering) {

                    let markers = (L as any).markerClusterGroup({
                        iconCreateFunction: this.createClusteredIcon.bind(this),
                        // chunkedLoading: true,
                    });

                    markers.on('clustermouseover', function(c: any) {
                        if (this.showPopUpInPlace)
                            c.layer.openPopup();
                        else
                            this.appState.infoScreenText = c.layer.getPopup().getContent();

                    }, this);
                    markers.on('clustermouseout', function(c: any) {
                        if (this.showPopUpInPlace)
                            c.layer.closePopup();
                        else
                            this.appState.infoScreenText = null;

                    }, this);
                    markers.on('clusterclick'), function(c: any) {
                        console.log(c)
                    }

                    this.batchAdd(0, 500, this.displayLayer.getLayers(), markers);
                    // markers.addLayer(this.displayLayer);
                    this.displayLayer = markers as any;


                }
                this.appState.map.addLayer(this.displayLayer);

                this.refreshFilters();
                if (!this.values) {
                    this.getValues();
                }
                this.toggleRedraw = false;

            }

        }

        if (this.layerType !== LayerTypes.HeatMap) {
            if ((this.symbolOptions.sizeXVar || this.symbolOptions.sizeYVar) &&
                this.symbolOptions.symbolType === SymbolTypes.Simple) {
                getScaleSymbolMaxValues.call(this);
            }
        }

    }


    refreshFilters() {
        let filters = this.appState.filters.filter((f) => { return f.layerId === this.id });
        for (let i in filters) {
            filters[i].init(true);
        }
    }

    /**  Manually trigger popup update without refreshing the layer*/
    refreshPopUps() {
        if (this.layerType !== LayerTypes.HeatMap) {
            if (this.displayLayer && this.popupHeaders) {
                if (this.showPopUpInPlace)
                    this.appState.infoScreenText = null;
                this.displayLayer.eachLayer(function(l: any) {
                    addPopups.call(this, l.feature, l);
                }, this)
            }
        }
    }

    /** Manually trigger cluster update*/
    refreshCluster() {
        if ((this.displayLayer as any).refreshClusters) {
            (this.displayLayer as any).refreshClusters();
        }
    }

    /** GetColors - calculates the color values based on a field name (colorOptions.colorField)  */
    getColors() {
        let opts = this.colorOptions;
        if (!opts.colorField) {
            return;
        }
        let values = this.values[opts.colorField.value]
        let colors = [];
        opts.limits = chroma.limits(values, opts.mode, opts.steps);
        opts.limits.splice(opts.limits.length - 1, 1); //remove maximum value
        opts.limits = opts.limits.filter(function(e, i, arr) {
            return arr.lastIndexOf(e) === i;
        }); //only unique values in limits
        colors = chroma.scale(opts.colorScheme).colors(opts.limits.length);
        opts.colors = opts.revert ? colors.reverse() : colors;
    }

    setOpacity() {
        if (this.layerType === LayerTypes.HeatMap) {
            this.toggleRedraw = true;
            this.refresh();
            return;
        }
        for (let lyr of this.displayLayer.getLayers()) {
            if ((lyr as any).setOpacity)
                (lyr as any).setOpacity(this.colorOptions.opacity);
            else
                (lyr as any).setStyle({ fillOpacity: this.colorOptions.fillOpacity, opacity: this.colorOptions.opacity })
        }
        this.refreshFilters();
    }

    /** Get feature values in their own dictionary to reduce the amount of common calculations*/
    getValues() {
        if (!this.values)
            this.values = {};
        if (!this.uniqueValues)
            this.uniqueValues = {};
        let pointCount = 0;
        this.geoJSON.features.map(function(feat) {
            if (feat.geometry.type == 'Point') {
                pointCount++;
            }
            for (let i in feat.properties) {
                if (!this.values[i])
                    this.values[i] = [];
                this.values[i].push(feat.properties[i]);
            }
        }, this);
        for (let i in this.headers.slice()) {
            let header = this.headers[i].value;

            if (this.values[header]) {
                this.values[header].sort(function(a, b) { return a == b ? 0 : a < b ? -1 : 1 })
                this.uniqueValues[header] = unique(this.values[header]);
            }
        }

        this.pointFeatureCount = pointCount;
        function unique(arr: any[]) { //http://stackoverflow.com/questions/1960473/unique-values-in-an-array/1961068#1961068
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
    }

    createClusteredIcon(cluster) {
        let values: { [field: string]: any[]; } = {};
        let avg: { [field: string]: number; } = {};
        let sum: { [field: string]: number; } = {};
        let col = this.colorOptions;
        let clu = this.clusterOptions;
        let sym = this.symbolOptions;
        let count = 0;
        let markers = cluster.getAllChildMarkers();

        let relevantHeaders: Header[] = [];
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
                sym.chartFields.map(function(f) { relevantHeaders.push(f) });
        }
        for (let h of clu.hoverHeaders) {
            let header = this.getHeaderById(h.headerId)
            if (relevantHeaders.indexOf(header) == -1 && (h.showAvg || h.showSum)) {
                relevantHeaders.push(header);
            }
        }

        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            if (marker.options.icon && marker.options.icon.options.className.indexOf('marker-hidden') > -1)
                continue;
            count++;

            for (let h of relevantHeaders.slice()) {

                let val = marker.feature.properties[h.value];
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
            col.fillColor = GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), avg[col.colorField.value]);
        }

        let icon: L.DivIcon;

        if (clu.useSymbolStyle) {

            switch (sym.symbolType) {
                case SymbolTypes.Icon:
                    icon = getFaIcon(sym, col, 0, avg[sym.iconField.value]);
                    break;
                case SymbolTypes.Chart:
                    let vals = [];
                    sym.chartFields.map(function(e) {
                        if (avg[e.value] > 0)
                            vals.push({ feat: e, val: avg[e.value], color: col.chartColors[e.value] });
                    });
                    let sizeVal = sym.sizeXVar ? avg[sym.sizeXVar.value] : undefined;
                    icon = getChartIcon(sym, col, 20, vals, sizeVal);
                    break;
                case SymbolTypes.Blocks:
                    icon = getBlockIcon(sym, col, 10, avg[sym.blockSizeVar.value]);
                    break;
                default:
                    let yVal = sym.sizeYVar ? avg[sym.sizeYVar.value] : undefined;
                    let xVal = sym.sizeXVar ? avg[sym.sizeXVar.value] : undefined;
                    icon = getSimpleIcon(sym, col, 20, yVal, xVal);
                    break;
            }
        }
        else {
            let style = {
                background: col.fillColor,
                minWidth: 50,
                minHeight: 50,
                borderRadius: '30px',
                display: count > 0 ? 'flex' : 'none',
                alignItems: 'center',
                border: '1px solid ' + col.color,
                opacity: col.fillOpacity
            }
            let iconElem =
                <div style={style}>
                    <div style={{
                        textAlign: 'center',
                        background: '#FFF',
                        width: '100%',
                        borderRadius: '30px'
                    }}>
                        <b style={{ display: 'block' }} > {count}</b>
                    </div>
                </div>

            let html: string = reactDOMServer.renderToString(iconElem);
            icon = L.divIcon({
                html: html, className: '',
                iconAnchor: L.point(25, 25),
            });

        }
        if (count > 0) {
            let popupContent = (clu.showCount ? clu.countText + ' ' + count + '<br/>' : '');
            clu.hoverHeaders.map(function(h) {
                let header = this.getHeaderById(h.headerId);
                popupContent += h.showSum ? h.sumText + ' ' + sum[header.value].toFixed(header.decimalAccuracy) + '<br/>' : '';
                popupContent += h.showAvg ? h.avgText + ' ' + avg[header.value].toFixed(header.decimalAccuracy) + '<br/>' : ''
            }, this)
            popupContent += 'Click or zoom to expand';
            cluster.bindPopup(L.popup({ closeButton: false }).setContent(popupContent));
        }

        return icon;
    }
    /** Add the determined amount of feature layers to displayLayer and let the UI refresh in between*/
    batchAdd(start: number, end: number, source, target) {
        let i;
        for (i = start; i < end; i++) {
            if (source.features) {
                if (source.features[i])
                    target.addData(source.features[i]);
                else
                    return;
            }
            else if (source) {
                if (source[i])
                    target.addLayer(source[i]);
                else
                    return;
            }
        }
        if (source.features ? i >= source.features.length : i >= source.length)
            return;
        else {
            setTimeout(this.batchAdd(i, i + 500, source, target), 10);
        }
    }
}

/** Function to run on every point-type data to visualize it according to the settings*/
function getMarker(col: ColorOptions, sym: SymbolOptions, feature, latlng: L.LatLng): L.Marker {
    if (col.colors.slice().length > 0 && col.limits.slice().length > 0 && col.useMultipleFillColors)
        col.fillColor = col.colorField.type == 'number' ?
            GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), feature.properties[col.colorField.value])
            : col.colors[col.limits.indexOf(feature.properties[col.colorField.value])];
    let x, y;
    switch (sym.symbolType) {
        case SymbolTypes.Icon:
            return L.marker(latlng, { icon: getFaIcon(sym, col, 0, feature.properties[sym.iconField.value]), opacity: col.opacity });
        case SymbolTypes.Chart:
            let vals = [];
            sym.chartFields.map(function(e) {
                if (feature.properties[e.value] > 0)
                    vals.push({ feat: e, val: feature.properties[e.value], color: col.chartColors[e.value] });
            });
            let sizeVal = sym.sizeXVar ? feature.properties[sym.sizeXVar.value] : undefined;
            return L.marker(latlng, { icon: getChartIcon(sym, col, 0, vals, sizeVal), opacity: col.opacity });
        case SymbolTypes.Blocks:
            return L.marker(latlng, { icon: getBlockIcon(sym, col, 0, feature.properties[sym.blockSizeVar.value]), opacity: col.opacity });
        default:
            let yVal = sym.sizeYVar ? feature.properties[sym.sizeYVar.value] : undefined;
            let xVal = sym.sizeXVar ? feature.properties[sym.sizeXVar.value] : undefined;
            return L.marker(latlng, { icon: getSimpleIcon(sym, col, 0, yVal, xVal), opacity: col.opacity });
    }

}

function getScaleSymbolMaxValues() {
    let maxXradius, minXradius, maxYradius, minYradius;
    let sym: SymbolOptions = this.symbolOptions;
    this.displayLayer.eachLayer(function(layer) {
        let r = 10;
        if (sym.sizeXVar) {
            let xVal = layer.feature.properties[sym.sizeXVar.value];

            r = GetSymbolSize(xVal, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit);
            //calculate min and max values and -size
            if (!sym.actualMaxXValue && !sym.actualMinXValue) {
                sym.actualMinXValue = xVal;
                sym.actualMaxXValue = xVal;
            }
            else {
                if (xVal > sym.actualMaxXValue) {
                    sym.actualMaxXValue = xVal;
                }
                else if (xVal < sym.actualMinXValue) {
                    sym.actualMinXValue = xVal;
                }
            }
            if (!maxXradius && !minXradius) {
                maxXradius = r;
                minXradius = r;
            }
            else {
                if (r > maxXradius) {
                    maxXradius = r;
                }
                else if (r < minXradius) {
                    minXradius = r;
                }
            }
        }
        if (sym.sizeYVar) {
            let yVal = layer.feature.properties[sym.sizeYVar.value];
            r = GetSymbolSize(yVal, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit);
            //calculate min and max values and -size
            if (!sym.actualMaxYValue && !sym.actualMinYValue) {
                sym.actualMinYValue = yVal;
                sym.actualMaxYValue = yVal;
            }
            else {
                if (yVal > sym.actualMaxYValue) {
                    sym.actualMaxYValue = yVal;
                }
                else if (yVal < sym.actualMinYValue) {
                    sym.actualMinYValue = yVal;
                }
            }
            if (!maxYradius && !minYradius) {
                maxYradius = r;
                minYradius = r;
            }
            else {
                if (r > maxYradius) {
                    maxYradius = r;
                }
                else if (r < minYradius) {
                    minYradius = r;
                }
            }
        }
    });
    sym.actualMinXRadius = minXradius;
    sym.actualMaxXRadius = maxXradius;
    sym.actualMinYRadius = minYradius;
    sym.actualMaxYRadius = maxYradius;
}

function getFaIcon(sym: SymbolOptions, col: ColorOptions, sizeModifier: number, value: any) {

    let icon: IIcon = sym.iconField.type == 'number' ?
        GetItemBetweenLimits(sym.iconLimits.slice(), sym.icons.slice(), sym.iconField ? value : 0)
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

function getChartIcon(sym: SymbolOptions, col: ColorOptions, sizeModifier: number, vals: any[], value?: number) {

    let x = value ? GetSymbolSize(value, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    x += sizeModifier;

    let chartHtml = makePieChart({
        fullCircle: sym.chartType === 'pie',
        data: vals,
        valueFunc: function(d) { return d.val; },
        strokeWidth: col.weight,
        outerRadius: x,
        innerRadius: x / 3,
        pieClass: function(d) { return d.data.feat },
        pathFillFunc: function(d) { return d.data.color },
        borderColor: col.color,
    });
    return L.divIcon({ iconAnchor: L.point(x, x), popupAnchor: L.point(0, -x), html: chartHtml, className: '' });

    function makePieChart(options) {
        if (!options.data || !options.valueFunc) {
            return '';
        }
        let data = options.data,
            valueFunc = options.valueFunc,
            r = options.outerRadius ? options.outerRadius : 28,
            rInner = options.innerRadius ? options.innerRadius : r - 10,
            pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function(d) { return d.data.feat.label + ': ' + d.data.val }, //Title for each path
            pieLabel = options.pieLabel ? options.pieLabel : '', //Label for the whole chart
            pathFillFunc = options.pathFillFunc,
            border = options.borderColor,

            origo = (r + options.strokeWidth), //Center coordinate
            w = origo * 2, //width and height of the svg element
            h = w,
            donut = d3.layout.pie(),
            arc = options.fullCircle ? d3.svg.arc().outerRadius(r) : d3.svg.arc().innerRadius(rInner).outerRadius(r);

        //Create an svg element
        let svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
        //Create the pie chart
        let vis = d3.select(svg)
            .data([data])
            .attr('width', w)
            .attr('height', h);

        let arcs = vis.selectAll('g.arc')
            .data(donut.value(valueFunc))
            .enter().append('svg:g')
            .attr('class', 'arc')
            .attr('transform', 'translate(' + origo + ',' + origo + ')');

        arcs.append('svg:path')
            .attr('fill', pathFillFunc)
            .attr('stroke', border)
            .attr('stroke-width', options.strokeWidth)
            .attr('d', arc)
            .append('svg:title')
            .text(pathTitleFunc);

        vis.append('text')
            .attr('x', origo)
            .attr('y', origo)
            .attr('text-anchor', 'middle')
            //.attr('dominant-baseline', 'central')
            /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
            .attr('dy', '.3em')
            .text(pieLabel);
        //Return the svg-markup rather than the actual element
        if (typeof (window as any).XMLSerializer != "undefined") {
            return (new (window as any).XMLSerializer()).serializeToString(svg);
        } else if (typeof (svg as any).xml != "undefined") {
            return (svg as any).xml;
        }
        return "";
    }

}

function getBlockIcon(sym: SymbolOptions, col: ColorOptions, sizeModifier: number, value: number) {
    let blockCount = Math.ceil(value / sym.blockValue);
    let columns = Math.min(sym.maxBlockColumns, blockCount);
    let rows = Math.min(sym.maxBlockRows, blockCount);
    let blocks = makeBlockSymbol(col.fillColor, col.color, col.weight, sym.blockWidth + sizeModifier);
    return L.divIcon({
        iconAnchor: L.point((sym.blockWidth + sizeModifier) / 2 * blocks.columns, (sym.blockWidth + sizeModifier) / 2 * blocks.rows),
        popupAnchor: L.point(0, (sym.blockWidth + sizeModifier) / 2 * -blocks.rows),
        html: blocks.html, className: ''
    });

    function makeBlockSymbol(fillColor: string, borderColor: string, borderWeight: number, width: number) {
        let arr = [];
        let filledBlocks = 0;
        let actualColumns = 0;
        let actualRows = 0;
        let style = {
            height: width,
            width: width,
            backgroundColor: fillColor,
            margin: 0,
            padding: 0,
            border: borderWeight + 'px solid ' + borderColor,
        }
        for (let row = 0; row < rows; row++) {
            if (filledBlocks < blockCount) {
                actualRows++;
                arr.push(
                    <tr key={row}>
                        {getColumns.call(this, row).map(
                            function(column) {
                                return column;
                            })
                        }
                    </tr>
                );
            }
            else
                break;
        }

        function getColumns(i: number) {
            let arr = [];
            for (let c = 0; c < columns; c++) {
                let isDrawn = c * rows + (rows - i) <= blockCount;
                if (isDrawn) {
                    arr.push(<td style={style} key={i + c}/>);
                    filledBlocks++;
                    actualColumns = Math.max(c + 1, actualColumns);
                }
                else {
                    return arr;
                }
            }
            return arr;
        }

        let table =
            <table style={{
                borderCollapse: 'collapse',
                width: actualColumns * width,
            }}>
                <tbody>
                    {arr.map(function(td) {
                        return td;
                    })}
                </tbody>
            </table>;
        return { html: reactDOMServer.renderToString(table), rows: actualRows, columns: actualColumns };
    }
}

function getSimpleIcon(sym: SymbolOptions, col: ColorOptions, sizeModifier: number, yValue: number, xValue: number) {
    let x = xValue !== undefined ? GetSymbolSize(xValue, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    let y = yValue !== undefined ? GetSymbolSize(yValue, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    x += sizeModifier;
    y += sizeModifier;
    let rectHtml = '<div style="height: ' + y + 'px; width: ' + x + 'px; background-color:' + col.fillColor + '; border: ' + (col.weight + sizeModifier / 6) + 'px solid ' + col.color + '; border-radius: ' + sym.borderRadius + 'px;"/>';
    return L.divIcon({ iconAnchor: L.point((x + col.weight + sizeModifier / 3) / 2, (y + col.weight + sizeModifier / 3) / 2), popupAnchor: L.point(0, -y / 2), html: rectHtml, className: '' });
}

function createHeatLayer(l: Layer) {
    let arr: number[][] = [];
    let customScheme = l.colorOptions.useCustomScheme;
    let max = customScheme ? l.colorOptions.limits[l.colorOptions.limits.length - 2] : 0;
    l.geoJSON.features.map(function(feat) {
        let pos = [];
        let heatVal = feat.properties[l.colorOptions.colorField.value];
        if (!customScheme && heatVal > max)
            max = heatVal;
        pos.push(feat.geometry.coordinates[1]);
        pos.push(feat.geometry.coordinates[0]);
        pos.push(heatVal);
        arr.push(pos);
    });
    let gradient = l.colorOptions.colors && l.colorOptions.colors.length > 0 ? {} : undefined;
    if (gradient) {
        let limits = l.colorOptions.limits;
        for (let i = 0; i < limits.length - 1; i++) {
            gradient[limits[i] / max] = l.colorOptions.colors[i];
        }
    }
    return L.heatLayer(arr, { relative: false, gradient: gradient, radius: l.colorOptions.heatMapRadius, max: max, minOpacity: l.colorOptions.fillOpacity })
}

function addPopups(feature, layer: L.GeoJSON) {
    let popupContent = '';
    let showInPlace = this.showPopUpInPlace;
    let showOnHover = this.showPopUpOnHover;
    let headers: Header[] = this.popupHeaders.slice();
    let state = this.appState;
    for (let h in headers) {
        let header = headers[h];
        let prop = feature.properties[header.value];
        if (prop != undefined) {
            popupContent += '<b>' + header.label + '</b>: ' + (header.type == 'number' ? prop.toFixed(header.decimalAccuracy) : prop);
            popupContent += '<br />';
        }
    }

    if (popupContent != '' && showInPlace) {
        let popup = L.popup({ closeButton: !showOnHover }).setContent(popupContent);
        layer.bindPopup(popup);
    }
    else
        layer.unbindPopup();

    if (showOnHover) {
        layer.off('click')
        layer.on('mouseover', function(e) { showInPlace ? this.openPopup() : updateInfoScreenText(popupContent); });
        layer.on('mouseout', function(e) { showInPlace ? this.closePopup() : updateInfoScreenText(null); });
    }
    else {
        layer.on('click', function(e) { showInPlace ? this.openPopup() : updateInfoScreenText(popupContent); })
        layer.off('mouseover');
        layer.off('mouseout');
    }

    function updateInfoScreenText(text) {
        state.infoScreenText = text;
    }

}

export class ColorOptions implements L.PathOptions {
    /** Field to color layers by*/
    @observable colorField: Header;
    /** Is the scale user-made?*/
    @observable useCustomScheme: boolean;
    /** Color name array to use in choropleth*/
    @observable colors: string[];
    /** Value array to use in choropleth*/
    @observable limits: number[];
    /** The color scheme name to use in choropleth. Default blue-white-red for heatmaps, else black-white*/
    @observable colorScheme: string;
    /** The amount of colors to use in choropleth. Default 5*/
    @observable steps: number;
    /** Is the scheme reversed. This is used only to keep the menu selection synced with map*/
    @observable revert: boolean;
    /** The Chroma-js method to calculate colors. Default q->quantiles*/
    @observable mode: string;
    /** The color of the icon in symbol maps. Default white */
    @observable iconTextColor: string;
    /** Main fill color. Default yellow*/
    @observable fillColor: string;
    /** Border color. Default black*/
    @observable color: string;
    /** Border width. Default 1*/
    @observable weight: number;
    /** Main opacity. Default 0.8*/
    @observable fillOpacity: number;
    /** Border opacity. Default 0.8*/
    @observable opacity: number;
    /** Whether to use choropleth colors/user-defined color steps or not*/
    @observable useMultipleFillColors: boolean;
    /** The l.heat radius, in meters */
    @observable heatMapRadius: number;
    /** Chart symbol colors*/
    @observable chartColors: { [field: string]: string; };

    /**
     * @param  prev   previous options to copy
     */
    constructor(prev?: ColorOptions) {

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
        this.weight = prev && prev.weight || 1;
        this.fillOpacity = prev && prev.fillOpacity || 0.8;
        this.opacity = prev && prev.opacity || 0.8;
        this.useMultipleFillColors = prev && prev.useMultipleFillColors || false;
        this.heatMapRadius = prev && prev.heatMapRadius || 25;
        this.chartColors = prev && prev.chartColors || {};
    }

}

export class SymbolOptions {
    /** The type of the symbol. Default circle*/
    @observable symbolType: SymbolTypes;
    /** Use steps to define different icons*/
    @observable useMultipleIcons: boolean;
    /** The list of icons to use. Default: one IIcon with shape='circle' and fa='anchor'*/
    @observable icons: IIcon[];

    @computed get iconCount() {
        return this.icons.slice().length;
    }

    /** Field by which to calculate icon values*/
    @observable iconField: Header;
    /** The steps of the field values by which to choose the icons */
    @observable iconLimits: any[];
    /** The field to scale size x-axis by*/
    @observable sizeXVar: Header;
    /** The field to scale size y-axis by*/
    @observable sizeYVar: Header;
    /** The name of the field to scale block size by*/
    @observable blockSizeVar: Header;
    /** Simple icon CSS border radius in px*/
    @observable borderRadius: number;
    /** The minimum allowed size when scaling*/
    @observable sizeLowLimit: number;
    /** The maximum allowed size when scaling*/
    @observable sizeUpLimit: number;
    /** The multiplier to scale the value by*/
    @observable sizeMultiplier: number;
    /** Currently selected chart fields*/
    @observable chartFields: Header[];
    /** The type of chart to draw*/
    @observable chartType: 'pie' | 'donut';
    /** How many units does a single block represent*/
    @observable blockValue: number;
    /**Block width in pixels*/
    @observable blockWidth: number;
    /** Maximum amount of columns in block symbol == width*/
    @observable maxBlockColumns: number;
    /** Maximum amount of columns in block symbol == height*/
    @observable maxBlockRows: number;
    /** If symbol is of scalable type; the minimum of all the x-values being calculated. Is used in the legend */
    @observable actualMinXValue: number;
    /** If symbol is of scalable type; the minimum of all the y-values being calculated. Is used in the legend */
    @observable actualMinYValue: number;
    /** If symbol is of scalable type; the minimum of all the x(pixels) being calculated. Is used in the legend */
    @observable actualMinXRadius: number;
    /** If symbol is of scalable type; the minimum of all the y(pixels) being calculated. Is used in the legend */
    @observable actualMinYRadius: number;
    /** If symbol is of scalable type; the maximum of all the x-values being calculated. Is used in the legend */
    @observable actualMaxXValue: number;
    /** If symbol is of scalable type; the maximum of all the y-values being calculated. Is used in the legend */
    @observable actualMaxYValue: number;
    /** If symbol is of scalable type; the maximum of all the x being calculated. Is used in the legend */
    @observable actualMaxXRadius: number;
    /** If symbol is of scalable type; the maximum of all the y being calculated. Is used in the legend */
    @observable actualMaxYRadius: number;

    constructor(prev?: SymbolOptions) {

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
        this.chartFields = prev && prev.chartFields || [];
        this.chartType = prev && prev.chartType || 'pie';
        this.blockValue = prev && prev.blockValue || 0;
        this.blockWidth = prev && prev.blockWidth || 10;
        this.maxBlockColumns = prev && prev.maxBlockColumns || 2;
        this.maxBlockRows = prev && prev.maxBlockRows || 10;
        this.actualMinYValue = prev && prev.actualMinYValue || undefined;
        this.actualMaxYValue = prev && prev.actualMaxYValue || undefined;
        this.actualMinXValue = prev && prev.actualMinXValue || undefined;
        this.actualMaxXValue = prev && prev.actualMaxXValue || undefined;
        this.actualMinYRadius = prev && prev.actualMinYRadius || undefined;
        this.actualMaxYRadius = prev && prev.actualMaxYRadius || undefined;
        this.actualMinXRadius = prev && prev.actualMinXRadius || undefined;
        this.actualMaxXRadius = prev && prev.actualMaxXRadius || undefined;
    }
}

export class ClusterOptions {
    @observable useClustering: boolean;
    /** Show count on clustered marker hover*/
    @observable showCount: boolean;
    @observable countText: string;
    @observable hoverHeaders: { headerId: number, showAvg: boolean, showSum: boolean, avgText: string, sumText: string }[];
    @observable useSymbolStyle: boolean;

    constructor(prev?: ClusterOptions) {
        this.useClustering = prev && prev.useClustering || false;
        this.showCount = prev && prev.showCount || true;
        this.countText = prev && prev.countText || 'map points';
        this.useSymbolStyle = prev && prev.useSymbolStyle || false;
        this.hoverHeaders = prev && prev.hoverHeaders || [];
    }
}

/** The interface for imported data columns/headers/property names */
export class Header {
    id: number;
    /** Actual data value. Used to, for example, get properties from GeoJSON layers*/
    @observable value: string = '';
    /** Display text. Can be modified by the user*/
    @observable label: string = '';
    /**  The data type of a field. Number/string (datetime and others TODO)*/
    @observable type: 'string' | 'number';
    @observable decimalAccuracy: number;

    constructor(prev?: Header) {
        this.id = prev && prev.id !== undefined ? prev.id : undefined;
        this.value = prev && prev.value || '';
        this.label = prev && prev.label || this.value && this.value[0].toUpperCase() + this.value.slice(1);;
        this.type = prev && prev.type || 'string';
        this.decimalAccuracy = prev && prev.decimalAccuracy || 0;
    }
}

/** The different kinds of layers that can be created */
export enum LayerTypes {
    /** Show polygons and points  */
    Standard,
    /** Show intensity of a phenomenon by color scaling. */
    HeatMap
}

/** Different supported symbol types */
export enum SymbolTypes {
    /** Simple size-scalable symbols (circle,rectangle)*/
    Simple,
    /** Pie- or donut chart based on multiple icons. Can be resized */
    Chart,
    /** leaflet.Awesome-Markers- type marker. Uses Font Awesome-css to show a specific icon. */
    Icon,
    /** Create a stack of squares. Uses L.DivIcon. Square amount adjustable */
    Blocks,
}
