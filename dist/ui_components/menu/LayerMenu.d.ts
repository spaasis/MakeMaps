import * as React from 'react';
import { AppState } from '../../stores/States';
export declare class LayerMenu extends React.Component<{
    state: AppState;
}, {}> {
    handleSort(type: 'heat' | 'standard', items: string[]): void;
    getLayerById(id: number): {
        name: string;
        id: number;
    };
    deleteLayer(id: number): void;
    render(): JSX.Element;
    renderHeaders(): JSX.Element;
}
