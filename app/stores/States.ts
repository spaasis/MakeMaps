import { observable, computed, autorun } from 'mobx';
import { Layer, LayerTypes, Header } from './Layer';
import { Filter } from './Filter';
import { Legend } from './Legend';
import { MapOptions, ViewOptions } from './Main';
import { Strings } from '../localizations/Strings';

let mobx = require('mobx');


export class AppState {

    @observable welcomeShown: boolean = false;
    /** Is the import wizard visible*/
    @observable importWizardShown: boolean = false;
    /** Is the options menu icon visible*/
    @observable menuShown: boolean = false;
    /** Array of all the available base layers*/
    baseLayers: { id: string, layer: L.TileLayer }[];

    @computed get obsBaseLayers() {
        let arr: ISelectData[] = [];
        this.baseLayers.map(function(lyr) {
            arr.push({ value: lyr.layer, label: lyr.id });
        });
        return arr;
    }
    /** Currently visible base map*/
    @observable activeBaseLayer: { id: string, layer: L.TileLayer };
    /** The layers of the map.*/
    @observable layers: Layer[] = [];
    /** The current order of layers */
    @observable standardLayerOrder: { id: number }[] = [];
    /** The current order of heatmap layers */
    @observable heatLayerOrder: { id: number }[] = [];

    /** The data filters of the map.*/
    @observable filters: Filter[] = [];

    @computed get nextFilterId() {
        return this.filters.length > 0 ? this.filters[this.filters.length - 1].id + 1 : 0;
    }
    /** The active legend of the map*/
    @observable legend: Legend;

    @observable currentLayerId: number = 0;
    /** Currently selected layer on the menu*/
    @observable editingLayer: Layer;
    /** Currently open submenu index. 0=none*/
    @observable visibleMenu: number = 0;

    @observable welcomeScreenState: WelcomeScreenState = new WelcomeScreenState();

    @observable importWizardState: ImportWizardState;

    /** UI state of the color menu*/
    @observable colorMenuState: ColorMenuState = new ColorMenuState();

    @observable symbolMenuState: SymbolMenuState = new SymbolMenuState();

    @observable filterMenuState: FilterMenuState = new FilterMenuState();

    @computed get editingFilter() {
        let selectedId = this.filterMenuState.selectedFilterId;
        return this.filters ? this.filters.filter(function(f) { return f.id === selectedId; })[0] : undefined;
    }

    @observable legendMenuState: LegendMenuState = new LegendMenuState();

    @observable layerMenuState: LayerMenuState = new LayerMenuState();

    @observable exportMenuState: ExportMenuState = new ExportMenuState();

    @observable clusterMenuState: ClusterMenuState = new ClusterMenuState();

    @observable autoRefresh: boolean = true;

    @observable embed: boolean = false;

    @observable infoScreenText: string;

    @observable loaded: boolean = false;

    @observable bounds: L.LatLngBounds;

    strings: Strings;

    map: L.Map;

    mapStartingCenter: [number, number] = [0, 0];

    mapStartingZoom = 2;

    @observable viewOptions: ViewOptions;

    @observable mapOptions: MapOptions;


    constructor() {
        mobx.autorun(() => {
            if (this.bounds) {
                try {

                    this.map.fitBounds(this.bounds, {});
                }
                catch (ex) { // try for HeatMap
                    try {
                        let bounds = (this.bounds as any).slice().map(function(va) { return va.slice(); });
                        this.map.fitBounds(bounds, {});
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
        });
    }

}

export class WelcomeScreenState {
    loadedMap: SaveState;
    @observable fileName: string;
    @observable demoOrder: number[] = [0, 1, 2, 3, 4];
    @observable scroller: number;
}

/** The state to be saved when exporting a map to a file*/
export class SaveState {
    baseLayerId: string;
    /** The layers of the map.*/
    layers: Layer[] = [];
    /** The data filters of the map.*/
    filters: Filter[] = [];
    /** The active legend of the map*/
    legend: Legend = new Legend();
}

export class ImportWizardState {
    /** The currently active step of the wizard */
    @observable step: number = 0;
    @observable layer: Layer;
    @observable fileName: string;
    /** The file extension of the updated file */
    @observable fileExtension: string;
    /** The file's contents as string */
    @observable content: string;
    /** The name of the latitude field */
    @observable latitudeField: string;
    /** The name of the longitude field */
    @observable longitudeField: string;
    /** CSV delimiter*/
    @observable delimiter: string;
    /** The name of the coordinate system */
    @observable coordinateSystem: string;
    @observable useCustomProjection: boolean;
    /** Is the file in GeoJSON? If so, don't show lat-lon-selection*/
    @computed get isGeoJSON() {
        return this.layer.geoJSON ? true : false;
    };
    /** Is the layer going to be a heatmap?*/
    @computed get isHeatMap() {
        return this.layer.layerType === LayerTypes.HeatMap;
    }

    constructor(state: AppState) {
        this.layer = new Layer(state);
    }
}

// TODO: filterstore, layerstore, legendstore(?)
export class ColorMenuState {
    /** The name of the color being edited in color selection */
    @observable editing: string;
    /** Helper for showing the clicked item's color on the Chrome-style picker */
    @observable startColor: string;
    /** Should the color display be rendered*/
    @observable colorSelectOpen: boolean;
}

export class SymbolMenuState {
    /** Is the icon selection visible*/
    @observable iconSelectOpen: boolean;
    @observable currentIconIndex: number;
}

export class FilterMenuState {
    /** Currently selected filter*/
    @observable selectedFilterId: number = -1;
    /** Currently selected field to filter*/
    @observable selectedField: string;
    /** The title of the filter to be rendered*/
    @observable filterTitle: string;
    /** Let the user define custom steps for the filter */
    @observable useCustomSteps: boolean = false;
    /** Amount of steps. Default 5*/
    @observable customStepCount: number = 5;
    /** The custom steps (minVal-maxVal)[]*/
    @observable customSteps: [number, number][] = [];
}

export class LegendMenuState {
    /** Is the meta edit modal open*/
    @observable metaEditOpen: boolean = false;
}

export class LayerMenuState {
    @observable editingLayerId: number;
}

export class ExportMenuState {
    @observable showLegend: boolean = true;
    @observable showFilters: boolean = false;
    @observable imageName: boolean;
}

export class ClusterMenuState {
    @observable selectedHeader: Header;
}
