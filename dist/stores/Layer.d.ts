import { AppState } from './States';
export declare class Layer {
    id: number;
    name: string;
    geoJSON: {
        features: any[];
        type: string;
    };
    layerType: LayerTypes;
    headers: Header[];
    readonly numberHeaders: Header[];
    readonly categories: Header[];
    getHeaderById(id: number): Header;
    popupHeaderIds: number[];
    showPopUpOnHover: boolean;
    showPopUpInPlace: boolean;
    displayLayer: L.GeoJSON;
    onEachFeature: (feature: any, layer: L.GeoJSON) => void;
    colorOptions: ColorOptions;
    symbolOptions: SymbolOptions;
    clusterOptions: ClusterOptions;
    appState: AppState;
    pointFeatureCount: number;
    values: {
        [field: string]: any[];
    };
    uniqueValues: {
        [field: string]: any[];
    };
    bounds: L.LatLngBounds;
    constructor(state: AppState, prev?: Layer);
    refresh(): void;
    reDraw(): void;
    init(): void;
    partialDraw(i: number): void;
    finishDraw(): void;
    initFilters(): void;
    refreshFilters(): void;
    refreshPopUps(): void;
    refreshCluster(): void;
    getColors(): void;
    setOpacity(): void;
    getValues(): void;
    createClusteredIcon(cluster: any): L.DivIcon;
    batchAdd(start: number, source: any, target: any, partialCallback: (i: number) => void, finishedCallback: () => void): void;
}
export declare class ColorOptions implements L.PathOptions {
    colorField: Header;
    useCustomScheme: boolean;
    colors: string[];
    limits: number[];
    colorScheme: string;
    steps: number;
    revert: boolean;
    mode: string;
    iconTextColor: string;
    fillColor: string;
    color: string;
    weight: number;
    fillOpacity: number;
    opacity: number;
    useMultipleFillColors: boolean;
    heatMapRadius: number;
    chartColors: {
        [field: string]: string;
    };
    constructor(prev?: ColorOptions);
}
export declare class SymbolOptions {
    symbolType: SymbolTypes;
    useMultipleIcons: boolean;
    icons: IIcon[];
    readonly iconCount: number;
    iconField: Header;
    iconLimits: any[];
    sizeXVar: Header;
    sizeYVar: Header;
    blockSizeVar: Header;
    borderRadius: number;
    sizeLowLimit: number;
    sizeUpLimit: number;
    sizeMultiplier: number;
    chartFields: Header[];
    chartType: 'pie' | 'donut';
    blockValue: number;
    blockWidth: number;
    maxBlockColumns: number;
    maxBlockRows: number;
    constructor(prev?: SymbolOptions);
}
export declare class ClusterOptions {
    useClustering: boolean;
    showCount: boolean;
    countText: string;
    hoverHeaders: {
        headerId: number;
        showAvg: boolean;
        showSum: boolean;
        avgText: string;
        sumText: string;
    }[];
    useSymbolStyle: boolean;
    constructor(prev?: ClusterOptions);
}
export declare class Header {
    id: number;
    value: string;
    label: string;
    type: 'string' | 'number';
    decimalAccuracy: number;
    constructor(prev?: Header);
}
export declare enum LayerTypes {
    Standard = 0,
    HeatMap = 1,
}
export declare enum SymbolTypes {
    Simple = 0,
    Chart = 1,
    Icon = 2,
    Blocks = 3,
}
