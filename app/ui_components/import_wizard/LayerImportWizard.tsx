import * as React from 'react';
import { FileUploadView } from './FileUploadView';
import { FileDetailsView } from './FileDetailsView';
import { ShowLoading, HideLoading, ShowNotification, HideNotification } from '../../common_items/common'
import { FilePreProcessModel } from '../../models/FilePreProcessModel';
let _fileModel = new FilePreProcessModel();
import { ImportWizardState, AppState } from '../../stores/States';
import { Layer, Header, LayerTypes } from '../../stores/Layer';
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
        if (this.props.state.importWizardState.step == 2)
            this.submit();
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
                this.setGeoJSONTypes(JSON.parse(state.content));
            else
                _fileModel.ParseToGeoJSON(state.content, ext, this.setGeoJSONTypes.bind(this))

        }
        HideLoading();
    }

    setGeoJSONTypes(geoJSON) {
        let state = this.props.state.importWizardState;
        let headerId = 0;
        state.layer.geoJSON = geoJSON;
        for (let i of state.layer.geoJSON.features) {
            let props = state.layer.geoJSON.features ? i.properties : {};
            for (let h of Object.keys(props)) {
                let isnumber = !isNaN(parseFloat(props[h]));
                if (isnumber)
                    props[h] = +props[h];
                let header = state.layer.headers.slice().filter(function(e) { return e.value === h })[0];

                if (!header) {
                    state.layer.headers.push(new Header({ id: headerId, value: h, type: isnumber ? 'number' : 'string', label: undefined, decimalAccuracy: undefined }));
                    headerId++;
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

    setFileDetails() {
        ShowLoading();
        let state = this.props.state.importWizardState;
        let layer = state.layer;

        if (!layer.geoJSON && state.fileExtension === 'csv') {

            _fileModel.ParseCSVToGeoJSON(
                state.content,
                state.latitudeField,
                state.longitudeField,
                state.delimiter,
                state.layer.headers,
                this.setGeoJSONTypes.bind(this));

        }
        else
            this.submit();
    }

    /**
     * submit - Pass the layer to map
     */
    submit() {
        let state = this.props.state.importWizardState;
        let layer = state.layer;
        layer.headers = layer.headers.filter(function(val) { return val.label !== state.longitudeField && val.label !== state.latitudeField });
        if (state.coordinateSystem && state.coordinateSystem !== 'WGS84') {
            layer.geoJSON = _fileModel.ProjectCoords(layer.geoJSON, state.coordinateSystem);
        }
        this.props.submit(layer);

    }

    getCurrentView() {
        switch (this.props.state.importWizardState.step) {
            case 0:
                return <FileUploadView
                    state={this.props.state.importWizardState}
                    saveValues={() => {
                        ShowLoading();
                        let setInfo = this.setFileInfo.bind(this);
                        setTimeout(setInfo, 10)
                    } }
                    cancel = {() => {
                        this.props.cancel();
                    } }
                    />
            case 1:
                return <FileDetailsView
                    state={this.props.state.importWizardState}
                    saveValues={() => {
                        ShowLoading();
                        let setDetails = this.setFileDetails.bind(this);
                        setTimeout(setDetails, 10)
                    } }
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
