import * as React from 'react';
let Select = require('react-select');
let ColorPicker = require('react-color');
import { ColorScheme } from './ColorScheme';
let Modal = require('react-modal');
let chroma = require('chroma-js');
import { AppState } from '../../stores/States';
import { Layer, ColorOptions, Header, LayerTypes, SymbolTypes } from '../../stores/Layer';
import { CalculateLimits } from '../../common_items/common';
import { observer } from 'mobx-react';

@observer
export class ColorMenu extends React.Component<{
    state: AppState,
    /** layer being edited*/
}, {}> {
    onColorSelect = (color) => {
        let layer = this.props.state.editingLayer;
        let isChart: boolean = layer.symbolOptions.symbolType === SymbolTypes.Chart;
        let hex: string = color.hex;
        let editing: string = this.props.state.colorMenuState.editing;

        if (editing.indexOf('step') !== -1) {
            layer.colorOptions.colors[editing.substring(4)] = hex;

        }
        else if (isChart && editing.indexOf('chartfield') !== -1) {
            layer.colorOptions.chartColors[editing.substring(10)] = hex;
        }
        else {
            switch (this.props.state.colorMenuState.editing) {
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
        if (this.props.state.autoRefresh)
            layer.refresh();
        this.props.state.colorMenuState.startColor = hex;
    }

    onCustomSchemeChange = (e) => {
        let use: boolean = e.target.checked;
        let layer = this.props.state.editingLayer;
        let steps: number = use ? layer.colorOptions.steps : layer.colorOptions.steps > 10 ? 10 : layer.colorOptions.steps; //  If switching back from custom steps, force the steps to be under the limit
        layer.colorOptions.useCustomScheme = use;
        layer.colorOptions.steps = steps;

        this.calculateValues();
    }

    onCustomLimitBlur = (step: number, e) => {
        let layer = this.props.state.editingLayer;
        let limits = layer.colorOptions.limits;
        let val = e.currentTarget.valueAsNumber;
        if (limits[step + 1] !== undefined && limits[step + 1] <= val) { // if collides with the next limit
            limits = this.increaseLimitStep(limits, val, step);
        }
        else if (limits[step - 1] !== undefined && limits[step - 1] >= val) { // if collides with the previous limit
            limits = this.decreaseLimitStep(limits, val, step);
        }
        if (this.props.state.autoRefresh)
            layer.refresh();

    }

    onCustomLimitChange = (step: number, e) => {
        let layer = this.props.state.editingLayer;
        let val = (e.currentTarget as any).valueAsNumber;
        if (step === 0 && val > layer.values[layer.colorOptions.colorField.value][0])// the lowest limit cannot be increased, since this would lead to some items not having a color
            return;
        else
            layer.colorOptions.limits[step] = val;
    }

    increaseLimitStep = (limits: number[], val: number, step: number) => {
        limits[step] = val;
        if (step < limits.length - 1 && limits[step + 1] <= val) {
            return this.increaseLimitStep(limits, val + 1, step + 1);
        }
        else {
            return limits;
        }
    }

    decreaseLimitStep = (limits: number[], val: number, step: number) => {
        limits[step] = val;
        if (step > 0 && limits[step - 1] >= val) {

            return this.decreaseLimitStep(limits, val - 1, step - 1);
        }
        else {
            return limits;
        }
    }

    toggleColorPick = (property: string) => {
        let state = this.props.state.colorMenuState;
        let col = this.props.state.editingLayer.colorOptions;
        state.colorSelectOpen = state.editing !== property ? true : !state.colorSelectOpen;
        state.startColor = property.indexOf('step') !== -1 ? col.colors[property.substring(4)] : property.indexOf('chartfield') !== -1 ? col.chartColors[property.substring(10)] : '';
        state.editing = property;
    }

    renderScheme = (option: Header) => {
        return <ColorScheme gradientName={option.value} revert={this.props.state.editingLayer.colorOptions.revert} width='109%' />;
    }

    /**
     * calculateValues - Performs the chroma-js calculation to get colors and steps
     */
    calculateValues = () => {
        let lyr: Layer = this.props.state.editingLayer;
        let field: Header = lyr.colorOptions.colorField;
        let limits: any[] = [];
        if (field.type === 'number') {
            let steps: number = Math.min(lyr.uniqueValues[field.value].length, lyr.colorOptions.steps);
            if (!lyr.colorOptions.useCustomScheme) {
                limits = chroma.limits(lyr.values[field.value], lyr.colorOptions.mode, steps);
                limits.splice(limits.length - 1, 1); // remove maximum value from limits
                limits = limits.filter(function(e, i, arr) {
                    return arr.lastIndexOf(e) === i;
                }); // only unique values in limits
            }
            else {
                if (steps >= lyr.uniqueValues[field.value].length) {
                    limits = lyr.uniqueValues[field.value];
                }
                else
                    limits = CalculateLimits(lyr.values[field.value][0], lyr.values[field.value][lyr.values[field.value].length - 1], steps, field.decimalAccuracy);
            }
        }
        else {
            limits = lyr.uniqueValues[field.value];
        }
        let colors: string[];
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
        if (this.props.state.autoRefresh)
            lyr.refresh();

    }

    /**
     * getOppositeColor - Returns a near-opposite color to the one given
     *
     * @param   color Color(hex) to compare
     * @return  Opposite color code(hex)
     */
    getOppositeColor = (color: string) => {
        if (!color || color.toLowerCase() === '#fff' || color === '#ffffff' || color === 'white') {
            return '#000';
        }
        else if (color.toLowerCase() === '#000' || color === '#000000' || color === 'black') {
            return '#FFF';
        }
        return '#' + ('000000' + ((0xffffff ^ parseInt(color.substr(1), 16)).toString(16))).slice(-6);

    }

    /** Get limits from steps*/
    getStepLimits = () => {
        if (!this.props.state.editingLayer.colorOptions.useMultipleFillColors)
            return [];
        let limits: number[] = [];
        for (let i = 0; i < this.props.state.editingLayer.colorOptions.steps; i++) {
            let step: number = +(document.getElementById(i + 'min') as any).value;
            limits.push(step);
        }
        limits.push(this.props.state.editingLayer.colorOptions.limits[this.props.state.editingLayer.colorOptions.limits.length - 1]);
        return limits;
    }


    render() {
        let strings = this.props.state.strings;
        let layer = this.props.state.editingLayer;
        let col = layer.colorOptions;

        let state = this.props.state.colorMenuState;
        let autoRefresh = this.props.state.autoRefresh;

        let fillColorBlockStyle = {
            background: col.fillColor,
            color: this.getOppositeColor(col.fillColor),
            border: '1px solid ' + col.color,
        };
        let iconTextColorBlockStyle = {

            background: col.iconTextColor,
            color: this.getOppositeColor(col.iconTextColor),
            border: '1px solid ' + col.color,
        };
        let colorSelectStyle = {
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
        let isChart = layer.layerType === LayerTypes.Standard && layer.symbolOptions.symbolType === SymbolTypes.Chart;
        let isHeat = layer.layerType === LayerTypes.HeatMap;
        let fieldIsString = col.colorField ? col.colorField.type === 'string' : false;

        // separated some components for readability
        let colorPicker = <Modal
            isOpen={state.colorSelectOpen}
            style={colorSelectStyle}
            contentLabel='Colors'
            >

            <ColorPicker.SwatchesPicker
                width={300}
                height={600}
                overlowY='auto'
                color={state.startColor}
                onChange={this.onColorSelect}
                />
            <button
                className='primaryButton'
                onClick={this.toggleColorPick.bind(this, state.editing)}
                style={{ position: 'absolute', left: 80 }}>OK</button>
        </Modal>;

        let stepModes = <div>
            {strings.selectStepCalculationMode}
            <label htmlFor='quantiles'>
                {strings.colorStepQuantiles}
                <input
                    type='radio'
                    onChange={() => { col.mode = 'q'; this.calculateValues(); } }
                    checked={col.mode === 'q'}
                    name='mode'
                    id='quantiles'
                    />
                <br />
            </label>
            <label htmlFor='kmeans'>
                {strings.colorStepKMeans}
                <input
                    type='radio'
                    onChange={() => { col.mode = 'k'; this.calculateValues(); } }
                    checked={col.mode === 'k'}
                    name='mode'
                    id='kmeans'
                    />
                <br />

            </label>
            <label htmlFor='equidistant'>
                {strings.colorStepEquidistant}
                <input
                    type='radio'
                    onChange={() => { col.mode = 'e'; this.calculateValues(); } }
                    checked={col.mode === 'e'}
                    name='mode'
                    id='equidistant'
                    />
                <br />

            </label>
        </div>;

        let colorBlocks = <div>
            {col.useMultipleFillColors || isHeat || isChart ?
                null :
                <div className='colorBlock' style={fillColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'fillColor')}>{strings.fillColor}</div>
            }
            {isHeat ? null :
                <div className='colorBlock'
                    style={{ background: col.color, border: '1px solid ' + col.color, cursor: 'pointer' }}
                    onClick={this.toggleColorPick.bind(this, 'borderColor')}>{strings.border}
                    <input type='number' min={0} max={15} step={1} value={col.weight.toString()} style={{ position: 'absolute', right: 0, width: 50 }}
                        onClick={(e) => { e.stopPropagation(); } }
                        onChange={(e) => {
                            let val: number = (e.currentTarget as any).valueAsNumber;
                            if (col.weight !== val) {
                                col.weight = val;
                                if (autoRefresh) layer.refresh();
                            }
                        } } />
                </div>
            }
            {!isHeat && layer.symbolOptions.symbolType === SymbolTypes.Icon ?
                <div className='colorBlock' style={iconTextColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'iconTextColor')}>{strings.icon}</div>
                : null
            }
        </div>;

        let colorSchemeOptions = <div>
            {strings.or}
            <br />
            <label>{strings.selectColorScheme}</label>
            <Select
                clearable={false}
                searchable={false}
                options={_gradientOptions}
                optionRenderer={this.renderScheme}
                valueRenderer={this.renderScheme}
                onChange={(e) => {
                    if (col.colorScheme !== e) {
                        col.colorScheme = e.value;
                        this.calculateValues();
                    }
                } }
                value={col.colorScheme}
                />
            <label htmlFor='revertSelect'>{strings.revert}</label>
            <input
                id='revertSelect'
                type='checkbox'
                onChange={(e) => {
                    col.revert = (e.target as any).checked;
                    this.calculateValues();
                } }
                checked={col.revert} />
        </div>;

        return (
            <div className='makeMaps-options'>
                {isHeat || isChart ? null :
                    <label htmlFor='multipleSelect'>{strings.useMultipleFillColors}
                        <input
                            id='multipleSelect'
                            type='checkbox'
                            onChange={(e) => {
                                col.useMultipleFillColors = (e.target as any).checked;
                                if (autoRefresh)
                                    layer.refresh();
                            } }
                            checked={col.useMultipleFillColors} />
                    </label>
                }
                {colorBlocks}
                <label>{strings.opacity}
                    <input type='number' max={1} min={0} step={0.1}
                        onChange={(e) => {
                            let val: number = (e.target as any).valueAsNumber;
                            let layer = this.props.state.editingLayer;
                            if (layer.colorOptions.opacity !== val || layer.colorOptions.fillOpacity !== val) {
                                layer.colorOptions.opacity = val;
                                layer.colorOptions.fillOpacity = val;
                                if (this.props.state.autoRefresh)
                                    layer.setOpacity();
                            }
                        } }
                        value={col.opacity.toString()} />
                </label>
                {colorPicker}

                {
                    (col.useMultipleFillColors || isHeat) && !isChart ?
                        <div>
                            <div>
                                <label>{strings.selectColorVariable}</label>
                                <Select
                                    options={layer.headers.slice()}
                                    onChange={(e: Header) => {
                                        if (col.colorField !== e) {
                                            col.colorField = e;
                                            this.calculateValues();
                                        }
                                    } }
                                    value={col.colorField}
                                    clearable={false}
                                    placeholder={strings.selectPlaceholder}
                                    />
                            </div>

                            {col.colorField && !fieldIsString ?
                                <div>
                                    <label htmlFor='customScale'>{strings.setCustomScheme}</label>
                                    <input
                                        id='customScale'
                                        type='checkbox'
                                        onChange={this.onCustomSchemeChange}
                                        checked={col.useCustomScheme} />
                                    <br />
                                    {col.useCustomScheme ?
                                        null
                                        :
                                        colorSchemeOptions
                                    }
                                    <label>{strings.steps}</label>
                                    <input
                                        type='number'
                                        max={layer.uniqueValues[col.colorField.value].length}
                                        min={2}
                                        step={1}
                                        onChange={(e) => {
                                            let val: number = (e.currentTarget as any).valueAsNumber;
                                            if (col.steps !== val) {
                                                col.steps = val;
                                                this.calculateValues();
                                            }
                                        } }
                                        value={col.steps.toString()} />
                                    {col.useCustomScheme ?
                                        <div>
                                            {strings.colorMenuStepHelp}
                                            {this.renderSteps()}
                                        </div>
                                        :
                                        stepModes
                                    }
                                    {isHeat ?
                                        <div>
                                            {strings.heatMapRadius}
                                            <input
                                                type='number'
                                                max={100}
                                                min={10}
                                                step={1}
                                                onChange={(e) => {
                                                    let val: number = (e.currentTarget as any).valueAsNumber;
                                                    if (col.heatMapRadius !== val) {
                                                        col.heatMapRadius = val;
                                                        if (autoRefresh)
                                                            layer.refresh();
                                                    }
                                                } }
                                                value={col.heatMapRadius.toString()} />
                                        </div>
                                        : null}
                                </div>
                                : null}


                        </div>
                        : null
                }
                {isChart || (fieldIsString && col.useMultipleFillColors) ? <div>
                    {this.renderSteps()}
                </div> : null}
                {autoRefresh ? null :
                    <button className='menuButton' onClick={() => {
                        this.props.state.editingLayer.refresh();
                    } }>{strings.refreshMap}</button>
                }
            </div >
        );
    }

    renderSteps() {
        let layer = this.props.state.editingLayer;
        let col = layer.colorOptions;
        let limits = col.limits.slice();
        let rows = [];
        let row = 0;
        if (layer.symbolOptions.symbolType === SymbolTypes.Chart) {
            for (let i of layer.symbolOptions.chartFields) {
                rows.push(
                    <li key={i.label}
                        style={{ background: col.chartColors[i.value] || '#FFF', borderRadius: '5px', border: '1px solid ' + col.color, cursor: 'pointer' }}
                        onClick={this.toggleColorPick.bind(this, 'chartfield' + i.value)}>
                        <i style={{ background: 'white', borderRadius: 5 }}>
                            {i.label}
                        </i>
                    </li>);
                row++;
            }
        }
        else if (col.colorField.type === 'string') {
            for (let i of limits) {
                rows.push(
                    <li key={row}
                        style={{ background: col.colors[row] || '#FFF', borderRadius: '5px', border: '1px solid ' + col.color, cursor: 'pointer', height: 32 }}
                        onClick={this.toggleColorPick.bind(this, 'step' + row)}>
                        <i style={{ background: 'white', borderRadius: 5 }}>
                            {i}
                        </i>
                    </li>);
                row++;
            }
        }
        else {
            for (let i of limits) {
                rows.push(
                    <li key={row}
                        style={{ background: col.colors[row] || '#FFF', borderRadius: '5px', border: '1px solid ' + col.color, cursor: 'pointer', height: 32 }}
                        onClick={this.toggleColorPick.bind(this, 'step' + row)}>

                        <input
                            id={row + 'min'}
                            type='number'
                            value={limits[row].toString()}
                            onChange={this.onCustomLimitChange.bind(this, row)}
                            onBlur={this.onCustomLimitBlur.bind(this, row)}
                            style={{
                                width: 100,
                            }}
                            onClick={function(e) { e.stopPropagation(); } }
                            step={1 * 10 ** (-col.colorField.decimalAccuracy)} />

                    </li>);
                row++;
            }
        }
        return <div>
            <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r; })}</ul>
        </div>;
    }
}
const _gradientOptions: { value: string }[] =
    [
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
        // { value: 'RdGy' },
        // { value: 'Set1' },
        { value: 'Set2' },
        // { value: 'Set3' },
        // { value: 'Accent' },
        { value: 'Dark2' },
        { value: 'Paired' },
        // { value: 'Pastel1' },
        // { value: 'Pastel2' }



    ];
