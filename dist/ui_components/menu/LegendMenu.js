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
var TextEditor_1 = require('../misc/TextEditor');
var Modal = require('react-modal');
var LegendMenu = (function (_super) {
    __extends(LegendMenu, _super);
    function LegendMenu() {
        _super.apply(this, arguments);
    }
    LegendMenu.prototype.render = function () {
        var _this = this;
        var strings = this.props.state.strings;
        var legend = this.props.state.legend;
        return (React.createElement("div", {className: "makeMaps-options"}, 
            React.createElement("label", {htmlFor: 'showLegend'}, 
                strings.showLegend, 
                React.createElement("input", {id: 'showLegend', type: 'checkbox', checked: legend.visible, onChange: function (e) {
                    legend.visible = e.currentTarget.checked;
                }})), 
            React.createElement("br", null), 
            legend.visible ? React.createElement("div", null, 
                React.createElement("label", null, strings.legendTitle), 
                React.createElement("input", {type: 'text', style: { width: '100%' }, value: legend.title, onChange: function (e) {
                    _this.props.state.legend.title = e.target.value;
                }}), 
                React.createElement("br", null), 
                React.createElement("label", null, strings.legendMeta), 
                React.createElement("div", {style: { background: 'white', border: '1px solid #cecece' }}, 
                    React.createElement(TextEditor_1.TextEditor, {style: { width: '100%', minHeight: '80px' }, content: legend.meta, onChange: function (e) {
                        legend.meta = e.target.value;
                    }})
                ), 
                React.createElement("label", {htmlFor: 'showPercentages'}, 
                    strings.legendDistShow, 
                    React.createElement("input", {id: 'showPercentages', type: 'checkbox', checked: legend.showPercentages, onChange: function (e) {
                        _this.props.state.legend.showPercentages = e.currentTarget.checked;
                    }})), 
                React.createElement("br", null), 
                React.createElement("label", {htmlFor: 'showPercentages'}, 
                    strings.legendVarShow, 
                    React.createElement("input", {id: 'showPercentages', type: 'checkbox', checked: legend.showVariableNames, onChange: function (e) {
                        legend.showVariableNames = e.currentTarget.checked;
                    }})), 
                React.createElement("br", null), 
                React.createElement("label", {htmlFor: 'makeHorizontal'}, 
                    strings.legendAlignHorizontal, 
                    React.createElement("input", {id: 'makeHorizontal', type: 'checkbox', checked: legend.horizontal, onChange: function (e) {
                        _this.props.state.legend.horizontal = e.currentTarget.checked;
                    }})), 
                React.createElement("hr", null), 
                React.createElement("label", null, strings.legendPosition), 
                React.createElement("table", {style: { cursor: 'pointer', border: "1px solid #999999", width: 50, height: 50, margin: '0 auto' }}, 
                    React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", {style: {
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.top && legend.left ? "#FFF" : ""
                            }, onClick: function () { legend.top = true; legend.left = true; legend.bottom = false; legend.right = false; }}), 
                            React.createElement("td", {style: {
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.top && legend.right ? "#FFF" : ""
                            }, onClick: function () { legend.top = true; legend.right = true; legend.bottom = false; legend.left = false; }})), 
                        React.createElement("tr", null, 
                            React.createElement("td", {style: {
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.bottom && legend.left ? "#FFF" : ""
                            }, onClick: function () { legend.bottom = true; legend.left = true; legend.top = false; legend.right = false; }}), 
                            React.createElement("td", {style: {
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.bottom && legend.right ? "#FFF" : ""
                            }, onClick: function () { legend.bottom = true; legend.right = true; legend.top = false; legend.left = false; }})))
                )) : null));
    };
    LegendMenu = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], LegendMenu);
    return LegendMenu;
}(React.Component));
exports.LegendMenu = LegendMenu;
