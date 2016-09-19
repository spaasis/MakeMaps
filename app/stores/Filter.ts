import { observable, computed } from 'mobx';
import { Layer, LayerTypes } from './Layer';
import { AppState } from './States';
let mobx = require('mobx');

export class Filter {

    /** The unique id of the filter */
    @observable id: number;
    /** The name of the this. Will be shown on the map*/
    @observable title: string;
    /** Layer Id to filter*/
    @observable layerId: number;
    /** The name of the field to filter*/
    @observable fieldToFilter: string;
    /** Dictionary containing lists of layer ids by the value being filtered*/
    @observable filterValues: { [value: number]: number[] };
    /** Current maximum value */
    @observable currentMax: number;
    /** Current min value */
    @observable currentMin: number;
    /** Original maximum value */
    @observable totalMax: number;
    /** Original min value */
    @observable totalMin: number;
    /** User defined steps*/
    @observable steps: [number, number][];
    /** Filter categories for string values*/
    @observable categories: string[];
    /** Whether to remove the filtered layer completely or change opacity*/
    @observable remove: boolean;
    /** The storage of already filtered indices */
    @observable filteredIndices: number[];
    @observable step: number;
    /** Keep the distance between the min and max the same when the slider is being moved.
     * Useful for keeping a locked range to filter
     */
    @observable lockDistance: boolean;

    appState: AppState;

    @observable show: boolean;

    previousLower: number;
    previousUpper: number;

    constructor(appState: AppState, prev?: Filter) {
        this.id = prev && prev.id !== undefined ? prev.id : undefined;;
        this.title = prev && prev.title || '';
        this.layerId = prev && prev.layerId !== undefined ? prev.layerId : undefined;
        this.fieldToFilter = prev && prev.fieldToFilter || undefined;
        this.filterValues = prev && prev.filterValues || {};
        this.currentMax = prev && prev.currentMax !== undefined ? prev.currentMax : undefined;
        this.currentMin = prev && prev.currentMin !== undefined ? prev.currentMin : undefined;
        this.totalMax = prev && prev.totalMax !== undefined ? prev.totalMax : undefined;
        this.totalMin = prev && prev.totalMin !== undefined ? prev.totalMin : undefined;
        this.steps = prev && prev.steps || [];
        this.categories = prev && prev.categories || [];
        this.remove = prev && prev.remove || false;
        this.filteredIndices = prev && prev.filteredIndices || [];
        this.step = prev && prev.step || -1;
        this.lockDistance = prev && prev.lockDistance || false;
        this.show = prev && prev.show || false;
        this.appState = prev && prev.appState || appState;

    }

    /**
     * Initializes a filter to be shown in the UI by calculating the layers
     */
    init(layerUpdate: boolean = false) {
        this.filterValues = {};
        this.filteredIndices = [];
        let id = this.layerId;
        let layer = this.appState.layers.filter(function(l) { return l.id == id })[0];
        if (layer.layerType !== LayerTypes.HeatMap) {
            layer.displayLayer.eachLayer(function(lyr: any) {
                let val = lyr.feature.properties[this.fieldToFilter];
                if (this.filterValues[val]) {
                    this.filterValues[val].push(lyr);
                }
                else
                    this.filterValues[val] = [lyr];
            }, this);
        }
        this.previousLower = this.totalMin;
        this.previousUpper = this.totalMax;
        if (layerUpdate) {
            this.filterLayer(); //hack-ish way to make sure that all of the layers are displayed after update
        }

        this.show = true;

    }

