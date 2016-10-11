import * as React from 'react';
import { FileUploadView } from './FileUploadView';
import { FileDetailsView } from './FileDetailsView';
import { ShowLoading, HideLoading, ShowNotification, HideNotification, IsNumber } from '../../common_items/common'
import { FilePreProcessModel } from '../../models/FilePreProcessModel';
let _fileModel = new FilePreProcessModel();
import { ImportWizardState, AppState } from '../../stores/States';
import { Layer, Header, LayerTypes } from '../../stores/Layer';
import { observer } from 'mobx-react';

@observer
export class LayerImportWizard extends React.Component<{
    state: AppState,
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
                let isnumber = IsNumber(props[h]);
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

    submit() {
        let state = this.props.state.importWizardState;
        let l = state.layer;
        l.headers = l.headers.filter(function(val) { return val.label !== state.longitudeField && val.label !== state.latitudeField });
        if (state.coordinateSystem && state.coordinateSystem !== 'WGS84') {
            l.geoJSON = _fileModel.ProjectCoords(l.geoJSON, state.coordinateSystem);
        }
        window.location.hash = 'edit';
        l.getValues()
        if (l.layerType !== LayerTypes.HeatMap && l.pointFeatureCount > 500) {
            ShowNotification(this.props.state.strings.clusterTogglePopup);
            l.clusterOptions.useClustering = true;
        }
        l.appState = this.props.state;
        l.id = this.props.state.currentLayerId++;
        l.colorOptions.colorField = l.numberHeaders[0];
        l.colorOptions.useMultipleFillColors = true;
        l.getColors();

        setTimeout(function() { l.init() }, 10);
        this.props.state.layers.push(l);
        if (l.layerType === LayerTypes.HeatMap)
            this.props.state.heatLayerOrder.push({ id: l.id });
        else
            this.props.state.standardLayerOrder.push({ id: l.id });
        this.props.state.importWizardShown = false;
        this.props.state.editingLayer = l;
        this.props.state.menuShown = true;

    }

    getCurrentView() {
        switch (this.props.state.importWizardState.step) {
            case 0:
                return <FileUploadView
                    strings = {this.props.state.strings}
                    state={this.props.state.importWizardState}
                    saveValues={() => {
                        ShowLoading();
                        let setInfo = this.setFileInfo.bind(this);
                        setTimeout(setInfo, 10)
                    } }
                    cancel = {() => {
                        this.props.state.importWizardShown = false;
                        if (this.props.state.layers.length == 0)
                            this.props.state.welcomeShown = true;
                        else {
                            this.props.state.menuShown = true;
                            this.props.state.editingLayer = this.props.state.layers[0];
                        }
                    } }
                    />
            case 1:
                return <FileDetailsView
                    strings = {this.props.state.strings}
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
