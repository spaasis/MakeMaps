import * as React from 'react';
let Dropzone = require('react-dropzone');
import { FilePreProcessModel } from '../../models/FilePreProcessModel';
import * as XLSX from 'xlsx';
let _fileModel = new FilePreProcessModel();
let _allowedFileTypes = ['geojson', 'csv', 'gpx', 'kml', 'wkt', 'osm', 'xlsx', 'xlsxm', 'xlsb', 'xls', 'ods'];//, 'shp', 'rar', 'zip'];
import { ImportWizardState } from '../../stores/States';
import { observer } from 'mobx-react';

@observer
export class FileUploadView extends React.Component<{
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
            if (ext === 'xlsx')
                reader.readAsBinaryString(file);
            else if (ext == 'zip' || ext == 'rar')
                reader.readAsArrayBuffer(file);
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
            }
            else {
                alert('File type not yet supported!');
            }
        }
    }

    proceed = () => {
        let layer = this.props.state.layer;
        if (this.props.state.fileExtension === 'xlsx') {
            let workbook = XLSX.read(this.props.state.content, { type: 'binary' });
            this.props.state.content = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]); //TODO:other sheets as well (as different layers)

            this.props.state.fileExtension = 'csv';
        }
        if (this.props.state.fileExtension === 'csv') {
            let head, delim;
            [head, delim] = _fileModel.ParseHeadersFromCSV(this.props.state.content);
            for (let i of head) {
                layer.headers.push({ value: i.name, label: i.name, type: i.type, decimalAccuracy: 0 });
            }
            this.props.state.delimiter = delim;
        }
        if (this.props.state.content) {
            this.props.saveValues();

        }
        else {
            alert("Upload a file!");
        }
    }
    render() {
        let layer = this.props.state.layer;
        let dropStyle = {
            height: 100,
            border: this.props.state.fileName ? '1px solid #549341' : '1px dotted #549341',
            borderRadius: 15,
            margin: 5,
            textAlign: 'center',
            lineHeight: '100px',
            color: 'grey',
            fontWeight: 'bold'
        }
        return (
            <div>
                <div>
                    <h2> Upload the file containing the data </h2>
                    <hr/>
                    <p>Currently supported file types: </p>
                    <p> GeoJSON, Microsoft Office spreadsheets, OpenDocument spreadsheets, CSV, KML, GPX, WKT, OSM...</p>
                    <a target="_blank" rel="noopener noreferrer" href='https://github.com/simopaasisalo/MakeMaps/wiki/Supported-file-types-and-their-requirements'>More info about supported file types</a>
                    <Dropzone
                        style={dropStyle}
                        onDrop={this.onDrop.bind(this)}
                        accept={_allowedFileTypes.map(function(type) { return '.' + type }).join(', ')}>

                        {this.props.state.fileName ? <span><i className='fa fa-check' style={{ color: '#549341', fontSize: 17 }}/> {this.props.state.fileName} </span> : <span>Drop file or click to open upload menu</span>}
                    </Dropzone>
                    <label>Give a name to the layer</label>
                    <input type="text" onChange={(e) => {
                        layer.name = (e.target as any).value;
                    } } value={layer.name}/>

                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }} onClick={() => {
                    this.props.cancel();
                } }>Cancel</button>
                <button className='primaryButton' disabled={this.props.state.content === undefined || layer.name === ''}  style={{ position: 'absolute', right: 15, bottom: 15 }} onClick={this.proceed.bind(this)}>Continue</button>
            </div>
        );
    }
}
