"use strict";
var Papa = require('papaparse');
var csv2geojson = require('csv2geojson');
var proj4 = require('proj4');
var togeojson = require('togeojson');
var wkt = require('wellknown');
var osmtogeojson = require('osmtogeojson');
var Layer_1 = require('../stores/Layer');
var common_1 = require('../common_items/common');
function ParseHeadersFromCSV(input) {
    var headers = [];
    var delim = '';
    var parse = Papa.parse(input, { preview: 1, header: true });
    delim = parse.meta.delimiter;
    for (var _i = 0, _a = parse.meta.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        if (common_1.IsNumber(field)) {
            headers = [];
            return { headers: headers, delim: delim };
        }
        headers.push({ name: field, type: common_1.IsNumber(parse.data[0][field]) ? 'number' : 'string' });
    }
    return { headers: headers, delim: delim };
}
exports.ParseHeadersFromCSV = ParseHeadersFromCSV;
function ParseCSVToGeoJSON(input, latField, lonField, delim, headers, onComplete) {
    csv2geojson.csv2geojson(input, {
        latfield: latField,
        lonfield: lonField,
        delimiter: delim
    }, function (err, data) {
        if (!err) {
            onComplete(data);
        }
        else {
            console.log(err);
        }
    });
}
exports.ParseCSVToGeoJSON = ParseCSVToGeoJSON;
function ParseToGeoJSON(input, fileFormat, onComplete) {
    var geoJSON = null;
    if (fileFormat === 'wkt') {
        onComplete(wkt(input));
        return;
    }
    var xml = stringToXML(input);
    if (fileFormat === 'kml') {
        geoJSON = togeojson.kml(xml);
    }
    else if (fileFormat === 'gpx') {
        geoJSON = togeojson.gpx(xml);
    }
    else if (fileFormat === 'osm') {
        geoJSON = osmtogeojson(xml);
    }
    onComplete(geoJSON);
}
exports.ParseToGeoJSON = ParseToGeoJSON;
function ParseTableToGeoJSON(input, onComplete) {
    var geoJSON = { features: [], type: 'FeatureCollection' };
    var count = input.loc.length;
    var fields = [];
    for (var key in input) {
        if (input.hasOwnProperty(key) && key != 'loc')
            fields.push(key);
    }
    for (var i = 0; i < count; i++) {
        var props = {};
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            props[field] = input[field][i] == null ? null : input[field][i];
        }
        geoJSON.features.push({
            geometry: {
                type: 'Point',
                coordinates: input.loc[i]
            },
            properties: props,
            type: 'Feature'
        });
    }
    onComplete(geoJSON);
}
exports.ParseTableToGeoJSON = ParseTableToGeoJSON;
function SetGeoJSONTypes(geoJSON, headers) {
    var headerId = 0;
    for (var _i = 0, _a = geoJSON.features; _i < _a.length; _i++) {
        var i = _a[_i];
        var props = geoJSON.features ? i.properties : {};
        var _loop_1 = function(h) {
            var isnumber = common_1.IsNumber(props[h]);
            if (isnumber && props[h] != null)
                props[h] = +props[h];
            var header = headers.slice().filter(function (e) { return e.value === h; })[0];
            if (!header) {
                headers.push(new Layer_1.Header({ id: headerId, value: h, type: isnumber ? 'number' : 'string', label: undefined, decimalAccuracy: undefined }));
                headerId++;
            }
            else {
                if (header.type === 'number' && !isnumber) {
                    header.type = 'string';
                }
            }
        };
        for (var _b = 0, _c = Object.keys(props); _b < _c.length; _b++) {
            var h = _c[_b];
            _loop_1(h);
        }
    }
    return geoJSON;
}
exports.SetGeoJSONTypes = SetGeoJSONTypes;
function stringToXML(oString) {
    return (new DOMParser()).parseFromString(oString, "text/xml");
}
function ProjectCoords(geoJSON, fromProj) {
    geoJSON.features.forEach(function (feature) {
        var x = feature.geometry.coordinates[0];
        var y = feature.geometry.coordinates[1];
        var convert = proj4(fromProj, 'WGS84', [x, y]);
        feature.geometry.coordinates[1] = convert[1];
        feature.geometry.coordinates[0] = convert[0];
    });
    return geoJSON;
}
exports.ProjectCoords = ProjectCoords;
