"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var oldHTML;
var TextEditor = (function (_super) {
    __extends(TextEditor, _super);
    function TextEditor() {
        _super.apply(this, arguments);
    }
    TextEditor.prototype.componentWillMount = function () {
        this.state = { html: this.props.content ? this.props.content : '' };
    };
    TextEditor.prototype.emitChange = function () {
        var editor = this.refs['editor'];
        var newHtml = editor.innerHTML;
        if (newHtml !== oldHTML) {
            oldHTML = newHtml;
            this.props.onChange({
                target: {
                    value: newHtml
                }
            });
        }
    };
    TextEditor.prototype.shouldComponentUpdate = function (nextProps) {
        return nextProps.content !== oldHTML;
    };
    TextEditor.prototype.addLink = function () {
        var linkURL = prompt('Enter a URL:', 'http://');
        if (linkURL !== null) {
            var selection = document.getSelection().toString();
            var linkText = selection === '' ? prompt('Enter the link text:', linkURL) : selection;
            if (linkText != null)
                this.execCommand('insertHTML', '<a href="' + linkURL + '" target="_blank">' + linkText + '</a>');
        }
    };
    TextEditor.prototype.execCommand = function (command, arg) {
        document.execCommand(command, false, arg);
    };
    TextEditor.prototype.render = function () {
        var buttonSpacing = { marginRight: 2 }, toolbarStyle = { marginBottom: 3 };
        return (React.createElement("div", null, 
            React.createElement("div", {style: toolbarStyle}, 
                React.createElement("div", {style: buttonSpacing}, 
                    React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.execCommand.bind(this, 'bold')}, 
                        React.createElement("i", {className: "fa fa-bold"})
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.execCommand.bind(this, 'italic')}, 
                        React.createElement("i", {className: "fa fa-italic"})
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.execCommand.bind(this, 'underline')}, 
                        React.createElement("i", {className: "fa fa-underline"})
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.execCommand.bind(this, 'insertOrderedList')}, 
                        React.createElement("i", {className: "fa fa-list-ol"})
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.execCommand.bind(this, 'insertUnorderedList')}, 
                        React.createElement("i", {className: "fa fa-list-ul"})
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default btn-xs", onClick: this.addLink.bind(this)}, 
                        React.createElement("i", {className: "fa fa-link"})
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default btn-xs", onClick: this.execCommand.bind(this, 'removeFormat')}, 
                        React.createElement("i", {className: "fa fa-eraser"})
                    ))
            ), 
            React.createElement("div", __assign({ref: "editor", className: "form-control"}, this.props, {contentEditable: true, dangerouslySetInnerHTML: { __html: this.props.content }, onInput: this.emitChange.bind(this)}))));
    };
    return TextEditor;
}(React.Component));
exports.TextEditor = TextEditor;
;
