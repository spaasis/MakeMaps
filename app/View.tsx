import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { MakeMaps } from './MakeMaps';
import { MakeMapsData } from './stores/Main';

let data: MakeMapsData[] = [];
data.push({
    id: 0,
    type: 'geojson',
    content: '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[27.675,62.999]},"properties":{"category":1}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.675,62.998]},"properties":{"category":2}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.675,62.997]},"properties":{"category":3}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.675,62.996]},"properties":{"category":4}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.675,62.995]},"properties":{"category":5}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.675,62.994]},"properties":{"category":6}}]}',
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer1'
});
data.push({
    id: 1,
    type: 'geojson',
    content: '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.999]},"properties":{"category":"love it"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.998]},"properties":{"category":"fine dining"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.997]},"properties":{"category":"harbor?"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.996]},"properties":{"category":"trees"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.995]},"properties":{"category":"road"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.994]},"properties":{"category":"bugs"}}]}',
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer2'
});
ReactDOM.render(
    <div>
        <MakeMaps settings={{ data: null, viewOptions: { showMenu: true, showExportOptions: true, allowLayerChanges: true, language: 'en' }, mapOptions: { attributionExtension: '', mapCenter: [0, 0], zoomLevel: 0 } }} />
    </div>, document.getElementById('content')
);
