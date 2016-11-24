"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var DemoPreview = (function (_super) {
    __extends(DemoPreview, _super);
    function DemoPreview() {
        _super.apply(this, arguments);
    }
    DemoPreview.prototype.loadClicked = function () {
        this.props.loadDemo();
    };
    DemoPreview.prototype.render = function () {
        var style = {
            height: '100%',
            width: '100%',
            display: 'inline-flex',
            position: 'relative',
            MozUserSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            overflowX: 'hidden'
        };
        var overlayStyle = {
            border: '1px solid #c1c1c1',
            borderRadius: 15,
            position: 'absolute',
            maxWidth: 400,
            whiteSpace: 'normal',
            zIndex: 90,
            background: 'white',
            bottom: 0,
            left: 0,
        };
        return (React.createElement("div", {style: style}, 
            React.createElement("img", {className: 'demoImage', src: this.props.imageURL}), 
            React.createElement("div", {style: overlayStyle}, 
                this.props.description, 
                React.createElement("button", {className: 'primaryButton', style: { display: 'block', margin: '0 auto' }, onClick: this.loadClicked.bind(this)}, this.props.strings.demoLoadButton))));
    };
    return DemoPreview;
}(React.Component));
exports.DemoPreview = DemoPreview;
