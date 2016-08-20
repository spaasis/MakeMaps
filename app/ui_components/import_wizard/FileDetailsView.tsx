
import * as React from 'react';
let Select = require('react-select');

var coords;
import { DefaultProjections } from "../common_items/common";

import { ImportWizardState } from '../Stores/States';
import { observer } from 'mobx-react';

@observer
export class FileDetailsView extends React.Component<
{
    state: ImportWizardState,
    /** Saves the lat- and lon- field names and the coordinate system name to the import wizard*/
    saveValues: (IFileDetails) => void,
    /** Go to the previous step of the wizard */
    goBack: () => void,
}, {}>{
    private activeLayer = this.props.state.layer;
    componentWillMount() {
        coords = [];
        for (let i = 0; i < DefaultProjections.length; i++) {
            let val = DefaultProjections[i];
            coords[i] = { value: val, label: val };
        }
        this.props.state.latitudeField = this.props.state.isGeoJSON ? '' : this.activeLayer.numberHeaders[0].label;
        this.props.state.longitudeField = this.props.state.isGeoJSON ? '' : this.activeLayer.numberHeaders[1].label;
        this.props.state.coordinateSystem = 'WGS84';


    }
    onLatitudeSelectionChange = (val) => {
        this.props.state.latitudeField = val ? val.value : '';
    }
    onLongitudeSelectionChange = (val) => {
        this.props.state.longitudeField = val ? val.value : '';
    }
    onCoordinateSystemChange = (val) => {
        this.props.state.coordinateSystem = val ? val.value : '';
    }
    onHeatValueChange = (val) => {
        this.activeLayer.heatMapVariable = val ? val.value : '';
        this.activeLayer.colorOptions.colorField = val ? val.value : '';
    }
    goBack = () => {
        this.props.goBack();
    }
    proceed = () => {
        let custom = (document.getElementById('customProj') as any).value;
        let values = {
            latitudeField: this.props.state.latitudeField,
            longitudeField: this.props.state.longitudeField,
            coordinateSystem: custom !== 'Insert custom Proj4-string here' ? custom : this.props.state.coordinateSystem,
        }
        this.props.saveValues(values);
    }
    render() {

        return <div style={{ height: '100%' }}>
            <div>
                <h2>Just a few more details</h2>
                <hr/>
                {this.props.state.isGeoJSON ?
                    null :
                    <div>
                        <label>Select the latitude/Y field name</label>
                        <Select
                            options={this.activeLayer.numberHeaders}
                            onChange={this.onLatitudeSelectionChange}
                            value={this.props.state.latitudeField}
                            />
                        <label>Select the longitude/X field name</label>
                        <Select
                            options={this.activeLayer.numberHeaders}
                            onChange={this.onLongitudeSelectionChange}
                            value={this.props.state.longitudeField}/>
                    </div>}
                <label>Select the coordinate system</label>

                <Select
                    options={coords}
                    onChange={this.onCoordinateSystemChange}
                    value={this.props.state.coordinateSystem}/>
                <p> Not sure? Try with the default (WGS84) and see if the data lines up.</p>
                <p>Coordinate system missing? Get the Proj4-string for your system from
                    <a href='http://spatialreference.org/ref/'> Spatial Reference</a>
                </p>
                <input id='customProj' defaultValue='Insert custom Proj4-string here' style={{ width: 400 }}/>
                {this.props.state.isHeatMap ?
                    <div>
                        <label>Select heat map variable</label>
                        <Select
                            options={this.activeLayer.numberHeaders}
                            onChange={this.onHeatValueChange}
                            value={this.activeLayer.heatMapVariable}/>
                    </div>
                    : null}
            </div>
            <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }} onClick={this.goBack}>Go back</button>
            <button className='primaryButton' disabled={!this.props.state.coordinateSystem || (this.props.state.isHeatMap && !this.activeLayer.heatMapVariable) || (!this.props.state.isGeoJSON && (!this.props.state.latitudeField || !this.props.state.longitudeField))} style={{ position: 'absolute', right: 15, bottom: 15 }} onClick={this.proceed}>Make a map!</button>
        </div>
    }

}
