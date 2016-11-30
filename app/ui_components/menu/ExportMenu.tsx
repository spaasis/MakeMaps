import * as React from 'react';
import { AppState, ExportMenuState, SaveState } from '../../stores/States';
import { observer } from 'mobx-react';
let domToImage = require('dom-to-image');
import { Layer } from '../../stores/Layer';
import { Filter } from '../../stores/Filter';
import { Legend } from '../../stores/Legend';
@observer
export class ExportMenu extends React.Component<{
    state: AppState,


}, {}> {
    saveImage() {

        let options = this.props.state.exportMenuState;
        function filter(node) {
            if (!node.className || !node.className.indexOf)
                return true;
            else
                return (node.className.indexOf('menu') === -1
                    && node.className.indexOf('leaflet-control-fullscreen') === -1
                    && node.className.indexOf('leaflet-control-zoom') === -1
                    && (options.showLegend || (!options.showLegend && node.className.indexOf('legend') === -1))
                    && (options.showFilters || (!options.showFilters && node.className.indexOf('filter') === -1))
                );
        }
        domToImage.toBlob(document.getElementById('content'), { filter: filter })
            .then(function(blob) {
                (window as any).saveAs(blob, 'MakeMaps_map.png');
            });
    }

    formSaveJSON() {
        let layers: Layer[] = [];
        for (let layer of this.props.state.layers) {
            layers.push(new Layer(this.props.state, layer));
        }
        let filters: Filter[] = [];
        for (let filter of this.props.state.filters) {
            filters.push(new Filter(this.props.state, filter));
        }
        let saveData: SaveState = {
            baseLayerId: this.props.state.activeBaseLayer.id,
            layers: layers,
            legend: new Legend(this.props.state.legend),
            filters: filters,
        };

        saveData.layers.forEach(function(e) {
            delete e.popupHeaderIds;
            if (e.colorOptions.colorField) {
                e.colorOptions['colorHeaderId'] = e.colorOptions.colorField.id;
                delete e.colorOptions.colorField;
            }
            if (e.symbolOptions.iconField) {
                e.symbolOptions['iconHeaderId'] = e.symbolOptions.iconField.id;
                delete e.symbolOptions.iconField;
            }
            if (e.symbolOptions.chartFields !== undefined) {
                e.symbolOptions['chartHeaderIds'] = [];
                e.symbolOptions.chartFields.map(function(h) { e.symbolOptions['chartHeaderIds'].push(h.id); });
                delete e.symbolOptions.chartFields;
            }
            if (e.symbolOptions.sizeXVar) {
                e.symbolOptions['xHeaderId'] = e.symbolOptions.sizeXVar.id;
                delete e.symbolOptions.sizeXVar;
            }
            if (e.symbolOptions.sizeYVar) {
                e.symbolOptions['yHeaderId'] = e.symbolOptions.sizeYVar.id;
                delete e.symbolOptions.sizeYVar;
            }
            if (e.symbolOptions.blockSizeVar) {
                e.symbolOptions['blockHeaderId'] = e.symbolOptions.blockSizeVar.id;
                delete e.symbolOptions.blockSizeVar;
            }
            if (e.symbolOptions.icons.length === 0) {
                delete e.symbolOptions.icons;
                delete e.symbolOptions.iconLimits;
            }
            if (e.colorOptions.colors.length === 0) {
                delete e.colorOptions.colors;
                delete e.colorOptions.steps;
            }
            delete e.appState; delete e.displayLayer; delete e.values; delete e.uniqueValues; delete e.pointFeatureCount;
        });
        saveData.filters.forEach(function(e) {
            delete e.filterValues; delete e.filteredIndices; delete e.appState;
        });
        return saveData;
    }

    saveFile() {

        let saveString = JSON.stringify(this.formSaveJSON());
        let blob = new Blob([saveString], { type: 'text/plain;charset=utf-8' });
        (window as any).saveAs(blob, 'map.mmap');
    }

    saveEmbedCode() {
        // tslint:disable-next-line
        let script = "<script type='text/javascript'>function loadJSON(){var json =' + JSON.stringify(this.formSaveJSON()) + '; var frame =	document.getElementById('MakeMapsEmbed'); frame.contentWindow.postMessage(JSON.stringify(json), '*');}</script>";
        // tslint:disable-next-line
        let frame = "<iframe onLoad='loadJSON();' src=';https://makemaps.online' id='MakeMapsEmbed' style='height: 100%; width: 100%; border:none;'/>";

        let html = script + frame;

        let blob = new Blob([html], { type: 'text/plain;charset=utf-8' });
        (window as any).saveAs(blob, 'MakeMaps_embed.html');
    }

    render() {
        let strings = this.props.state.strings;
        return (
            <div>
                <button className='menuButton' onClick={() => {
                    this.saveFile();
                } }>{strings.saveAsFile}</button>
                <i>{strings.saveAsFileHelpText}</i>
                <br />

                <hr />
                <button className='menuButton' onClick={() => {
                    this.saveEmbedCode();
                } }>{strings.saveEmbedCode}</button>
                <i>{strings.saveEmbedCodeHelpText}</i>
                <br />

                <hr />
                {this.props.state.legend.visible ?
                    <div>
                        <label htmlFor='showLegend' style={{ marginTop: 0 }}>{strings.downloadShowLegend}</label>
                        <input id='showLegend' type='checkbox' checked={this.props.state.exportMenuState.showLegend} onChange={(e) => {
                            this.props.state.exportMenuState.showLegend = (e.currentTarget as any).checked;
                        } } />
                    </div> : null
                }
                {this.props.state.filters.length > 0 ?
                    <div>
                        <label htmlFor='showFilters'>{strings.downloadShowFilters}</label>
                        <input id='showFilters' type='checkbox' checked={this.props.state.exportMenuState.showFilters}
                            onChange={(e) => {
                                this.props.state.exportMenuState.showFilters = (e.currentTarget as any).checked;
                            } } />
                    </div> : null
                }

                <button className='menuButton' onClick={() => {
                    this.saveImage();
                } }>{strings.saveAsImage}</button>
                <i>{strings.saveAsImageHelpText}</i>


            </div>
        );
    }
}
