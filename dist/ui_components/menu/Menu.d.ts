import * as React from 'react';
import { AppState } from '../../stores/States';
export declare class MakeMapsMenu extends React.Component<{
    state: AppState;
}, {}> {
    componentWillMount(): void;
    onActiveMenuChange: (item: number) => void;
    getActiveMenu(): JSX.Element;
    render(): JSX.Element;
}
