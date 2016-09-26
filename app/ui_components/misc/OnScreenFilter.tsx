import * as React from 'react';
import { Filter } from '../../stores/Filter';

let Slider = require('react-slider');
let Draggable = require('react-draggable');
import { observer } from 'mobx-react';

@observer
export class OnScreenFilter extends React.Component<{ filter: Filter }, {}>{
    advanceSliderWhenLocked = (lower, upper) => {
        let minValDiff = this.props.filter.currentMin - lower;
        let maxValDiff = this.props.filter.currentMax - upper;
        if (minValDiff != 0) {
            if (this.props.filter.currentMin - minValDiff > this.props.filter.totalMin &&
                this.props.filter.currentMax - minValDiff < this.props.filter.totalMax) {

                this.props.filter.currentMin -= minValDiff;
                this.props.filter.currentMax -= minValDiff;
            }
        }
        else if (maxValDiff != 0) {
            if (this.props.filter.currentMin - maxValDiff > this.props.filter.totalMin &&
                this.props.filter.currentMax - maxValDiff < this.props.filter.totalMax) {

                this.props.filter.currentMin -= maxValDiff
                this.props.filter.currentMax -= maxValDiff;
            }
        }
        this.props.filter.filterLayer();
    }
    onFilterScaleChange = (values) => {
        if (this.props.filter.lockDistance) {
            this.advanceSliderWhenLocked(values[0], values[1]);
        }
        else {
            this.props.filter.currentMin = values[0];
            this.props.filter.currentMax = values[1];
        }
        this.props.filter.filterLayer();

    }
    onCurrentMinChange = (e) => {
        let val = e.currentTarget.valueAsNumber
        this.props.filter.selectedStep = -1;
        if (this.props.filter.lockDistance) {
            this.advanceSliderWhenLocked(val, this.props.filter.currentMax);
        }
        else {
            this.props.filter.currentMin = val;
        }
        this.props.filter.filterLayer();

    }
    onCurrentMaxChange = (e) => {
        let val = e.currentTarget.valueAsNumber
        this.props.filter.selectedStep = -1;
        if (this.props.filter.lockDistance) {
            this.advanceSliderWhenLocked(this.props.filter.currentMin, val);
        }
        else {
            this.props.filter.currentMax = val;
        }
        this.props.filter.filterLayer();

    }
    onCustomStepClick = (i: number) => {
        let filter = this.props.filter;
        if (filter.selectedStep == i) {
            filter.selectedStep = -1;
            filter.currentMin = filter.totalMin;
            filter.currentMax = filter.totalMax;
        }
        else {
            let minVal = filter.steps[i][0];
            let maxVal = filter.steps[i][1];
            filter.currentMin = minVal;
            filter.currentMax = maxVal;
            filter.selectedStep = i;
        }
        filter.filterLayer();
    }

    onCustomCategoryClick = (i: number) => {
        let filter = this.props.filter;
        let categories = filter.selectedCategories;
        let category = filter.categories[i];
        let index = categories.indexOf(category);
        if (index == -1)
            categories.push(category);
        else
            categories.splice(index, 1);
        filter.filterLayer();

    }
    renderSteps() {
        let rows = [];
        let filter = this.props.filter;
        if (filter.steps) {
            let index = 0;
            filter.steps.forEach(function(step) {
                rows.push(
                    <div
                        style={{
                            borderBottom: '1px solid #6891e2',
                            textAlign: 'center',
                            cursor: 'pointer',
                            height: 40,
                            lineHeight: '40px',
                            borderLeft: filter.selectedStep === index ? '6px solid #6891e2' : '',
                            borderRight: filter.selectedStep === index ? '6px solid #6891e2' : ''

                        }}
                        key={step}
                        onClick={this.onCustomStepClick.bind(this, index)}
                        >{step[0] + '-' + step[1]}
                    </div>)
                index++;
            }, this);

        }
        else if (filter.categories) {
            let index = 0;
            filter.categories.forEach(function(category) {
                rows.push(
                    <div
                        style={{
                            borderBottom: '1px solid #6891e2',
                            textAlign: 'center',
                            cursor: 'pointer',
                            width: 200,
                            height: 40,
                            borderLeft: filter.selectedCategories.indexOf(category) > -1 ? '6px solid #6891e2' : '',
                            borderRight: filter.selectedCategories.indexOf(category) > -1 ? '6px solid #6891e2' : '',
                        }}

                        key={category}
                        onClick={this.onCustomCategoryClick.bind(this, index)}
                        >
                        <span style={{
                            textOverflow: 'ellipsis',
                            display: 'block',
                            width: '100%',
                            lineHeight: '40px',
                        }}>
                            {category}
                        </span>
                    </div>)
                index++;
            }, this);

        }
        return <div> {rows.map(function(e) { return e })} </div>
    }


    render() {
        let filter = this.props.filter;
        return <Draggable
            handle={'.filterhead'}
            onDrag={(e) => { e.preventDefault(); e.stopPropagation(); return; } }
            >
            <div className='filter'
                onMouseEnter={(e) => { filter.appState.map.dragging.disable(); } }
                onMouseLeave={(e) => { filter.appState.map.dragging.enable(); } }
                onWheel={(e) => { e.stopPropagation(); } }
                >
                <h3 className='filterhead'>{filter.title}</h3>
                {this.renderSteps.call(this)}
                {filter.fieldToFilter.type == 'number' ?
                    <div style={{ display: 'inline-flex' }}                    >
                        <input type='number' style={{ width: '70px' }} value={filter.currentMin.toFixed(0)} onChange={this.onCurrentMinChange}/>
                        <Slider className='horizontal-slider'
                            onAfterChange={(e) => { this.onFilterScaleChange(e); filter.selectedStep = -1; } }
                            value={[filter.currentMin, filter.currentMax]}
                            min={filter.totalMin - 1}
                            max={filter.totalMax + 1}
                            withBars>
                            <div className='minHandle'></div>
                            <div className='maxHandle'></div>
                        </Slider>
                        <input type='number' style={{ width: '70px' }} value={filter.currentMax.toFixed(0)} onChange={this.onCurrentMaxChange}/>
                        <div style={{ display: 'inline-block', cursor: 'pointer' }} onClick={() => {
                            filter.lockDistance = !filter.lockDistance;
                        } }>
                            <i style={{ color: 'cecece', fontSize: 20, padding: 4 }} className={!filter.lockDistance ? 'fa fa-unlock-alt' : 'fa fa-lock'}/>
                        </div>
                    </div>
                    : null}
            </div>
        </Draggable>
    }
}
