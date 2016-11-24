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
var Legend_1 = require('./Legend');
var mobx = require('mobx');
var AppState = (function () {
    function AppState() {
        var _this = this;
        this.welcomeShown = false;
        this.importWizardShown = false;
        this.menuShown = false;
        this.layers = [];
        this.standardLayerOrder = [];
        this.heatLayerOrder = [];
        this.filters = [];
        this.currentLayerId = 0;
        this.visibleMenu = 0;
        this.welcomeScreenState = new WelcomeScreenState();
        this.colorMenuState = new ColorMenuState();
        this.symbolMenuState = new SymbolMenuState();
        this.filterMenuState = new FilterMenuState();
        this.legendMenuState = new LegendMenuState();
        this.layerMenuState = new LayerMenuState();
        this.exportMenuState = new ExportMenuState();
        this.clusterMenuState = new ClusterMenuState();
        this.autoRefresh = true;
        this.embed = false;
        this.loaded = false;
        this.mapStartingCenter = [0, 0];
        this.mapStartingZoom = 2;
        mobx.autorun(function () {
            if (_this.bounds) {
                _this.map.fitBounds(_this.bounds, {});
            }
        });
    }
    Object.defineProperty(AppState.prototype, "obsBaseLayers", {
        get: function () {
            var arr = [];
            this.baseLayers.map(function (lyr) {
                arr.push({ value: lyr.layer, label: lyr.id });
            });
            return arr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppState.prototype, "nextFilterId", {
        get: function () {
            return this.filters.length > 0 ? this.filters[this.filters.length - 1].id + 1 : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppState.prototype, "editingFilter", {
        get: function () {
            var selectedId = this.filterMenuState.selectedFilterId;
            return this.filters ? this.filters.filter(function (f) { return f.id === selectedId; })[0] : undefined;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], AppState.prototype, "welcomeShown", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], AppState.prototype, "importWizardShown", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], AppState.prototype, "menuShown", void 0);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], AppState.prototype, "obsBaseLayers", null);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Object)
    ], AppState.prototype, "activeBaseLayer", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], AppState.prototype, "layers", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], AppState.prototype, "standardLayerOrder", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], AppState.prototype, "heatLayerOrder", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], AppState.prototype, "filters", void 0);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], AppState.prototype, "nextFilterId", null);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Legend_1.Legend)
    ], AppState.prototype, "legend", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], AppState.prototype, "currentLayerId", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Layer_1.Layer)
    ], AppState.prototype, "editingLayer", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], AppState.prototype, "visibleMenu", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', WelcomeScreenState)
    ], AppState.prototype, "welcomeScreenState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', ImportWizardState)
    ], AppState.prototype, "importWizardState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', ColorMenuState)
    ], AppState.prototype, "colorMenuState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', SymbolMenuState)
    ], AppState.prototype, "symbolMenuState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', FilterMenuState)
    ], AppState.prototype, "filterMenuState", void 0);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], AppState.prototype, "editingFilter", null);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', LegendMenuState)
    ], AppState.prototype, "legendMenuState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', LayerMenuState)
    ], AppState.prototype, "layerMenuState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', ExportMenuState)
    ], AppState.prototype, "exportMenuState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', ClusterMenuState)
    ], AppState.prototype, "clusterMenuState", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], AppState.prototype, "autoRefresh", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], AppState.prototype, "embed", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], AppState.prototype, "infoScreenText", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], AppState.prototype, "language", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], AppState.prototype, "loaded", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Object)
    ], AppState.prototype, "bounds", void 0);
    return AppState;
}());
exports.AppState = AppState;
var WelcomeScreenState = (function () {
    function WelcomeScreenState() {
        this.demoOrder = [0, 1, 2, 3, 4];
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], WelcomeScreenState.prototype, "fileName", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], WelcomeScreenState.prototype, "demoOrder", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], WelcomeScreenState.prototype, "scroller", void 0);
    return WelcomeScreenState;
}());
exports.WelcomeScreenState = WelcomeScreenState;
var SaveState = (function () {
    function SaveState() {
        this.layers = [];
        this.filters = [];
        this.legend = new Legend_1.Legend();
    }
    return SaveState;
}());
exports.SaveState = SaveState;
var ImportWizardState = (function () {
    function ImportWizardState(state) {
        this.step = 0;
        this.layer = new Layer_1.Layer(state);
    }
    Object.defineProperty(ImportWizardState.prototype, "isGeoJSON", {
        get: function () {
            return this.layer.geoJSON ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ImportWizardState.prototype, "isHeatMap", {
        get: function () {
            return this.layer.layerType === Layer_1.LayerTypes.HeatMap;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], ImportWizardState.prototype, "step", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Layer_1.Layer)
    ], ImportWizardState.prototype, "layer", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "fileName", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "fileExtension", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "content", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "latitudeField", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "longitudeField", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "delimiter", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ImportWizardState.prototype, "coordinateSystem", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ImportWizardState.prototype, "useCustomProjection", void 0);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], ImportWizardState.prototype, "isGeoJSON", null);
    __decorate([
        mobx_1.computed, 
        __metadata('design:type', Object)
    ], ImportWizardState.prototype, "isHeatMap", null);
    return ImportWizardState;
}());
exports.ImportWizardState = ImportWizardState;
var ColorMenuState = (function () {
    function ColorMenuState() {
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorMenuState.prototype, "editing", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], ColorMenuState.prototype, "startColor", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ColorMenuState.prototype, "colorSelectOpen", void 0);
    return ColorMenuState;
}());
exports.ColorMenuState = ColorMenuState;
var SymbolMenuState = (function () {
    function SymbolMenuState() {
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], SymbolMenuState.prototype, "iconSelectOpen", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], SymbolMenuState.prototype, "currentIconIndex", void 0);
    return SymbolMenuState;
}());
exports.SymbolMenuState = SymbolMenuState;
var FilterMenuState = (function () {
    function FilterMenuState() {
        this.selectedFilterId = -1;
        this.useCustomSteps = false;
        this.customStepCount = 5;
        this.customSteps = [];
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], FilterMenuState.prototype, "selectedFilterId", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], FilterMenuState.prototype, "selectedField", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], FilterMenuState.prototype, "filterTitle", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], FilterMenuState.prototype, "useCustomSteps", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], FilterMenuState.prototype, "customStepCount", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Array)
    ], FilterMenuState.prototype, "customSteps", void 0);
    return FilterMenuState;
}());
exports.FilterMenuState = FilterMenuState;
var LegendMenuState = (function () {
    function LegendMenuState() {
        this.metaEditOpen = false;
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], LegendMenuState.prototype, "metaEditOpen", void 0);
    return LegendMenuState;
}());
exports.LegendMenuState = LegendMenuState;
var LayerMenuState = (function () {
    function LayerMenuState() {
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Number)
    ], LayerMenuState.prototype, "editingLayerId", void 0);
    return LayerMenuState;
}());
exports.LayerMenuState = LayerMenuState;
var ExportMenuState = (function () {
    function ExportMenuState() {
        this.showLegend = true;
        this.showFilters = false;
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ExportMenuState.prototype, "showLegend", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ExportMenuState.prototype, "showFilters", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], ExportMenuState.prototype, "imageName", void 0);
    return ExportMenuState;
}());
exports.ExportMenuState = ExportMenuState;
var ClusterMenuState = (function () {
    function ClusterMenuState() {
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Layer_1.Header)
    ], ClusterMenuState.prototype, "selectedHeader", void 0);
    return ClusterMenuState;
}());
exports.ClusterMenuState = ClusterMenuState;
