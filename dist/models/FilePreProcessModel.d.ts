import { Header } from '../stores/Layer';
declare function ParseHeadersFromCSV(input: string): {
    headers: {
        name: string;
        type: "string" | "number";
    }[];
    delim: string;
};
declare function ParseCSVToGeoJSON(input: string, latField: string, lonField: string, delim: string, headers: Header[], onComplete: (geoJSON) => void): void;
declare function ParseToGeoJSON(input: string, fileFormat: string, onComplete: (geoJSON) => void): void;
declare function ParseTableToGeoJSON(input: any, onComplete: (geoJSON) => void): void;
declare function SetGeoJSONTypes(geoJSON: {
    features: any;
    type: string;
}, headers: Header[]): {
    features: any;
    type: string;
};
declare function ProjectCoords(geoJSON: any, fromProj: string): any;
export { ParseHeadersFromCSV, ParseCSVToGeoJSON, ParseTableToGeoJSON, ParseToGeoJSON, ProjectCoords, SetGeoJSONTypes };
