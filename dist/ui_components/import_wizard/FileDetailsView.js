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
var Select = require('react-select');
var coords;
var common_1 = require("../../common_items/common");
var mobx_react_1 = require('mobx-react');
var FileDetailsView = (function (_super) {
    __extends(FileDetailsView, _super);
    function FileDetailsView() {
        var _this = this;
        _super.apply(this, arguments);
        this.activeLayer = this.props.state.layer;
        this.proceed = function () {
            var element = document.getElementById('customProj');
            var custom = element ? element.value : '';
            _this.props.state.coordinateSystem = _this.props.state.useCustomProjection && custom !== _this.props.strings.customProjectionPrompt ? custom : _this.props.state.coordinateSystem;
            _this.props.saveValues();
        };
    }
    FileDetailsView.prototype.componentWillMount = function () {
        coords = [];
        for (var i = 0; i < common_1.DefaultProjections.length; i++) {
            var val = common_1.DefaultProjections[i];
            coords[i] = { value: val, label: val };
        }
        this.props.state.latitudeField = this.props.state.isGeoJSON ? '' : this.activeLayer.numberHeaders[0].label;
        this.props.state.longitudeField = this.props.state.isGeoJSON ? '' : this.activeLayer.numberHeaders[1].label;
        this.props.state.coordinateSystem = 'WGS84';
    };
    FileDetailsView.prototype.render = function () {
        var _this = this;
        var strings = this.props.strings;
        var state = this.props.state;
        return React.createElement("div", {style: { padding: 20 }}, 
            React.createElement("div", {style: { height: '90%' }}, 
                React.createElement("h2", null, strings.fileDetailsViewHeader), 
                React.createElement("hr", null), 
                state.isGeoJSON ?
                    null :
                    React.createElement("div", null, 
                        React.createElement("label", null, strings.selectLatHeader), 
                        React.createElement(Select, {options: this.activeLayer.numberHeaders, onChange: function (val) {
                            _this.props.state.latitudeField = val ? val.value : '';
                        }, value: state.latitudeField, clearable: false}), 
                        React.createElement("label", null, strings.selectLngHeader), 
                        React.createElement(Select, {options: this.activeLayer.numberHeaders, onChange: function (val) { _this.props.state.longitudeField = val ? val.value : ''; }, value: state.longitudeField, clearable: false})), 
                React.createElement("label", null, strings.selectCoordSystem), 
                React.createElement(Select, {options: coords, onChange: function (val) {
                    state.useCustomProjection = false;
                    state.coordinateSystem = val ? val.value : '';
                }, value: state.coordinateSystem, clearable: false}), 
                React.createElement("p", null, strings.coordSystemHelp), 
                state.useCustomProjection ?
                    React.createElement("div", null, 
                        React.createElement("p", null, 
                            strings.coordSystemMissing, 
                            React.createElement("a", {href: 'http://spatialreference.org/ref/'}, "Spatial Reference")), 
                        React.createElement("input", {id: 'customProj', defaultValue: strings.customProjectionPrompt, style: { width: 400 }}))
                    :
                        React.createElement("button", {className: 'primaryButton', style: { width: 'auto' }, onClick: function () { state.useCustomProjection = true; }}, strings.useCustomProjectionButton)), 
            React.createElement("button", {className: 'secondaryButton', style: { position: 'absolute', left: 15, bottom: 15 }, onClick: this.props.goBack}, strings.previous), 
            React.createElement("button", {className: 'primaryButton', disabled: !state.coordinateSystem || (!state.isGeoJSON && (!state.latitudeField || !state.longitudeField)), style: { position: 'absolute', right: 15, bottom: 15 }, onClick: this.proceed}, strings.finishImport));
    };
    FileDetailsView = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], FileDetailsView);
    return FileDetailsView;
}(React.Component));
exports.FileDetailsView = FileDetailsView;
