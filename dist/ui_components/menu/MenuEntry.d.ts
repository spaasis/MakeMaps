import * as React from 'react';
export declare class MenuEntry extends React.Component<{
    text: string;
    fa: string;
    id: number;
    active: boolean;
    onClick: (id: number) => void;
    hide?: boolean;
}, {}> {
    render(): JSX.Element;
}
