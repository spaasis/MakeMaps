import * as Papa from 'papaparse';
let csv2geojson = require('csv2geojson');
let proj4 = require('proj4');
let togeojson = require('togeojson');
let wkt = require('wellknown');
let osmtogeojson = require('osmtogeojson');
import { IHeader } from '../stores/Layer';
// declare function shp(any): { any }
export class FilePreProcessModel {


    /**
     * public - Returns the headers from the input text
     *
     * @param  {string} input         the whole input as string
     * @return {[{string, string}[], string]}   tuple containing headers in an array and the delimiter
     */
    public ParseHeadersFromCSV(input: string) {
        let headers: { name: string, type: string }[] = [];
        let delim: string = '';

        let parse = Papa.parse(input, { preview: 1, header: true });
        for (let field of parse.meta.fields) {
            headers.push({ name: field, type: this.guessType(parse.data, field) })
        }
        delim = parse.meta.delimiter;


        return [headers, delim];
    }
    /**
     * private - Preliminary type guessing based on the first row of data
     *TODO: DateTime?
     * @param   data        the first row of parsed data
     * @param   fieldName   the field name to inspect
     * @return              type as string
     */
    private guessType(data: any[], fieldName: string) {
        if (!isNaN(parseFloat(data[0][fieldName]))) {
            return 'number'
        }
        else
            return 'string';
    }

    public ParseToGeoJSON(input: string, fileFormat: string, onComplete: (geoJSON) => void) {
        let geoJSON: { features: any[], type: string } = null;

        if (fileFormat === 'kml') {
            let xml = this.stringToXML(input);
            geoJSON = togeojson.kml(xml)
        }
        else if (fileFormat === 'gpx') {
            let xml = this.stringToXML(input);
            geoJSON = togeojson.gpx(xml)
        }
        else if (fileFormat === 'wkt') {
            geoJSON = wkt(input);
        }
        else if (fileFormat === 'osm') {
            let xml = (new DOMParser()).parseFromString(input, 'text/xml');
            geoJSON = osmtogeojson(xml);
        }
        onComplete(geoJSON);
        // else if (fileFormat === 'rar' || fileFormat === 'zip' || fileFormat === 'shp') {
        //     let promise = (shp(input) as any).then(function(geojson) {
        //         return geojson;
        //     });
        //     return promise;
        // }


    }

    private stringToXML(oString) {
        return (new DOMParser()).parseFromString(oString, "text/xml");
    }


    /**
     * private - Projects the coordinates from original projection to WGS84
     *
     * @param  geoJSON    The GeoJSON object
     * @param  fromProj   Original projection name
     * @return            The projected L.GeoJSON
     */
    public ProjectCoords(geoJSON, fromProj: string) {
        geoJSON.features.forEach(feature => {
            let x = feature.geometry.coordinates[0];
            let y = feature.geometry.coordinates[1];
            let convert = proj4(fromProj, 'WGS84', [x, y]);
            feature.geometry.coordinates[1] = convert[1];
            feature.geometry.coordinates[0] = convert[0];
        });
        return geoJSON;

    }






}
