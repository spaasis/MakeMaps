import * as React from 'react';
import { Filter } from '../../stores/Filter';
import { AppState } from '../../stores/States';
export declare class OnScreenFilter extends React.Component<{
    filter: Filter;
    state: AppState;
}, {}> {
    componentDidMount(): void;
    advanceSliderWhenLocked: (lower: any, upper: any) => void;
    onFilterScaleChange: (values: any) => void;
    onCurrentMinChange: (e: any) => void;
    onCurrentMaxChange: (e: any) => void;
    onKeyDown: (e: any) => void;
    onCustomStepClick: (i: number) => void;
    onCustomCategoryClick: (i: number) => void;
    render(): JSX.Element;
    renderSteps(): JSX.Element;
}
