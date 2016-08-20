import * as React from 'react';
let Sortable = require('react-sortablejs')
import { AppState } from '../Stores/States';
import { Layer } from '../Stores/Layer';
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

    onBaseMapChange = (e: ISelectData) => {
        this.props.state.map.removeLayer(this.props.state.activeBaseLayer);
        this.props.state.activeBaseLayer = e.value;
        this.props.state.map.addLayer(this.props.state.activeBaseLayer);
    }

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
            this.props.state.map.removeLayer(layerInfo.layer);
        }
    }
    render() {
        if (this.props.state.visibleMenu !== 1)
            return <div/>
        let layerStyle = {
            cursor: 'pointer',
            width: '90%',
            background: 'white',
            color: 'black',
            borderColor: 'white',
            borderWidth: '3px',
            borderStyle: 'double',
            borderRadius: '15px',
            textAlign: 'center',
            lineHeight: '20px',
        }
        return (
            <div className="mapify-options">
                <label>Select the base map</label>
                <Select
                    options={this.props.state.obsBaseLayers}
                    onChange={this.onBaseMapChange}
                    value={{ value: this.props.state.activeBaseLayer, label: this.props.state.activeBaseLayer.options.id }}
                    clearable={false}
                    />
                <hr/>
                <label>Drag and drop to reorder</label>
                <Sortable className='layerList' onChange={this.handleSort.bind(this)}>
                    {this.props.state.layerMenuState.order.map(function(layer) {
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

            </div>
        );
    }


}
