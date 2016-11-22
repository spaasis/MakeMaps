import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { MakeMaps } from './MakeMaps';
import { MakeMapsData, ViewOptions, MapOptions } from './stores/Main';


let d1: MakeMapsData = {
    id: 0,
    type: 'general',
    data: { field1: [1, null, 3, 4, 5, 6], field2: ["a", null, "c", "d", "e", "f"], loc: [[27.68, 62.899], [27.68, 62.898], [27.68, 62.897], [27.68, 62.896], [27.68, 62.895], [27.68, 62.894]] },
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer1'
};
let d2: MakeMapsData = {
    id: 1,
    type: 'geojson',
    content: '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.999]},"properties":{"category":"love it"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.998]},"properties":{"category":"fine dining"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.997]},"properties":{"category":"harbor?"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.996]},"properties":{"category":"trees"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.995]},"properties":{"category":"road"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.994]},"properties":{"category":"bugs"}}]}',
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer2'
};
let d3: MakeMapsData = {
    id: 2,
    type: 'geojson',
    data: {
        type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Point", coordinates: [27.69, 62.983] }, properties: { "category": "love it" } },
        { type: "Feature", geometry: { type: "Point", coordinates: [27.69, 62.980] }, properties: { "category": "fine dining" } },
        { type: "Feature", geometry: { type: "Point", coordinates: [27.69, 62.981] }, properties: { "category": "harbor?" } },
        { type: "Feature", geometry: { type: "Point", coordinates: [27.69, 62.982] }, properties: { "category": "trees" } },
        { type: "Feature", geometry: { type: "Point", coordinates: [27.69, 62.984] }, properties: { "category": "road" } },
        { type: "Feature", geometry: { type: "Point", coordinates: [27.69, 62.985] }, properties: { "category": "bugs" } }]
    },
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer3'
};



export class ViewTest extends React.Component<{}, { data: MakeMapsData[], viewOptions: ViewOptions, mapOptions: MapOptions }>{

    componentWillMount() {
        this.state = {
            data: [d1],
            viewOptions: { showMenu: true, showExportOptions: true, allowLayerChanges: true, language: 'en' },
            mapOptions: { attributionExtension: '', mapCenter: null, zoomLevel: null }
        }
    }

    render() {
        return <div>
            <button style={{ position: 'absolute', zIndex: 999 }} onClick={f => { this.setState({ viewOptions: this.state.viewOptions, mapOptions: this.state.mapOptions, data: this.state.data.length == 1 ? [d1, d2] : this.state.data.length == 2 ? [d2, d3, d1] : [d2] }) } } >ChangeData</button>
            <button style={{ position: 'absolute', top: 30, zIndex: 999 }} onClick={f => { this.setState({ data: this.state.data, viewOptions: this.state.viewOptions, mapOptions: { attributionExtension: '', mapCenter: [15, 15], zoomLevel: 4 } }) } } >ChangeMapOpt</button>
            <button style={{ position: 'absolute', top: 60, zIndex: 999 }} onClick={f => { this.setState({ data: this.state.data, viewOptions: { showMenu: false, showExportOptions: true, allowLayerChanges: true, language: 'fi' }, mapOptions: this.state.mapOptions }) } } >ChangeViewOpt</button>
            <MakeMaps data={this.state.data} viewOptions={this.state.viewOptions} mapOptions={this.state.mapOptions} />
        </div>
    }

}


ReactDOM.render(
    <div>
        <ViewTest />
    </div>, document.getElementById('content')
);
