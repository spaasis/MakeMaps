import * as React from 'react';
import { AppState } from '../../stores/States';
import { Header, SymbolTypes } from '../../stores/Layer';
export declare class SymbolMenu extends React.Component<{
    state: AppState;
}, {}> {
    onTypeChange: (type: SymbolTypes) => void;
    onXVariableChange: (val: any) => void;
    onYVariableChange: (val: any) => void;
    onFAIconChange: (e: any) => void;
    onIconShapeChange: (shape: "circle" | "square" | "star" | "penta") => void;
    onChartFieldsChange: (e: Header[]) => void;
    toggleIconSelect: (index: number) => void;
    onUseIconStepsChange: (e: any) => void;
    onIconFieldChange: (val: Header) => void;
    onIconStepCountChange: (amount: number) => void;
    addRandomIcon(): void;
    onStepLimitChange: (step: number, e: any) => void;
    getIcon(shape: string, fa: string, stroke: string, fill: string, onClick: any): JSX.Element;
    calculateIconValues(field: Header, steps: number, accuracy: number): void;
    render(): JSX.Element;
    renderIcons(): JSX.Element;
    renderIconSteps(): JSX.Element;
}
