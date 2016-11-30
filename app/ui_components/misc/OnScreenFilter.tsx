import * as React from 'react';
import { Filter } from '../../stores/Filter';
import { AppState } from '../../stores/States';

let Slider = require('react-slider');
let Draggable = require('react-draggable');
import { observer } from 'mobx-react';
require('../../../styles/react-slider.css');

@observer
export class OnScreenFilter extends React.Component<{ filter: Filter, state: AppState }, {}>{
    componentDidMount() {
        let filter = this.props.filter;
        setTimeout(function() {
            filter.x = Math.min(filter.x, window.innerWidth - +document.getElementById('filter' + filter.id).offsetWidth); //place within bounds
            filter.y = Math.min(filter.y, window.innerWidth - +document.getElementById('filter' + filter.id).offsetHeight);

        }, 10)

    }

    advanceSliderWhenLocked = (lower, upper) => {
        let filter = this.props.filter;
        let minValDiff = filter.currentMin - lower;
        let maxValDiff = filter.currentMax - upper;
        if (minValDiff != 0) {
            if (filter.currentMin - minValDiff >= filter.totalMin &&
                filter.currentMax - minValDiff <= filter.totalMax) {

                filter.currentMin -= minValDiff;
                filter.currentMax -= minValDiff;
            }
            else {
                if (filter.currentMin - minValDiff < filter.totalMin) {
                    filter.currentMin = filter.totalMin;
                    filter.currentMax = filter.totalMin + filter.lockedDistance
                }
                if (filter.currentMax - minValDiff > filter.totalMax) {
                    filter.currentMax = filter.totalMax;
                    filter.currentMin = filter.totalMax - filter.lockedDistance
                }
            }
        }
        else if (maxValDiff != 0) {
            if (filter.currentMin - maxValDiff >= filter.totalMin &&
                filter.currentMax - maxValDiff <= filter.totalMax) {

                filter.currentMin -= maxValDiff
                filter.currentMax -= maxValDiff;
            }
            else {
                if (filter.currentMin - maxValDiff < filter.totalMin) {
                    filter.currentMin = filter.totalMin;
                    filter.currentMax = filter.totalMin + filter.lockedDistance
                }
                if (filter.currentMax - maxValDiff > filter.totalMax) {
                    filter.currentMax = filter.totalMax;
                    filter.currentMin = filter.totalMax - filter.lockedDistance
                }
            }
        }
        this.props.filter.filterLayer();
    }
    onFilterScaleChange = (values) => {
        if (this.props.filter.locked) {
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
        if (this.props.filter.locked) {
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
        if (this.props.filter.locked) {
            this.advanceSliderWhenLocked(this.props.filter.currentMin, val);
        }
        else {
            this.props.filter.currentMax = val;
        }
        this.props.filter.filterLayer();

    }
    onKeyDown = (e) => {
        let filter = this.props.filter;
        let up = e.keyCode == 38;
        let down = e.keyCode == 40;
        if (up || down) {
            if (filter.categories.length > 0) {
                let index = filter.categories.indexOf(filter.selectedCategories[filter.selectedCategories.length - 1]);
                index += up ? -1 : 1;
                this.onCustomCategoryClick(index == -1 ? 0 : index)
            }
            else if (filter.steps.length > 0) {
                let index = filter.selectedStep + (up ? -1 : 1);
                if (index > -1 && index < filter.steps.length)
                    this.onCustomStepClick(index);
                else
                    this.onCustomStepClick(0)
            }
        }
    }

    onCustomStepClick = (i: number) => {
        let filter = this.props.filter;
        if (filter.selectedStep == i) {
            if (!filter.forceSelection) {
                filter.selectedStep = -1;
                filter.currentMin = filter.totalMin;
                filter.currentMax = filter.totalMax;
            }
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
        if (index == -1) {
            if (!filter.allowCategoryMultiSelect)
                categories.splice(0, categories.length);
            categories.push(category);
        }
        else
            if (!filter.forceSelection || (filter.forceSelection && categories.length > 1))
                categories.splice(index, 1);
        filter.filterLayer();

    }


    render() {
        let filter = this.props.filter;
        let map = filter.appState.map;
        let header = this.props.state.layers.filter((layer) => { return layer.id == filter.layerId })[0].getHeaderById(filter.filterHeaderId);

        return <Draggable
            handle={'.filterhead'}
            position={{ x: filter.x, y: filter.y }}
            onStop={(e, data) => {
                filter.x = data.x;
                filter.y = data.y;
            } }
            bounds={'parent'}
            >
            <div className='filter'
                id={'filter' + filter.id}
                onMouseEnter={(e) => { map.dragging.disable(); map.scrollWheelZoom.disable(); map.keyboard.disable(); document.onkeydown = this.onKeyDown.bind(this); } }
                onMouseLeave={(e) => { map.dragging.enable(); map.scrollWheelZoom.enable(); map.keyboard.enable(); document.onkeydown = null; } }
                onKeyDown={this.onKeyDown.bind(this)}
                >
                <div className='filterhead' style={{ position: 'sticky' }}>
                    <h3 >{filter.title}</h3>
                </div>
                {this.renderSteps.call(this)}
                {header.type == 'number' && filter.showSlider ?
                    <div style={{ display: 'inline-flex' }}                    >
                        <input type='number' style={{ width: '70px' }} value={filter.currentMin.toFixed(0)} onChange={this.onCurrentMinChange} />
                        <Slider className='horizontal-slider'
                            onAfterChange={(e) => { this.onFilterScaleChange(e); filter.selectedStep = -1; } }
                            value={[filter.currentMin, filter.currentMax]}
                            min={filter.totalMin}
                            max={filter.totalMax}
                            withBars>
                            <div className='minHandle'></div>
                            <div className='maxHandle'></div>
                        </Slider>
                        <input type='number' style={{ width: '70px' }} value={filter.currentMax.toFixed(0)} onChange={this.onCurrentMaxChange} />
                        <div style={{ display: 'inline-block', cursor: 'pointer' }} onClick={() => {
                            filter.locked = !filter.locked;
                            filter.lockedDistance = filter.currentMax - filter.currentMin;
                        } }>
                            <i style={{ color: 'cecece', fontSize: 20, padding: 4 }} className={!filter.locked ? 'fa fa-unlock-alt' : 'fa fa-lock'} />
                        </div>
                    </div>
                    : null}
            </div>
        </Draggable>
    }

    renderSteps() {
        let rows = [];
        let filter = this.props.filter;
        if (filter.steps && filter.steps.slice().length > 0) {
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
                            fontWeight: filter.selectedStep === index ? 'bold' : 'normal',
                            textDecoration: filter.selectedStep === index ? 'underline' : '',
                        }}
                        key={step[0]}
                        onClick={this.onCustomStepClick.bind(this, index)}
                        >{step[0] + (!filter.useDistinctValues ? ('-' + step[1]) : '')}
                    </div>)
                index++;
            }, this);

        }
        else if (filter.categories && filter.categories.slice().length > 0) {
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
                            fontWeight: filter.selectedCategories.indexOf(category) > -1 ? 'bold' : 'normal',
                            textDecoration: filter.selectedCategories.indexOf(category) > -1 ? 'underline' : '',
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

}
