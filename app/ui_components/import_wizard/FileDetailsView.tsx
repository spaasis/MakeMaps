
import * as React from 'react';
let Select = require('react-select');

var coords;
import { DefaultProjections } from "../../common_items/common";

import { ImportWizardState } from '../../stores/States';
import { observer } from 'mobx-react';
import { Strings } from '../../localizations/strings';

@observer
export class FileDetailsView extends React.Component<
{
    strings: Strings,
    state: ImportWizardState,
    /** Saves the lat- and lon- field names and the coordinate system name to the import wizard*/
    saveValues: () => void,
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

    proceed = () => {
        let element = document.getElementById('customProj');
        let custom = element ? (element as any).value : '';
        this.props.state.coordinateSystem = this.props.state.useCustomProjection && custom !== this.props.strings.customProjectionPrompt ? custom : this.props.state.coordinateSystem;
        this.props.saveValues();
    }
    render() {
        let strings = this.props.strings;
        let state = this.props.state;
        return <div style={{ padding: 20 }}>
            <div style={{ height: '90%' }}>
                <h2>{strings.fileDetailsViewHeader}</h2>
                <hr/>
                {state.isGeoJSON ?
                    null :
                    <div>
                        <label>{strings.selectLatHeader}</label>
                        <Select
                            options={this.activeLayer.numberHeaders}
                            onChange={(val) => {
                                this.props.state.latitudeField = val ? val.value : '';
                            } }
                            value={state.latitudeField}
                            clearable={false}
                            />
                        <label>{strings.selectLngHeader}</label>
                        <Select
                            options={this.activeLayer.numberHeaders}
                            onChange={(val) => { this.props.state.longitudeField = val ? val.value : ''; } }
                            value={state.longitudeField}
                            clearable={false}/>
                    </div>}
                <label>{strings.selectCoordSystem}</label>

                <Select
                    options={coords}
                    onChange={(val) => {
                        state.useCustomProjection = false;
                        state.coordinateSystem = val ? val.value : '';
                    } }
                    value={state.coordinateSystem}
                    clearable={false}/>
                <p>{strings.coordSystemHelp}</p>
                {state.useCustomProjection ?
                    <div>
                        <p>{strings.coordSystemMissing}
                            <a href='http://spatialreference.org/ref/'>Spatial Reference</a>
                        </p>
                        <input id='customProj' defaultValue={strings.customProjectionPrompt} style={{ width: 400 }}/>

                    </div>
                    :
                    <button className='primaryButton' style={{ width: 'auto' }} onClick={() => { state.useCustomProjection = true } }>{strings.useCustomProjectionButton}</button>
                }
            </div>
            <button className='secondaryButton'
                style={{ position: 'absolute', left: 15, bottom: 15 }}
                onClick={this.props.goBack}>{strings.previous}</button>
            <button className='primaryButton'
                disabled={!state.coordinateSystem || (!state.isGeoJSON && (!state.latitudeField || !state.longitudeField))}
                style={{ position: 'absolute', right: 15, bottom: 15 }}
                onClick={this.proceed}>{strings.finishImport}</button>
        </div>
    }

}
