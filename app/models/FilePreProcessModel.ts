import * as Papa from 'papaparse';
let csv2geojson = require('csv2geojson');
let proj4 = require('proj4');
let togeojson = require('togeojson');
let wkt = require('wellknown');
let osmtogeojson = require('osmtogeojson');
import { Header } from '../stores/Layer';
import { IsNumber } from '../common_items/common';
//  declare function shp(any): { any }
/**
 * public - Returns the headers from the input text
 *
 * @param  {string} input         the whole input as string
 * @return {[{string, string}[], string]}   tuple containing headers in an array and the delimiter
 */
function ParseHeadersFromCSV(input: string) {
    let headers: { name: string, type: 'number' | 'string' }[] = [];
    let delim: string = '';

    let parse = Papa.parse(input, { preview: 1, header: true });
    delim = parse.meta.delimiter;
    for (let field of parse.meta.fields) {
        if (IsNumber(field)) {
            headers = [];
            return { headers: headers, delim: delim };
        }
        headers.push({ name: field, type: IsNumber(parse.data[0][field]) ? 'number' : 'string' });
    }

    return { headers: headers, delim: delim };
}



/**
 * public - Converts input csv data into GeoJSON object
 */
function ParseCSVToGeoJSON(input: string, latField: string, lonField: string, delim: string, headers: Header[], onComplete: (geoJSON) => void) {
    csv2geojson.csv2geojson(input, {
        latfield: latField,
        lonfield: lonField,
        delimiter: delim
    },
        function(err, data) {
            if (!err) {
                onComplete(data);
            }
            else {
                // TODO
                console.log(err);
            }
        });
}


function ParseToGeoJSON(input: string, fileFormat: string, onComplete: (geoJSON) => void) {
    let geoJSON: { features: any[], type: string } = null;
    if (fileFormat === 'wkt') {
        onComplete(wkt(input));
        return;
    }
    let xml = stringToXML(input);
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

function ParseTableToGeoJSON(input, onComplete: (geoJSON) => void) {
    let geoJSON = { features: [], type: 'FeatureCollection' };
    let count = input.loc.length;
    let fields: string[] = [];
    for (let key in input) {

        if (input.hasOwnProperty(key) && key !== 'loc')
            fields.push(key);
    }

    for (let i = 0; i < count; i++) {
        let props = {};
        for (let field of fields) {
            props[field] = input[field][i] === null ? null : input[field][i];
        }
        geoJSON.features.push({
            geometry: {
                type: 'Point', // TODO: other types
                coordinates: input.loc[i]
            },
            properties: props,
            type: 'Feature'
        });
    }
    onComplete(geoJSON);
}

function SetGeoJSONTypes(geoJSON: { features: any, type: string }, headers: Header[]) {
    let headerId = 0;
    for (let i of geoJSON.features) {
        let props = geoJSON.features ? i.properties : {};
        for (let h of Object.keys(props)) {
            let isnumber = IsNumber(props[h]);
            if (isnumber && props[h] != null)
                props[h] = +props[h];
            let header = headers.slice().filter(function(e) { return e.value === h; })[0];

            if (!header) {
                headers.push(new Header({ id: headerId, value: h, type: isnumber ? 'number' : 'string', label: undefined, decimalAccuracy: undefined }));
                headerId++;
            }
            else {
                if (header.type === 'number' && !isnumber) { // previously marked as number but new value is text => mark as string
                    header.type = 'string';
                }
            }
        }

    }
    return geoJSON;

}

function stringToXML(oString) {
    return (new DOMParser()).parseFromString(oString, 'text/xml');
}



/**
 * private - Projects the coordinates from original projection to WGS84
 *
 * @param  geoJSON    The GeoJSON object
 * @param  fromProj   Original projection name
 * @return            The projected L.GeoJSON
 */
function ProjectCoords(geoJSON, fromProj: string) {
    geoJSON.features.forEach(feature => {
        let x = feature.geometry.coordinates[0];
        let y = feature.geometry.coordinates[1];
        let convert = proj4(fromProj, 'WGS84', [x, y]);
        feature.geometry.coordinates[1] = convert[1];
        feature.geometry.coordinates[0] = convert[0];
    });
    return geoJSON;

}

export { ParseHeadersFromCSV, ParseCSVToGeoJSON, ParseTableToGeoJSON, ParseToGeoJSON, ProjectCoords, SetGeoJSONTypes }
