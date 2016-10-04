import * as React from 'react';
let Dropzone = require('react-dropzone');
import { ShowNotification, ShowLoading, HideLoading } from '../../common_items/common';
import { FilePreProcessModel } from '../../models/FilePreProcessModel';
import * as XLSX from 'xlsx';
let _fileModel = new FilePreProcessModel();
let _allowedFileTypes = ['geojson', 'csv', 'gpx', 'kml', 'wkt', 'osm', 'xlsx', 'xlsxm', 'xlsb', 'xls', 'ods'];//, 'shp', 'rar', 'zip'];
import { ImportWizardState } from '../../stores/States';
import { observer } from 'mobx-react';
import { Strings } from '../../localizations/strings';

@observer
export class FileUploadView extends React.Component<{
    strings: Strings,
    state: ImportWizardState,
    /** Saves the filename, string content, delimiter and the headers/column names to the import wizard */
    saveValues: () => void,
    /** Cancel import */
    cancel: () => void
}, {}>{

    onDrop = (files) => {
        let reader = new FileReader();
        let fileName, content;
        let ext: string;
        reader.onload = contentUploaded.bind(this);
        files.forEach((file) => {
            fileName = file.name;
            ext = fileName.split('.').pop().toLowerCase();
            if (ext === 'xlsx' || ext === 'xlsxm' || ext === 'xlsb' || ext === 'xls' || ext === 'ods')
                reader.readAsBinaryString(file);
            // else if (ext == 'zip','rar')
            //     reader.readAsArrayBuffer(file);
            else
                reader.readAsText(file);
        });
        function contentUploaded(e) {
            let contents: any = e.target;
            if (_allowedFileTypes.indexOf(ext) !== -1) {
                this.props.state.content = contents.result;

                this.props.state.fileName = fileName;
                this.props.state.layer.name = fileName;
                this.props.state.fileExtension = ext;
                this.props.state.layer.geoJSON = undefined;
                HideLoading();
            }
            else {
                HideLoading
                ShowNotification('File type not yet supported!');
            }
        }
    }

    proceed = () => {

        let ext = this.props.state.fileExtension;
        if (ext === 'xlsx' || ext === 'xlsxm' || ext === 'xlsb' || ext === 'xls' || ext === 'ods') {
            let workbook = XLSX.read(this.props.state.content, { type: 'binary' });
            this.props.state.content = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]); //TODO:other sheets as well (as different layers)

            ext = 'csv';
        }
        if (ext === 'csv') {
            let headers, delim;
            [headers, delim] = _fileModel.ParseHeadersFromCSV(this.props.state.content);
            this.props.state.layer.headers = [];
            if (headers.length == 0) {
                ShowNotification(this.props.strings.noHeadersError);
                HideLoading();
                return;
            }
            for (let header of headers) {
                this.props.state.layer.headers.push({ id: headers.indexOf(header), value: header.name, label: header.name, type: header.type, decimalAccuracy: 0 });
            }
            this.props.state.delimiter = delim;
        }
        if (this.props.state.content) {
            this.props.state.fileExtension = ext;
            this.props.saveValues();
            HideLoading();

        }
        else {
            ShowNotification(this.props.strings.noFileNotification);
            HideLoading();
        }
    }
    render() {
        let strings = this.props.strings;
        let layer = this.props.state.layer;
        return (
            <div style={{ padding: 20 }}>
                <div>
                    <h2>{strings.uploadViewHeader}</h2>
                    <hr/>
                    <p>{strings.currentlySupportedTypes}: </p>
                    <p> GeoJSON, Microsoft Office {strings.spreadsheets}, OpenDocument {strings.spreadsheets}, CSV, KML, GPX, WKT, OSM...</p>
                    <a target="_blank" rel="noopener noreferrer" href='https://github.com/simopaasisalo/MakeMaps/wiki/Supported-file-types-and-their-requirements'>{strings.fileTypeSupportInfo}</a>
                    <Dropzone
                        className='dropZone'
                        onDrop={this.onDrop.bind(this)}
                        accept={_allowedFileTypes.map(function(type) { return '.' + type }).join(', ')}>

                        {this.props.state.fileName ? <span><i className='fa fa-check' style={{ color: '#549341', fontSize: 17 }}/> {this.props.state.fileName} </span> : <span>{strings.uploadDropBoxText}</span>}
                    </Dropzone>
                    <label>{strings.giveNameToLayer}</label>
                    <input type="text" onChange={(e) => {
                        layer.name = (e.target as any).value;
                    } } value={layer.name}/>

                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }} onClick={() => {
                    this.props.cancel();
                } }>{strings.cancel}</button>
                <button className='primaryButton'
                    disabled={this.props.state.content === undefined || layer.name === ''}
                    style={{ position: 'absolute', right: 15, bottom: 15 }}
                    onClick={() => { ShowLoading(); setTimeout(this.proceed, 10) } }>{strings.continue}</button>
            </div>
        );
    }
}
