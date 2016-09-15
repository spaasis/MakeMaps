import * as React from 'react';
import { LayerType } from "./LayerType";
import { LayerTypes } from "../../common_items/common";
import { ImportWizardState, AppState } from '../../stores/States';
import { Layer } from '../../stores/Layer';
import { observer } from 'mobx-react';

@observer
export class LayerTypeSelectView extends React.Component<{
    state: ImportWizardState,
    appState: AppState,
    /** cancels the layer import wizard */
    cancel: () => void,
}, {}>{
    newlayer = this.props.state.layer = new Layer(this.props.appState);


    onMapTypeClick = (type: LayerTypes) => {
        this.props.state.layer.layerType = type;
    }

    proceed = () => {
        let layer = this.props.state.layer;
        let col = layer.colorOptions;
        if (layer.layerType === null) {
            alert('Choose a layer type!');
        }
        else {
            if (layer.layerType === LayerTypes.HeatMap) {
                col.revert = true;
                col.colorScheme = 'RdYlBu';
                col.useMultipleFillColors = true;
            }
            else if (layer.layerType === LayerTypes.ChoroplethMap) {
                col.useMultipleFillColors = true;

            }
            this.props.state.step++
        }
    }

    public render() {
        let layer = this.props.state.layer;

        return (
            <div>
                <div>
                    <h2>Select a map type to create</h2>
                    <hr/>
                    <div style = {{ height: 600 }}>
                        <LayerType
                            name = 'Choropleth'
                            type = {LayerTypes.ChoroplethMap}
                            imageURL = 'app/images/choropreview.png'
                            description = 'Use this type to create clean and easy to read maps from your polygon data. Color the areas by a single value by selecting a predefined color scheme or define your own.'
                            onClick = {this.onMapTypeClick}
                            selected = {layer.layerType == LayerTypes.ChoroplethMap}
                            />
                        <LayerType
                            name = 'Symbol map'
                            type = {LayerTypes.SymbolMap}
                            imageURL = 'app/images/symbolpreview.png'
                            description = 'Use icons and charts to bring your point data to life! Scale symbol size by a value and give them choropleth-style coloring to create multi-value maps.'
                            onClick = {this.onMapTypeClick}
                            selected = {layer.layerType == LayerTypes.SymbolMap}

                            />
                        <LayerType
                            name = 'Heatmap'
                            type = {LayerTypes.HeatMap}
                            imageURL = 'app/images/heatpreview.png'
                            description = 'Turn your point data into an intensity map with this layer type. A really effective map type for large point datasets'
                            onClick = {this.onMapTypeClick}
                            selected = {layer.layerType === LayerTypes.HeatMap}
                            />
                    </div>

                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }}  onClick={() => {
                    this.props.cancel();
                } }>Cancel</button>
                <button className='primaryButton' disabled={layer.layerType === undefined} style={{ position: 'absolute', right: 15, bottom: 15 }}  onClick={this.proceed}>Continue</button>
            </div >
        );
    }

}
