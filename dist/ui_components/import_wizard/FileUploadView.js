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
var Dropzone = require('react-dropzone');
var common_1 = require('../../common_items/common');
var FilePreProcessModel_1 = require('../../models/FilePreProcessModel');
var XLSX = require('xlsx');
var _allowedFileTypes = ['geojson', 'csv', 'gpx', 'kml', 'wkt', 'osm', 'xlsx', 'xlsxm', 'xlsb', 'xls', 'ods'];
var mobx_react_1 = require('mobx-react');
var FileUploadView = (function (_super) {
    __extends(FileUploadView, _super);
    function FileUploadView() {
        var _this = this;
        _super.apply(this, arguments);
        this.onDrop = function (files) {
            var reader = new FileReader();
            var fileName, content;
            var ext;
            reader.onload = contentUploaded.bind(_this);
            files.forEach(function (file) {
                fileName = file.name;
                ext = fileName.split('.').pop().toLowerCase();
                if (ext === 'xlsx' || ext === 'xlsxm' || ext === 'xlsb' || ext === 'xls' || ext === 'ods')
                    reader.readAsBinaryString(file);
                else
                    reader.readAsText(file);
            });
            function contentUploaded(e) {
                var contents = e.target;
                if (_allowedFileTypes.indexOf(ext) !== -1) {
                    this.props.state.content = contents.result;
                    this.props.state.fileName = fileName;
                    this.props.state.layer.name = fileName;
                    this.props.state.fileExtension = ext;
                    this.props.state.layer.geoJSON = undefined;
                    common_1.HideLoading();
                }
                else {
                    common_1.HideLoading;
                    common_1.ShowNotification('File type not yet supported!');
                }
            }
        };
        this.proceed = function () {
            var ext = _this.props.state.fileExtension;
            if (ext === 'xlsx' || ext === 'xlsxm' || ext === 'xlsb' || ext === 'xls' || ext === 'ods') {
                var workbook = XLSX.read(_this.props.state.content, { type: 'binary' });
                _this.props.state.content = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
                ext = 'csv';
            }
            if (ext === 'csv') {
                var res = FilePreProcessModel_1.ParseHeadersFromCSV(_this.props.state.content);
                var headers = res.headers;
                _this.props.state.layer.headers = [];
                if (res.headers.length == 0) {
                    common_1.ShowNotification(_this.props.strings.noHeadersError);
                    common_1.HideLoading();
                    return;
                }
                for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                    var header = headers_1[_i];
                    _this.props.state.layer.headers.push({ id: headers.indexOf(header), value: header.name, label: header.name, type: header.type, decimalAccuracy: 0 });
                }
                _this.props.state.delimiter = res.delim;
            }
            if (_this.props.state.content) {
                _this.props.state.fileExtension = ext;
                _this.props.saveValues();
                common_1.HideLoading();
            }
            else {
                common_1.ShowNotification(_this.props.strings.noFileNotification);
                common_1.HideLoading();
            }
        };
    }
    FileUploadView.prototype.render = function () {
        var _this = this;
        var strings = this.props.strings;
        var layer = this.props.state.layer;
        return (React.createElement("div", {style: { padding: 20 }}, 
            React.createElement("div", null, 
                React.createElement("h2", null, strings.uploadViewHeader), 
                React.createElement("hr", null), 
                React.createElement("p", null, 
                    strings.currentlySupportedTypes, 
                    ": "), 
                React.createElement("p", null, 
                    " GeoJSON, Microsoft Office ", 
                    strings.spreadsheets, 
                    ", OpenDocument ", 
                    strings.spreadsheets, 
                    ", CSV, KML, GPX, WKT, OSM..."), 
                React.createElement("a", {target: "_blank", rel: "noopener noreferrer", href: 'https://github.com/simopaasisalo/MakeMaps/wiki/Supported-file-types-and-their-requirements'}, strings.fileTypeSupportInfo), 
                React.createElement(Dropzone, {className: 'dropZone', onDrop: this.onDrop.bind(this), accept: _allowedFileTypes.map(function (type) { return '.' + type; }).join(', ')}, this.props.state.fileName ? React.createElement("span", null, 
                    React.createElement("i", {className: 'fa fa-check', style: { color: '#549341', fontSize: 17 }}), 
                    " ", 
                    this.props.state.fileName, 
                    " ") : React.createElement("span", null, strings.uploadDropBoxText)), 
                React.createElement("label", null, strings.giveNameToLayer), 
                React.createElement("input", {type: "text", onChange: function (e) {
                    layer.name = e.target.value;
                }, value: layer.name})), 
            React.createElement("button", {className: 'secondaryButton', style: { position: 'absolute', left: 15, bottom: 15 }, onClick: function () {
                _this.props.cancel();
            }}, strings.cancel), 
            React.createElement("button", {className: 'primaryButton', disabled: this.props.state.content === undefined || layer.name === '', style: { position: 'absolute', right: 15, bottom: 15 }, onClick: function () { common_1.ShowLoading(); setTimeout(_this.proceed, 10); }}, strings.continue)));
    };
    FileUploadView = __decorate([
        mobx_react_1.observer, 
        __metadata('design:paramtypes', [])
    ], FileUploadView);
    return FileUploadView;
}(React.Component));
exports.FileUploadView = FileUploadView;
