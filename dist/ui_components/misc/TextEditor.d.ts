import * as React from 'react';
export declare class TextEditor extends React.Component<{
    content: string;
    style: any;
    onChange: (target: any) => void;
}, {}> {
    componentWillMount(): void;
    emitChange(): void;
    shouldComponentUpdate(nextProps: any): boolean;
    addLink(): void;
    execCommand(command: any, arg: any): void;
    render(): JSX.Element;
}
