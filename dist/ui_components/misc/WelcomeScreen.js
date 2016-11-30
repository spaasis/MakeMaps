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
var DemoPreview_1 = require('./DemoPreview');
var Dropzone = require('react-dropzone');
var common_1 = require('../../common_items/common');
var States_1 = require('../../stores/States');
require('../../../styles/flags32.css');
var mobx_react_1 = require('mobx-react');
var WelcomeScreen = (function (_super) {
    __extends(WelcomeScreen, _super);
    function WelcomeScreen() {
        _super.apply(this, arguments);
    }
    WelcomeScreen.prototype.componentDidMount = function () {
        this.stopScrolling();
        this.startScrolling();
    };
    WelcomeScreen.prototype.startScrolling = function () {
        this.props.state.scroller = setInterval(this.moveDemosLeft.bind(this), 6000);
    };
    WelcomeScreen.prototype.stopScrolling = function () {
        clearInterval(this.props.state.scroller);
    };
    WelcomeScreen.prototype.loadDemo = function (filename) {
        common_1.ShowLoading();
        var appState = this.props.appState;
        setTimeout(function () { common_1.FetchSavedMap('demos/' + filename + '.mmap', appState); }, 10);
    };
    WelcomeScreen.prototype.moveDemosLeft = function () {
        var order = this.props.state.demoOrder;
        var first = order.shift();
        order.push(first);
    };
    WelcomeScreen.prototype.moveDemosRight = function () {
        var order = this.props.state.demoOrder;
        var last = order.pop();
        order.unshift(last);
    };
    WelcomeScreen.prototype.highlightDemo = function (index) {
        var order = this.props.state.demoOrder;
        while (order.indexOf(index) > 0) {
            this.moveDemosLeft();
        }
    };
    WelcomeScreen.prototype.onDrop = function (files) {
        var reader = new FileReader();
        var fileName, content;
        var state = this.props.state;
        var load = this.loadMap.bind(this);
        reader.onload = contentUploaded.bind(this);
        files.forEach(function (file) {
            fileName = file.name;
            reader.readAsText(file);
        });
        function contentUploaded(e) {
            var contents = e.target;
            var ext = fileName.split('.').pop().toLowerCase();
            if (ext === 'mmap') {
                state.loadedMap = JSON.parse(contents.result);
                state.fileName = fileName;
                load();
            }
            else {
                common_1.ShowNotification('Select a .mmap file!');
            }
        }
    };
    WelcomeScreen.prototype.loadMap = function () {
        common_1.ShowLoading();
        var json = this.props.state.loadedMap;
        var appState = this.props.appState;
        setTimeout(function () { common_1.LoadSavedMap(json, appState); }, 10);
    };
    WelcomeScreen.prototype.render = function () {
        var _this = this;
        var strings = this.props.appState.strings;
        var blockHeaderStyle = { display: 'block', fontFamily: 'dejavu_sansextralight' };
        var infoDivStyle = { width: 200, border: '1px solid #cecece', borderRadius: '15px', padding: 10 };
        var flags = React.createElement("div", {style: { position: 'absolute', top: 5, left: 5 }, className: 'f32'}, 
            React.createElement("i", {className: 'flag gb', onClick: function () { _this.props.changeLanguage('en'); }, style: { cursor: 'pointer', borderBottom: this.props.appState.language == 'en' ? '2px solid #cecece' : '' }}), 
            React.createElement("i", {className: 'flag fi', onClick: function () { _this.props.changeLanguage('fi'); }, style: { cursor: 'pointer', borderBottom: this.props.appState.language == 'fi' ? '2px solid #cecece' : '' }}));
        var infoBlocks = React.createElement("div", {style: { display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '85%' }}, 
            React.createElement("div", {style: infoDivStyle}, 
                React.createElement("b", {style: blockHeaderStyle}, strings.welcomeOpenness), 
                React.createElement("a", {style: { textDecoration: 'none' }, target: "_blank", rel: "noopener noreferrer", href: "https://github.com/simopaasisalo/MakeMaps"}, 
                    React.createElement("i", {className: 'fa fa-github-square', style: { display: 'block', fontSize: '80px', color: '#cecece' }})
                ), 
                strings.welcomeOpennessText1, 
                React.createElement("br", null), 
                strings.welcomeOpennessText2, 
                React.createElement("a", {target: "_blank", rel: "noopener noreferrer", href: "https://github.com/simopaasisalo/MakeMaps"}, "GitHub")), 
            React.createElement("div", {style: infoDivStyle}, 
                React.createElement("b", {style: blockHeaderStyle}, strings.welcomeAccessibility), 
                React.createElement("i", {className: 'fa fa-eye', style: { display: 'block', fontSize: '80px', color: '#cecece' }}), 
                strings.welcomeAccessibilityText1, 
                React.createElement("a", {target: "_blank", rel: "noopener noreferrer", href: "http://colorbrewer2.org/"}, "Color Brewer"), 
                strings.welcomeAccessibilityText2), 
            React.createElement("div", {style: infoDivStyle}, 
                React.createElement("b", {style: blockHeaderStyle}, strings.welcomeUsability), 
                React.createElement("i", {className: 'fa fa-bolt', style: { display: 'block', fontSize: '80px', color: '#cecece' }}), 
                strings.welcomeUsabilityText1, 
                " ", 
                React.createElement("a", {target: "_blank", rel: "noopener noreferrer", href: "https://github.com/simopaasisalo/MakeMaps/wiki"}, strings.wiki), 
                " ", 
                strings.welcomeUsabilityText2), 
            React.createElement("div", {style: infoDivStyle}, 
                React.createElement("b", {style: blockHeaderStyle}, strings.welcomeFileSupport), 
                React.createElement("i", {className: 'fa fa-file-text-o', style: { display: 'block', fontSize: '80px', color: '#cecece' }}), 
                strings.welcomeFileSupportText, 
                React.createElement("br", null), 
                React.createElement("a", {target: "_blank", rel: "noopener noreferrer", href: "https://github.com/simopaasisalo/MakeMaps/wiki/Supported-file-types-and-their-requirements"}, strings.welcomeFileSupportLink)), 
            React.createElement("div", {style: infoDivStyle}, 
                React.createElement("b", {style: blockHeaderStyle}, strings.welcomeDataFiltering), 
                React.createElement("i", {className: 'fa fa-sliders', style: { display: 'block', fontSize: '80px', color: '#cecece' }}), 
                strings.welcomeDataFilteringText));
        return (React.createElement("div", {style: { textAlign: 'center' }}, 
            flags, 
            React.createElement("div", {style: { display: 'block', margin: '0 auto', padding: 5 }}, 
                React.createElement("img", {src: 'images/favicon.png', style: { display: 'inline-block', width: 50, height: 50, verticalAlign: 'middle' }}), 
                React.createElement("img", {src: 'images/logo.png', style: { display: 'inline-block', verticalAlign: 'middle' }}), 
                React.createElement("img", {src: 'images/favicon.png', style: { display: 'inline-block', width: 50, height: 50, verticalAlign: 'middle' }})), 
            React.createElement("hr", null), 
            this.getDemoButtons().map(function (d) { return d; }), 
            React.createElement("div", {style: {
                overflowX: 'hidden', overflowY: 'hidden', height: 250, maxWidth: '85%',
                margin: '0 auto', whiteSpace: 'nowrap', position: 'relative'
            }, onMouseEnter: function () { _this.stopScrolling(); }, onMouseLeave: function () { _this.startScrolling(); }}, 
                React.createElement("button", {className: 'primaryButton', style: { height: '100%', width: 40, position: 'absolute', left: 0, top: 0 }, onClick: function () { return _this.moveDemosRight(); }}, '<'), 
                React.createElement("div", {style: { marginLeft: 40, marginRight: 40 }}, this.getHighlightedDemo()), 
                React.createElement("button", {className: 'primaryButton', style: { height: '100%', width: 40, position: 'absolute', right: 0, top: 0 }, onClick: function () { return _this.moveDemosLeft(); }}, '>')), 
            React.createElement("hr", null), 
            React.createElement("div", {style: { display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', padding: 20 }}, 
                React.createElement(Dropzone, {className: 'primaryButton dropButton', style: { width: 300, margin: 5 }, onDrop: this.onDrop.bind(this), accept: '.mmap'}, strings.uploadSavedMap), 
                React.createElement("button", {style: { width: 300, margin: 5 }, className: 'primaryButton', onClick: function () {
                    var state = _this.props.appState;
                    state.importWizardState = new States_1.ImportWizardState(state);
                    state.importWizardShown = true;
                    state.welcomeShown = false;
                    state.menuShown = false;
                }}, strings.createNewMap)), 
            React.createElement("br", null), 
            infoBlocks, 
            React.createElement("br", null)));
    };
    WelcomeScreen.prototype.getDemoButtons = function () {
        var _this = this;
        var buttons = [];
        var _loop_1 = function(i) {
            buttons.push(React.createElement("button", {key: i, className: 'welcomeDemoButton' + (this_1.props.state.demoOrder[0] == i ? ' active' : ''), onClick: function () { _this.highlightDemo(i); }, onMouseEnter: function () { _this.stopScrolling(); }, onMouseLeave: function () { _this.startScrolling(); }}));
        };
        var this_1 = this;
        for (var i = 0; i < this.props.state.demoOrder.length; i++) {
            _loop_1(i);
        }
        return buttons;
    };
    WelcomeScreen.prototype.getHighlightedDemo = function () {
        var _this = this;
        var strings = this.props.appState.strings;
        var demos = [React.createElement(DemoPreview_1.DemoPreview, {key: 0, strings: strings, imageURL: 'demos/chorodemo.png', description: strings.chorodemoDescription, loadDemo: this.loadDemo.bind(this, 'chorodemo'), onClick: function () { _this.highlightDemo(0); }}),
            React.createElement(DemoPreview_1.DemoPreview, {key: 1, strings: strings, imageURL: 'demos/symboldemo.png', description: strings.symboldemoDescription, loadDemo: this.loadDemo.bind(this, 'symboldemo'), onClick: function () { _this.highlightDemo(1); }}),
            React.createElement(DemoPreview_1.DemoPreview, {key: 2, strings: strings, imageURL: 'demos/hki_chartdemo.png', description: strings.chartDemoDescription, loadDemo: this.loadDemo.bind(this, 'hki_chartdemo'), onClick: function () { _this.highlightDemo(2); }}),
            React.createElement(DemoPreview_1.DemoPreview, {key: 3, strings: strings, imageURL: 'demos/hki_heatdemo.png', description: strings.heatDemoDescription, loadDemo: this.loadDemo.bind(this, 'hki_heatdemo'), onClick: function () { _this.highlightDemo(3); }}),
            React.createElement(DemoPreview_1.DemoPreview, {key: 4, strings: strings, imageURL: 'demos/clusterdemo.png', description: strings.clusterDemoDescription, loadDemo: this.loadDemo.bind(this, 'clusterdemo'), onClick: function () { _this.highlightDemo(4); }})];
        return demos[this.props.state.demoOrder[0]];
    };
    WelcomeScreen = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], WelcomeScreen);
    return WelcomeScreen;
}(React.Component));
exports.WelcomeScreen = WelcomeScreen;
