import * as React from 'react';
let Select = require('react-select');
import { AppState } from '../../stores/States';
import { Filter } from '../../stores/Filter';
import { observer } from 'mobx-react';
import { LayerTypes } from '../../stores/Layer';

@observer
export class FilterMenu extends React.Component<{
    state: AppState,
}, {}>{

    onFilterVariableChange = (val) => {

        if (val) {
            this.props.state.editingFilter.fieldToFilter = val.value;
            this.props.state.editingFilter.title = val.value;
            this.getMinMax()
        }
    }

    getMinMax() {
        let filter = this.props.state.editingFilter;
        if (filter) {
            let vals = this.props.state.editingLayer.values;
            let field = filter.fieldToFilter;
            let minVal = vals[field][0];
            let maxVal = vals[field][vals[field].length - 1];
            filter.totalMin = minVal;
            filter.currentMin = minVal;
            filter.totalMax = maxVal;
            filter.currentMax = maxVal;
        }
    }

    getDistinctValues(field: string) {
        let values: number[] = [];
        let layer = this.props.state.layers.filter(function(f) { return f.id == this.props.state.editingFilter.layerId }, this)[0];
        values = layer.values[field].filter(function(e, i, arr) {
            return arr.lastIndexOf(e) === i;
        });

        return values;
    }
    changeStepsCount(amount: number) {
        let newVal = this.props.state.filterMenuState.customStepCount + amount;
        if (newVal > 0) {
            this.props.state.filterMenuState.customStepCount = newVal;
        }
    }
    calculateSteps() {
        let state = this.props.state.filterMenuState;
        let filter = this.props.state.editingFilter;
        let steps: [number, number][] = [];
        if (state.useCustomSteps) {
            if (state.useDistinctValues) {
                let values = this.getDistinctValues(filter.fieldToFilter);
                for (let i = 0; i < values.length - 1; i++) {
                    let step: [number, number] = [values[i], values[i + 1] - 1];
                    steps.push(step);
                }
            }
            else if (this.props.state.editingFilter.steps && this.props.state.editingFilter.steps.length > 0) {
                steps = this.props.state.editingFilter.steps;
            }
            else {
                for (let i = filter.totalMin; i < filter.totalMax; i += (filter.totalMax - filter.totalMin) / state.customStepCount) {
                    let step: [number, number] = [i, i + (filter.totalMax - filter.totalMin) / state.customStepCount - 1];
                    steps.push(step);
                }
            }
        }

        filter.steps = steps;
    }

    createNewFilter = () => {
        let filter = new Filter(this.props.state);
        filter.id = this.props.state.nextFilterId;
        filter.layerId = this.props.state.editingLayer.id;
        filter.fieldToFilter = this.props.state.editingLayer.numberHeaders[0].value;
        filter.title = filter.fieldToFilter;

        this.props.state.filters.push(filter);
        this.props.state.filterMenuState.selectedFilterId = filter.id;
        this.getMinMax()
    }
    saveFilter = () => {
        let filter = this.props.state.editingFilter;
        if (!filter.show)
            filter.init();
        if (this.props.state.filterMenuState.useCustomSteps)
            filter.steps = this.getStepValues();
        else
            filter.steps = null;
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
        let layer = this.props.state.editingLayer;
        let filter = this.props.state.editingFilter;
        let state = this.props.state.filterMenuState;
        let filters = [];
        for (let i in this.props.state.filters.slice()) {
            filters.push({ value: this.props.state.filters[i].id, label: this.props.state.filters[i].title });
        }
        return (!layer ? null :
            <div className="makeMaps-options">
                {filters ?
                    <div>
                        <label>Select the filter to update</label>
                        <Select
                            options={filters}
                            onChange={(id: ISelectData) => {
                                state.selectedFilterId = id != null ? id.value : -1;
                                state.useCustomSteps = this.props.state.editingFilter.steps.slice().length > 0;
                            } }
                            value={filter}
                            valueRenderer={(v) => { return v.title } }
                            />
                        Or</div> : null}
                <button className='menuButton' onClick={this.createNewFilter}>Create new filter</button>
                <br/>

                {filter ?
                    <div>
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
                                    state.useCustomSteps = (e.target as any).checked;
                                    this.calculateSteps();
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
                                        onChange={(e) => {
                                            filter.steps = [];
                                            state.useDistinctValues = (e.target as any).checked;
                                            state.customStepCount = (e.target as any).checked ? this.getDistinctValues(this.props.state.editingFilter.fieldToFilter).length - 1 : 5;
                                            this.calculateSteps();
                                        } }
                                        checked={state.useDistinctValues}
                                        id='dist'
                                        />
                                    <br/>
                                </label>
                                {renderSteps.call(this)}
                            </div>
                            : null
                        }
                        {layer.layerType === LayerTypes.HeatMap ? null :
                            <div>
                                <label forHTML='remove'>
                                    Remove filtered items
                                    <input
                                        type='radio'
                                        onChange={() => {
                                            this.props.state.editingFilter.remove = true;
                                            layer.refreshFilters();
                                        } }
                                        checked={filter.remove}
                                        name='filterMethod'
                                        id='remove'
                                        />
                                </label>
                                <br/>
                                Or
                                <br/>
                                <label forHTML='opacity' style={{ marginTop: 0 }}>
                                    Change opacity
                                    <input
                                        type='radio'
                                        onChange={() => {
                                            this.props.state.editingFilter.remove = false;
                                            layer.refreshFilters();
                                        } }
                                        checked={!filter.remove}
                                        name='filterMethod'
                                        id='opacity'
                                        />

                                </label>
                            </div>
                        }
                        {filter.show ?
                            <button className='menuButton' onClick={this.deleteFilter}>Delete filter</button>
                            :
                            <button className='menuButton' onClick={this.saveFilter}>Save filter</button>}

                        <br/>
                        <i>TIP: drag the filter on screen by the header to place it where you wish</i>
                    </div>

                    :
                    null
                }
            </div >
        );

        function renderSteps() {

            let rows = [];
            let inputStyle = {
                display: 'inline',
                width: 100
            }
            let row = 0;
            filter.steps.map(function(s) {
                rows.push(
                    <li key={row}>
                        <input
                            id={row + 'min'}
                            type='number'
                            value={s[0]}
                            onChange={(e) => { s[0] = (e.currentTarget as any).valueAsNumber } }
                            style={inputStyle}
                            step='any'/>
                        -
                        <input
                            id={row + 'max'}
                            type='number'
                            value={s[1]}
                            onChange={(e) => { s[1] = (e.currentTarget as any).valueAsNumber } }
                            style={inputStyle}
                            step='any'/>
                    </li>);
                row++;
            });
            return <div>
                <button onClick={this.changeStepsCount.bind(this, -1)}>-</button>
                <button onClick={this.changeStepsCount.bind(this, 1)}>+</button>
                <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r })}</ul>
            </div>
        }
    }
}
