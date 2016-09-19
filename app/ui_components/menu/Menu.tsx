import * as React from 'react';
import { LayerMenu } from './LayerMenu';
import { ColorMenu } from './ColorMenu';
import { SymbolMenu } from './SymbolMenu';
import { FilterMenu } from './FilterMenu';
import { LegendMenu } from './LegendMenu';
import { ClusterMenu } from './ClusterMenu';
import { PopUpMenu } from './PopUpMenu';
import { ExportMenu } from './ExportMenu';
import { AppState } from '../../stores/States';
import { Layer, ColorOptions, SymbolOptions, LayerTypes } from '../../stores/Layer';
import { Legend } from '../../stores/Legend';
import { observer } from 'mobx-react';
import { MenuEntry } from './MenuEntry';

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

    addNewLayer = () => {
        this.props.state.editingLayer = null;
        this.props.state.visibleMenu = 0;
        this.props.addLayer();
    }


    getActiveMenu() {
        switch (this.props.state.visibleMenu) {
            case 0:
                return;
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
                return <ClusterMenu
                    state = {this.props.state}
                    />;
            case 7:
                return <PopUpMenu
                    state = {this.props.state}
                    />;
            case 8:
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
                        <MenuEntry text="Layers" id={1} active={this.props.state.visibleMenu === 1} fa='bars' onClick = {this.onActiveMenuChange}/>
                        <MenuEntry text="Colors" id={2} active={this.props.state.visibleMenu == 2} fa='paint-brush' onClick = {this.onActiveMenuChange} hide={!this.props.state.editingLayer}/>
                        <MenuEntry text="Symbols" id={3} active={this.props.state.visibleMenu == 3} fa='map-marker' onClick = {this.onActiveMenuChange} hide={!this.props.state.editingLayer || this.props.state.editingLayer.pointFeatureCount == 0 || this.props.state.editingLayer.layerType === LayerTypes.HeatMap}/>
                        <MenuEntry text="Filters" id={4} active={this.props.state.visibleMenu == 4} fa='sliders' onClick = {this.onActiveMenuChange} />
                        <MenuEntry text="Legend" id={5} active={this.props.state.visibleMenu == 5} fa='map-o' onClick = {this.onActiveMenuChange}/>
                        <MenuEntry text="Cluster" id={6} active={this.props.state.visibleMenu == 6} fa='asterisk' onClick = {this.onActiveMenuChange} hide = {this.props.state.editingLayer.pointFeatureCount == 0 || this.props.state.editingLayer.layerType === LayerTypes.HeatMap}/>
                        <MenuEntry text="Pop-ups" id={7} active={this.props.state.visibleMenu == 7} fa='newspaper-o' onClick = {this.onActiveMenuChange} hide={!this.props.state.editingLayer || this.props.state.editingLayer.layerType === LayerTypes.HeatMap}/>
                        <MenuEntry text="Download" id={8} active={this.props.state.visibleMenu == 8} fa='download' onClick = {this.onActiveMenuChange}/>
                    </div >
                    <div className={this.props.state.visibleMenu > 0 ? 'menuOpen' : document.getElementsByClassName('menuOpen').length > 0 ? 'menuClose' : ''}
                        style ={{ float: 'right', width: this.props.state.visibleMenu > 0 ? 250 : 0, height: '100%', overflowY: 'auto', background: '#ededed' }}>

                        {
                            this.props.state.visibleMenu !== 0 && this.props.state.visibleMenu !== 1 && this.props.state.visibleMenu !== 4 && this.props.state.visibleMenu !== 5 && this.props.state.visibleMenu !== 8 ?
                                <div>
                                    <label>Select layer to edit</label>
                                    <Select
                                        options={layers}
                                        onChange = {(val: { label: string, value: Layer }) => {
                                            this.props.state.editingLayer = val.value;
                                        } }
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
