import * as React from 'react';
let Modal = require('react-modal');
let Select = require('react-select');
import { CalculateLimits } from '../../common_items/common';
import { AppState, SymbolMenuState } from '../../stores/States';
import { Layer, SymbolOptions, Header, SymbolTypes } from '../../stores/Layer';
import { observer } from 'mobx-react';

@observer
export class SymbolMenu extends React.Component<{
    state: AppState,
}, {}>{

    onTypeChange = (type: SymbolTypes) => {
        let layer: Layer = this.props.state.editingLayer;
        let sym: SymbolOptions = this.props.state.editingLayer.symbolOptions;
        sym.symbolType = type;
        if (type === SymbolTypes.Blocks && !sym.blockSizeVar) {
            sym.blockSizeVar = layer.numberHeaders[0];
            sym.blockValue = sym.blockValue == 0 ? Math.ceil(layer.values[sym.blockSizeVar.value][layer.values[sym.blockSizeVar.value].length - 1] / 5) : sym.blockValue;
        }
        if (type === SymbolTypes.Chart) {
            if (sym.chartFields.length == 0)
                this.onChartFieldsChange(layer.numberHeaders);
        }
        if (type === SymbolTypes.Icon) {
            if (!sym.iconField)
                sym.iconField = layer.numberHeaders[0];
            if (!sym.icons || sym.icons.length == 0) {
                sym.icons = [];
                this.addRandomIcon();
            }
        }
        if (this.props.state.autoRefresh)
            layer.refresh();
    }

    onXVariableChange = (val) => {
        let layer = this.props.state.editingLayer;
        let sym = layer.symbolOptions;
        if (sym.symbolType === SymbolTypes.Blocks) {
            sym.blockSizeVar = val ? val : '';
            sym.blockValue = Math.ceil(layer.values[sym.blockSizeVar.value][layer.values[sym.blockSizeVar.value].length - 1] / 5);

        }
        else
            sym.sizeXVar = val ? val : '';
        sym.sizeMultiplier = sym.sizeMultiplier ? sym.sizeMultiplier : 1;
        if (this.props.state.autoRefresh)
            this.props.state.editingLayer.refresh();

    }

    onYVariableChange = (val) => {
        let sym = this.props.state.editingLayer.symbolOptions;
        sym.sizeYVar = val ? val : '';
        sym.sizeMultiplier = sym.sizeMultiplier ? sym.sizeMultiplier : 1;
        if (this.props.state.autoRefresh)
            this.props.state.editingLayer.refresh();
    }

    onFAIconChange = (e) => {
        if (e.currentTarget) { //if event triggered from input
            e = e.currentTarget.value
        }
        this.props.state.editingLayer.symbolOptions.icons[this.props.state.symbolMenuState.currentIconIndex].fa = e;
        if (this.props.state.autoRefresh)
            this.props.state.editingLayer.refresh();

    }

    onIconShapeChange = (shape: 'circle' | 'square' | 'star' | 'penta') => {
        this.props.state.editingLayer.symbolOptions.icons[this.props.state.symbolMenuState.currentIconIndex].shape = shape;
        if (this.props.state.autoRefresh)
            this.props.state.editingLayer.refresh();

    }

    onChartFieldsChange = (e: Header[]) => {
        let headers: Header[] = this.props.state.editingLayer.symbolOptions.chartFields;
        let colors = this.props.state.editingLayer.colorOptions.chartColors;
        if (e === null)
            e = [];
        headers.splice(0, headers.length) //empty headers
        for (let i in e) { //add new headers
            if (!colors[e[i].value]) {
                colors[e[i].value] = defaultChartColors[i] || '#FFF';
            }
            headers.push(e[i]);
        }
        if (this.props.state.autoRefresh)
            this.props.state.editingLayer.refresh();

    }

    toggleIconSelect = (index: number) => {
        this.props.state.symbolMenuState.iconSelectOpen = index !== this.props.state.symbolMenuState.currentIconIndex ? true : !this.props.state.symbolMenuState.iconSelectOpen;
        this.props.state.symbolMenuState.currentIconIndex = index;
    }

    onUseIconStepsChange = (e) => {
        let use: boolean = e.target.checked;
        let sym: SymbolOptions = this.props.state.editingLayer.symbolOptions;
        this.props.state.editingLayer.symbolOptions.useMultipleIcons = use;
        sym.icons = use ? sym.icons : [sym.icons.slice()[0]];
        sym.iconLimits = use ? sym.iconLimits : [];
        if (use && sym.iconField) {
            this.calculateIconValues(sym.iconField, sym.iconCount, sym.iconField.decimalAccuracy)
        }
        if (this.props.state.autoRefresh)
            this.props.state.editingLayer.refresh();

    }

    onIconFieldChange = (val: Header) => {
        let layer = this.props.state.editingLayer;
        layer.symbolOptions.iconField = val;
        this.calculateIconValues(val, layer.symbolOptions.iconCount, val.decimalAccuracy);
        if (this.props.state.autoRefresh)
            layer.refresh();

    }
    onIconStepCountChange = (amount: number) => {

        let layer = this.props.state.editingLayer;
        let sym = layer.symbolOptions
        if (amount == 1) {
            if (sym.iconCount >= layer.uniqueValues[sym.iconField.value].length)
                return;
            this.addRandomIcon()
        }
        else if (amount == -1 && sym.iconCount > 1) {
            sym.icons.pop();
        }
        if (sym.iconCount > 0) {
            this.calculateIconValues(sym.iconField, sym.iconCount, sym.iconField.decimalAccuracy)
        }
        if (this.props.state.autoRefresh)
            layer.refresh();

    }

    addRandomIcon() {
        let shapes = ['circle', 'square', 'star', 'penta'];
        let shape: 'circle' | 'square' | 'star' | 'penta' = shapes[Math.floor(Math.random() * shapes.length)] as any;
        this.props.state.editingLayer.symbolOptions.icons.push({ shape: shape, fa: faIcons[Math.floor(Math.random() * faIcons.length)] });
    }

    onStepLimitChange = (step: number, e) => {
        let layer = this.props.state.editingLayer;
        let limits: number[] = layer.symbolOptions.iconLimits;
        let val = e.currentTarget.valueAsNumber;
        if (limits[step + 1] && limits[step + 1] <= val) { //if collides with the next limit
            let index = step + 1;
            while (index < limits.length) { //keep increasing limits by one until a free amount is found. NOTE: This will cause some funky effects if the actual limits are something like 0.5, 0.6, 0.7...
                limits[index]++;
                if (limits[index + 1] && limits[index + 1] <= limits[index])
                    index++;
                else
                    break;
            }
        }
        else if (limits[step - 1] && limits[step - 1] >= val) { //if collides with the previous limit
            let index = step - 1;
            while (true) { //keep increasing limits by one until a free amount is found. NOTE: This will cause some funky effects if the actual limits are something like 0.5, 0.6, 0.7...
                limits[index]--;
                if (limits[index - 1] && limits[index - 1] >= limits[index])
                    index--;
                else
                    break;
            }
        }
        layer.symbolOptions.iconLimits[step] = val;

        if (this.props.state.autoRefresh)
            layer.refresh();

    }

    getIcon(shape: string, fa: string, stroke: string, fill: string, onClick) {
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
                break;
        }
        return <div
            onClick={onClick}
            style={{
                cursor: 'pointer',
                display: 'inline-block',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: 42,
                height: 42,
            }}
            >
            {activeIcon}
            <i style={{ position: 'relative', bottom: 33, width: 18, height: 18 }} className={'fa ' + fa}/>
        </div>

    }

    calculateIconValues(field: Header, steps: number, accuracy: number) {
        let layer = this.props.state.editingLayer;
        let values = layer.values;
        let uniqueValues = layer.uniqueValues;
        if (field.type == 'number') {
            if (steps >= uniqueValues[field.value].length) {
                layer.symbolOptions.iconLimits = uniqueValues[field.value];
            }
            else
                layer.symbolOptions.iconLimits = CalculateLimits(values[field.value][0], values[field.value][values[field.value].length - 1], steps, accuracy); //get limits by min and max value
        }
        else {
            layer.symbolOptions.iconLimits = uniqueValues[field.value];
        }
        while (layer.symbolOptions.iconCount < layer.symbolOptions.iconLimits.slice().length) {
            this.addRandomIcon();
        }
    }

    render() {
        let layer = this.props.state.editingLayer;
        let sym: SymbolOptions = layer.symbolOptions;
        let state: SymbolMenuState = this.props.state.symbolMenuState;
        let autoRefresh = this.props.state.autoRefresh;
        let iconSelectStyle = {
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
        }

        let iconSelect = (
            <Modal
                isOpen={state.iconSelectOpen}
                style={iconSelectStyle}
                >
                {state.iconSelectOpen ? <div>
                    Icon
                    {this.renderIcons.call(this)}
                    Or
                    <br/>
                    <label>Use another <a href='http://fontawesome.io/icons/'>Font Awesome</a> icon</label>
                    <input type="text" onChange={this.onFAIconChange} value={sym.icons[state.currentIconIndex].fa}/>

                    <br/>
                    Icon shape
                    <br/>
                    <div
                        style ={{ display: 'inline-block' }}
                        onClick={this.onIconShapeChange.bind(this, 'circle')}>
                        {this.getIcon('circle', '', '#999999', 'transparent', null)}
                    </div>
                    <div
                        style ={{ display: 'inline-block' }}
                        onClick={this.onIconShapeChange.bind(this, 'square')}>
                        {this.getIcon('square', '', '#999999', 'transparent', null)}
                    </div>
                    <div
                        style ={{ display: 'inline-block' }}
                        onClick={this.onIconShapeChange.bind(this, 'star')}>
                        {this.getIcon('star', '', '#999999', 'transparent', null)}
                    </div>
                    <div
                        style ={{ display: 'inline-block' }}
                        onClick={this.onIconShapeChange.bind(this, 'penta')}>
                        {this.getIcon('penta', '', '#999999', 'transparent', null)}
                    </div>
                    <br/>
                    <button
                        className='primaryButton'
                        onClick={this.toggleIconSelect.bind(this, state.currentIconIndex)}
                        style={{ position: 'absolute', left: 80 }}>OK</button>
                </div>
                    : null}
            </Modal>
        );
        return (

            <div className="makeMaps-options">
                <label>Select symbol type </label>
                <br/>
                <label forHTML='circle'>
                    <i style={{ margin: 4 }} className='fa fa-circle-o'/>
                    Simple
                    <input
                        type='radio'
                        onChange={this.onTypeChange.bind(this, SymbolTypes.Simple)}
                        checked={sym.symbolType === SymbolTypes.Simple}
                        name='symboltype'
                        id='circle'
                        />
                    <br/>
                </label>
                <label forHTML='icon'>
                    <i style={{ margin: 4 }} className='fa fa-map-marker'/>
                    Icon
                    <input
                        type='radio'
                        onChange={this.onTypeChange.bind(this, SymbolTypes.Icon)}
                        checked={sym.symbolType === SymbolTypes.Icon}
                        name='symboltype'
                        id='icon'
                        />
                    <br/>
                </label>
                <label forHTML='chart'>
                    <i style={{ margin: 4 }} className='fa fa-pie-chart'/>
                    Chart
                    <input
                        type='radio'
                        onChange={this.onTypeChange.bind(this, SymbolTypes.Chart)}
                        checked={sym.symbolType === SymbolTypes.Chart}
                        name='symboltype'
                        id='chart'
                        />
                    <br/>
                </label>
                <label forHTML='blocks'>
                    <i style={{ margin: 4 }} className='fa fa-th-large'/>
                    Blocks
                    <input
                        type='radio'
                        onChange={this.onTypeChange.bind(this, SymbolTypes.Blocks)}
                        checked={sym.symbolType === SymbolTypes.Blocks}
                        name='symboltype'
                        id='blocks'
                        />
                    <br/>
                </label>
                {sym.symbolType !== SymbolTypes.Icon ?
                    <div>
                        <label>Scale {sym.symbolType === SymbolTypes.Simple ? 'width' : 'size'} by</label>
                        <Select
                            options={layer.numberHeaders}
                            onChange={this.onXVariableChange}
                            value={sym.symbolType === SymbolTypes.Blocks ? sym.blockSizeVar : sym.sizeXVar}
                            clearable={sym.symbolType !== SymbolTypes.Blocks}
                            />

                        {sym.symbolType === SymbolTypes.Simple ? <div>
                            <label>Scale height by</label>
                            <Select
                                options={layer.numberHeaders}
                                onChange={this.onYVariableChange}
                                value={sym.sizeYVar}
                                />
                            <label>Border radius
                                <input type='number' value={sym.borderRadius} onChange={(e) => {
                                    let val = (e.currentTarget as any).valueAsNumber;
                                    if (sym.borderRadius != val) {
                                        sym.borderRadius = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                } } min={0} max={100} step={1}/>
                            </label>
                        </div> : null}
                        {sym.symbolType !== SymbolTypes.Blocks && (sym.sizeXVar || sym.sizeYVar) ?
                            <div>
                                <label>Size multiplier
                                    <input type='number' value={sym.sizeMultiplier} onChange={(e) => {
                                        let val = (e.currentTarget as any).valueAsNumber;
                                        if (sym.sizeMultiplier != val) {
                                            sym.sizeMultiplier = val;
                                            if (autoRefresh)
                                                layer.refresh();
                                        }
                                    } } min={0.1} max={10} step={0.1}/>
                                </label>
                                <br/>
                                <label>Size lower limit
                                    <input type='number' value={sym.sizeLowLimit} onChange={(e) => {
                                        let val = (e.currentTarget as any).valueAsNumber;
                                        if (sym.sizeLowLimit != val) {
                                            sym.sizeLowLimit = val;
                                            if (autoRefresh)
                                                layer.refresh();
                                        }
                                    } } min={0}/>
                                </label>
                                <br/>
                                <label>Size upper limit
                                    <input type='number' value={sym.sizeUpLimit} onChange={(e) => {
                                        let val = (e.currentTarget as any).valueAsNumber;
                                        if (sym.sizeUpLimit != val) {
                                            sym.sizeUpLimit = val;
                                            if (autoRefresh)
                                                layer.refresh();
                                        }
                                    } } min={1}/>
                                </label>
                            </div>
                            : null}
                    </div>
                    : null
                }
                {
                    sym.symbolType === SymbolTypes.Icon ?
                        <div>
                            <label htmlFor='iconSteps'>Use multiple icons</label>
                            <input id='iconSteps' type='checkbox' onChange={this.onUseIconStepsChange} checked={sym.useMultipleIcons}/>

                            {sym.useMultipleIcons ?
                                <div>
                                    <label>Field to change icon by</label>
                                    <Select
                                        options={layer.headers.slice()}
                                        onChange={this.onIconFieldChange}
                                        value={sym.iconField}
                                        clearable={false}
                                        />
                                    {sym.iconField && sym.iconField.type == 'number' ?
                                        <div>Set the <i>lower limit</i> and icon
                                            <br/>
                                            <button onClick={this.onIconStepCountChange.bind(this, -1)}>-</button>
                                            <button onClick={this.onIconStepCountChange.bind(this, 1)}>+</button>

                                        </div> : null}
                                    {sym.iconField ? this.renderIconSteps.call(this) : null}

                                </div>
                                :
                                <div>
                                    Set icon
                                    {this.getIcon(sym.icons[0].shape, sym.icons[0].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, 0))}

                                </div>
                            }
                            <br/>
                            Change icon colors in the color menu
                        </div>
                        : null
                }
                {sym.symbolType === SymbolTypes.Chart ?
                    <div>
                        <label>Select the variables to show</label>
                        <Select
                            options={layer.numberHeaders}
                            multi
                            onChange={this.onChartFieldsChange}
                            value={sym.chartFields.slice()}
                            backspaceRemoves={false}

                            />
                        Chart type
                        <br/>
                        <label forHTML='pie'>
                            Pie
                            <input
                                type='radio'
                                onChange={() => {
                                    sym.chartType = 'pie';
                                    if (autoRefresh) layer.refresh();
                                } }
                                checked={sym.chartType === 'pie'}
                                name='charttype'
                                id='pie'
                                />
                            <br/>

                        </label>
                        <label forHTML='donut'>
                            Donut
                            <input
                                type='radio'
                                onChange={() => {
                                    sym.chartType = 'donut';
                                    if (autoRefresh) layer.refresh()
                                } }
                                checked={sym.chartType === 'donut'}
                                name='charttype'
                                id='donut'
                                />
                            <br/>

                        </label>
                        <br/>
                        <i>TIP: hover over symbol segments to see corresponding value</i>
                    </div>

                    : null
                }
                {sym.symbolType === SymbolTypes.Blocks ?
                    <div>
                        <label>Single block value
                            <input type='number' value={sym.blockValue}
                                onChange={(e) => {
                                    let val = (e.currentTarget as any).valueAsNumber;
                                    if (sym.blockValue != val) {
                                        sym.blockValue = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                } }
                                min={1}/>
                        </label>
                        <label>Single block width
                            <input type='number' value={sym.blockWidth}
                                onChange={(e) => {
                                    let val = (e.currentTarget as any).valueAsNumber;
                                    if (sym.blockWidth != val) {
                                        sym.blockWidth = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                } }
                                min={1}/>
                        </label>
                        <label>Max. width
                            <input type='number' value={sym.maxBlockColumns}
                                onChange={(e) => {
                                    let val = (e.currentTarget as any).valueAsNumber;
                                    if (sym.maxBlockColumns != val) {
                                        sym.maxBlockColumns = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                } }
                                min={1}/>
                        </label>
                        <label>Max. height
                            <input type='number' value={sym.maxBlockRows}
                                onChange={(e) => {
                                    let val = (e.currentTarget as any).valueAsNumber;
                                    if (sym.maxBlockRows != val) {
                                        sym.maxBlockRows = val;
                                        if (autoRefresh)
                                            layer.refresh();
                                    }
                                } }
                                min={1}/>
                        </label>
                    </div>
                    : null

                }
                {autoRefresh ? null :
                    <button className='menuButton' onClick={() => { layer.refresh() } }>Refresh map</button>
                }
                {iconSelect}
            </div >
        );


    }


    /**
     * renderIcons - Renders icons for icon selection screen
     */
    renderIcons() {
        let arr = [];
        let columnCount = 7;
        for (let i = 0; i < faIcons.length; i += columnCount) {

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
            for (let c = 0; c < columnCount; c++) {
                let style = {
                    width: 30,
                    height: 30,
                    border: this.props.state.editingLayer.symbolOptions.icons[this.props.state.symbolMenuState.currentIconIndex].iconFA === faIcons[i + c] ? '1px solid #000' : '1px solid #FFF',
                    borderRadius: 30,
                    lineHeight: '30px',
                    textAlign: 'center'
                }
                columns.push(<td style={style} key={i + c} className={'symbolIcon fa ' + faIcons[i + c]} onClick={this.onFAIconChange.bind(this, faIcons[i + c])}/>);
            }
            return columns;
        }
        return (
            <table style={{ width: '100%', cursor: 'pointer' }}>
                <tbody>
                    {arr.map(function(td) {
                        return td;
                    })}
                </tbody>
            </table>
        );

    }

    /**
     * renderIconSteps - Renders custom icon steps
     */
    renderIconSteps() {
        let layer = this.props.state.editingLayer;
        let limits = layer.symbolOptions.iconLimits.slice();
        let rows = [];
        let row = 0;
        if (layer.symbolOptions.iconField.type == 'number') {
            for (let i of limits) {

                rows.push(
                    <li key={i} style={{ lineHeight: 0 }}>
                        <input
                            id={row + 'min'}
                            type='number'
                            defaultValue={i.toFixed(layer.symbolOptions.iconField.decimalAccuracy)}
                            style={{
                                width: 100,
                            }}
                            onChange={this.onStepLimitChange.bind(this, row)}
                            step={1 * 10 ** (-layer.symbolOptions.iconField.decimalAccuracy)}
                            />
                        {this.getIcon(layer.symbolOptions.icons[row].shape, layer.symbolOptions.icons[row].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, row))}
                    </li>);
                row++;
            }
        }
        else {
            for (let i of layer.uniqueValues[layer.symbolOptions.iconField.value]) {
                rows.push(
                    <li key={i} style={{ lineHeight: '30px' }}>
                        {i}
                        {this.getIcon(layer.symbolOptions.icons[row].shape, layer.symbolOptions.icons[row].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, row))}
                    </li>);
                row++;
            }
        }
        return <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r })}</ul>
    }

}


let faIcons = [
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

let defaultChartColors = [
    '#6bbc60', '#e2e236', '#e28c36', '#36a6e2', '#e25636', '#36e2c9', '#364de2', '#e236c9', '#51400e', '#511f0e', '#40510e'
];
