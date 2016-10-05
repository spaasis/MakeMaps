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
    /** Save map as .html iFrame*/
    saveEmbedCode: () => void,

}, {}>{

    render() {
        let strings = this.props.state.strings;
        return (
            <div>
                {this.props.state.legend.visible ?
                    <div>
                        <label htmlFor='showLegend'>{strings.downloadShowLegend}</label>
                        <input id='showLegend' type='checkbox' checked={this.props.state.exportMenuState.showLegend} onChange={(e) => {
                            this.props.state.exportMenuState.showLegend = (e.currentTarget as any).checked;
                        } }/>
                        <br/>
                    </div> : null
                }
                {this.props.state.filters.length > 0 ?
                    <div>
                        <label htmlFor='showFilters'>{strings.downloadShowFilters}</label>
                        <input id='showFilters' type='checkbox' checked={this.props.state.exportMenuState.showFilters}
                            onChange={(e) => {
                                this.props.state.exportMenuState.showFilters = (e.currentTarget as any).checked;
                            } }/>
                        <br/>
                    </div> : null
                }

                <button className='menuButton' onClick={() => {
                    this.props.saveImage();
                } }>{strings.saveAsImage}</button>
                <br/>
                {strings.or}
                <br/>
                <button className='menuButton' onClick={() => {
                    this.props.saveFile();
                } }>{strings.saveAsFile}</button>



            </div>
        )
    }
}
