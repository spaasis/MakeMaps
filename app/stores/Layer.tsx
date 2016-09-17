import { observable, computed } from 'mobx';
import { LayerTypes, SymbolTypes, GetSymbolSize, GetItemBetweenLimits } from '../common_items/common';
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
    @observable geoJSON: { features: any[], type: string };
    /** The type of the layer. Will affect the options available.*/
    @observable layerType: LayerTypes;
    /** The data property names.*/
    @observable headers: IHeader[] = [];

    @computed get numberHeaders() {
        return this.headers.filter(function(val) { return val.type === 'number' });
    }

    @observable popupHeaders: IHeader[] = [];
    @observable showPopUpOnHover: boolean;
    /** The variable by which to create the heat map*/
    @observable heatMapVariable: string;
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
    toggleCluster: boolean = true;
    pointFeatureCount: number = 0;
    values: { [field: string]: any[]; } = undefined;


    constructor(state: AppState) {
        this.appState = state;
    }

    /** Update layer based on changed options and properties. */
    refresh() {
        let layer = this.displayLayer;
        console.time("LayerCreate")
        let col: ColorOptions = JSON.parse(JSON.stringify(this.colorOptions));
        let sym: SymbolOptions = JSON.parse(JSON.stringify(this.symbolOptions));
        let style = function(opts: ColorOptions, feature) {
            return {
                fillOpacity: opts.fillOpacity,
                opacity: opts.opacity,
                fillColor: opts.colors.slice().length == 0 || !opts.useMultipleFillColors ? opts.fillColor : GetItemBetweenLimits(opts.limits.slice(), opts.colors.slice(), feature.properties[opts.colorField.value]),
                color: opts.color,
                weight: 1,
            }
        }
        if (layer && this.layerType !== LayerTypes.HeatMap && !this.toggleCluster) {
            let that = this;
            let path = false;
            layer.eachLayer(function(l: any) {

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
            this.refreshFilter();
            this.refreshCluster();
            console.timeEnd("LayerCreate")
        }
        else if (this.geoJSON) {
            if (this.layerType === LayerTypes.HeatMap) {
                if (this.heatMapVariable)
                    layer = (createHeatLayer(this) as any);
            }
            else {
                let geoJSON = JSON.parse(JSON.stringify(this.geoJSON));
                let options: L.GeoJSONOptions = {}
                layer = L.geoJson(geoJSON, ({
                    onEachFeature: this.onEachFeature,
                    pointToLayer: getMarker.bind(this, col, sym),
                    style: style.bind(this, col),
                }));
            }
            if (layer) {
                console.time("LayerRender")
                if (this.clusterOptions.useClustering) {
                    let markers = L.markerClusterGroup({
                        iconCreateFunction: this.createClusteredIcon.bind(this),
                    });

                    markers.on('clustermouseover', function(c: any) {
                        c.layer.openPopup();
                    });
                    markers.on('clustermouseout', function(c: any) {
                        c.layer.closePopup();

                    });
                    markers.addLayer(layer);
                    layer = markers as any;
                    this.appState.map.addLayer(layer);

                }
                else {
                    layer.addTo(this.appState.map);
                }
                console.timeEnd("LayerRender")
                if (this.displayLayer)
                    this.appState.map.removeLayer(this.displayLayer)
                this.displayLayer = layer;
                this.refreshFilter();
                if (!this.values) {
                    this.values = {};
                    this.getValues();
                }
                this.toggleCluster = false;
            }

        }
        console.timeEnd("LayerCreate");




        if (this.layerType === LayerTypes.SymbolMap) {
            if (this.symbolOptions.sizeXVar || this.symbolOptions.sizeYVar &&
                (this.symbolOptions.symbolType === SymbolTypes.Circle ||
                    this.symbolOptions.symbolType === SymbolTypes.Rectangle
                )
            ) {
                getScaleSymbolMaxValues.call(this);
            }
        }

    }
    refreshFilter() {
        let filters = this.appState.filters.filter((f) => { return f.layer.id === this.id });
        for (let i in filters) {
            filters[i].init(true);
        }
    }

    /**  Manually trigger popup update without refreshing the layer*/
    refreshPopUps() {
        if (this.displayLayer && this.popupHeaders.slice().length > 0) {
            console.time('refreshPopUps');
            this.displayLayer.eachLayer(function(l: any) {
                addPopups.call(this, l.feature, l);
            }, this)
            console.timeEnd('refreshPopUps');
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

        let values = (this.geoJSON as any).features.map(function(item) {
            return item.properties[opts.colorField.value];
        });
        let colors = [];
        opts.limits = chroma.limits(values, opts.mode, opts.steps);
        colors = chroma.scale(opts.colorScheme).colors(opts.limits.length - 1);
        opts.colors = opts.revert ? colors.reverse() : colors;
    }

    /** Get feature values in their own dictionary to reduce the amount of common calculations*/
    getValues() {
        if (!this.values)
            this.values = {};
        console.time("Layer.GetValues");
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
                this.values[header].sort(function(a, b) { return a - b })
            }
        }
        this.pointFeatureCount = pointCount;
        console.timeEnd("Layer.GetValues");

    }

    createClusteredIcon(cluster) {
        let values = [];
        let sum = 0;
        let col = this.colorOptions;
        let clu = this.clusterOptions;
        let count = 0;
        let markers = cluster.getAllChildMarkers();
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            if (marker.options.icon && marker.options.icon.options.className.indexOf('marker-hidden') > -1)
                continue;
            let val = marker.feature.properties[col.colorField.value];
            if (!isNaN(parseFloat(val))) {//if is numeric
                values.push(+val);
                sum += val;
            }

            count++;
        }
        let avg = values.length > 0 ? (sum / values.length).toFixed(col.colorField.decimalAccuracy) : 0;

        let fillColor;
        if (!col.colorField || !col.useMultipleFillColors) {
            fillColor = count >= 100 ? '#fc4925' : count >= 50 ? '#ea9d38' : count >= 20 ? '#deea38' : '#85ea38';
        }
        else {
            fillColor = GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), +avg); //TODO: check if variable is the same, own variable and limits to clusters?
        }
        let style = {
            background: fillColor,
            minWidth: 50,
            minHeight: 50,
            borderRadius: '30px',
            display: count > 0 ? 'flex' : 'none',
            alignItems: 'center',
            border: '1px solid ' + col.color,
            opacity: col.fillOpacity
        }
        let icon =
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

        let html: string = reactDOMServer.renderToString(icon);
        if (count > 0) {
            let popupContent =
                (clu.showCount ? clu.countText + ' ' + count + '<br/>' : '') +
                (clu.showSum && col.colorField && col.useMultipleFillColors ? (clu.sumText + ' ' + sum.toFixed(col.colorField.decimalAccuracy) + '<br/>') : '') +
                (clu.showAvg && col.colorField && col.useMultipleFillColors ? (clu.avgText + ' ' + avg + '<br/>') : '') +
                'Click or zoom to expand';
            cluster.bindPopup(popupContent);
        }
        // let center = cluster.getBounds().getCenter();
        // let popup = L.popup({ offset: new L.Point(60, cluster.getBounds().getNorth()) }).setContent(popupContent);
        // cluster.bindPopup(popup);
        return L.divIcon({
            html: html, className: '',
            iconAnchor: L.point(25, 25),
        });
    }
}

