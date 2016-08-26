import * as React from 'react';
import { LayerMenu } from './LayerMenu';
import { ColorMenu } from './ColorMenu';
import { SymbolMenu } from './SymbolMenu';
import { FilterMenu } from './FilterMenu';
import { LegendMenu } from './LegendMenu';
import { PopUpMenu } from './PopUpMenu';
import { ExportMenu } from './ExportMenu';
import { LayerTypes, SymbolTypes } from '../common_items/common';
import { AppState } from '../Stores/States';
import { Layer, ColorOptions, SymbolOptions } from '../Stores/Layer';
import { Legend } from '../Stores/Legend';
import { observer } from 'mobx-react';

let Select = require('react-select');

@observer
export class MakeMapsMenu extends React.Component<{
    /** Application state*/
    state: AppState,
    /** Reorder the layers on the map*/
    changeLayerOrder: () => void,
    /** Add a new layer (by opening import wizard)*/
    addLayer: () => void,
    /** Export map as .png */
    saveImage: () => void,
    /** Export map as .makeMaps*/
    saveFile: () => void,
}, {}>{
    componentWillMount() {
        this.props.state.visibleMenu = 0;
        this.props.state.editingLayer = this.props.state.layers ? this.props.state.layers[this.props.state.layers.length - 1] : null;
    }

    onActiveMenuChange = (item: number) => {
        this.props.state.visibleMenu = this.props.state.visibleMenu === item ? 0 : item;
    }
    onLayerSelectionChange = (val: { label: string, value: Layer }) => {
        this.props.state.visibleMenu = 0;
        this.props.state.editingLayer = val.value;
    }

    addNewLayer = () => {
        this.props.state.editingLayer = null;
        this.props.state.visibleMenu = 0;
        this.props.addLayer();
    }

    changePopUpHeaders = () => {
        let lyr: Layer = this.props.state.editingLayer;
        let headers = this.props.state.editingLayer.popupHeaders;
        lyr.onEachFeature = addPopupsToLayer;

        function addPopupsToLayer(feature, layer: L.GeoJSON) {
            var popupContent = '';
            for (var prop in feature.properties) {
                let index = headers.map(function(h) { return h.label; }).indexOf(prop);
                if (index != -1) {
                    popupContent += prop + ": " + feature.properties[prop];
                    popupContent += "<br />";
                }
            }
            if (popupContent != '')
                layer.bindPopup(popupContent);
        }
        this.setState({
            selectedLayer: lyr
        })
    }

    getActiveMenu() {
        switch (this.props.state.visibleMenu) {
            case 1:
                return <LayerMenu
                    state={this.props.state}
                    saveOrder={() => {
                        this.props.changeLayerOrder();
                    } }
                    addNewLayer = {this.addNewLayer}
                    />;
            case 2:
                return <ColorMenu state = {this.props.state}/>;
            case 3:
                return <SymbolMenu state = {this.props.state}/>;
            case 4:
                return <FilterMenu state={this.props.state} />;
            case 5:
                return <LegendMenu state = {this.props.state}  />;
            case 6:
                return <PopUpMenu
                    state = {this.props.state}
                    saveValues = {this.changePopUpHeaders}
                    />;
            case 7:
                return <ExportMenu
                    state={this.props.state}
                    saveImage = {() => {
                        this.props.saveImage();
                    } }
                    saveFile = {() => {
                        this.props.saveFile();
                    } }
                    />;

        }
    }

    render() {
        let layers = [];
        if (this.props.state.layers) {
            for (let layer of this.props.state.layers) {
                layers.push({ value: layer, label: layer.name });
            }
        }
        let menuStyle = {
            float: 'right',
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 999
        };
        return (
            !this.props.state.menuShown ? null :
                <div style = {menuStyle} className='menu'>
                    <div style={{ float: 'left', display: 'flex', flexFlow: 'column', height: '100%' }}>
                        <div className='menuHeaderDiv' style={{ backgroundColor: this.props.state.visibleMenu === 1 ? '#ededed' : '#fefefe' }} onClick = {this.onActiveMenuChange.bind(this, 1)}>
                            <i className="menuHeader fa fa-bars"/>
                            <span className='menuHover'>Layers</span>
                        </div>
                        {this.props.state.editingLayer ?
                            <div className='menuHeaderDiv' onClick = {this.onActiveMenuChange.bind(this, 2)}
                                style={{ backgroundColor: this.props.state.visibleMenu === 2 ? '#ededed' : '#fefefe' }}>
                                <i className="menuHeader fa fa-paint-brush"/>
                                <span className='menuHover'>Colors</span>
                            </div>
                            : <div/>
                        }
                        {this.props.state.editingLayer && this.props.state.editingLayer.layerType !== LayerTypes.ChoroplethMap && this.props.state.editingLayer.layerType !== LayerTypes.HeatMap ?
                            <div className='menuHeaderDiv' onClick = {this.onActiveMenuChange.bind(this, 3)}
                                style={{ backgroundColor: this.props.state.visibleMenu === 3 ? '#ededed' : '#fefefe' }}>
                                <i className="menuHeader fa fa-map-marker"/>
                                <span className='menuHover'>Symbols</span>
                            </div>
                            : <div/>
                        }
                        <div className='menuHeaderDiv'
                            onClick = {this.onActiveMenuChange.bind(this, 4)}
                            style={{ backgroundColor: this.props.state.visibleMenu === 4 ? '#ededed' : '#fefefe' }}>
                            <i className="menuHeader fa fa-sliders"/>
                            <span className='menuHover'>Filters</span>
                        </div>

                        <div className='menuHeaderDiv'
                            onClick = {this.onActiveMenuChange.bind(this, 5)}
                            style={{ backgroundColor: this.props.state.visibleMenu === 5 ? '#ededed' : '#fefefe' }}>
                            <i className="menuHeader fa fa-map-o"/>
                            <span className='menuHover'>Legend</span>
                        </div >
                        {this.props.state.editingLayer && this.props.state.editingLayer.layerType !== LayerTypes.HeatMap ?

                            <div
                                className='menuHeaderDiv'
                                onClick = {this.onActiveMenuChange.bind(this, 6)}
                                style={{ backgroundColor: this.props.state.visibleMenu === 6 ? '#ededed' : '#fefefe' }}
                                >
                                <i className="menuHeader fa fa-newspaper-o"/>
                                <span className='menuHover'>Pop-ups</span>
                            </div>
                            : <div/>
                        }
                        <div
                            className='menuHeaderDiv'
                            onClick = {this.onActiveMenuChange.bind(this, 7)}
                            style={{ backgroundColor: this.props.state.visibleMenu === 7 ? '#ededed' : '#fefefe' }}>
                            <i className="menuHeader fa fa-download"/>
                            <span className='menuHover'>Download</span>
                        </div>
                    </div >
                    <div className='menuOptions' style ={{ float: 'right', width: this.props.state.visibleMenu > 0 ? 250 : 0, height: '100%', background: '#ededed' }}>

                        {
                            this.props.state.visibleMenu !== 0 && this.props.state.visibleMenu !== 1 && this.props.state.visibleMenu !== 4 && this.props.state.visibleMenu !== 5 && this.props.state.visibleMenu !== 7 ?
                                <div>
                                    <label>Select layer to edit</label>
                                    <Select
                                        options={layers}
                                        onChange = {this.onLayerSelectionChange}
                                        value = {this.props.state.editingLayer}
                                        valueRenderer = {(option: Layer) => {
                                            return option ? option.name : '';
                                        } }
                                        clearable={false}
                                        />
                                    <br/>
                                </div>
                                :
                                null
                        }

                        {this.getActiveMenu()}
                    </div>
                </div>

        );
    }
}
