export class MakeMapsData {
    /** Unique id that is used to reference the map layers. */
    id: number;
    /** Display name of the layer*/
    name: string;
    /** The format of the data */
    type: 'general' | 'csv' | 'gpx' | 'kml' | 'geojson';
    /** The data as a string*/
    content?: string;
    /** Data as a JS object*/
    data?: any;
    /** List of column names that are used. If undefined or null, every column is in use*/
    columns: string[];
    /** Map projection. Default WGS84*/
    projection: 'WGS84' | 'EPSG:4269' | 'EPSG:3857' | 'ETRS-GK25FIN' = 'WGS84';
    /** Name of the latitude column*/
    latName: string;
    /** Name of the longitude column*/
    lonName: string;
}

export class MapOptions {
    /** Add text or html string to map attribution text*/
    attributionExtension: string;
    /** Map center coordinates. If null or undefined, will be automatically set based on the data*/
    mapCenter: [number, number] = [0, 0];
    /** Map zoom level. If null or undefined (or not fit to baselayer), will be automatically set*/
    zoomLevel: number = 2;
    /** Map base layer*/
    baseMapName: 'OSM Streets' | 'OSM Black&White' | 'OpenTopoMap' | 'Stamen Toner' | 'Stamen Watercolor' | null = 'OSM Streets';
}

export class ViewOptions {
    /** Should the menu (right side of the map view) be shown. Default true*/
    showMenu: boolean = true;
    /** Should the export options be visible in the menu. Default true*/
    showExportOptions: boolean = true;
    /** Should the addition and removal of layers be allowed in the layer menu. Default true*/
    allowLayerChanges: boolean = true;
    /** Menu display language. Null=automatically select based on browser*/
    language: 'fi' | 'en' | null = null;
    /** Show default MakeMaps welcome screen when there is no data to load. Default true*/
    showWelcomeScreen = true;
}
