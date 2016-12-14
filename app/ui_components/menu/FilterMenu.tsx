import * as React from 'react';
let Select = require('react-select');
import { AppState } from '../../stores/States';
import { Filter } from '../../stores/Filter';
import { Layer, Header } from '../../stores/Layer';
import { observer } from 'mobx-react';
import { LayerTypes } from '../../stores/Layer';

@observer
export class FilterMenu extends React.Component<{
    state: AppState,
}, {}> {

    onFilterVariableChange = (val: Header) => {
        let filter = this.props.state.editingFilter;
        filter.filterHeaderId = val.id;
        filter.title = val.label;
        if (val.type === 'string') {
            this.props.state.filterMenuState.useCustomSteps = true;
            filter.useDistinctValues = true;
            this.calculateSteps(val);
        }
        else {
            this.props.state.filterMenuState.useCustomSteps = false;
            filter.useDistinctValues = false;
            this.getMinMax();
        }
    }

    getMinMax() {
        let filter = this.props.state.editingFilter;
        if (filter) {
            let layer = this.props.state.layers.filter(function(l) { return l.id === filter.layerId; })[0];
            let field = layer.getHeaderById(filter.filterHeaderId).value;
            let minVal = layer.values[field][0];
            let maxVal = layer.values[field][layer.values[field].length - 1];
            filter.totalMin = minVal;
            filter.currentMin = minVal;
            filter.totalMax = maxVal;
            filter.currentMax = maxVal;
        }
    }

    onStepsCountChange = (amount: number) => {
        let newVal = this.props.state.filterMenuState.customStepCount + amount;
        if (newVal > 0) {
            this.props.state.filterMenuState.customStepCount = newVal;
        }
    }
    calculateSteps(header: Header) {
        let state = this.props.state.filterMenuState;
        let filter = this.props.state.editingFilter;
        let layer = this.props.state.layers.filter(function(l) { return l.id === filter.layerId; })[0];

        let steps: [number, number][] = [];
        if (state.useCustomSteps) {
            if (filter.useDistinctValues) {
                let values = layer.uniqueValues[header.value];
                if (header.type === 'string') {
                    filter.categories = values;
                    return;
                }
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

    onCreate = () => {
        let state = this.props.state;
        let filter = new Filter(state);
        filter.id = state.nextFilterId;

        state.filters.push(filter);
        state.filterMenuState.selectedFilterId = filter.id;
        this.setFilterLayerInfo(state.editingLayer);
    }

    setFilterLayerInfo = (layer: Layer) => {
        let state = this.props.state;
        state.editingFilter.layerId = layer.id;
        let header = layer.headers[0];
        state.editingFilter.filterHeaderId = header.id;
        state.editingFilter.title = header.label;
        if (header.type === 'string') {
            state.filterMenuState.useCustomSteps = true;
            state.editingFilter.useDistinctValues = true;
            this.calculateSteps(header);
        }
        else {
            state.filterMenuState.useCustomSteps = false;
            state.editingFilter.useDistinctValues = false;
            this.getMinMax();
        }

    }

    onSave = () => {
        let filter = this.props.state.editingFilter;
        let header = this.props.state.layers.filter((f) => { return f.id === filter.layerId; })[0].getHeaderById(filter.filterHeaderId);
        if (!filter.show)
            filter.init();
        if (header.type === 'number' && this.props.state.filterMenuState.useCustomSteps) {
            filter.steps = this.getStepValues();
            filter.categories = null;
        }
        else
            filter.steps = null;
    }
    onDelete = () => {
        let filter = this.props.state.editingFilter;
        filter.currentMax = filter.totalMax;
        filter.currentMin = filter.totalMin;
        filter.filterLayer();
        this.props.state.filters = this.props.state.filters.filter(function(f) { return f.id !== filter.id; });
        this.props.state.filterMenuState.selectedFilterId = - 1;
    }
    getStepValues() {
        let steps: [number, number][] = [];
        for (let i = 0; i < this.props.state.filterMenuState.customStepCount; i++) {
            let step: [number, number] = [+(document.getElementById(i + 'min') as any).value,
            +(document.getElementById(i + 'max') as any).value];
            steps.push(step);
        }
        return steps;
    }

    render() {
        let strings = this.props.state.strings;
        let layers = [];
        if (this.props.state.layers) {
            for (let layer of this.props.state.layers) {
                layers.push({ value: layer, label: layer.name });
            }
        }
        let filters: { value: number, label: string }[] = [];
        for (let i in this.props.state.filters.slice()) {
            filters.push({ value: this.props.state.filters[i].id, label: this.props.state.filters[i].title });
        }
        let filter = this.props.state.editingFilter;
        let layer = filter ? this.props.state.layers.filter(function(l) { return l.id === filter.layerId; })[0] : null;
        let state = this.props.state.filterMenuState;
        let header = layer ? layer.getHeaderById(filter.filterHeaderId) : null;

        return (this.props.state.layers.slice().length === 0 ? null :
            <div className='makeMaps-options'>
                {filters ?
                    <div>
                        <label>{strings.selectFilter}</label>
                        <Select
                            options={filters}
                            onChange={(id: ISelectData) => {
                                state.selectedFilterId = id !== null ? id.value : -1;
                                let filt = this.props.state.filters.filter(function(f) { return f.id === id.value; })[0];
                                if (filt) {
                                    let steps = filt.steps.slice();
                                    let categories = filt.categories.slice();
                                    state.useCustomSteps = steps.length > 0 || categories.length > 0;
                                }
                            }
                            }
                            value={filter}
                            valueRenderer={(v) => { return v.title; } }
                            placeholder={strings.selectPlaceholder}
                            />
                        {strings.or}</div> : null}
                <button className='menuButton' onClick={() => { this.onCreate(); } }>{strings.createNewFilter}</button>
                <br />

                {filter ?

                    <div>
                        <label>{strings.selectFilterLayer}</label>
                        <Select
                            options={layers}
                            onChange={(val: { label: string, value: Layer }) => {
                                this.setFilterLayerInfo(val.value);
                            } }
                            value={layer}
                            valueRenderer={(option: Layer) => {
                                return option ? option.name : '';
                            } }
                            clearable={false}
                            placeholder={strings.selectPlaceholder}
                            />
                        <br />
                        <label>{strings.giveNameToFilter}
                            <input type='text' onChange={(e) => {
                                filter.title = (e.target as any).value;
                            } } value={filter ? filter.title : ''} />
                        </label>
                        {filter.show ? <br />
                            :
                            <div>
                                <label>{strings.selectFilterVariable}
                                    <Select
                                        options={layer.headers.slice()}
                                        onChange={this.onFilterVariableChange}
                                        value={header}
                                        placeholder={strings.selectPlaceholder}
                                        clearable={false}
                                        />
                                </label>
                            </div>
                        }
                        {filter.filterHeaderId !== undefined ?
                            <div>
                                {header.type !== 'string' ?
                                    <div>
                                        <label htmlFor='steps'>
                                            {strings.filterUseSteps}
                                            <input
                                                type='checkbox'
                                                onChange={(e) => {
                                                    state.useCustomSteps = (e.target as any).checked;
                                                    this.calculateSteps(header);
                                                } }
                                                checked={state.useCustomSteps}
                                                id='steps'
                                                />
                                            <br />
                                        </label>
                                        <label htmlFor='showSlider'>
                                            {strings.filterShowSlider}
                                            <input
                                                type='checkbox'
                                                onChange={(e) => {
                                                    filter.showSlider = (e.target as any).checked;
                                                } }
                                                checked={filter.showSlider}
                                                id='showSlider'
                                                />
                                            <br />
                                        </label>
                                    </div>
                                    :
                                    <label htmlFor='multiSelect'>
                                        {strings.filterMultiSelect}
                                        <input
                                            type='checkbox'
                                            onChange={(e) => {
                                                let val = (e.target as any).checked;
                                                filter.allowCategoryMultiSelect = val;
                                                if (!val && filter.selectedCategories.length > 1)
                                                    filter.selectedCategories.splice(1, filter.selectedCategories.length);
                                            } }
                                            checked={filter.allowCategoryMultiSelect}
                                            id='multiSelect'
                                            />
                                        <br />
                                    </label>
                                }
                                {header.type !== 'string' && state.useCustomSteps && filter.totalMin !== undefined && filter.totalMax !== undefined ?
                                    <div>
                                        <label htmlFor='dist'>
                                            {strings.filterUseDistinctValues}
                                            <input
                                                type='checkbox'
                                                onChange={(e) => {
                                                    filter.steps = [];
                                                    filter.useDistinctValues = (e.target as any).checked;
                                                    state.customStepCount = (e.target as any).checked ? layer.uniqueValues[header.value].length - 1 : 5;
                                                    this.calculateSteps(header);
                                                } }
                                                checked={filter.useDistinctValues}
                                                id='dist'
                                                />
                                            <br />
                                        </label>
                                        {this.renderSteps.call(this)}
                                    </div>
                                    : null
                                }
                                {state.useCustomSteps || header.type === 'string' ?
                                    <div>
                                        <label htmlFor='noSelect'>
                                            {strings.filterAllowNoSelection}
                                            <input
                                                type='checkbox'
                                                onChange={(e) => {
                                                    let val: boolean = (e.target as any).checked;
                                                    filter.forceSelection = val;
                                                    if (val) {
                                                        filter.selectedStep = filter.selectedStep > -1 ? filter.selectedStep : filter.steps && filter.steps.length > 0 ? 0 : -1;
                                                        filter.selectedCategories = filter.selectedCategories.length > 0 ? filter.selectedCategories : filter.categories.length > 0 ? [filter.categories[0]] : [];
                                                    }
                                                } }
                                                checked={filter.forceSelection}
                                                id='noSelect'
                                                />
                                            <br />
                                        </label>
                                    </div> : null
                                }
                            </div>
                            : null}
                        {layer.layerType === LayerTypes.HeatMap ? null :
                            <div>
                                <label htmlFor='remove'>
                                    {strings.filterRemove}
                                    <input
                                        type='radio'
                                        onChange={() => {
                                            if (!filter.remove) {
                                                filter.remove = true;
                                                if (filter.show) {
                                                    filter.init();
                                                    filter.filterLayer();
                                                }
                                            }
                                        } }
                                        checked={filter.remove}
                                        name='filterMethod'
                                        id='remove'
                                        />
                                </label>
                                <br />
                                {strings.or}
                                <br />
                                <label htmlFor='opacity' style={{ marginTop: 0 }}>
                                    {strings.filterChangeOpacity}
                                    <input
                                        type='radio'
                                        onChange={() => {
                                            if (filter.remove) {
                                                filter.remove = false;
                                                if (filter.show) {
                                                    filter.init();
                                                    filter.filterLayer();
                                                }
                                            }
                                        } }
                                        checked={!filter.remove}
                                        name='filterMethod'
                                        id='opacity'
                                        />

                                </label>
                            </div>
                        }
                        {filter.show ?
                            <button className='menuButton' onClick={this.onDelete}>{strings.deleteFilter}</button>
                            :
                            <button className='menuButton' onClick={this.onSave}>{strings.saveFilter}</button>}

                        <br />
                        <i>{strings.filterDragTip}</i>
                    </div>

                    :
                    null
                }
            </div >
        );


    }

    renderSteps() {
        let filter = this.props.state.editingFilter;
        let header = this.props.state.layers.filter((f) => { return f.id === filter.layerId; })[0].getHeaderById(filter.filterHeaderId);
        let rows = [];
        let inputStyle = {
            display: 'inline',
            width: 100
        };
        let row = 0;

        if (header.type === 'number') {
            filter.steps.map(function(s) {
                rows.push(
                    <li key={row}>
                        <input
                            id={row + 'min'}
                            type='number'
                            value={s[0].toString()}
                            onChange={(e) => { s[0] = (e.currentTarget as any).valueAsNumber; } }
                            style={inputStyle}
                            step='any' />
                        -
                        <input
                            id={row + 'max'}
                            type='number'
                            value={s[1].toString()}
                            onChange={(e) => { s[1] = (e.currentTarget as any).valueAsNumber; } }
                            style={inputStyle}
                            step='any' />
                    </li>);
                row++;
            });
        }
        else {
            filter.categories.map(function(s) {
                rows.push(
                    <li key={row}>
                        <span
                            style={inputStyle}
                            step='any'>{s}</span>
                    </li>);
                row++;
            });

        }
        return <div>
            <button onClick={this.onStepsCountChange.bind(this, -1)}>-</button>
            <button onClick={this.onStepsCountChange.bind(this, 1)}>+</button>
            <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r; })}</ul>
        </div>;
    }
}
