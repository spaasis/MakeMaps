import * as React from 'react';
import { Strings } from '../../localizations/Strings';
export declare class DemoPreview extends React.Component<{
    strings: Strings;
    imageURL: string;
    description: string;
    loadDemo: () => void;
    onClick: () => void;
}, {}> {
    loadClicked(): void;
    render(): JSX.Element;
}
