"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var React = require('react');
var FileUploadView_1 = require('./FileUploadView');
var FileDetailsView_1 = require('./FileDetailsView');
var common_1 = require('../../common_items/common');
var FilePreProcessModel_1 = require('../../models/FilePreProcessModel');
var Layer_1 = require('../../stores/Layer');
var mobx_react_1 = require('mobx-react');
var LayerImportWizard = (function (_super) {
    __extends(LayerImportWizard, _super);
    function LayerImportWizard() {
        _super.apply(this, arguments);
    }
    LayerImportWizard.prototype.nextStep = function () {
        this.props.state.importWizardState.step++;
        if (this.props.state.importWizardState.step == 2)
            this.submit();
    };
    LayerImportWizard.prototype.previousStep = function () {
        this.props.state.importWizardState.step--;
    };
    LayerImportWizard.prototype.setFileInfo = function () {
        var state = this.props.state.importWizardState;
        var ext = state.fileExtension;
        if (ext === 'csv') {
            this.nextStep();
        }
        else {
            if (ext === 'geojson')
                state.layer.geoJSON = FilePreProcessModel_1.SetGeoJSONTypes(JSON.parse(state.content), state.layer.headers);
            else
                FilePreProcessModel_1.ParseToGeoJSON(state.content, ext, function (geojson) {
                    state.layer.geoJSON = FilePreProcessModel_1.SetGeoJSONTypes(geojson, state.layer.headers);
                });
            this.nextStep();
        }
        common_1.HideLoading();
    };
    LayerImportWizard.prototype.setFileDetails = function () {
        common_1.ShowLoading();
        var state = this.props.state.importWizardState;
        var layer = state.layer;
        if (!layer.geoJSON && state.fileExtension === 'csv') {
            FilePreProcessModel_1.ParseCSVToGeoJSON(state.content, state.latitudeField, state.longitudeField, state.delimiter, state.layer.headers, function (geojson) {
                state.layer.geoJSON = FilePreProcessModel_1.SetGeoJSONTypes(geojson, state.layer.headers);
            });
            this.nextStep();
        }
        else
            this.submit();
    };
    LayerImportWizard.prototype.submit = function () {
        var state = this.props.state.importWizardState;
        var l = state.layer;
        l.headers = l.headers.filter(function (val) { return val.label !== state.longitudeField && val.label !== state.latitudeField; });
        if (state.coordinateSystem && state.coordinateSystem !== 'WGS84') {
            l.geoJSON = FilePreProcessModel_1.ProjectCoords(l.geoJSON, state.coordinateSystem);
        }
        window.location.hash = 'edit';
        l.getValues();
        if (l.layerType !== Layer_1.LayerTypes.HeatMap && l.pointFeatureCount > 500) {
            common_1.ShowNotification(this.props.state.strings.clusterTogglePopup);
            l.clusterOptions.useClustering = true;
        }
        l.appState = this.props.state;
        l.id = this.props.state.currentLayerId++;
        l.colorOptions.colorField = l.numberHeaders[0];
        l.colorOptions.useMultipleFillColors = true;
        l.getColors();
        setTimeout(function () { l.init(); }, 10);
        this.props.state.layers.push(l);
        if (l.layerType === Layer_1.LayerTypes.HeatMap)
            this.props.state.heatLayerOrder.push({ id: l.id });
        else
            this.props.state.standardLayerOrder.push({ id: l.id });
        this.props.state.importWizardShown = false;
        this.props.state.editingLayer = l;
        this.props.state.menuShown = true;
    };
    LayerImportWizard.prototype.getCurrentView = function () {
        var _this = this;
        switch (this.props.state.importWizardState.step) {
            case 0:
                return React.createElement(FileUploadView_1.FileUploadView, {strings: this.props.state.strings, state: this.props.state.importWizardState, saveValues: function () {
                    common_1.ShowLoading();
                    var setInfo = _this.setFileInfo.bind(_this);
                    setTimeout(setInfo, 10);
                }, cancel: function () {
                    _this.props.state.importWizardShown = false;
                    if (_this.props.state.layers.length == 0)
                        _this.props.state.welcomeShown = true;
                    else {
                        _this.props.state.menuShown = true;
                        _this.props.state.editingLayer = _this.props.state.layers[0];
                    }
                }});
            case 1:
                return React.createElement(FileDetailsView_1.FileDetailsView, {strings: this.props.state.strings, state: this.props.state.importWizardState, saveValues: function () {
                    common_1.ShowLoading();
                    var setDetails = _this.setFileDetails.bind(_this);
                    setTimeout(setDetails, 10);
                }, goBack: this.previousStep.bind(this)});
        }
    };
    LayerImportWizard.prototype.render = function () {
        return (React.createElement("div", {style: { overflowX: 'auto' }}, this.getCurrentView()));
    };
    LayerImportWizard = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], LayerImportWizard);
    return LayerImportWizard;
}(React.Component));
exports.LayerImportWizard = LayerImportWizard;
