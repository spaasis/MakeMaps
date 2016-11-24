"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var MenuEntry = (function (_super) {
    __extends(MenuEntry, _super);
    function MenuEntry() {
        _super.apply(this, arguments);
    }
    MenuEntry.prototype.render = function () {
        var _this = this;
        if (this.props.hide)
            return null;
        else
            return React.createElement("div", {className: 'menuHeaderDiv', style: { backgroundColor: this.props.active ? '#ededed' : '#fefefe' }, onClick: function () { return _this.props.onClick(_this.props.id); }}, 
                React.createElement("i", {className: "menuHeader fa fa-" + this.props.fa}), 
                React.createElement("div", {className: 'menuHover'}, 
                    React.createElement("span", {className: 'rotate'}, this.props.text)
                ));
    };
    return MenuEntry;
}(React.Component));
exports.MenuEntry = MenuEntry;
