import * as React from 'react';
import { AppState } from '../../stores/States';
import { Layer, SymbolOptions, ColorOptions } from '../../stores/Layer';
export declare class OnScreenLegend extends React.Component<{
    state: AppState;
}, {}> {
    createLegend(layer: Layer, showLayerName: boolean, showSeparator: boolean): JSX.Element;
    createMultiColorLegend(layer: Layer, percentages: number[]): JSX.Element;
    createScaledSizeLegend(layer: Layer): JSX.Element;
    createChartSymbolLegend(col: ColorOptions, sym: SymbolOptions): JSX.Element;
    createIconLegend(layer: Layer, percentages: number[], layerName: string): JSX.Element;
    createBlockLegend(layer: Layer): JSX.Element;
    getStepPercentages(values: number[], limits: number[]): any[];
    combineLimits(layer: Layer): any[];
    render(): JSX.Element;
}
