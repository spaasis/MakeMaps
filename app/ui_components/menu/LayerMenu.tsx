import * as React from 'react';
let Sortable = require('react-sortablejs');
import { AppState } from '../../stores/States';
import { Layer, LayerTypes } from '../../stores/Layer';
import { observer } from 'mobx-react';
let Select = require('react-select');

@observer
export class LayerMenu extends React.Component<{
    state: AppState,
}, {}> {
    handleSort(type: 'heat' | 'standard', items: string[]) {
        let arr: { id: number }[] = [];
        for (let i of items) {
            arr.push(this.getLayerById(+i));
        }
        if (type === 'standard')
            this.props.state.standardLayerOrder = arr;
        else
            this.props.state.heatLayerOrder = arr;

        for (let i of this.props.state.standardLayerOrder) {
            this.props.state.layers.filter(lyr => lyr.id === i.id)[0].reDraw();
        }
        for (let i of this.props.state.heatLayerOrder) {
            this.props.state.layers.filter(lyr => lyr.id === i.id)[0].reDraw();

        }

    }
    getLayerById(id: number) {

        for (let lyr of this.props.state.layers) {
            if (lyr.id === id) {
                return { name: lyr.name, id: lyr.id };
            }
        }
    }
    deleteLayer(id: number) {
        let layerInfo = this.props.state.layers.filter(lyr => lyr.id === id)[0];
        if (layerInfo) {
            this.props.state.layers = this.props.state.layers.filter((lyr) => { return lyr.id !== id; });
            this.props.state.map.removeLayer(layerInfo.displayLayer);
            this.props.state.standardLayerOrder = this.props.state.standardLayerOrder.filter((l) => { return l.id !== id; });
        }
    }
    render() {
        let strings = this.props.state.strings;
        let state = this.props.state;
        let layer = state.layers.filter(function(f) { return f.id === state.layerMenuState.editingLayerId; })[0];
        let layers = [];
        if (this.props.state.layers) {
            for (let layer of this.props.state.layers) {
                layers.push({ value: layer, label: layer.name });
            }
        }
        let layerStyle = {
            cursor: 'pointer',
            background: 'white',
            color: 'black',
            borderColor: 'white',
            borderWidth: '3px',
            borderStyle: 'double',
            borderRadius: '15px',
            textAlign: 'center',
            lineHeight: '40px',
            border: '1px solid gray'
        };
        return (
            <div className='makeMaps-options'>
                <label>{strings.selectBaseMap}</label>
                <Select
                    options={this.props.state.obsBaseLayers}
                    onChange={(e: ISelectData) => {
                        this.props.state.map.removeLayer(this.props.state.activeBaseLayer.layer);
                        this.props.state.activeBaseLayer = { id: e.label, layer: e.value };
                        this.props.state.map.addLayer(this.props.state.activeBaseLayer.layer);
                    } }
                    value={{ value: this.props.state.activeBaseLayer, label: this.props.state.activeBaseLayer.id }}
                    clearable={false}
                    placeholder={strings.selectPlaceholder}
                    />
                <hr />
                <label>{strings.layerMenuDragDrop}</label>
                {state.heatLayerOrder.length > 0 ?
                    <div>
                        <label>{strings.heatLayers}</label>
                        <Sortable className='layerList'
                            onChange={this.handleSort.bind(this, 'heat')}>
                            {state.heatLayerOrder.map(function(item) {
                                return <div style={layerStyle} key={item.id} data-id={item.id} >
                                    {this.props.state.layers.filter(function(f) { return f.id === item.id; })[0].name}
                                    <i className='fa fa-times' onClick={this.deleteLayer.bind(this, item.id)} style={{ float: 'right', lineHeight: '40px', marginRight: '5px' }} />
                                </div>;
                            }, this)}
                        </Sortable>
                    </div> : null
                }
                {state.standardLayerOrder.length > 0 ?
                    <div>
                        <label>{strings.standardLayers}</label>
                        <Sortable className='layerList'
                            onChange={this.handleSort.bind(this, 'standard')}>
                            {state.standardLayerOrder.map(function(item) {
                                return <div style={layerStyle} key={item.id} data-id={item.id} >
                                    {this.props.state.layers.filter(function(f) { return f.id === item.id; })[0].name}
                                    <i className='fa fa-times' onClick={this.deleteLayer.bind(this, item.id)} style={{ float: 'right', lineHeight: '40px', marginRight: '5px' }} />
                                </div>;
                            }, this)}
                        </Sortable>
                    </div> : null
                }
                <button className='menuButton' onClick={() => {
                    this.props.state.editingLayer = null;
                    this.props.state.visibleMenu = 0;
                    this.props.state.importWizardShown = true;
                    this.props.state.menuShown = false;
                } }>{strings.addNewLayer}</button>

                <hr />
                <label>{strings.editLayerProperties}</label>
                <Select
                    options={layers}
                    onChange={(val: { label: string, value: Layer }) => {
                        state.layerMenuState.editingLayerId = val.value.id;
                    } }
                    value={layer}
                    valueRenderer={(option: Layer) => {
                        return option ? option.name : '';
                    } }
                    clearable={false}
                    placeholder={strings.selectLayerPlaceholder}
                    />

                {layer ?
                    <div>
                        {strings.name}
                        <br />
                        <input type='text' style={{ width: '100%' }} value={layer.name} onChange={(e) => {
                            layer.name = (e.target as any).value;
                        } } />

                        {strings.layerType}
                        <br />
                        <label htmlFor='standard'>
                            {strings.layerTypeStandard}
                            <input
                                type='radio'
                                onChange={() => {
                                    if (layer.layerType !== LayerTypes.Standard) {
                                        layer.layerType = LayerTypes.Standard;
                                        layer.colorOptions.opacity = 0.8;
                                        layer.colorOptions.fillOpacity = 0.8;
                                        state.heatLayerOrder = state.heatLayerOrder.filter(function(l) { return l.id !== layer.id; });
                                        state.standardLayerOrder.push({ id: layer.id });
                                        layer.reDraw();
                                    }
                                } }
                                checked={layer.layerType === LayerTypes.Standard}
                                name='layertype'
                                id='standard'
                                />
                            <br />

                        </label>
                        <label htmlFor='heat'>
                            {strings.layerTypeHeat}
                            <input
                                type='radio'
                                onChange={() => {
                                    if (layer.layerType !== LayerTypes.HeatMap) {
                                        layer.layerType = LayerTypes.HeatMap;
                                        layer.colorOptions.colorField = layer.colorOptions.colorField || layer.numberHeaders[0];
                                        layer.colorOptions.opacity = 0.3;
                                        layer.colorOptions.fillOpacity = 0.3;
                                        state.standardLayerOrder = state.standardLayerOrder.filter(function(l) { return l.id !== layer.id; });
                                        state.heatLayerOrder.push({ id: layer.id });
                                        layer.reDraw();
                                    }
                                } }
                                checked={layer.layerType === LayerTypes.HeatMap}
                                name='layertype'
                                id='heat'
                                />
                            <br />

                        </label>
                        {this.renderHeaders.call(this)}

                    </div>

                    : null}


            </div>
        );
    }
    renderHeaders() {
        let state = this.props.state;
        let strings = state.strings;
        let arr = [];

        let layer = state.layers.filter(function(f) { return f.id === state.layerMenuState.editingLayerId; })[0];
        let columnCount = 2;
        for (let h of layer.headers) {

            arr.push(
                <tr key={h.id}>
                    <td>
                        <input type='text' style={{ width: 120 }}
                            value={h.label}
                            onChange={(e) => { h.label = (e.currentTarget as any).value; } }
                            onBlur={(e) => { layer.refreshPopUps(); } }
                            onKeyPress={(e) => { if (e.charCode === 13) { layer.refreshPopUps(); } } } />
                    </td>
                    <td>
                        <input type='number' style={{ width: 40 }}
                            value={h.decimalAccuracy.toString()}
                            onChange={(e) => { h.decimalAccuracy = (e.currentTarget as any).valueAsNumber; layer.refreshPopUps(); } }
                            min={0}
                            />


                    </td>

                </tr>
            );
        }
        return (
            <table style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <th>{strings.name}</th>
                        <th>{strings.decimalAccuracy}</th>
                    </tr>
                    {arr.map(function(td) {
                        return td;
                    })}
                </tbody>
            </table>
        );

    }


}
