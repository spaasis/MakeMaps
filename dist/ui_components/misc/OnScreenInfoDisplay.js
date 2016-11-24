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
var mobx_react_1 = require('mobx-react');
var OnScreenInfoDisplay = (function (_super) {
    __extends(OnScreenInfoDisplay, _super);
    function OnScreenInfoDisplay() {
        _super.apply(this, arguments);
    }
    OnScreenInfoDisplay.prototype.render = function () {
        var _this = this;
        return !this.props.state.infoScreenText ? null :
            React.createElement("div", {style: { position: 'absolute', top: 2, left: '50%', transform: 'translate(-50%, 0)', zIndex: 600 }, className: 'leaflet-popup-content-wrapper'}, 
                React.createElement("a", {className: "leaflet-popup-close-button", onClick: function () { _this.props.state.infoScreenText = null; }}, "x"), 
                React.createElement("div", {className: 'leaflet-popup-content', dangerouslySetInnerHTML: { __html: this.props.state.infoScreenText }}));
    };
    OnScreenInfoDisplay = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], OnScreenInfoDisplay);
    return OnScreenInfoDisplay;
}(React.Component));
exports.OnScreenInfoDisplay = OnScreenInfoDisplay;
