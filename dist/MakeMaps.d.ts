import * as React from 'react';
import { MakeMapsData, MapOptions, ViewOptions } from './stores/Main';
export declare class MakeMaps extends React.Component<{
    data: MakeMapsData[];
    viewOptions: ViewOptions;
    mapOptions: MapOptions;
}, {}> {
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillReceiveProps(newProps: {
        data: MakeMapsData[];
        mapOptions: MapOptions;
        viewOptions: ViewOptions;
    }): void;
    loadData(oldData: MakeMapsData[], newData: MakeMapsData[]): void;
    changeLanguage(lang: string): void;
    reset(): void;
    onBackButtonEvent(e: any): void;
    render(): JSX.Element;
}
