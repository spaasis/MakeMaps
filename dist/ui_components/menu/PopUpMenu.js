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
var mobx_react_1 = require('mobx-react');
var PopUpMenu = (function (_super) {
    __extends(PopUpMenu, _super);
    function PopUpMenu() {
        var _this = this;
        _super.apply(this, arguments);
        this.onSelectionChange = function (headers) {
            var layer = _this.props.state.editingLayer;
            if (headers === null)
                headers = [];
            layer.popupHeaderIds = [];
            for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                var header = headers_1[_i];
                layer.popupHeaderIds.push(header.id);
            }
            if (_this.props.state.autoRefresh)
                layer.refreshPopUps();
        };
    }
    PopUpMenu.prototype.saveValues = function () {
        this.props.state.editingLayer.refreshPopUps();
    };
    PopUpMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        var layer = this.props.state.editingLayer;
        var headers = [];
        for (var _i = 0, _a = layer.popupHeaderIds; _i < _a.length; _i++) {
            var id = _a[_i];
            headers.push(layer.getHeaderById(id));
        }
        return (React.createElement("div", {className: "makeMaps-options"}, 
            React.createElement("label", null, strings.selectHeadersToShow), 
            React.createElement(Select, {options: layer.headers.slice(), multi: true, onChange: this.onSelectionChange, value: headers, backspaceRemoves: false, placeholder: strings.selectPlaceholder}), 
            React.createElement("div", null, 
                React.createElement("label", {htmlFor: 'click'}, 
                    strings.showPopupOnClick, 
                    React.createElement("input", {type: 'radio', onChange: function () {
                        layer.showPopUpOnHover = false;
                        if (_this.props.state.autoRefresh)
                            layer.refreshPopUps();
                    }, checked: !layer.showPopUpOnHover, name: 'openMethod', id: 'click'})), 
                React.createElement("br", null), 
                strings.or, 
                React.createElement("br", null), 
                React.createElement("label", {htmlFor: 'hover', style: { marginTop: 0 }}, 
                    strings.showPopUpOnHover, 
                    React.createElement("input", {type: 'radio', onChange: function () {
                        layer.showPopUpOnHover = true;
                        if (_this.props.state.autoRefresh)
                            layer.refreshPopUps();
                    }, checked: layer.showPopUpOnHover, name: 'openMethod', id: 'hover'})), 
                React.createElement("br", null), 
                React.createElement("label", {htmlFor: 'inPlace'}, 
                    strings.showPopUpInPlace, 
                    React.createElement("input", {type: 'radio', onChange: function () {
                        layer.showPopUpInPlace = true;
                        if (_this.props.state.autoRefresh)
                            layer.refreshPopUps();
                    }, checked: layer.showPopUpInPlace, name: 'placement', id: 'inPlace'})), 
                React.createElement("br", null), 
                strings.or, 
                React.createElement("br", null), 
                React.createElement("label", {htmlFor: 'separate', style: { marginTop: 0 }}, 
                    strings.showPopUpUpTop, 
                    React.createElement("input", {type: 'radio', onChange: function () {
                        layer.showPopUpInPlace = false;
                        if (_this.props.state.autoRefresh)
                            layer.refreshPopUps();
                    }, checked: !layer.showPopUpInPlace, name: 'placement', id: 'separate'}))), 
            this.props.state.autoRefresh ? null :
                React.createElement("button", {className: 'menuButton', onClick: function () {
                    _this.saveValues();
                }}, strings.refreshMap), 
            React.createElement("br", null), 
            React.createElement("i", null, strings.popupHelp), 
            layer.clusterOptions.useClustering ?
                React.createElement("div", null, 
                    React.createElement("i", null, strings.popupClusterHelp)
                )
                : null));
    };
    PopUpMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], PopUpMenu);
    return PopUpMenu;
}(React.Component));
exports.PopUpMenu = PopUpMenu;
