import * as Papa from 'papaparse';
let csv2geojson = require('csv2geojson');
let proj4 = require('proj4');
let togeojson = require('togeojson');
let wkt = require('wellknown');


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


    /**
     * public - Converts input csv data into GeoJSON object
     *
     * @param  input      the import file in text format
     * @param  latField  latitude field name
     * @param  lonField  longitude field name
     * @param  delim     delimiter
     * @return           GeoJSON object
     */
    public ParseCSVToGeoJSON(input: string, latField: string, lonField: string, delim: string, coordSystem: string, headers: IHeader[]) {
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

        if (coordSystem !== 'WGS84')
            geoJSON = this.ProjectCoords(geoJSON, coordSystem)
        geoJSON = this.setGeoJSONTypes(geoJSON, headers);

        return geoJSON;

    }


    public ParseToGeoJSON(input: string, fileFormat: string) {
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
        return geoJSON;
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


    /**
     * private - Sets GeoJSON feature data types based on the the header information for later calculations (symbol sizing, etc.)
     *
     * @param   geoJSON   The GeoJSON object
     * @param  headers    Header information. Contains type descriptions
     * @return            The changed GeoJSON object
     */
    private setGeoJSONTypes(geoJSON, headers: IHeader[]) {
        let numbers: string[] = [];
        headers.map(function(head) {
            if (head.type === 'number') {
                numbers.push(head.label);
            }
        })
        geoJSON.features.forEach(feature => {
            for (let prop in feature.properties) {
                if (numbers.indexOf(prop) > -1) {
                    feature.properties[prop] = +feature.properties[prop]; //convert to number
                }
            }
        });
        return geoJSON
    }



}
