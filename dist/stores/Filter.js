"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var mobx_1 = require('mobx');
var Layer_1 = require('./Layer');
var mobx = require('mobx');
var Filter = (function () {
    function Filter(appState, prev) {
        this.id = prev && prev.id !== undefined ? prev.id : undefined;
        ;
        this.title = prev && prev.title || '';
        this.layerId = prev && prev.layerId !== undefined ? prev.layerId : undefined;
        this.filterHeaderId = prev && prev.filterHeaderId || undefined;
        this.filterValues = prev && prev.filterValues || {};
        this.currentMax = prev && prev.currentMax !== undefined ? prev.currentMax : undefined;
        this.currentMin = prev && prev.currentMin !== undefined ? prev.currentMin : undefined;
        this.totalMax = prev && prev.totalMax !== undefined ? prev.totalMax : undefined;
        this.totalMin = prev && prev.totalMin !== undefined ? prev.totalMin : undefined;
        this.selectedStep = prev && prev.selectedStep !== undefined ? prev.selectedStep : -1;
        this.x = prev && prev.x !== undefined ? prev.x : 10;
        this.y = prev && prev.y !== undefined ? prev.y : 10;
        this.steps = prev && prev.steps || [];
        this.categories = prev && prev.categories || [];
        this.remove = prev && prev.remove || false;
        this.filteredIndices = prev && prev.filteredIndices || [];
        this.selectedCategories = prev && prev.selectedCategories || [];
        this.locked = prev && prev.locked || false;
        this.show = prev && prev.show || false;
        this.show = prev && prev.show || false;
        this.appState = prev && prev.appState || appState;
        this.showSlider = prev && prev.showSlider !== undefined ? prev.showSlider : true;
        this.forceSelection = prev && prev.forceSelection !== undefined ? prev.forceSelection : true;
        this.useDistinctValues = prev && prev.useDistinctValues || false;
    }
    Filter.prototype.init = function () {
        this.filterValues = {};
        this.filteredIndices = [];
        var id = this.layerId;
        var count = 0;
        var layer = this.appState.layers.filter(function (l) { return l.id == id; })[0];
        var header = layer.getHeaderById(this.filterHeaderId);
        if (layer.layerType !== Layer_1.LayerTypes.HeatMap) {
            layer.displayLayer.eachLayer(function (lyr) {
                var val = lyr.feature.properties[header.value];
                if (this.filterValues[val]) {
                    this.filterValues[val].push(lyr);
                }
                else
                    this.filterValues[val] = [lyr];
            }, this);
        }
        this.previousLower = this.totalMin;
        this.previousUpper = this.totalMax;
        this.show = true;
    };
    Filter.prototype.filterLayer = function () {
        if (this.show) {
            var id_1 = this.layerId;
            var layer_1 = this.appState.layers.filter(function (l) { return l.id === id_1; })[0];
            var header_1 = layer_1.getHeaderById(this.filterHeaderId);
            if (layer_1.layerType !== Layer_1.LayerTypes.HeatMap) {
                for (var val in this.filterValues) {
                    if (header_1.type == 'number') {
                        filterByNumber.call(this, +val, layer_1);
                    }
                    else {
                        if (this.selectedCategories.length > 0) {
                            if (this.selectedCategories.indexOf(val) > -1) {
                                show.call(this, val, layer_1);
                            }
                            else {
                                hide.call(this, val);
                            }
                        }
                        else {
                            show.call(this, val, layer_1);
                        }
                    }
                }
                layer_1.refreshCluster();
            }
            else {
                var arr_1 = [];
                var max_1 = 0;
                layer_1.geoJSON.features.map(function (feat) {
                    if (feat.properties[header_1.value] >= this.currentMin && feat.properties[header_1.value] <= this.currentMax) {
                        var pos = [];
                        var heatVal = feat.properties[layer_1.colorOptions.colorField.value];
                        if (heatVal > max_1)
                            max_1 = heatVal;
                        pos.push(feat.geometry.coordinates[1]);
                        pos.push(feat.geometry.coordinates[0]);
                        pos.push(heatVal);
                        arr_1.push(pos);
                    }
                }, this);
                for (var i in arr_1) {
                    arr_1[i][2] = arr_1[i][2] / max_1;
                }
                layer_1.displayLayer.setLatLngs(arr_1);
            }
            this.previousLower = this.currentMin;
            this.previousUpper = this.currentMax;
        }
        function filterByNumber(val, layer) {
            if ((this.previousLower <= +val && +val < this.currentMin) || (this.currentMin <= +val && +val < this.previousLower) ||
                (this.previousUpper < +val && +val <= this.currentMax) || (this.currentMax < +val && +val <= this.previousUpper)) {
                var filteredIndex = this.filteredIndices.indexOf(+val);
                if (filteredIndex === -1 && (+val < this.currentMin || +val > this.currentMax)) {
                    hide.call(this, val);
                    this.filteredIndices.push(+val);
                }
                else if (filteredIndex > -1 && (+val >= this.currentMin && +val <= this.currentMax)) {
                    show.call(this, val, layer);
                    this.filteredIndices.splice(filteredIndex, 1);
                }
            }
        }
        function hide(val) {
            this.filterValues[val].map(function (lyr) {
                if (!this.remove) {
                    if (lyr._icon && lyr._icon.style.display == 'none') {
                        lyr._icon.style.display = '';
                        if (lyr._shadow) {
                            lyr._shadow.style.display = '';
                        }
                    }
                    if (lyr._shadow && lyr._shadow.style.display == 'none') {
                        lyr._shadow.style.display = '';
                    }
                    else if (lyr._path && lyr._path.style.display == 'none') {
                        lyr._path.style.display = '';
                    }
                    if (lyr.setOpacity)
                        lyr.setOpacity(0.2);
                    else
                        lyr.setStyle({ fillOpacity: 0.2, opacity: 0.2 });
                }
                else {
                    if (lyr._icon) {
                        lyr._icon.style.display = 'none';
                        if (lyr._shadow) {
                            lyr._shadow.style.display = 'none';
                        }
                    }
                    else if (lyr._path) {
                        lyr._path.style.display = 'none';
                    }
                    if (lyr.options.icon && lyr.options.icon.options.className.indexOf('marker-hidden') == -1) {
                        lyr.options.icon.options.className += ' marker-hidden';
                        lyr.setIcon(lyr.options.icon);
                    }
                }
            }, this);
        }
        function show(val, layer) {
            this.filterValues[val].map(function (lyr) {
                if (shouldLayerBeAdded.call(this, lyr)) {
                    if (lyr.setOpacity)
                        lyr.setOpacity(layer.colorOptions.fillOpacity);
                    else
                        lyr.setStyle({ fillOpacity: layer.colorOptions.fillOpacity, opacity: layer.colorOptions.opacity });
                    if (lyr._icon) {
                        lyr._icon.style.display = '';
                        if (lyr._shadow) {
                            lyr._shadow.style.display = '';
                        }
                    }
                    else if (lyr._path) {
                        lyr._path.style.display = '';
                    }
                    var className = lyr.options.icon ? lyr.options.icon.options.className : null;
                    if (className && className.indexOf('marker-hidden') > -1) {
                        lyr.options.icon.options.className = className.replace(' marker-hidden', '');
                        lyr.setIcon(lyr.options.icon);
                    }
                }
            }, this);
        }
        function shouldLayerBeAdded(layer) {
            var _this = this;
            var filters = this.appState.filters.filter(function (f) { return f.id !== _this.id && f.layerId === _this.layerId; });
            var canUnFilter = true;
            for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
                var filter = filters_1[_i];
                var header = this.appState.layers.filter(function (layer) { return layer.id == _this.layerId; })[0].getHeaderById(filter.filterHeaderId);
                var val = layer.feature.properties[header.value];
                if (header.type == 'number') {
                    canUnFilter = val <= filter.currentMax && val >= filter.currentMin;
                }
                else
                    canUnFilter = filter.selectedCategories.indexOf(val) > -1;
            }
            return canUnFilter;
        }
    };
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "id", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], Filter.prototype, "title", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "layerId", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "filterHeaderId", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Object)
    ], Filter.prototype, "filterValues", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "currentMax", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "currentMin", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "totalMax", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "totalMin", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], Filter.prototype, "steps", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], Filter.prototype, "categories", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "remove", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], Filter.prototype, "filteredIndices", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "selectedStep", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "allowCategoryMultiSelect", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], Filter.prototype, "selectedCategories", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "locked", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "show", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "x", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], Filter.prototype, "y", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "showSlider", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "forceSelection", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Filter.prototype, "useDistinctValues", void 0);
    return Filter;
}());
exports.Filter = Filter;
