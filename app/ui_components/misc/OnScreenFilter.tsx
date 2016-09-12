import * as React from 'react';
import { Filter } from '../Stores/Filter';

let Slider = require('react-slider');
let Draggable = require('react-draggable');
import { observer } from 'mobx-react';

@observer
export class OnScreenFilter extends React.Component<{ state: Filter }, {}>{
    advanceSliderWhenLocked = (lower, upper) => {
        let minValDiff = this.props.state.currentMin - lower;
        let maxValDiff = this.props.state.currentMax - upper;
        if (minValDiff != 0) {
            if (this.props.state.currentMin - minValDiff > this.props.state.totalMin &&
                this.props.state.currentMax - minValDiff < this.props.state.totalMax) {

                this.props.state.currentMin -= minValDiff;
                this.props.state.currentMax -= minValDiff;
            }
        }
        else if (maxValDiff != 0) {
            if (this.props.state.currentMin - maxValDiff > this.props.state.totalMin &&
                this.props.state.currentMax - maxValDiff < this.props.state.totalMax) {

                this.props.state.currentMin -= maxValDiff
                this.props.state.currentMax -= maxValDiff;
            }
        }
        this.props.state.filterLayer();
    }
    onFilterScaleChange = (values) => {
        if (this.props.state.lockDistance) {
            this.advanceSliderWhenLocked(values[0], values[1]);
        }
        else {
            this.props.state.currentMin = values[0];
            this.props.state.currentMax = values[1];
        }
        this.props.state.filterLayer();

    }
    onCurrentMinChange = (e) => {
        let val = e.currentTarget.valueAsNumber
        if (this.props.state.lockDistance) {
            this.advanceSliderWhenLocked(val, this.props.state.currentMax);
        }
        else {
            this.props.state.currentMin = val;
        }
        this.props.state.filterLayer();

    }
    onCurrentMaxChange = (e) => {
        let val = e.currentTarget.valueAsNumber
        if (this.props.state.lockDistance) {
            this.advanceSliderWhenLocked(this.props.state.currentMin, val);
        }
        else {
            this.props.state.currentMax = val;
        }
        this.props.state.filterLayer();

    }
    onCustomStepClick = (i: number) => {
        let minVal = this.props.state.steps[i][0];
        let maxVal = this.props.state.steps[i][1];
        this.props.state.currentMin = minVal;
        this.props.state.currentMax = maxVal;
        this.props.state.step = i;
        this.props.state.filterLayer();

    }
    renderSteps() {
        let rows = [];
        if (this.props.state.steps) {
            let index = 0;
            this.props.state.steps.forEach(function(step) {
                rows.push(
                    <div
                        style={{
                            borderBottom: '1px solid #6891e2',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderLeft: this.props.state.step === index ? '6px solid #6891e2' : '',
                            borderRight: this.props.state.step === index ? '6px solid #6891e2' : ''

                        }}
                        key={step}
                        onClick={this.onCustomStepClick.bind(this, index)}
                        >{step[0] + '-' + step[1]}
                    </div>)
                index++;
            }, this);

        }
        return <div> {rows.map(function(e) { return e })} </div>
    }


    render() {
        return <Draggable
            handle={'.filterhead'}
            >
            <div className='filter'>
                <h3 className='filterhead'>{this.props.state.title}</h3>
                {this.renderSteps.call(this)}
                <div style={{ display: 'inline-flex' }}>
                    <input type='number' style={{ width: '70px' }} value={this.props.state.currentMin.toFixed(0)} onChange={this.onCurrentMinChange}/>
                    <Slider className='horizontal-slider'
                        onChange={this.onFilterScaleChange}
                        value={[this.props.state.currentMin, this.props.state.currentMax]}
                        min={this.props.state.totalMin - 1}
                        max={this.props.state.totalMax + 1}
                        withBars>
                        <div className='minHandle'></div>
                        <div className='maxHandle'></div>
                    </Slider>
                    <input type='number' style={{ width: '70px' }} value={this.props.state.currentMax.toFixed(0)} onChange={this.onCurrentMaxChange}/>
                    <div style={{ display: 'inline-block', cursor: 'pointer' }} onClick={() => {
                        this.props.state.lockDistance = !this.props.state.lockDistance;
                    } }>
                        <i style={{ color: 'cecece', fontSize: 20, padding: 4 }} className={!this.props.state.lockDistance ? 'fa fa-unlock-alt' : 'fa fa-lock'}/>
                    </div>
                </div>
                {

                    // <label>Lock distance
                    //     <input type='checkbox' checked={this.props.state.lockDistance} onChange={this.onLockDistanceChange}/>
                    // </label>
                }
            </div>
        </Draggable>
    }
}
