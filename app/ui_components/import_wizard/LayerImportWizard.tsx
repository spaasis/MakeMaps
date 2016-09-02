import * as React from 'react';

import { LayerTypeSelectView } from './LayerTypeSelectView';
import { FileUploadView } from './FileUploadView';
import { FileDetailsView } from './FileDetailsView';
import { FilePreProcessModel } from '../../models/FilePreProcessModel';
import { LayerTypes } from "../common_items/common";

let _fileModel = new FilePreProcessModel();

import { ImportWizardState, AppState } from '../Stores/States';
import { Layer } from '../Stores/Layer';
import { observer } from 'mobx-react';

@observer
export class LayerImportWizard extends React.Component<{
    state: ImportWizardState,
    appState: AppState,
    /** Function to upload the data to the map */
    submit: (Layer) => void,
    /** Function to signal the cancellation of the import.  */
    cancel: () => void,
}, {}>{
    nextStep() {
        this.props.state.step++;
    }

    previousStep() {
        this.props.state.step--;
    }

    setFileInfo() {
        let state = this.props.state;
        let ext = state.fileExtension;
        if (ext === 'csv') {
            this.nextStep();
        }
        else {
            if (ext === 'geojson')
                state.layer.geoJSON = JSON.parse(state.content);
            else
                state.layer.geoJSON = _fileModel.ParseToGeoJSON(state.content, ext)
            for (let i of state.layer.geoJSON.features) { //have to loop every feature here, because each can have different properties
                let props = state.layer.geoJSON.features ? i.properties : {};
                for (let h of Object.keys(props)) {
                    let isnumber = !isNaN(parseFloat(props[h]));
                    if (isnumber)
                        props[h] = +props[h];
                    let header = state.layer.headers.slice().filter(function(e) { return e.label === h })[0];

                    if (!header) {
                        state.layer.headers.push({ value: h, label: h, type: isnumber ? 'number' : 'string' });
                    }
                    else {
                        if (header.type === 'number' && !isnumber) { //previously marked as number but new value is text => mark as string
                            header.type = 'string';
                        }
                    }
                }
            }
            this.nextStep();
        }
    }

    setFileDetails(fileDetails) {
        let details = this.props.state;

        details.latitudeField = fileDetails.latitudeField;
        details.longitudeField = fileDetails.longitudeField;
        details.coordinateSystem = fileDetails.coordinateSystem;
        this.submit();
    }

    /**
     * submit - Parse given data to GeoJSON and pass to Map
     *
     * @return {void}
     */
    submit() {
        let state = this.props.state;
        let layer = this.props.state.layer;
        if (!layer.geoJSON && state.fileExtension === 'csv') {
            layer.geoJSON = _fileModel.ParseCSVToGeoJSON(state.content,
                state.latitudeField,
                state.longitudeField,
                state.delimiter,
                state.coordinateSystem,
                state.layer.headers);

            layer.headers = layer.headers.filter(function(val) { return val.label !== state.longitudeField && val.label !== state.latitudeField });

        }

        else if (state.coordinateSystem && state.coordinateSystem !== 'WGS84') {
            layer.geoJSON = _fileModel.ProjectCoords(layer.geoJSON, state.coordinateSystem);
        }

        layer.getColors();

        layer.blockUpdate = false;
        this.props.submit(layer);
    }

    getCurrentView() {
        switch (this.props.state.step) {
            case 0:
                return <div style={{ minWidth: 1000 }}>
                    <LayerTypeSelectView
                        state = {this.props.state}
                        appState= {this.props.appState}
                        cancel = {() => {
                            this.props.cancel();
                        } }
                        />
                </div>
            case 1:
                return <FileUploadView
                    state={this.props.state}
                    saveValues={this.setFileInfo.bind(this)}
                    goBack={this.previousStep.bind(this)}
                    />
            case 2:
                return <FileDetailsView
                    state={this.props.state}
                    saveValues={this.setFileDetails.bind(this)}
                    goBack = {this.previousStep.bind(this)}
                    />
        }
    }

    render() {
        return (
            <div style ={{ overflowX: 'auto' }}>
                {this.getCurrentView()}
            </div>
        )
    }
}