    /**
    * Remove or show items based on changes on a filter
    */
    filterLayer() {
        if (this.show) {
            let id = this.layerId;
            let layer = this.appState.layers.filter(function(l) { return l.id == id })[0];

            if (layer.layerType !== LayerTypes.HeatMap) {
                for (let val in this.filterValues) {
                    if ((this.previousLower <= +val && +val < this.currentMin) || (this.currentMin <= +val && +val < this.previousLower) ||
                        (this.previousUpper < +val && +val <= this.currentMax) || (this.currentMax < +val && +val <= this.previousUpper)) {
                        let filteredIndex = this.filteredIndices.indexOf(+val); //is filtered?
                        if (filteredIndex === -1 && (+val < this.currentMin || +val > this.currentMax)) { //If not yet filtered and values over thresholds
                            this.filterValues[val].map(function(lyr: any) {
                                if (lyr.setOpacity)
                                    lyr.setOpacity(0.2);
                                else
                                    lyr.setStyle({ fillOpacity: 0.2, opacity: 0.2 })

                                if (lyr._icon) {
                                    lyr._icon.style.display = this.remove ? 'none' : '';
                                    if (lyr._shadow) {
                                        lyr._shadow.style.display = this.remove ? 'none' : '';
                                    }
                                }
                                else if (lyr.setStyle) {
                                    lyr._path.style.display = this.remove ? 'none' : '';
                                }
                                else //clustered markers don't have _icon
                                    if (lyr.options.icon) {
                                        lyr.options.icon.options.className += ' marker-hidden';
                                        lyr.setIcon(lyr.options.icon);
                                    }



                            }, this);
                            this.filteredIndices.push(+val); //mark as filtered
                        }
                        else if (filteredIndex > -1 && (+val >= this.currentMin && +val <= this.currentMax)) { //If filtered and within thresholds
                            this.filterValues[val].map(function(lyr: any) {
                                if (shouldLayerBeAdded.call(this, lyr)) {
                                    if (lyr.setOpacity)
                                        lyr.setOpacity(layer.colorOptions.fillOpacity);
                                    else
                                        lyr.setStyle({ fillOpacity: layer.colorOptions.fillOpacity, opacity: layer.colorOptions.opacity })

                                    if (lyr._icon) {
                                        lyr._icon.style.display = '';
                                        if (lyr._shadow) {
                                            lyr._shadow.style.display = '';
                                        }
                                    }

                                    else if (lyr._path) {
                                        lyr._path.style.display = '';
                                    }
                                    else
                                        if (lyr.options.icon) {
                                            lyr.options.icon.options.className = lyr.options.icon.options.className.replace(' marker-hidden', '');
                                            lyr.setIcon(lyr.options.icon);
                                        }
                                }
                            }, this);
                            this.filteredIndices.splice(filteredIndex, 1);
                        }
                    }
                }

                layer.refreshCluster();

            }
            else {
                let arr: number[][] = [];
                let max = 0;
                layer.geoJSON.features.map(function(feat) {
                    if (feat.properties[this.fieldToFilter] >= this.currentMin && feat.properties[this.fieldToFilter] <= this.currentMax) {
                        let pos = [];
                        let heatVal = feat.properties[layer.colorOptions.colorField.value];
                        if (heatVal > max)
                            max = heatVal;
                        pos.push(feat.geometry.coordinates[1]);
                        pos.push(feat.geometry.coordinates[0]);
                        pos.push(heatVal);
                        arr.push(pos);
                    }
                }, this);
                for (let i in arr) {
                    arr[i][2] = arr[i][2] / max;
                }
                (layer.displayLayer as any).setLatLngs(arr);
            }

            this.previousLower = this.currentMin;
            this.previousUpper = this.currentMax;
        }

        /**
         * shouldLayerBeAdded - Checks every active filter to see if a layer can be un-filtered
         *
         * TODO: optimize performance (by storing every filter current value in state?)
         */
        function shouldLayerBeAdded(layer) {
            let filters: Filter[] = this.appState.filters.filter((f) => { return f.id !== this.id });
            let canUnFilter = true;
            for (let i in filters) {
                let filter = filters[i];
                let val = layer.feature.properties[filter.fieldToFilter];
                canUnFilter = val <= filter.currentMax && val >= filter.currentMin;
            }
            return canUnFilter;
        }
    }
}
