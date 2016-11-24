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
var Select = require('react-select');
var ClusterMenu = (function (_super) {
    __extends(ClusterMenu, _super);
    function ClusterMenu() {
        _super.apply(this, arguments);
    }
    ClusterMenu.prototype.render = function () {
        var strings = this.props.state.strings;
        var layer = this.props.state.editingLayer;
        var menuState = this.props.state.clusterMenuState;
        var options = layer.clusterOptions;
        var hoverHeader = menuState.selectedHeader ? options.hoverHeaders.filter(function (f) { return f.headerId == menuState.selectedHeader.id; })[0] : undefined;
        return (React.createElement("div", {className: 'makeMaps-options'}, 
            React.createElement("label", {htmlFor: 'useClustering'}, 
                strings.useClustering, 
                React.createElement("input", {id: 'useClustering', type: 'checkbox', checked: options.useClustering, onChange: function (e) {
                    var val = e.currentTarget.checked;
                    if (options.useClustering != val) {
                        options.useClustering = val;
                        layer.reDraw();
                    }
                }})), 
            options.useClustering ?
                React.createElement("div", null, 
                    React.createElement("label", {htmlFor: 'useDefaultStyle'}, 
                        strings.clusterUseSymbolStyle, 
                        React.createElement("input", {id: 'useDefaultStyle', type: 'checkbox', checked: options.useSymbolStyle, onChange: function (e) {
                            options.useSymbolStyle = e.currentTarget.checked;
                            layer.refreshCluster();
                        }})), 
                    React.createElement("label", {htmlFor: 'showCount'}, 
                        strings.clusterShowCount, 
                        React.createElement("input", {id: 'showCount', type: 'checkbox', checked: options.showCount, onChange: function (e) {
                            options.showCount = e.currentTarget.checked;
                            layer.refreshCluster();
                        }})), 
                    options.showCount ?
                        React.createElement("div", null, 
                            React.createElement("span", null, strings.displayText), 
                            React.createElement("input", {type: 'text', style: { width: '100%' }, value: options.countText, onChange: function (e) {
                                options.countText = e.target.value;
                                layer.refreshCluster();
                            }}))
                        : null, 
                    strings.clusterInfo, 
                    React.createElement(Select, {options: layer.numberHeaders, onChange: function (e) { menuState.selectedHeader = e; }, value: menuState.selectedHeader, clearable: true}), 
                    menuState.selectedHeader ?
                        React.createElement("div", null, 
                            React.createElement("label", {htmlFor: 'showAvg'}, 
                                strings.clusterShowAvg, 
                                React.createElement("input", {id: 'showAvg', type: 'checkbox', checked: hoverHeader ? hoverHeader.showAvg : false, onChange: function (e) {
                                    var val = e.currentTarget.checked;
                                    if (hoverHeader && val)
                                        hoverHeader.showAvg = val;
                                    else if (hoverHeader && !val) {
                                        if (!hoverHeader.showSum)
                                            options.hoverHeaders = options.hoverHeaders.filter(function (f) { return f.headerId != menuState.selectedHeader.id; });
                                    }
                                    else if (val && !hoverHeader) {
                                        options.hoverHeaders.push({ headerId: menuState.selectedHeader.id, showAvg: val, showSum: false, avgText: menuState.selectedHeader.label + ' avg: ', sumText: menuState.selectedHeader.label + ' sum: ' });
                                    }
                                    layer.refreshCluster();
                                }})), 
                            hoverHeader && hoverHeader.showAvg ?
                                React.createElement("div", null, 
                                    React.createElement("span", null, strings.displayText), 
                                    React.createElement("input", {type: 'text', style: { width: '100%' }, value: hoverHeader.avgText, onChange: function (e) {
                                        hoverHeader.avgText = e.target.value;
                                        layer.refreshCluster();
                                    }}))
                                : null, 
                            React.createElement("label", {htmlFor: 'showSum'}, 
                                strings.clusterShowSum, 
                                React.createElement("input", {id: 'showSum', type: 'checkbox', checked: hoverHeader ? hoverHeader.showSum : false, onChange: function (e) {
                                    var val = e.currentTarget.checked;
                                    if (hoverHeader && val)
                                        hoverHeader.showSum = val;
                                    else if (hoverHeader && !val) {
                                        if (!hoverHeader.showAvg)
                                            options.hoverHeaders = options.hoverHeaders.filter(function (f) { return f.headerId != menuState.selectedHeader.id; });
                                    }
                                    else if (val && !hoverHeader) {
                                        options.hoverHeaders.push({ headerId: menuState.selectedHeader.id, showSum: val, showAvg: false, avgText: menuState.selectedHeader.label + ' avg: ', sumText: menuState.selectedHeader.label + ' sum: ' });
                                    }
                                    layer.refreshCluster();
                                }})), 
                            hoverHeader && hoverHeader.showSum ?
                                React.createElement("div", null, 
                                    React.createElement("span", null, strings.displayText), 
                                    React.createElement("input", {type: 'text', style: { width: '100%' }, value: hoverHeader.sumText, onChange: function (e) {
                                        hoverHeader.sumText = e.target.value;
                                        layer.refreshCluster();
                                    }}))
                                : null)
                        : React.createElement("i", null, strings.clusterInfoHelpText)) :
                React.createElement("div", null, 
                    React.createElement("i", null, strings.clusterHelpText)
                )));
    };
    ClusterMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], ClusterMenu);
    return ClusterMenu;
}(React.Component));
exports.ClusterMenu = ClusterMenu;
