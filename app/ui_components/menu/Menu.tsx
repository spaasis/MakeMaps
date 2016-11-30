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
}, {}> {
    componentWillMount() {
        this.props.state.visibleMenu = 0;
        this.props.state.editingLayer = this.props.state.layers ? this.props.state.layers[this.props.state.layers.length - 1] : null;
    }

    onActiveMenuChange = (item: number) => {
        this.props.state.visibleMenu = this.props.state.visibleMenu === item ? 0 : item;
    }

    getActiveMenu() {
        switch (this.props.state.visibleMenu) {
            case 0:
                return;
            case 1:
                return <LayerMenu state={this.props.state} />;
            case 2:
                return <ColorMenu state={this.props.state} />;
            case 3:
                return <SymbolMenu state={this.props.state} />;
            case 4:
                return <FilterMenu state={this.props.state} />;
            case 5:
                return <LegendMenu state={this.props.state} />;
            case 6:
                return <ClusterMenu state={this.props.state} />;
            case 7:
                return <PopUpMenu state={this.props.state} />;
            case 8:
                return <ExportMenu state={this.props.state} />;

        }
    }

    render() {
        let state = this.props.state;
        let strings = state.strings;
        let layers = [];
        if (state.layers) {
            for (let layer of state.layers) {
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
        let visibleMenu = state.visibleMenu;
        let visibleMenuName: string;
        switch (visibleMenu) {
            case 1:
                visibleMenuName = strings.layerMenuTitle;
                break;
            case 2:
                visibleMenuName = strings.colorMenuTitle;
                break;
            case 3:
                visibleMenuName = strings.symbolMenuTitle;
                break;
            case 4:
                visibleMenuName = strings.filterMenuTitle;
                break;
            case 5:
                visibleMenuName = strings.legendMenuTitle;
                break;
            case 6:
                visibleMenuName = strings.clusterMenuTitle;
                break;
            case 7:
                visibleMenuName = strings.popupMenuTitle;
                break;
            case 8:
                visibleMenuName = strings.downloadMenuTitle;
                break;
        }
        return (
            !state.menuShown ? null :
                <div style={menuStyle} className='menu'>
                    <div style={{ float: 'left', display: 'flex', flexFlow: 'column', height: '100%' }}>
                        <MenuEntry text={strings.layerMenuTitle} id={1} active={visibleMenu === 1} fa='bars' onClick={this.onActiveMenuChange} />
                        <MenuEntry text={strings.colorMenuTitle} id={2} active={visibleMenu === 2} fa='paint-brush' onClick={this.onActiveMenuChange} hide={!state.editingLayer} />
                        <MenuEntry text={strings.symbolMenuTitle} id={3} active={visibleMenu === 3} fa='map-marker' onClick={this.onActiveMenuChange} hide={!state.editingLayer || state.editingLayer.pointFeatureCount === 0 || state.editingLayer.layerType === LayerTypes.HeatMap} />
                        <MenuEntry text={strings.filterMenuTitle} id={4} active={visibleMenu === 4} fa='sliders' onClick={this.onActiveMenuChange} />
                        <MenuEntry text={strings.legendMenuTitle} id={5} active={visibleMenu === 5} fa='map-o' onClick={this.onActiveMenuChange} />
                        <MenuEntry text={strings.clusterMenuTitle} id={6} active={visibleMenu === 6} fa='asterisk' onClick={this.onActiveMenuChange} hide={state.editingLayer.pointFeatureCount === 0 || state.editingLayer.layerType === LayerTypes.HeatMap} />
                        <MenuEntry text={strings.popupMenuTitle} id={7} active={visibleMenu === 7} fa='newspaper-o' onClick={this.onActiveMenuChange} hide={!state.editingLayer || state.editingLayer.layerType === LayerTypes.HeatMap} />
                        <MenuEntry text={strings.downloadMenuTitle} id={8} active={visibleMenu === 8} fa='download' onClick={this.onActiveMenuChange} hide={!state.showExportOptions} />
                    </div >
                    <div className={state.visibleMenu > 0 ? 'menuOpen' : document.getElementsByClassName('menuOpen').length > 0 ? 'menuClose' : ''}
                        style={{ float: 'right', width: state.visibleMenu > 0 ? 250 : 0, height: '100%', overflowY: 'auto', background: '#ededed' }}>
                        <h3>{visibleMenuName}</h3>
                        {
                            state.visibleMenu !== 0 && state.visibleMenu !== 1 && state.visibleMenu !== 4 && state.visibleMenu !== 5 && state.visibleMenu !== 8 ?
                                <div>
                                    <label>{strings.editingLayerSelection}</label>
                                    <Select
                                        options={layers}
                                        onChange={(val: { label: string, value: Layer }) => {
                                            state.editingLayer = val.value;
                                        } }
                                        value={state.editingLayer}
                                        valueRenderer={(option: Layer) => {
                                            return option ? option.name : '';
                                        } }
                                        clearable={false}
                                        />
                                    <br />
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
