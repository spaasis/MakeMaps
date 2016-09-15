import * as React from 'react';
import { AppState, ExportMenuState } from '../../stores/States';
import { observer } from 'mobx-react';

@observer
export class ExportMenu extends React.Component<{
    state: AppState,
    /** Save map as a .png image*/
    saveImage: () => void,
    /** Save map as a .makeMaps file*/
    saveFile: () => void,

}, {}>{

    render() {
        return (
            <div>
                <label htmlFor='showLegend'>Show legend on the image</label>
                <input id='showLegend' type='checkbox' checked={this.props.state.exportMenuState.showLegend} onChange={(e) => {
                    this.props.state.exportMenuState.showLegend = (e.currentTarget as any).checked;
                } }/>
                <br/>
                <label htmlFor='showFilters'>Show filters on the image</label>
                <input id='showFilters' type='checkbox' checked={this.props.state.exportMenuState.showFilters}
                    onChange={(e) => {
                        this.props.state.exportMenuState.showFilters = (e.currentTarget as any).checked;
                    } }/>
                <br/>
                <button className='menuButton' onClick={() => {
                    this.props.saveImage();
                } }>Download map as image</button>
                <br/>
                Or
                <br/>
                <button className='menuButton' onClick={() => {
                    this.props.saveFile();
                } }>Download map as a file</button>

                <br/>


            </div>
        )
    }
}
