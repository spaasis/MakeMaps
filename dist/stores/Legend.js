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
var Legend = (function () {
    function Legend(prev) {
        this.title = prev && prev.title || "";
        this.meta = prev && prev.meta || "";
        this.horizontal = prev && prev.horizontal !== undefined ? prev.horizontal : true;
        this.visible = prev && prev.visible !== undefined ? prev.visible : true;
        this.showPercentages = prev && prev.showPercentages || false;
        this.showVariableNames = prev && prev.showVariableNames || false;
        this.top = prev && prev.top !== undefined ? prev.top : false;
        this.bottom = prev && prev.bottom !== undefined ? prev.bottom : true;
        this.left = prev && prev.left !== undefined ? prev.left : true;
        this.right = prev && prev.right !== undefined ? prev.right : false;
    }
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], Legend.prototype, "title", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', String)
    ], Legend.prototype, "meta", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "horizontal", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "visible", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "showPercentages", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "showVariableNames", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "top", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "bottom", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "left", void 0);
    __decorate([
        mobx_1.observable, 
        __metadata('design:type', Boolean)
    ], Legend.prototype, "right", void 0);
    return Legend;
}());
exports.Legend = Legend;
