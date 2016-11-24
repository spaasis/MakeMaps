import * as React from 'react';
import { AppState } from '../../stores/States';
export declare class LayerImportWizard extends React.Component<{
    state: AppState;
}, {}> {
    nextStep(): void;
    previousStep(): void;
    setFileInfo(): void;
    setFileDetails(): void;
    submit(): void;
    getCurrentView(): JSX.Element;
    render(): JSX.Element;
}
