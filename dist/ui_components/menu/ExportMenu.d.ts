import * as React from 'react';
import { AppState, SaveState } from '../../stores/States';
export declare class ExportMenu extends React.Component<{
    state: AppState;
}, {}> {
    saveImage(): void;
    formSaveJSON(): SaveState;
    saveFile(): void;
    saveEmbedCode(): void;
    render(): JSX.Element;
}
