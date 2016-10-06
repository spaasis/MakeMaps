import * as React from 'react';
import { GetItemBetweenLimits } from '../../common_items/common';
import { AppState } from '../../stores/States';
import { Layer, SymbolOptions, ColorOptions, LayerTypes, SymbolTypes } from '../../stores/Layer';
import { TextEditor } from './TextEditor';
import { Header } from '../../stores/Layer';

import { observer } from 'mobx-react';

@observer
export class OnScreenLegend extends React.Component<{ state: AppState }, {}>{
    createLegend(layer: Layer, showLayerName: boolean, showSeparator) {
        let choroLegend, scaledLegend, chartLegend, iconLegend, blockLegend;
        let options = layer;
        let col = options.colorOptions;
        let sym = options.symbolOptions;
        let isHeat = layer.layerType === LayerTypes.HeatMap;

        if (col.colors && col.colors.length !== 0 && col.useMultipleFillColors && sym.symbolType !== SymbolTypes.Chart && (isHeat || sym.symbolType !== SymbolTypes.Icon || sym.iconField !== col.colorField)) {
            let percentages: number[] = this.props.state.legend.showPercentages ? this.getStepPercentages(layer.values[col.colorField.value], col.limits) : [];
            choroLegend = this.createMultiColorLegend(options, percentages);
        }
        if (!isHeat && sym.symbolType === SymbolTypes.Chart && col.chartColors) {
            chartLegend = this.createChartSymbolLegend(col, sym);
        }
        if (!isHeat && sym.symbolType === SymbolTypes.Simple) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        if (!isHeat && sym.symbolType === SymbolTypes.Icon) {
            let percentages: number[] = this.props.state.legend.showPercentages && sym.iconLimits.length > 1 ? this.getStepPercentages(layer.values[sym.iconField.value], sym.iconLimits) : [];
            iconLegend = this.createIconLegend(options, percentages, layer.name);
        }
        if (!isHeat && sym.symbolType === SymbolTypes.Blocks) {
            blockLegend = this.createBlockLegend(options);
        }

        return <div key={layer.id} style={{ clear: 'both' }}>
            <div>
                {showLayerName ? layer.name : null}
            </div>
            {choroLegend}
            {scaledLegend}
            {chartLegend}
            {iconLegend}
            {blockLegend}
            {showSeparator ? <hr style ={{ clear: 'both' }}/> : null}

        </div>
    }
    createMultiColorLegend(layer: Layer, percentages: number[]) {
        let divs = [];
        let limits = layer.colorOptions.limits;
        let colors = layer.colorOptions.colors;
        let isNumber = layer.colorOptions.colorField.type == 'number';
        let legend = this.props.state.legend;
        for (let i of limits) {
            let index = limits.indexOf(i);
            let colorStyle = {
                background: colors[index],
                opacity: layer.layerType === LayerTypes.HeatMap ? 1 : layer.colorOptions.fillOpacity,
                minWidth: '20px',
                minHeight: '20px',
            }

            divs.push(<div key={i} style={{ display: legend.horizontal ? 'initial' : 'flex', width: '100%' }}>
                <div style={colorStyle} />

                <span style={{ marginLeft: '3px', marginRight: '3px' }}>

                    {isNumber ? i.toFixed(layer.colorOptions.colorField.decimalAccuracy) + (index < (limits.length - 1) ? '-' : '+') : i}
                    {legend.horizontal ? <br/> : ''}
                    {isNumber && index < (limits.length - 1) ? limits[index + 1].toFixed(layer.colorOptions.colorField.decimalAccuracy) : ''}
                    {isNumber && legend.showPercentages ? <br/> : null}
                    {isNumber && legend.showPercentages ? percentages[index] ? percentages[index] + '%' : '0%' : null}
                </span>

            </div >);
        }
        return <div style={{ margin: '5px', float: '', textAlign: 'center' }}>
            {legend.showVariableNames ? layer.colorOptions.colorField.label : null}
            <div style= {{ display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}>
                {divs.map(function(d) { return d })}
            </div >
        </div >;
    }

    createScaledSizeLegend(layer: Layer) {
        let symbolType = layer.symbolOptions.symbolType;
        let opt = layer.symbolOptions;
        let xVar = opt.sizeXVar;
        let yVar = opt.sizeYVar;
        let square: boolean = xVar && yVar && xVar === yVar;

        let style = {
            float: 'left',
            margin: 5,
            clear: this.props.state.legend.horizontal ? 'both' : ''
        }

        if (square)
            return (<div style={style}>
                {rectangleLegend.call(this, false)}
            </div>);
        else {
            return (
                <div style={style}>
                    {xVar ? rectangleLegend.call(this, false) : null}
                    {yVar ? rectangleLegend.call(this, true) : null}
                </div>);
        }


        function rectangleLegend(y: boolean) {

            let divs = [], sides = [], values = [];
            let classes: number = 5;
            for (let i = 0; i < classes - 1; i++) {
                sides[i] = y ? Math.round(opt.actualMinYRadius + i * ((opt.actualMaxYRadius - opt.actualMinYRadius) / classes)) : Math.round(opt.actualMinXRadius + i * ((opt.actualMaxXRadius - opt.actualMinXRadius) / classes));
                values[i] = y ? (opt.actualMinYValue + i * ((opt.actualMaxYValue - opt.actualMinYValue) / classes)).toFixed(yVar.decimalAccuracy) : (opt.actualMinXValue + i * ((opt.actualMaxXValue - opt.actualMinXValue) / classes)).toFixed(xVar.decimalAccuracy);
            }
            sides.push(y ? opt.actualMaxYRadius : opt.actualMaxXRadius);
            values.push(y ? opt.actualMaxYValue.toFixed(yVar.decimalAccuracy) : opt.actualMaxXValue.toFixed(xVar.decimalAccuracy));
            let textWidth = values[values.length - 1].length;

            for (let i = 0; i < classes; i++) {
                let margin = (sides[sides.length - 1] - sides[i]) / 2;
                let l = sides[i];
                let style = {
                    width: square ? l : y ? 10 : l,
                    height: square ? l : y ? l : 10,
                    backgroundColor: layer.colorOptions.fillColor,
                    display: this.props.state.legend.horizontal ? '' : 'inline-block',
                    border: '1px solid gray',
                    borderRadius: opt.borderRadius,
                    marginLeft: this.props.state.legend.horizontal || y ? 'auto' : margin, //center values
                    marginRight: this.props.state.legend.horizontal || y ? 'auto' : margin, //center values
                    marginTop: this.props.state.legend.horizontal && y ? margin : 'auto',
                    marginBottom: this.props.state.legend.horizontal && y ? margin : 'auto',
                }

                let parentDivStyle = {
                    float: this.props.state.legend.horizontal ? 'left' : '',
                    marginRight: this.props.state.legend.horizontal ? 5 : 0,
                }
                divs.push(
                    <div key={i} style={parentDivStyle}>
                        <div style={style} />
                        <span style={{ display: 'inline-block', width: this.props.state.legend.horizontal ? '' : textWidth * 10 }}>{values[i]}</span>
                    </div >);
            }

            return <div style= {{ float: this.props.state.legend.horizontal ? '' : 'left', textAlign: 'center' }}>
                {y ? layer.symbolOptions.sizeYVar.label : layer.symbolOptions.sizeXVar.label}
                <div>
                    {divs.map(function(d) { return d })}
                </div>
            </div>;
        }

        function circleLegend() {
            let divs = [], radii = [], values = [];
            let classes: number = 5;
            for (let i = 0; i < classes - 1; i++) {
                radii[i] = Math.round(opt.actualMinXRadius + i * ((opt.actualMaxXRadius - opt.actualMinXRadius) / classes));
                values[i] = (opt.actualMinXValue + i * ((opt.actualMaxXValue - opt.actualMinXValue) / classes)).toFixed(xVar.decimalAccuracy);
            }
            radii.push(opt.actualMaxXRadius);
            values.push(opt.actualMaxXValue.toFixed(xVar.decimalAccuracy));
            for (let i = 0; i < classes; i++) {
                let margin = radii[radii.length - 1] - radii[i] + 2;
                let l = 2 * radii[i];
                let style = {
                    width: l,
                    height: l,
                    backgroundColor: layer.colorOptions.fillColor,
                    float: this.props.state.legend.horizontal ? '' : 'left',
                    border: '1px solid gray',
                    borderRadius: '50%',
                    marginLeft: this.props.state.legend.horizontal ? 2 : margin, //center values
                    marginRight: this.props.state.legend.horizontal ? 2 : margin, //center values
                    marginTop: this.props.state.legend.horizontal ? margin : 2,
                    marginBottom: this.props.state.legend.horizontal ? margin : 2,
                }
                let parentDivStyle = {
                    float: this.props.state.legend.horizontal ? 'left' : '',
                    minHeight: '15px',
                    overflow: this.props.state.legend.horizontal ? 'none' : 'auto',
                    lineHeight: this.props.state.legend.horizontal ? '' : Math.max(2 * radii[i] + 4, 15) + 'px',

                }
                divs.push(
                    <div key={i} style={parentDivStyle}>
                        <div style={style} />
                        <span style={{ marginRight: this.props.state.legend.horizontal ? 15 : '' }}>{values[i]}</span>
                    </div>);
            }

            return <div style= {{ float: this.props.state.legend.horizontal ? '' : 'left', textAlign: 'center' }}>
                {layer.symbolOptions.sizeXVar.label}

                <div>
                    {divs.map(function(d) { return d })}
                </div>
            </div>;
        }

    }

    createChartSymbolLegend(col: ColorOptions, sym: SymbolOptions) {
        let divs = [];
        let headers = sym.chartFields;
        for (let i = 0; i < headers.length; i++) {
            let colorStyle = {
                background: col.chartColors[headers[i].value],
                minWidth: '20px',
                minHeight: '20px',
            }
            divs.push(<div key={i} style={{ display: this.props.state.legend.horizontal ? 'initial' : 'flex', width: '100%' }}>
                <div style={colorStyle} />
                <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                    {headers[i].label}
                </span>
            </div >);
        }
        return <div style={{ margin: '5px', float: '' }}>
            <div style= {{ display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}>
                {divs.map(function(d) { return d })}
            </div >
        </div >;
    }

    createIconLegend(layer: Layer, percentages: number[], layerName: string) {
        let divs = [];
        let col = layer.colorOptions;
        let sym = layer.symbolOptions;
        let icons: IIcon[] = sym.icons.slice();
        let limits = sym.iconField == col.colorField ? this.combineLimits(layer) : sym.iconLimits.slice();
        let isNumber = sym.iconField.type == 'number';
        let legend = this.props.state.legend;
        if (limits && limits.length > 0) {
            for (let i of limits) {

                let index = limits.indexOf(i);

                let fillColor: string = col.colorField === layer.symbolOptions.iconField && col.useMultipleFillColors ?
                    isNumber ?
                        GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), (limits[index] + limits[index]) / 2) ://if can be fitted into the same legend, show colors and symbols together. Get fill color by average of icon limits
                        col.colors[index]
                    : col.fillColor;
                let icon = icons.length == 1 ? icons[0] : isNumber ? GetItemBetweenLimits(sym.iconLimits.slice(), sym.icons.slice(), (i + limits[index]) / 2) : icons[index];

                divs.push(<div key={i} style={{ display: legend.horizontal ? 'initial' : 'flex', width: '100%' }}>
                    {!icon ? '' : getIcon(icon.shape, icon.fa, col.color, fillColor, fillColor != '000' ? layer.colorOptions.iconTextColor : 'FFF')}
                    <span style={{ marginLeft: '3px', marginRight: '3px' }}>

                        {isNumber ? (i.toFixed(sym.iconField.decimalAccuracy) + (index < (limits.length - 1) ? '-' : '+')) : i}
                        {isNumber ? (legend.horizontal ? <br/> : '') : null}
                        {isNumber ? (index < (limits.length - 1) ? limits[index + 1].toFixed(sym.iconField.decimalAccuracy) : '') : null}
                        {legend.showPercentages ? <br/> : null}
                        {legend.showPercentages ? percentages[i] ? percentages[i] + '%' : '0%' : null}
                    </span>
                </div >);
            }
            return <div style={{ margin: '5px', float: '', textAlign: 'center' }}>
                {legend.showVariableNames ? layer.symbolOptions.iconField.label : null}
                <div style= {{ display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}>
                    {divs.map(function(d) { return d })}
                </div >
            </div >;
        }
        else {
            return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
                {layerName}
                <div style= {{ display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}>
                    {getIcon(icons[0].shape, icons[0].fa, layer.colorOptions.color, layer.colorOptions.fillColor, layer.colorOptions.iconTextColor)}
                </div >
            </div >;
        }
        function getIcon(shape: string, fa: string, stroke: string, fill: string, iconColor: string) {
            let circleIcon =
                <svg viewBox="0 0 69.529271 95.44922" height="40" width="40">
                    <g transform="translate(-139.52 -173.21)">
                        <path fill={fill} stroke={stroke} d="m174.28 173.21c-19.199 0.00035-34.764 15.355-34.764 34.297 0.007 6.7035 1.5591 12.813 5.7461 18.854l0.0234 0.0371 28.979 42.262 28.754-42.107c3.1982-5.8558 5.9163-11.544 6.0275-19.045-0.0001-18.942-15.565-34.298-34.766-34.297z"/>
                    </g>

                </svg>;
            let squareIcon =
                <svg viewBox="0 0 69.457038 96.523441" height="40" width="40">
                    <g transform="translate(-545.27 -658.39)">
                        <path fill={fill} stroke={stroke} d="m545.27 658.39v65.301h22.248l12.48 31.223 12.676-31.223h22.053v-65.301h-69.457z"/>
                    </g>
                </svg>
            let starIcon =
                <svg height="40" width="40" viewBox="0 0 77.690999 101.4702"><g transform="translate(-101.15 -162.97)">
                    <g transform="matrix(1 0 0 1.0165 -65.712 -150.28)">
                        <path  fill={fill} stroke={stroke} d="m205.97 308.16-11.561 11.561h-16.346v16.346l-11.197 11.197 11.197 11.197v15.83h15.744l11.615 33.693 11.467-33.568 0.125-0.125h16.346v-16.346l11.197-11.197-11.197-11.197v-15.83h-15.83l-11.561-11.561z"/></g>
                </g>
                </svg>
            let pentaIcon =
                <svg viewBox="0 0 71.550368 96.362438" height="40" width="40">
                    <g fill={fill} transform="translate(-367.08 -289.9)">
                        <path stroke={stroke} d="m367.08 322.5 17.236-32.604h36.151l18.164 32.25-35.665 64.112z"/></g>
                </svg>
            let activeIcon;
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
            return <div
                style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: iconColor,
                    width: 42,
                    height: 42,
                }}
                >
                {activeIcon}
                <i style={{ position: 'relative', bottom: 33, width: 18, height: 18 }} className={'fa ' + fa}/>
            </div>

        }
    }

