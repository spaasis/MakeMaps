import * as React from 'react';

import { FileUploadView } from './FileUploadView';
import { FileDetailsView } from './FileDetailsView';
import { FilePreProcessModel } from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();

import { ImportWizardState, AppState } from '../../stores/States';
import { Layer, IHeader, LayerTypes } from '../../stores/Layer';
import { observer } from 'mobx-react';

@observer
export class LayerImportWizard extends React.Component<{
    state: AppState,
    /** Function to upload the data to the map */
    submit: (Layer) => void,
    /** Function to signal the cancellation of the import.  */
    cancel: () => void,
}, {}>{
    nextStep() {
        this.props.state.importWizardState.step++;
    }

    previousStep() {
        this.props.state.importWizardState.step--;
    }

    setFileInfo() {
        let state = this.props.state.importWizardState;
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
                    let header = state.layer.headers.slice().filter(function(e) { return e.value === h })[0];

                    if (!header) {
                        state.layer.headers.push(new IHeader({ value: h, type: isnumber ? 'number' : 'string', label: undefined, decimalAccuracy: undefined }));
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
        let details = this.props.state.importWizardState;

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
        let state = this.props.state.importWizardState;
        let layer = state.layer;
        if (!layer.geoJSON && state.fileExtension === 'csv') {
            layer.geoJSON = _fileModel.ParseCSVToGeoJSON(state.content,
                state.latitudeField,
                state.longitudeField,
                state.delimiter,
                state.layer.headers);
        }

        if (state.coordinateSystem && state.coordinateSystem !== 'WGS84') {
            layer.geoJSON = _fileModel.ProjectCoords(layer.geoJSON, state.coordinateSystem);
        }
        layer.getValues()
        if (layer.pointFeatureCount > 500) {
            layer.clusterOptions.useClustering = true;
            alert('The dataset contains a large number of map points. In order to boost performance, we have enabled map clustering. If you wish, you may turn this off in the clustering options');
        }
        layer.getColors();
        this.props.submit(layer);
    }

    getCurrentView() {
        switch (this.props.state.importWizardState.step) {
            case 0:
                return <FileUploadView
                    state={this.props.state.importWizardState}
                    saveValues={this.setFileInfo.bind(this)}
                    cancel = {() => {
                        this.props.cancel();
                    } }
                    />
            case 1:
                return <FileDetailsView
                    state={this.props.state.importWizardState}
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
