import * as React from 'react';
import { FileUploadView } from './FileUploadView';
import { FileDetailsView } from './FileDetailsView';
import { ShowLoading, HideLoading, ShowNotification, HideNotification } from '../../common_items/common'
import { FilePreProcessModel } from '../../models/FilePreProcessModel';
let _fileModel = new FilePreProcessModel();
import { ImportWizardState, AppState } from '../../stores/States';
import { Layer, IHeader, LayerTypes } from '../../stores/Layer';
import { observer } from 'mobx-react';
let csv2geojson = require('csv2geojson');

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
    }

    setGeoJSONTypes(geoJSON) {
        let state = this.props.state.importWizardState;
        state.layer.geoJSON = geoJSON;
        for (let i of state.layer.geoJSON.features) {
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

    setFileDetails() {
        ShowLoading();
        let state = this.props.state.importWizardState;
        let layer = state.layer;


        if (!layer.geoJSON && state.fileExtension === 'csv') {

            let submit = this.submit.bind(this);
            let setGeoJSONTypes = this.setGeoJSONTypes.bind(this);
            setTimeout(
                function() {
                    let geoJSON: { features: any[], type: string } = null;
                    csv2geojson.csv2geojson(state.content, {
                        latfield: state.latitudeField,
                        lonfield: state.longitudeField,
                        delimiter: state.delimiter
                    },
                        function(err, data) {
                            if (!err) {
                                setTimeout(
                                    setGeoJSONTypes(data), 10);
                            }

                            else {
                                //TODO
                                console.log(err);
                            }
                        });

                }, 10);
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
