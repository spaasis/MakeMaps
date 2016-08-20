import * as React from 'react';
import { LayerTypes, SymbolTypes } from './../common_items/common';
let Select = require('react-select');
import { AppState } from '../Stores/States';
import { Filter } from '../Stores/Filter';
import { observer } from 'mobx-react';

@observer
export class FilterMenu extends React.Component<{
    state: AppState,
}, {}>{

    onFilterVariableChange = (val) => {
        this.props.state.editingFilter.fieldToFilter = val.value;
        this.props.state.editingFilter.title = this.props.state.editingFilter.title ? this.props.state.editingFilter.title : val.value + '-filter';
        this.getMinMax()

    }

    onUseDistinctValuesChange = (e) => {
        this.props.state.filterMenuState.useDistinctValues = e.target.checked;
        this.props.state.filterMenuState.customStepCount = e.target.checked ? this.getDistinctValues(this.props.state.editingFilter.fieldToFilter).length - 1 : 5;
    }
    getMinMax() {
        let minVal: number; let maxVal: number;
        let field = this.props.state.editingFilter.fieldToFilter;
        this.props.state.editingLayer.geoJSON.features.map(function(feat) {
            let val = feat.properties[field];
            if (minVal === undefined && maxVal === undefined) {
                minVal = val;
                maxVal = val;
            }
            else {
                if (val < minVal)
                    minVal = val;
                if (val > maxVal)
                    maxVal = val;
            }
        });
        this.props.state.editingFilter.totalMin = minVal;
        this.props.state.editingFilter.currentMin = minVal;
        this.props.state.editingFilter.totalMax = maxVal;
        this.props.state.editingFilter.currentMax = maxVal;
    }

    getDistinctValues(field: string) {
        let values: number[] = [];
        this.props.state.editingLayer.geoJSON.features.map(function(feat) {
            let val = feat.properties[field];
            if (values.indexOf(val) === -1)
                values.push(val)
        });

        return values.sort(function(a, b) { return a - b });
    }
    changeStepsCount(amount: number) {
        let newVal = this.props.state.filterMenuState.customStepCount + amount;
        if (newVal > 0) {
            this.props.state.filterMenuState.customStepCount = newVal;
        }
    }

    createNewFilter = () => {
        let filter = new Filter();
        filter.id = this.props.state.nextFilterId;
        filter.layer = this.props.state.editingLayer;
        filter.title = this.props.state.editingLayer.name + '-filter';
        filter.fieldToFilter = this.props.state.editingLayer.numberHeaders[0].label;
        filter.appState = this.props.state;
        this.props.state.filters.push(filter);
        this.props.state.filterMenuState.selectedFilterId = filter.id;
        this.getMinMax()

    }
    saveFilter = () => {
        let steps;
        // if (this.props.state.filterMenuState.useCustomSteps) {
        //     steps = this.getStepValues();
        // }
        this.props.state.editingFilter.init();
        if (this.props.state.filterMenuState.useCustomSteps) {
            this.props.state.editingFilter.steps = this.getStepValues();
        }
    }
    deleteFilter = () => {
        let filter = this.props.state.editingFilter;
        filter.currentMax = filter.totalMax;
        filter.currentMin = filter.totalMin;
        this.props.state.filters = this.props.state.filters.filter(function(f) { return f.id !== filter.id });
        this.props.state.filterMenuState.selectedFilterId = - 1;
    }
    getStepValues() {
        let steps: [number, number][] = [];
        for (let i = 0; i < this.props.state.filterMenuState.customStepCount; i++) {
            let step: [number, number] = [+(document.getElementById(i + 'min') as any).value,
            +(document.getElementById(i + 'max') as any).value];
            steps.push(step)
        }
        return steps;
    }

    render() {
        if (this.props.state.visibleMenu !== 4)
            return <div/>;
        let layer = this.props.state.editingLayer;
        let filter = this.props.state.editingFilter;
        let state = this.props.state.filterMenuState;
        let filters = [];
        for (let i in this.props.state.filters.slice()) {
            filters.push({ value: this.props.state.filters.slice()[i].id, label: this.props.state.filters.slice()[i].title });
        }
        return (!layer ? null :
            <div className="mapify-options">
                {filter ?
                    <div>
                        <label>Select the filter to update</label>
                        <Select
                            options={filters}
                            onChange={(id: ISelectData) => {
                                this.props.state.filterMenuState.selectedFilterId = id.value;
                            } }
                            value={state.selectedFilterId}
                            />
                        Or
                        <button onClick={this.createNewFilter}>Create new filter</button>
                        <br/>
                        <label>Give a name to the filter
                            <input type="text" onChange={(e) => {
                                this.props.state.editingFilter.title = (e.target as any).value;
                            } } value={filter ? filter.title : ''}/>
                        </label>
                        {filter.show ? <br/>
                            :
                            <div>
                                <label>Select the filter variable
                                    <Select
                                        options={layer.numberHeaders}
                                        onChange={this.onFilterVariableChange}
                                        value={filter ? filter.fieldToFilter : ''}
                                        />
                                </label>
                            </div>
                        }
                        <label forHTML='steps'>
                            Use predefined steps
                            <input
                                type='checkbox'
                                onChange={(e) => {
                                    this.props.state.filterMenuState.useCustomSteps = (e.target as any).checked;
                                } }
                                checked={state.useCustomSteps}
                                id='steps'
                                />
                            <br/>
                        </label>
                        {state.useCustomSteps && filter.totalMin !== undefined && filter.totalMax !== undefined ?
                            <div>
                                <label forHTML='dist'>
                                    Use distinct values
                                    <input
                                        type='checkbox'
                                        onChange={this.onUseDistinctValuesChange}
                                        checked={state.useDistinctValues}
                                        id='dist'
                                        />
                                    <br/>
                                </label>
                                {renderSteps.call(this)}
                            </div>
                            : null}
                        {layer.layerType === LayerTypes.HeatMap ||
                            (layer.symbolOptions.symbolType === SymbolTypes.Icon ||
                                layer.symbolOptions.symbolType === SymbolTypes.Chart) ? null :
                            < div >
                                <label forHTML='remove'>
                                    Remove filtered items
                                    <input
                                        type='radio'
                                        onChange={() => {
                                            this.props.state.editingFilter.remove = true;
                                        } }
                                        checked={filter.remove}
                                        name='filterMethod'
                                        id='remove'
                                        />
                                </label>
                                <br/>
                                Or
                                <br/>

                                <label forHTML='opacity'>
                                    Change opacity
                                    <input
                                        type='radio'
                                        onChange={() => {
                                            this.props.state.editingFilter.remove = false;
                                        } }
                                        checked={!filter.remove}
                                        name='filterMethod'
                                        id='opacity'
                                        />

                                </label>
                            </div>
                        }
                        <button className='menuButton' onClick={this.saveFilter}>Save filter</button>
                        {filters.length > 0 && state.selectedFilterId !== -1 ?
                            <button className='menuButton' onClick={this.deleteFilter}>Delete filter</button>
                            : null}
                        <br/>
                        <i>TIP: drag the filter on screen by the header to place it where you wish</i>
                    </div>

                    :
                    <button onClick={this.createNewFilter}>Create new filter</button>
                }
            </div >
        );

        function renderSteps() {

            let rows = [];
            let inputStyle = {
                display: 'inline',
                width: 100
            }
            let steps: [number, number][] = [];

            if (!state.useDistinctValues) {
                for (let i = filter.totalMin; i < filter.totalMax; i += (filter.totalMax - filter.totalMin) / state.customStepCount) {
                    let step: [number, number] = [i, i + (filter.totalMax - filter.totalMin) / state.customStepCount - 1];
                    steps.push(step);
                }
            }
            else {
                let values = this.getDistinctValues(filter.fieldToFilter);
                for (let i = 0; i < values.length - 1; i++) {
                    let step: [number, number] = [values[i], values[i + 1] - 1];
                    steps.push(step);
                }
            }
            let row = 0;
            for (let i of steps) {
                rows.push(
                    <li key={i}>
                        <input
                            id={row + 'min'}
                            type='number'
                            defaultValue={i[0].toFixed(2)}
                            style={inputStyle}
                            step='any'/>
                        -
                        <input
                            id={row + 'max'}
                            type='number'
                            defaultValue={i[1].toFixed(2)}
                            style={inputStyle}
                            step='any'/>
                    </li>);
                row++;
            }
            return <div>
                <button onClick={this.changeStepsCount.bind(this, -1)}>-</button>
                <button onClick={this.changeStepsCount.bind(this, 1)}>+</button>
                <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r })}</ul>
            </div>
        }
    }
}