    createBlockLegend(layer: Layer) {
        let legend = this.props.state.legend;
        let style = {
            width: 10,
            height: 10,
            backgroundColor: layer.colorOptions.fillColor,
            float: legend.horizontal ? '' : 'left',
            border: '1px solid ' + layer.colorOptions.color,
            margin: 'auto',
        }
        let parentDivStyle = {
            float: legend.horizontal ? 'left' : '',
            minHeight: '15px',
            overflow: legend.horizontal ? 'none' : 'auto',
            lineHeight: legend.horizontal ? '' : 24 + 'px',

        }
        return (
            <div style={{ margin: '5px', float: 'left' }}>
                {legend.showVariableNames ? layer.symbolOptions.blockSizeVar ? layer.symbolOptions.blockSizeVar.label : '' : null}
                <div style= {{ display: 'flex', flexDirection: legend.horizontal ? 'row' : 'column', flex: '1' }}>
                    <div style={style} />
                    =
                    <span style={{ display: 'inline-block' }}>{layer.symbolOptions.blockValue}</span>

                </div >
            </div >);
    }

    getStepPercentages(values: number[], limits: number[]) {
        let counts: number[] = [];
        let step = 0;
        let upperLimit = limits[step + 1];
        for (let i of values) {
            if (i >= upperLimit) {
                step++;
                if (step < limits.length - 1)
                    upperLimit = limits[step + 1];
                else upperLimit = Infinity
            }
            if (!counts[step])
                counts[step] = 0;
            counts[step]++;
        }
        let percentages = [];
        for (let i in counts) {
            percentages[i] = +(counts[i] / values.length * 100).toFixed(2);
        }
        return percentages;
    }

