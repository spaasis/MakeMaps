import * as React from 'react';
let Sortable = require('react-sortablejs')
import { AppState } from '../../stores/States';
import { Layer, LayerTypes } from '../../stores/Layer';
import { observer } from 'mobx-react';
let Select = require('react-select');

@observer
export class LayerMenu extends React.Component<{
    state: AppState,
    /** Function to signal the opening of the layer import wizard. Triggered by button press*/
    addNewLayer: () => void,
    /** Save the current order to the map*/
    saveOrder: () => void,
}, {}>{
    handleSort(type: 'heat' | 'standard', items: string[]) {
        let arr: { id: number }[] = [];
        for (let i of items) {
            arr.push(this.getLayerById(+i));
        }
        if (type == 'standard')
            this.props.state.layerMenuState.standardLayerOrder = arr;
        else
            this.props.state.layerMenuState.heatLayerOrder = arr;
        this.props.saveOrder();
    }
    getLayerById(id: number) {

        for (let lyr of this.props.state.layers) {
            if (lyr.id === id) {
                return { name: lyr.name, id: lyr.id };
            }
        }
    }
    deleteLayer(id: number) {
        let layerInfo = this.props.state.layers.filter(lyr => lyr.id == id)[0];
        if (layerInfo) {
            this.props.state.layers = this.props.state.layers.filter((lyr) => { return lyr.id != id });
            this.props.state.map.removeLayer(layerInfo.displayLayer);
            this.props.state.layerMenuState.standardLayerOrder = this.props.state.layerMenuState.standardLayerOrder.filter((l) => { return l.id != id });
        }
    }
    render() {
        let menuState = this.props.state.layerMenuState;
        let layer = menuState.editingLayer;
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
        }
        return (
            <div className="makeMaps-options">
                <label>Select the base map</label>
                <Select
                    options={this.props.state.obsBaseLayers}
                    onChange={(e: ISelectData) => {
                        this.props.state.map.removeLayer(this.props.state.activeBaseLayer.layer);
                        console.log(this.props.state.activeBaseLayer)
                        this.props.state.map.addLayer(this.props.state.activeBaseLayer.layer);
                    } }
                    value={{ value: this.props.state.activeBaseLayer, label: this.props.state.activeBaseLayer.id }}
                    clearable={false}
                    />
                <hr/>
                <label>Drag and drop to reorder</label>
                {menuState.heatLayerOrder.length > 0 ?
                    <div>
                        <label>Heat layers</label>
                        <Sortable className='layerList'
                            onChange={this.handleSort.bind(this, 'heat')}>
                            {menuState.heatLayerOrder.map(function(item) {
                                return <div style={layerStyle} key={item.id} data-id={item.id} >
                                    {this.props.state.layers.filter(function(f) { return f.id === item.id })[0].name}
                                    <i className="fa fa-times" onClick = {this.deleteLayer.bind(this, item.id)} style={{ float: 'right', lineHeight: '40px', marginRight: '5px' }}/>
                                </div>;
                            }, this)}
                        </Sortable>
                    </div> : null
                }
                {menuState.standardLayerOrder.length > 0 ?
                    <div>
                        <label>Standard layers</label>
                        <Sortable className='layerList'
                            onChange={this.handleSort.bind(this, 'standard')}>
                            {menuState.standardLayerOrder.map(function(item) {
                                return <div style={layerStyle} key={item.id} data-id={item.id} >
                                    {this.props.state.layers.filter(function(f) { return f.id === item.id })[0].name}
                                    <i className="fa fa-times" onClick = {this.deleteLayer.bind(this, item.id)} style={{ float: 'right', lineHeight: '40px', marginRight: '5px' }}/>
                                </div>;
                            }, this)}
                        </Sortable>
                    </div> : null
                }
                <button className='menuButton' onClick={() => {
                    this.props.addNewLayer();
                } }>Add new layer</button>

                <hr/>
                <label>Edit layer properties</label>
                <Select
                    options={layers}
                    onChange = {(val: { label: string, value: Layer }) => {
                        menuState.editingLayer = val.value;
                    } }
                    value = {menuState.editingLayer}
                    valueRenderer = {(option: Layer) => {
                        return option ? option.name : '';
                    } }
                    clearable={false}
                    placeholder='Select layer...'
                    />

                {layer ?
                    <div>
                        Name
                        <br/>
                        <input type='text' style={{ width: '100%' }} value={layer.name} onChange={(e) => {
                            layer.name = (e.target as any).value;
                        } }/>

                        Layer type
                        <br/>
                        <label forHTML='standard'>
                            Standard
                            <input
                                type='radio'
                                onChange={() => {
                                    if (layer.layerType !== LayerTypes.Standard) {
                                        layer.layerType = LayerTypes.Standard;
                                        layer.colorOptions.opacity = 0.8;
                                        layer.colorOptions.fillOpacity = 0.8;
                                        menuState.heatLayerOrder = menuState.heatLayerOrder.filter(function(l) { return l.id !== layer.id });
                                        menuState.standardLayerOrder.push({ id: layer.id });
                                        layer.toggleRedraw = true;
                                        layer.refresh();
                                    }
                                } }
                                checked={layer.layerType === LayerTypes.Standard}
                                name='layertype'
                                id='standard'
                                />
                            <br/>

                        </label>
                        <label forHTML='heat'>
                            HeatMap
                            <input
                                type='radio'
                                onChange={() => {
                                    if (layer.layerType !== LayerTypes.HeatMap) {
                                        layer.layerType = LayerTypes.HeatMap;
                                        layer.colorOptions.colorField = layer.colorOptions.colorField || layer.numberHeaders[0];
                                        layer.colorOptions.opacity = 0.3;
                                        layer.colorOptions.fillOpacity = 0.3;
                                        layer.toggleRedraw = true;
                                        menuState.standardLayerOrder = menuState.standardLayerOrder.filter(function(l) { return l.id !== layer.id });
                                        menuState.heatLayerOrder.push({ id: layer.id });
                                        layer.refresh();
                                    }
                                } }
                                checked={layer.layerType === LayerTypes.HeatMap}
                                name='layertype'
                                id='heat'
                                />
                            <br/>

                        </label>
                        {this.renderHeaders.call(this)}

                    </div>

                    : null}


            </div>
        );
    }
    renderHeaders() {
        let arr = [];
        let menuState = this.props.state.layerMenuState;
        let headers = menuState.editingLayer.headers.slice()
        let columnCount = 2;
        for (let i = 0; i < headers.length; i++) {
            let h = headers[i]

            arr.push(
                <tr key={i}>
                    <td>
                        <input type='text' style={{ width: 120 }}
                            value={h.label}
                            onChange={(e) => { h.label = (e.currentTarget as any).value } }
                            onBlur={(e) => { menuState.editingLayer.refreshPopUps() } }
                            onKeyPress={(e) => { if (e.charCode == 13) { menuState.editingLayer.refreshPopUps() } } }/>
                    </td>
                    <td>
                        <input type='number' style={{ width: 40 }}
                            value={h.decimalAccuracy}
                            onChange={(e) => { h.decimalAccuracy = (e.currentTarget as any).valueAsNumber; menuState.editingLayer.refreshPopUps(); } }
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
                        <th>Name</th>
                        <th>Decimals</th>
                    </tr>
                    {arr.map(function(td) {
                        return td;
                    })}
                </tbody>
            </table>
        );

    }


}