/** Function to run on every point-type data to visualize it according to the settings*/
function getMarker(col: ColorOptions, sym: SymbolOptions, feature, latlng: L.LatLng): L.Marker {

    if (col.colors && col.limits)
        col.fillColor = col.colors.slice().length == 0 || !col.useMultipleFillColors ? col.fillColor : GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), feature.properties[col.colorField.value]);
    let borderColor = col.color;
    let x: number = sym.sizeXVar ? GetSymbolSize(feature.properties[sym.sizeXVar.value], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    let y: number = sym.sizeYVar ? GetSymbolSize(feature.properties[sym.sizeYVar.value], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 20;
    switch (sym.symbolType) {
        case SymbolTypes.Icon:
            let icon = GetItemBetweenLimits(sym.iconLimits.slice(), sym.icons.slice(), feature.properties[sym.iconField.value]);
            let customIcon = L.ExtraMarkers.icon({
                icon: icon ? icon.fa : sym.icons[0].fa,
                prefix: 'fa',
                markerColor: col.fillColor,
                svg: true,
                svgBorderColor: borderColor,
                svgOpacity: col.fillOpacity,
                shape: icon ? icon.shape : sym.icons[0].shape,
                iconColor: col.iconTextColor,
            });
            let mark = L.marker(latlng, { icon: customIcon });
            return mark;
        case SymbolTypes.Chart:
            let vals = [];
            let i = 0;
            sym.chartFields.map(function(e) {
                if (feature.properties[e.value] > 0)
                    vals.push({ feat: e, val: feature.properties[e.value], color: col.chartColors[e.value] });
                i++;
            });

            let chartHtml = makePieChart({
                fullCircle: sym.chartType === 'pie',
                data: vals,
                valueFunc: function(d) { return d.val; },
                strokeWidth: 1,
                outerRadius: x,
                innerRadius: x / 3,
                pieClass: function(d) { return d.data.feat },
                pathFillFunc: function(d) { return d.data.color },
                borderColor: col.color,
                opacity: col.fillOpacity
            });
            let marker = L.divIcon({ iconAnchor: L.point(x, x), html: chartHtml, className: '' });
            return L.marker(latlng, { icon: marker });
        case SymbolTypes.Blocks:
            let side = Math.ceil(Math.sqrt(feature.properties[sym.blockSizeVar] / sym.blockValue));
            let blockCount = Math.ceil(feature.properties[sym.blockSizeVar] / sym.blockValue);
            let blockHtml = makeBlockSymbol(side, blockCount, col.fillColor, borderColor);
            let blockMarker = L.divIcon({ iconAnchor: L.point(5 * side, 5 * side), html: blockHtml, className: '' });
            return L.marker(latlng, { icon: blockMarker });
        case SymbolTypes.Rectangle:
            let rectHtml = '<div style="height: ' + y + 'px; width: ' + x + 'px; opacity:' + col.opacity + '; background-color:' + col.fillColor + '; border: 1px solid ' + borderColor + '"/>';
            let rectIcon = L.divIcon({ iconAnchor: L.point(x / 2, y / 2), html: rectHtml, className: '' });
            return L.marker(latlng, { icon: rectIcon });
        default:
            let circleHtml = '<div style="height: ' + x + 'px; width: ' + x + 'px; opacity:' + col.opacity + '; background-color:' + col.fillColor + '; border: 1px solid ' + borderColor + ';border-radius: 30px;"/>';
            let circleIcon = L.divIcon({ iconAnchor: L.point(x / 2, x / 2), html: circleHtml, className: '' });
            return L.marker(latlng, { icon: circleIcon });
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

function makePieChart(options) {
    if (!options.data || !options.valueFunc) {
        return '';
    }
    let data = options.data,
        valueFunc = options.valueFunc,
        r = options.outerRadius ? options.outerRadius : 28,
        rInner = options.innerRadius ? options.innerRadius : r - 10,
        strokeWidth = options.strokeWidth ? options.strokeWidth : 1,
        pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function(d) { return d.data.feat.label + ': ' + d.data.val }, //Title for each path
        pieLabel = options.pieLabel ? options.pieLabel : '', //Label for the whole pie
        pathFillFunc = options.pathFillFunc,
        border = options.borderColor,
        opacity = options.opacity,

        origo = (r + strokeWidth), //Center coordinate
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
        .attr('opacity', opacity)
        .attr('stroke', border)
        .attr('stroke-width', strokeWidth)
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

function makeBlockSymbol(sideLength: number, blockAmount: number, fillColor: string, borderColor: string) {
    let arr = [];
    for (let i = sideLength; i > 0; i--) {

        arr.push(
            <tr key={i}>
                {getColumns.call(this, i).map(
                    function(column) {
                        return column;
                    })
                }
            </tr>
        );
    }

    function getColumns(i: number) {
        let columns = [];
        for (let c = 0; c < sideLength; c++) {
            let style = {
                width: 10,
                height: 10,
                backgroundColor: i + sideLength * c <= blockAmount ? fillColor : 'transparent',
                margin: 0,
                padding: 0,
                border: i + sideLength * c <= blockAmount ? '1px solid ' + borderColor : '0px',
            }
            columns.push(<td style={style} key={i + c}/>);
        }
        return columns;
    }

    let table =
        <table style={{
            width: 10 * sideLength,
            borderCollapse: 'collapse'
        }}>
            <tbody>
                {arr.map(function(td) {
                    return td;
                })}
            </tbody>
        </table>;
    return reactDOMServer.renderToString(table);
}

function createHeatLayer(l: Layer) {
    let arr: number[][] = [];
    let customScheme = l.colorOptions.useCustomScheme;
    let max = customScheme ? l.colorOptions.limits[l.colorOptions.limits.length - 2] : 0;
    l.geoJSON.features.map(function(feat) {
        let pos = [];
        let heatVal = feat.properties[l.heatMapVariable];
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

    let headers: IHeader[] = this.popupHeaders.slice();

    for (let h in headers) {
        let header = headers[h];
        let prop = feature.properties[header.value];
        if (prop != undefined) {
            popupContent += header.label + ": " + (header.type == 'number' ? prop.toFixed(header.decimalAccuracy) : prop);
            popupContent += "<br />";
        }
    }

    if (popupContent != '')
        layer.bindPopup(popupContent);

    if (this.showPopUpOnHover) {
        layer.off('click')
        layer.on('mouseover', function(e) { this.openPopup(); });
        layer.on('mouseout', function(e) { this.closePopup(); });
    }
    else {
        layer.on('click', function(e) { this.openPopup(); })
        layer.off('mouseover');
        layer.off('mouseout');
    }

}


export class ColorOptions implements L.PathOptions {
    /** Field to color layers by*/
    @observable colorField: IHeader;
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
    @observable iconTextColor: string = '#FFF';
    /** Main fill color. Default yellow*/
    @observable fillColor: string = '#E0E62D';
    /** Border color. Default black*/
    @observable color: string = '#000';
    /** Main opacity. Default 0.8*/
    @observable fillOpacity: number = 0.8;
    /** Border opacity. Default 0.8*/
    @observable opacity: number = 0.8;
    /** Whether to use choropleth colors/user-defined color steps or not*/
    @observable useMultipleFillColors: boolean;
    /** The l.heat radius, in meters */
    @observable heatMapRadius: number = 25;
    /** Chart symbol colors*/
    @observable chartColors: { [field: string]: string; } = undefined;

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
    @observable iconField: IHeader;
    /** The steps of the field values by which to choose the icons */
    @observable iconLimits: number[];
    /** The field to scale size x-axis by*/
    @observable sizeXVar: IHeader;
    /** The field to scale size y-axis by*/
    @observable sizeYVar: IHeader;
    /** The name of the field to scale block size by*/
    @observable blockSizeVar: string;
    /** The minimum allowed size when scaling*/
    @observable sizeLowLimit: number;
    /** The maximum allowed size when scaling*/
    @observable sizeUpLimit: number;
    /** The multiplier to scale the value by*/
    @observable sizeMultiplier: number;
    /** Currently selected chart fields*/
    @observable chartFields: IHeader[];
    /** The type of chart to draw*/
    @observable chartType: 'pie' | 'donut';
    /** How many units does a single block represent*/
    @observable blockValue: number;
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

        this.symbolType = prev && prev.symbolType || SymbolTypes.Circle;
        this.useMultipleIcons = prev && prev.useMultipleIcons || false;
        this.icons = prev && prev.icons || [{ shape: 'circle', fa: 'fa-anchor' }];
        this.iconField = prev && prev.iconField || undefined;
        this.iconLimits = prev && prev.iconLimits || [];
        this.sizeXVar = prev && prev.sizeXVar || undefined;
        this.sizeYVar = prev && prev.sizeYVar || undefined;
        this.sizeLowLimit = prev && prev.sizeLowLimit || 0;
        this.sizeUpLimit = prev && prev.sizeUpLimit || 50;
        this.sizeMultiplier = prev && prev.sizeMultiplier || 1;
        this.chartFields = prev && prev.chartFields || [];
        this.chartType = prev && prev.chartType || 'pie';
        this.blockValue = prev && prev.blockValue || 0;
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
    @observable showAvg: boolean;
    @observable avgText: string;
    @observable showSum: boolean;
    @observable sumText: string;

    constructor(prev?: ClusterOptions) {
        this.useClustering = prev && prev.useClustering || false;
        this.showCount = prev && prev.showCount || true;
        this.countText = prev && prev.countText || 'map points';
        this.showAvg = prev && prev.showAvg || false;
        this.avgText = prev && prev.avgText || 'avg:';
        this.showAvg = prev && prev.showAvg || false;
        this.sumText = prev && prev.sumText || 'sum:';

    }
}

/** The interface for imported data columns/headers/property names */
export class IHeader {
    /** Actual data value. Used to, for example, get properties from GeoJSON layers*/
    @observable value: string = '';
    /** Display text. Can be modified by the user*/
    @observable label?: string = '';
    /**  The data type of a field. Number/string (datetime and others TODO)*/
    @observable type: 'string' | 'number';
    @observable decimalAccuracy?: number;

    constructor(prev?: IHeader) {
        this.value = prev && prev.value || '';
        this.label = prev && prev.label || this.value && this.value[0].toUpperCase() + this.value.slice(1);;
        this.type = prev && prev.type || 'string';
        this.decimalAccuracy = prev && prev.decimalAccuracy || 0;
    }
}
