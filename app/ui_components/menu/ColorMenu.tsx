import * as React from 'react';
let Select = require('react-select');
let ColorPicker = require('react-color');
import { ColorScheme } from './ColorScheme';
let Modal = require('react-modal');
let chroma = require('chroma-js');
import { AppState } from '../Stores/States';
import { Layer, ColorOptions } from '../Stores/Layer';
import { LayerTypes, SymbolTypes, CalculateLimits } from "../common_items/common";
import { observer } from 'mobx-react';

@observer
export class ColorMenu extends React.Component<{
    state: AppState,
    /** layer being edited*/
}, {}>{
    onColorSelect = (color) => {
        let layer = this.props.state.editingLayer;
        let isChart: boolean = layer.layerType === LayerTypes.SymbolMap && layer.symbolOptions.symbolType === SymbolTypes.Chart;
        let hex: string = color.hex;
        let editing: string = this.props.state.colorMenuState.editing;
        layer.blockUpdate = true;

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
        layer.blockUpdate = false;
        this.props.state.colorMenuState.startColor = hex;
    }

    onChoroVariableChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.colorField = e.label;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;

    }
    onSchemeChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.colorScheme = e.value;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onOpacityChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.opacity = e.target.valueAsNumber;
        this.props.state.editingLayer.colorOptions.fillOpacity = e.target.valueAsNumber;
        this.props.state.editingLayer.blockUpdate = false;
    }
    onStepsChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.steps = e.target.valueAsNumber;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onModeChange = (mode) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.mode = mode;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onRevertChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.revert = e.target.checked;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onCustomSchemeChange = (e) => {
        let use: boolean = e.target.checked;
        let steps: number = use ? this.props.state.editingLayer.colorOptions.steps : this.props.state.editingLayer.colorOptions.steps > 10 ? 10 : this.props.state.editingLayer.colorOptions.steps; //If switching back from custom steps, force the steps to be under the limit
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.useCustomScheme = use;
        this.props.state.editingLayer.colorOptions.steps = steps;
        if (use) {
            this.props.state.editingLayer.colorOptions.colorScheme = undefined;
        }
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }

    onCustomLimitChange = (step: number, e) => {
        let layer = this.props.state.editingLayer;
        let limits = layer.colorOptions.limits;
        let val = e.currentTarget.valueAsNumber;
        if (step === 0 && val > layer.values[layer.colorOptions.colorField][0])//the lowest limit cannot be increased, since this would lead to some items not having a color
            return
        layer.blockUpdate = true;
        if (limits[step + 1] !== undefined && limits[step + 1] <= val) { //if collides with the next limit
            limits = this.increaseLimitStep(limits, val, step);
        }
        else if (limits[step - 1] !== undefined && limits[step - 1] >= val) { //if collides with the previous limit
            limits = this.decreaseLimitStep(limits, val, step);
        }
        else {
            limits[step] = val;
        }

        layer.blockUpdate = false;

    }

    increaseLimitStep = (limits: number[], val: number, step: number) => {
        limits[step] = val;
        if (step < limits.length - 1 && limits[step + 1] <= val) {
            return this.increaseLimitStep(limits, val + 1, step + 1)
        }
        else {
            return limits;
        }
    }

    decreaseLimitStep = (limits: number[], val: number, step: number) => {
        limits[step] = val;
        if (step > 0 && limits[step - 1] >= val) {

            return this.decreaseLimitStep(limits, val - 1, step - 1)
        }
        else {
            return limits;
        }
    }

    toggleColorPick = (property: string) => {
        let state = this.props.state.colorMenuState;
        let col = this.props.state.editingLayer.colorOptions;
        state.colorSelectOpen = state.editing !== property ? true : !state.colorSelectOpen;
        state.startColor = property.indexOf('step') !== -1 ? col.colors[property.substring(4)] : property.indexOf('chartfield') !== -1 ? col.chartColors[property.substring(10)] : "";
        state.editing = property;
    }

    renderScheme = (option: IHeader) => {
        return <ColorScheme gradientName={option.value} revert={this.props.state.editingLayer.colorOptions.revert}/>;
    }

    /**
     * calculateValues - Performs the chroma-js calculation to get colors and steps
     */
    calculateValues = () => {
        let lyr: Layer = this.props.state.editingLayer;
        let field: string = lyr.colorOptions.colorField;
        let uniqueValues: number[] = lyr.values[field].filter(function(e, i, arr) {
            return arr.lastIndexOf(e) === i;
        });
        let steps: number = Math.min(uniqueValues.length, lyr.colorOptions.steps);
        let limits: number[] = [];
        if (!lyr.colorOptions.useCustomScheme) {
            limits = chroma.limits(lyr.values[field], lyr.colorOptions.mode, steps);
        }
        else {
            if (steps === uniqueValues.length) {

                uniqueValues.push(uniqueValues[uniqueValues.length - 1] + 1);
                limits = uniqueValues;
            }
            else
                limits = CalculateLimits(lyr.values[field][0], lyr.values[field][lyr.values[field].length - 1], steps);
        }
        // for (let i in limits) {
        //     limits[i] = Math.round(limits[i]); //TODO: layer-specific accuracy on decimals. For example two decimal accuracy:  * 100) / 100
        // }
        //
        let colors: string[];
        if (!lyr.colorOptions.useCustomScheme) {
            colors = chroma.scale(lyr.colorOptions.colorScheme).colors(limits.length - 1);
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

    }

    /**
     * getOppositeColor - Returns a near-opposite color to the one given
     *
     * @param   color Color(hex) to compare
     * @return  Opposite color code(hex)
     */
    getOppositeColor = (color: string) => {
        if (color.toLowerCase() === '#fff' || color === '#ffffff' || color === 'white') {
            return '#000';
        }
        else if (color.toLowerCase() === '#000' || color === '#000000' || color === 'black') {
            return '#FFF'
        }
        return '#' + ('000000' + ((0xffffff ^ parseInt(color.substr(1), 16)).toString(16))).slice(-6);

    }

    /** Get limits from steps*/
    getStepLimits = () => {
        if (!this.props.state.editingLayer.colorOptions.useMultipleFillColors)
            return [];
        let limits: number[] = [];
        for (let i = 0; i < this.props.state.editingLayer.colorOptions.steps; i++) {
            let step: number = +(document.getElementById(i + 'min') as any).value
            limits.push(step)
        }
        limits.push(this.props.state.editingLayer.colorOptions.limits[this.props.state.editingLayer.colorOptions.limits.length - 1]);
        return limits;
    }


    /**  Manually save values when autoRefresh is disabled */
    saveOptions = () => {

    }
    renderSteps() {
        let layer = this.props.state.editingLayer;
        let limits = layer.colorOptions.limits.slice();
        let rows = [];
        let row = 0;
        if (layer.layerType === LayerTypes.SymbolMap && layer.symbolOptions.symbolType === SymbolTypes.Chart) {
            for (let i of layer.symbolOptions.chartFields) {
                rows.push(
                    <li key={i.label}
                        style={{ background: layer.colorOptions.chartColors[i.value] || '#FFF' }}
                        onClick={this.toggleColorPick.bind(this, 'chartfield' + i.value)}>
                        <i style={{ margin: 4, padding: 10, background: 'white', borderRadius: 5 }}>
                            {i.label}
                        </i>
                    </li>);
                row++;
            }
        }
        else {
            let steps: number[] = [];
            for (let i in limits) {
                if (+i !== limits.length - 1) {
                    let step: number = limits[i];
                    steps.push(step);
                }
            }
            for (let i of steps) {
                rows.push(
                    <li key={i}
                        style={{ background: layer.colorOptions.colors[row] || '#FFF' }}
                        onClick={this.toggleColorPick.bind(this, 'step' + row)}>

                        <input
                            id={row + 'min'}
                            type='number'
                            value={limits[row]}
                            onChange={this.onCustomLimitChange.bind(this, row)}
                            style={{
                                width: 100,
                            }}
                            onClick={function(e) { e.stopPropagation(); } }
                            step='any'/>

                    </li>);
                row++;
            }
        }
        return <div>
            <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r })}</ul>
        </div>
    }

    render() {
        if (this.props.state.visibleMenu !== 2)
            return <div />;
        let col = this.props.state.editingLayer.colorOptions;
        let layer = this.props.state.editingLayer;
        let state = this.props.state.colorMenuState;

        let fillColorBlockStyle = {
            background: col.fillColor,
            color: this.getOppositeColor(col.fillColor),
            border: '1px solid ' + col.color,
        }
        let borderColorBlockStyle = {
            background: col.color,
            color: this.getOppositeColor(col.color),
            border: '1px solid ' + col.color,
        }
        let iconTextColorBlockStyle = {

            background: col.iconTextColor,
            color: this.getOppositeColor(col.iconTextColor),
            border: '1px solid ' + col.color,
        }
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
        }
        let isChart = layer.layerType === LayerTypes.SymbolMap && layer.symbolOptions.symbolType === SymbolTypes.Chart;
        return (
            <div className="mapify-options">
                {layer.layerType === LayerTypes.ChoroplethMap || layer.layerType === LayerTypes.HeatMap || isChart ? null :
                    <div>
                        <label htmlFor='multipleSelect'>Use multiple fill colors
                            <input
                                id='multipleSelect'
                                type='checkbox'
                                onChange={(e) => {
                                    this.props.state.editingLayer.colorOptions.useMultipleFillColors = (e.target as any).checked;
                                } }
                                checked={col.useMultipleFillColors}/>
                        </label>
                    </div>
                }
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {col.useMultipleFillColors || layer.layerType === LayerTypes.HeatMap || isChart ?
                        null :
                        <div className='colorBlock' style={fillColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'fillColor')}>Fill</div>
                    }
                    {layer.layerType === LayerTypes.HeatMap ? null :
                        <div className='colorBlock' style={borderColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'borderColor')}>Border</div>
                    }
                    {layer.layerType === LayerTypes.SymbolMap && layer.symbolOptions.symbolType === SymbolTypes.Icon ?
                        <div className='colorBlock' style={iconTextColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'iconTextColor')}>Icon</div>
                        : null
                    }

                </div>
                {layer.layerType === LayerTypes.HeatMap ? null :
                    <div>
                        <label>Opacity</label>
                        <input type='number' max={1} min={0} step={0.1} onChange={this.onOpacityChange} value={col.opacity}/>
                    </div>
                }
                <Modal
                    isOpen={state.colorSelectOpen}
                    style={colorSelectStyle}
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
                </Modal>
                {isChart ? <div>
                    {this.renderSteps()}
                </div> : null}
                {
                    col.useMultipleFillColors && !isChart ?
                        <div>
                            {layer.layerType === LayerTypes.HeatMap ? null :
                                <div>
                                    <label>Select the variable to color by</label>
                                    <Select
                                        options={layer.numberHeaders}
                                        onChange={this.onChoroVariableChange}
                                        value={col.colorField}
                                        clearable={false}
                                        />
                                </div>
                            }

                            {col.colorField ?

                                <div>
                                    <label htmlFor='customScale'>Set custom scheme</label>
                                    <input
                                        id='customScale'
                                        type='checkbox'
                                        onChange={this.onCustomSchemeChange}
                                        checked={col.useCustomScheme}/>
                                    <br/>
                                    {col.useCustomScheme ?
                                        null
                                        :
                                        <div>
                                            Or
                                            <br/>
                                            <label>Select a color scheme</label>
                                            <Select
                                                clearable = {false}
                                                searchable = {false}
                                                options = {_gradientOptions}
                                                optionRenderer={this.renderScheme}
                                                valueRenderer = {this.renderScheme}
                                                onChange={this.onSchemeChange}
                                                value={col.colorScheme}
                                                />
                                            <label htmlFor='revertSelect'>Revert</label>
                                            <input
                                                id='revertSelect'
                                                type='checkbox'
                                                onChange={this.onRevertChange}
                                                checked={col.revert}/>
                                        </div>
                                    }
                                    <label>Steps</label>
                                    <input
                                        type='number'
                                        max={col.useCustomScheme ? 100 : 10}
                                        min={2}
                                        step={1}
                                        onChange={this.onStepsChange}
                                        value={col.steps}/>
                                    {col.useCustomScheme ?
                                        <div>
                                            Set the <i>lower limit</i> for each step and a color to match
                                            {this.renderSteps()}
                                        </div>
                                        :
                                        <div>
                                            <label forHTML='quantiles'>
                                                Quantiles
                                                <input
                                                    type='radio'
                                                    onChange={this.onModeChange.bind(this, 'q')}
                                                    checked={col.mode === 'q'}
                                                    name='mode'
                                                    id='quantiles'
                                                    />
                                                <br/>
                                            </label>
                                            <label forHTML='kmeans'>
                                                K-means
                                                <input
                                                    type='radio'
                                                    onChange={this.onModeChange.bind(this, 'k')}
                                                    checked={col.mode === 'k'}
                                                    name='mode'
                                                    id='kmeans'
                                                    />
                                                <br/>

                                            </label>
                                            <label forHTML='equidistant'>
                                                Equidistant
                                                <input
                                                    type='radio'
                                                    onChange={this.onModeChange.bind(this, 'e')}
                                                    checked={col.mode === 'e'}
                                                    name='mode'
                                                    id='equidistant'
                                                    />
                                                <br/>

                                            </label>
                                        </div>
                                    }
                                    {layer.layerType === LayerTypes.HeatMap ?
                                        <div>
                                            Set the heatmap radius
                                            <input
                                                type='number'
                                                max={100}
                                                min={10}
                                                step={1}
                                                onChange={(e) => {
                                                    this.props.state.editingLayer.colorOptions.heatMapRadius = (e.currentTarget as any).valueAsNumber;
                                                } }
                                                value={col.heatMapRadius}/>
                                        </div>
                                        : null}
                                </div>
                                : null}


                        </div>
                        : null
                }
                {this.props.state.autoRefresh ? null :
                    <button className='menuButton' onClick={this.saveOptions}>Refresh map</button>
                }
            </div >
        );
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
        //{ value: 'RdGy' },
        //{ value: 'Set1' },
        { value: 'Set2' },
        //{ value: 'Set3' },
        //{ value: 'Accent' },
        { value: 'Dark2' },
        { value: 'Paired' },
        //{ value: 'Pastel1' },
        //{ value: 'Pastel2' }



    ];
