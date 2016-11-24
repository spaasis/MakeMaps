"use strict";
var MakeMapsData = (function () {
    function MakeMapsData() {
        this.projection = 'WGS84';
    }
    return MakeMapsData;
}());
exports.MakeMapsData = MakeMapsData;
var MapOptions = (function () {
    function MapOptions() {
        this.mapCenter = [0, 0];
        this.zoomLevel = 2;
    }
    return MapOptions;
}());
exports.MapOptions = MapOptions;
var ViewOptions = (function () {
    function ViewOptions() {
        this.showMenu = true;
        this.showExportOptions = true;
        this.allowLayerChanges = true;
        this.showWelcomeScreen = true;
    }
    return ViewOptions;
}());
exports.ViewOptions = ViewOptions;
