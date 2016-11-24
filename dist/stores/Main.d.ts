export declare class MakeMapsData {
    id: number;
    name: string;
    type: 'general' | 'csv' | 'gpx' | 'kml' | 'geojson';
    content?: string;
    data?: any;
    columns: string[];
    projection: 'WGS84' | 'EPSG:4269' | 'EPSG:3857' | 'ETRS-GK25FIN';
    latName: string;
    lonName: string;
}
export declare class MapOptions {
    attributionExtension: string;
    mapCenter: [number, number];
    zoomLevel: number;
    baseMapName: 'OSM Streets' | 'OSM Black&White' | 'OpenTopoMap' | 'Stamen Toner' | 'Stamen Watercolor';
}
export declare class ViewOptions {
    showMenu: boolean;
    showExportOptions: boolean;
    allowLayerChanges: boolean;
    language: 'fi' | 'en';
    showWelcomeScreen: boolean;
}
