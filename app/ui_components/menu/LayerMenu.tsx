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
    /** Save the current order to the map. Triggered by button press*/
    saveOrder: () => void,
}, {}>{
    // shouldComponentUpdate(nextProps: ILayerMenuProps, nextState: ILayerMenuStates) {
    //     return this.props.isVisible !== nextProps.isVisible ||
    //         this.props.layers !== nextProps.layers ||
    //         this.areOrdersDifferent(this.state.order, nextState.order);
    // }

    // componentWillReceiveProps(nextProps: ILayerMenuProps) {
    //     this.setState({
    //         order: this.getOriginalOrder(nextProps.layers)
    //     })
    // }

    areOrdersDifferent(first: { name: string, id: number }[], second: { name: string, id: number }[]) {
        if (first.length !== second.length)
            return true;
        for (let i = 0; i < first.length; i++) {
            if (first[i].id !== second[i].id) {
                return true;
            }
        }
        return false;
    }
    getOriginalOrder(layers?: Layer[]) {
        if (!layers) layers = this.props.state.layers;

        let arr = [];
        for (let lyr of layers) {
            arr.push({ name: lyr.name, id: lyr.id });
        }
        return arr;
    }
    handleSort(items: string[]) {
        let arr: { name: string, id: number }[] = [];
        for (let i of items) {
            arr.push(this.getLayerInfoById(+i));
        }
        this.props.state.layerMenuState.order = arr;
        this.props.saveOrder();
    }
    getLayerInfoById(id: number) {

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
            this.props.state.layerMenuState.order = this.props.state.layerMenuState.order.filter((l) => { return l.id != id });
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
            lineHeight: '20px',
            border: '1px solid gray'
        }
        return (
            <div className="makeMaps-options">
                <label>Select the base map</label>
                <Select
                    options={this.props.state.obsBaseLayers}
                    onChange={(e: ISelectData) => {
                        this.props.state.map.removeLayer(this.props.state.activeBaseLayer);
                        this.props.state.activeBaseLayer = e.value;
                        this.props.state.map.addLayer(this.props.state.activeBaseLayer);
                    } }
                    value={{ value: this.props.state.activeBaseLayer, label: this.props.state.activeBaseLayer.options.id }}
                    clearable={false}
                    />
                <hr/>
                <label>Drag and drop to reorder</label>
                <Sortable className='layerList' onChange={this.handleSort.bind(this)}>
                    {menuState.order.map(function(layer) {
                        return <div style={layerStyle} key={layer.id} data-id={layer.id} >
                            {layer.name}
                            <i className="fa fa-times" onClick = {this.deleteLayer.bind(this, layer.id)}/>
                        </div>;
                    }, this)}
                </Sortable>
                {this.props.state.autoRefresh ? null :
                    <button className='menuButton'
                        onClick={() => {
                            this.props.saveOrder(); //unnecessary? just set the state?
                        } }>Save</button>}
                <button className='menuButton' onClick={() => {
                    this.props.addNewLayer();
                } }>Add new layer</button>

                <hr/>
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
                    />

                {layer ?
                    <div>
                        Layer type
                        <br/>
                        <label forHTML='standard'>
                            Standard
                            <input
                                type='radio'
                                onChange={() => {
                                    if (layer.layerType !== LayerTypes.Standard) {
                                        layer.layerType = LayerTypes.Standard;
                                        if (this.props.state.autoRefresh) {
                                            layer.toggleRedraw = true;
                                            layer.refresh();
                                        }
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
                                        if (this.props.state.autoRefresh) {
                                            layer.toggleRedraw = true;
                                            layer.refresh();
                                        }
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
