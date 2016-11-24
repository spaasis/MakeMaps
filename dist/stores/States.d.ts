import { Layer, Header } from './Layer';
import { Filter } from './Filter';
import { Legend } from './Legend';
import { Strings } from '../localizations/Strings';
export declare class AppState {
    welcomeShown: boolean;
    importWizardShown: boolean;
    menuShown: boolean;
    baseLayers: {
        id: string;
        layer: L.TileLayer;
    }[];
    readonly obsBaseLayers: ISelectData[];
    activeBaseLayer: {
        id: string;
        layer: L.TileLayer;
    };
    layers: Layer[];
    standardLayerOrder: {
        id: number;
    }[];
    heatLayerOrder: {
        id: number;
    }[];
    filters: Filter[];
    readonly nextFilterId: number;
    legend: Legend;
    currentLayerId: number;
    editingLayer: Layer;
    visibleMenu: number;
    welcomeScreenState: WelcomeScreenState;
    importWizardState: ImportWizardState;
    colorMenuState: ColorMenuState;
    symbolMenuState: SymbolMenuState;
    filterMenuState: FilterMenuState;
    readonly editingFilter: Filter;
    legendMenuState: LegendMenuState;
    layerMenuState: LayerMenuState;
    exportMenuState: ExportMenuState;
    clusterMenuState: ClusterMenuState;
    autoRefresh: boolean;
    embed: boolean;
    infoScreenText: string;
    language: string;
    loaded: boolean;
    bounds: L.LatLngBounds;
    strings: Strings;
    map: L.Map;
    mapStartingCenter: [number, number];
    mapStartingZoom: number;
    constructor();
}
export declare class WelcomeScreenState {
    loadedMap: SaveState;
    fileName: string;
    demoOrder: number[];
    scroller: number;
}
export declare class SaveState {
    baseLayerId: string;
    layers: Layer[];
    filters: Filter[];
    legend: Legend;
}
export declare class ImportWizardState {
    step: number;
    layer: Layer;
    fileName: string;
    fileExtension: string;
    content: string;
    latitudeField: string;
    longitudeField: string;
    delimiter: string;
    coordinateSystem: string;
    useCustomProjection: boolean;
    readonly isGeoJSON: boolean;
    readonly isHeatMap: boolean;
    constructor(state: AppState);
}
export declare class ColorMenuState {
    editing: string;
    startColor: string;
    colorSelectOpen: boolean;
}
export declare class SymbolMenuState {
    iconSelectOpen: boolean;
    currentIconIndex: number;
}
export declare class FilterMenuState {
    selectedFilterId: number;
    selectedField: string;
    filterTitle: string;
    useCustomSteps: boolean;
    customStepCount: number;
    customSteps: [number, number][];
}
export declare class LegendMenuState {
    metaEditOpen: boolean;
}
export declare class LayerMenuState {
    editingLayerId: number;
}
export declare class ExportMenuState {
    showLegend: boolean;
    showFilters: boolean;
    imageName: boolean;
}
export declare class ClusterMenuState {
    selectedHeader: Header;
}
