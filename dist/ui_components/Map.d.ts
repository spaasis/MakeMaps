import * as React from 'react';
import { AppState } from '../stores/States';
import 'leaflet';
import 'Leaflet.extra-markers';
import 'leaflet-fullscreen';
import 'leaflet.markercluster';
export declare class Map extends React.Component<{
    state: AppState;
}, {}> {
    componentDidMount(): void;
    embed(): void;
    getUrlParameter(sParam: string, parameters: string[]): string;
    initMap(): void;
    renderFilters(): JSX.Element[];
    renderLegend(): JSX.Element;
    render(): JSX.Element;
}
