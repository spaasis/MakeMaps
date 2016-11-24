"use strict";
var Filter_1 = require('../stores/Filter');
var Layer_1 = require('../stores/Layer');
var Legend_1 = require('../stores/Legend');
var DefaultProjections = ['WGS84', 'EPSG:4269', 'EPSG:3857', 'ETRS-GK25FIN'];
exports.DefaultProjections = DefaultProjections;
function GetSymbolRadius(val, sizeMultiplier, minSize, maxSize) {
    var r = Math.sqrt(val * sizeMultiplier / 4) * 2;
    if (r <= minSize)
        return minSize;
    else if (r >= maxSize)
        return maxSize;
    return r;
}
exports.GetSymbolRadius = GetSymbolRadius;
function ShowLoading() {
    document.getElementById('loading').style.display = 'flex';
}
exports.ShowLoading = ShowLoading;
function HideLoading() {
    document.getElementById('loading').style.display = 'none';
}
exports.HideLoading = HideLoading;
function ShowNotification(text) {
    document.getElementById('notificationText').innerText = text;
    document.getElementById('notification').style.display = 'block';
}
exports.ShowNotification = ShowNotification;
function HideNotification() {
    document.getElementById('notification').style.display = 'none';
}
exports.HideNotification = HideNotification;
function CalculateLimits(min, max, count, accuracy) {
    var limits = [];
    for (var i = +min; i < max; i += (max - min) / count) {
        var val = +i.toFixed(accuracy);
        if (limits.indexOf(val) === -1)
            limits.push(val);
    }
    return limits;
}
exports.CalculateLimits = CalculateLimits;
function GetItemBetweenLimits(limits, items, value) {
    if (value != null && !isNaN(value)) {
        if (limits.length > 0)
            for (var i = 0; i < limits.length; i++) {
                if (i < limits.length - 1) {
                    var lowerLimit = limits[i];
                    var upperLimit = limits[i + 1];
                    if (lowerLimit <= value && value < upperLimit) {
                        return items[i];
                    }
                }
                else {
                    return items[items.length - 1];
                }
            }
        else {
            return items[0];
        }
    }
}
exports.GetItemBetweenLimits = GetItemBetweenLimits;
function FetchSavedMap(path, appState) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open('GET', path, true);
    }
    else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open('GET', path);
    }
    else {
        xhr = null;
    }
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status == 0) {
                LoadSavedMap(JSON.parse(xhr.responseText), appState);
            }
        }
    };
    xhr.onerror = function () { console.log('Embedding error in XHR request'); };
    xhr.send();
}
exports.FetchSavedMap = FetchSavedMap;
function LoadSavedMap(saved, appState) {
    window.location.hash = 'edit';
    console.time("LoadSavedMap");
    var headers;
    if (saved.baseLayerId) {
        var oldBase = appState.activeBaseLayer;
        if (saved.baseLayerId !== oldBase.id) {
            var newBase = { id: saved.baseLayerId, layer: appState.baseLayers.filter(function (l) { return l.id === saved.baseLayerId; })[0].layer };
            if (newBase) {
                appState.map.removeLayer(oldBase.layer);
                appState.map.addLayer(newBase.layer);
                appState.activeBaseLayer = newBase;
            }
        }
    }
    for (var _i = 0, _a = saved.layers; _i < _a.length; _i++) {
        var lyr = _a[_i];
        var newLayer = new Layer_1.Layer(appState, lyr);
        newLayer.headers = [];
        for (var _b = 0, _c = lyr.headers; _b < _c.length; _b++) {
            var j = _c[_b];
            newLayer.headers.push(new Layer_1.Header(j));
        }
        newLayer.colorOptions.colorField = newLayer.getHeaderById(lyr.colorOptions['colorHeaderId']);
        newLayer.symbolOptions.iconField = newLayer.getHeaderById(lyr.symbolOptions['iconHeaderId']);
        newLayer.symbolOptions.blockSizeVar = newLayer.getHeaderById(lyr.symbolOptions['blockHeaderId']);
        newLayer.symbolOptions.sizeXVar = newLayer.getHeaderById(lyr.symbolOptions['xHeaderId']);
        newLayer.symbolOptions.sizeYVar = newLayer.getHeaderById(lyr.symbolOptions['yHeaderId']);
        appState.layers.push(newLayer);
        if (newLayer.layerType === Layer_1.LayerTypes.HeatMap)
            appState.heatLayerOrder.push({ id: newLayer.id });
        else
            appState.standardLayerOrder.push({ id: newLayer.id });
        appState.currentLayerId = Math.max(appState.currentLayerId, lyr.id);
    }
    appState.currentLayerId++;
    var layers = appState.layers;
    saved.filters.map(function (f) {
        appState.filters.push(new Filter_1.Filter(appState, f));
    });
    for (var i in appState.layers.slice()) {
        var lyr = appState.layers[i];
        lyr.init();
    }
    appState.legend = new Legend_1.Legend(saved.legend);
    appState.welcomeShown = false;
    appState.editingLayer = appState.layers[0];
    appState.menuShown = !appState.embed;
    console.timeEnd("LoadSavedMap");
}
exports.LoadSavedMap = LoadSavedMap;
function IsNumber(val) {
    return val == '' || !isNaN(+val);
}
exports.IsNumber = IsNumber;
