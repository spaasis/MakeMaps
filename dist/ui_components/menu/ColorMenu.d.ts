import * as React from 'react';
import { AppState } from '../../stores/States';
import { Header } from '../../stores/Layer';
export declare class ColorMenu extends React.Component<{
    state: AppState;
}, {}> {
    onColorSelect: (color: any) => void;
    onCustomSchemeChange: (e: any) => void;
    onCustomLimitBlur: (step: number, e: any) => void;
    onCustomLimitChange: (step: number, e: any) => void;
    increaseLimitStep: (limits: number[], val: number, step: number) => any;
    decreaseLimitStep: (limits: number[], val: number, step: number) => any;
    toggleColorPick: (property: string) => void;
    renderScheme: (option: Header) => JSX.Element;
    calculateValues: () => void;
    getOppositeColor: (color: string) => string;
    getStepLimits: () => number[];
    render(): JSX.Element;
    renderSteps(): JSX.Element;
}
