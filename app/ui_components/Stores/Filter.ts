import { observable, computed } from 'mobx';
import { LayerTypes, SymbolTypes } from '../common_items/common';
import { Layer } from './Layer';
import { AppState } from './States';
let mobx = require('mobx');

export class Filter {

    /** The unique id of the filter */
    @observable id: number;
    /** The name of the this. Will be shown on the map*/
    @observable title: string;
    /** Layer Id to filter*/
    @observable layer: Layer;
    /** The name of the field to filter*/
    @observable fieldToFilter: string;
    /** Dictionary containing lists of layer ids by the value being filtered*/
    @observable filterValues: { [value: number]: number[] } = {};
    /** Current maximum value */
    @observable currentMax: number;
    /** Current min value */
    @observable currentMin: number;
    /** Original maximum value */
    @observable totalMax: number;
    /** Original min value */
    @observable totalMin: number;
    /** User defined steps*/
    @observable steps: [number, number][] = [];
    /** Filter categories for string values*/
    @observable categories: string[] = [];
    /** Whether to remove the filtered layer completely or change opacity*/
    @observable remove: boolean;
    /** The storage of already filtered indices */
    @observable filteredIndices: number[] = [];
    @observable step: number = -1;
    /** Keep the distance between the min and max the same when the slider is being moved.
     * Useful for keeping a locked range to filter
     */
    @observable lockDistance: boolean;

    appState: AppState;

    @observable show: boolean;

    /**
     * Initializes a filter to be shown in the UI by calculating the layers
     */
    init(layerUpdate: boolean = false) {
        this.filterValues = {};
        this.filteredIndices = [];
        if (this.layer.layerType !== LayerTypes.HeatMap) {
            this.layer.layer.eachLayer(function(layer) {
                let val = (layer as any).feature.properties[this.fieldToFilter];
                if (this.filterValues[val]) {
                    this.filterValues[val].push(layer._leaflet_id);
                }
                else
                    this.filterValues[val] = [layer._leaflet_id];
            }, this);
        }

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
            if (this.layer.layerType !== LayerTypes.HeatMap) {
                for (let val in this.filterValues) {
                    let filteredIndex = this.filteredIndices.indexOf(+val); //is filtered?

                    if (filteredIndex === -1 && (+val < this.currentMin || +val > this.currentMax)) { //If not yet filtered and values over thresholds
                        this.filterValues[val].map(function(id) {
                            let layer = this.layer.layer._layers[id];
                            if (this.remove) {
                                if (layer._icon) {
                                    layer._icon.style.display = 'none';
                                }
                                else if (layer._path) {
                                    layer._path.style.display = 'none';
                                }
                                if (layer._shadow) {
                                    layer._shadow.style.display = 'none';
                                }
                            }
                            else {
                                if (layer.setOpacity)
                                    layer.setOpacity(0.2);
                                else
                                    layer.setStyle({ fillOpacity: 0.2, opacity: 0.2 })

                            }
                        }, this);
                        this.filteredIndices.push(+val); //mark as filtered
                    }
                    else if (filteredIndex > -1 && (+val >= this.currentMin && +val <= this.currentMax)) { //If filtered and within thresholds
                        this.filterValues[val].map(function(id) {
                            let layer = this.layer.layer._layers[id];
                            if (shouldLayerBeAdded.call(this, layer)) {
                                if (this.remove) {
                                    if (layer._icon) {
                                        layer._icon.style.display = 'block';
                                    }
                                    else if (layer._path) {
                                        layer._path.style.display = 'block';
                                    }
                                    if (layer._shadow) {
                                        layer._shadow.style.display = 'block';
                                    }
                                }
                                else {
                                    if (layer.setOpacity)
                                        layer.setOpacity(this.layer.colorOptions.fillOpacity);
                                    else
                                        layer.setStyle({ fillOpacity: this.layer.colorOptions.fillOpacity, opacity: this.layer.colorOptions.opacity })
                                }
                            }
                        }, this);
                        this.filteredIndices.splice(filteredIndex, 1);
                    }
                }
            }
            else {
                let arr: number[][] = [];
                let max = 0;
                this.layer.geoJSON.features.map(function(feat) {
                    if (feat.properties[this.fieldToFilter] >= this.currentMin && feat.properties[this.fieldToFilter] <= this.currentMax) {
                        let pos = [];
                        let heatVal = feat.properties[this.layer.heatMapVariable];
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
                this.layer.layer.setLatLngs(arr);
            }
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
