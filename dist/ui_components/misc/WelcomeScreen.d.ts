import * as React from 'react';
import { WelcomeScreenState, AppState } from '../../stores/States';
export declare class WelcomeScreen extends React.Component<{
    state: WelcomeScreenState;
    appState: AppState;
    changeLanguage: (lang: string) => void;
}, {}> {
    componentDidMount(): void;
    startScrolling(): void;
    stopScrolling(): void;
    loadDemo(filename: string): void;
    moveDemosLeft(): void;
    moveDemosRight(): void;
    highlightDemo(index: number): void;
    onDrop(files: any): void;
    loadMap(): void;
    render(): JSX.Element;
    getDemoButtons(): JSX.Element[];
    getHighlightedDemo(): JSX.Element;
}
