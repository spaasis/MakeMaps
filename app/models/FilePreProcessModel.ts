import * as Papa from 'papaparse';
let csv2geojson = require('csv2geojson');
let proj4 = require('proj4');
let togeojson = require('togeojson');
let wkt = require('wellknown');
let osmtogeojson = require('osmtogeojson');
import { Header } from '../stores/Layer';
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
        delim = parse.meta.delimiter;
        for (let field of parse.meta.fields) {
            if (this.isNumber(field)) {
                headers = [];
                return [headers, delim];
            }
            headers.push({ name: field, type: this.isNumber(parse.data[0][field]) ? 'number' : 'string' });
        }


        return [headers, delim];
    }

    private isNumber(val: string) {
        return val == '' || !isNaN(+val)
    }

    /**
     * public - Converts input csv data into GeoJSON object
     *
     * @param  input      the import file in text format
     * @param  latField  latitude field name
     * @param  lonField  longitude field name
     * @param  delim     delimiter
     * @param  headers  layer headers
     * @return           GeoJSON object
     */
    public ParseCSVToGeoJSON(input: string, latField: string, lonField: string, delim: string, headers: Header[], onComplete: (geoJSON) => void) {
        let geoJSON: { features: any[], type: string } = null;
        csv2geojson.csv2geojson(input, {
            latfield: latField,
            lonfield: lonField,
            delimiter: delim
        },
            function(err, data) {
                if (!err) {
                    geoJSON = data;

                }
                else {
                    //TODO
                    console.log(err);
                }
            });

        onComplete(geoJSON);

    }


    public ParseToGeoJSON(input: string, fileFormat: string, onComplete: (geoJSON) => void) {
        let geoJSON: { features: any[], type: string } = null;
        if (fileFormat === 'wkt') {
            onComplete(wkt(input));
            return;
        }
        let xml = this.stringToXML(input);
        if (fileFormat === 'kml') {
            geoJSON = togeojson.kml(xml)
        }
        else if (fileFormat === 'gpx') {
            geoJSON = togeojson.gpx(xml)
        }
        else if (fileFormat === 'osm') {
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
