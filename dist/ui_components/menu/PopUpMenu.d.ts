import * as React from 'react';
import { AppState } from '../../stores/States';
import { Header } from '../../stores/Layer';
export declare class PopUpMenu extends React.Component<{
    state: AppState;
}, {}> {
    saveValues(): void;
    onSelectionChange: (headers: Header[]) => void;
    render(): JSX.Element;
}
