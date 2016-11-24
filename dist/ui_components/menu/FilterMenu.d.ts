import * as React from 'react';
import { AppState } from '../../stores/States';
import { Header } from '../../stores/Layer';
export declare class FilterMenu extends React.Component<{
    state: AppState;
}, {}> {
    onFilterVariableChange: (val: Header) => void;
    getMinMax(): void;
    onStepsCountChange: (amount: number) => void;
    calculateSteps(header: Header): void;
    onCreate: () => void;
    onSave: () => void;
    onDelete: () => void;
    getStepValues(): [number, number][];
    render(): JSX.Element;
    renderSteps(): JSX.Element;
}