    combineLimits(layer: Layer) {
        return layer.symbolOptions.iconLimits.concat(layer.colorOptions.limits.filter(function(item) {
            return layer.symbolOptions.iconLimits.indexOf(item) < 0;
        })).sort(function(a, b) { return a == b ? 0 : a < b ? -1 : 1 });
    }

    onMetaChange = (e) => {
        this.props.state.legend.meta = e.target.value;
    }


    render() {
        let state = this.props.state;
        let layers = state.layers;
        let legend = state.legend;
        let layerCount = 0;
        let classExtension = legend.right ? (state.visibleMenu > 0 ? ' legendRightAnimate' : ' legendLeftAnimate') : '';
        return (
            <div className={'legend' + classExtension} //animate with menu open/close
                onMouseEnter={(e) => { state.map.dragging.disable(); state.map.scrollWheelZoom.disable(); } }
                onMouseLeave={(e) => { state.map.dragging.enable(); state.map.scrollWheelZoom.enable(); } }
                style={{
                    width: 'auto',
                    textAlign: 'center',
                    position: 'absolute',
                    left: legend.left ? 0 : '',
                    right: legend.right ? (state.menuShown ? (state.visibleMenu == 0 ? 30 : 281) : 0) : '',
                    bottom: legend.bottom ? 15 : '', //15 to keep the legend above map attributions
                    top: legend.top ? 0 : '',
                    background: "#FFF",
                    borderRadius: 15,
                    zIndex: 600
                }}>
                <h2 className='legendHeader'>{legend.title}</h2>
                <div>
                    {
                        layers.map(function(m) {
                            layerCount++;
                            return this.createLegend(m, layers.length > 1, layerCount < layers.length);
                        }, this)
                    }

                </div>
                <div style={{ clear: 'both' }}>
                    <TextEditor
                        style={{ width: '100%', minHeight: legend.edit ? '40px' : '' }}
                        content={legend.meta}
                        onChange={this.onMetaChange}
                        edit={legend.edit}/>
                </div>
            </div >


        );
    }



}
