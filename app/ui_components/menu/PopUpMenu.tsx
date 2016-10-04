import * as React from 'react';
let Select = require('react-select');
import { AppState } from '../../stores/States';
import { observer } from 'mobx-react';
import { Header } from '../../stores/Layer';

@observer
export class PopUpMenu extends React.Component<{
    state: AppState,
}, {}>{

    saveValues() {
        this.props.state.editingLayer.refreshPopUps();
    }

    onSelectionChange = (e: Header[]) => {
        let layer = this.props.state.editingLayer;
        if (e === null)
            e = [];
        layer.popupHeaders = [] //empty headers
        for (let i of e) { //add new headers
            layer.popupHeaders.push(i);
        }
        if (this.props.state.autoRefresh)
            layer.refreshPopUps();

    }
    render() {
        console.log('renderstart')

        let strings = this.props.state.strings;
        let layer = this.props.state.editingLayer;
        return (<div className="makeMaps-options">
            <label>{strings.selectHeadersToShow}</label>
            <Select
                options={layer.headers.slice()}
                multi
                onChange={this.onSelectionChange}
                value={layer.popupHeaders.slice()}
                backspaceRemoves={false}
                placeholder={strings.selectPlaceholder}
                />

            <div>
                <label forHTML='click'>
                    {strings.showPopupOnClick}
                    <input
                        type='radio'
                        onChange={() => {
                            layer.showPopUpOnHover = false;
                            if (this.props.state.autoRefresh)
                                layer.refreshPopUps();

                        } }
                        checked={!layer.showPopUpOnHover}
                        name='openMethod'
                        id='click'
                        />
                </label>
                <br/>
                {strings.or}
                <br/>
                <label forHTML='hover' style={{ marginTop: 0 }}>
                    {strings.showPopUpOnHover}
                    <input
                        type='radio'
                        onChange={() => {
                            layer.showPopUpOnHover = true;
                            if (this.props.state.autoRefresh)
                                layer.refreshPopUps();
                        } }
                        checked={layer.showPopUpOnHover}
                        name='openMethod'
                        id='hover'
                        />

                </label>
                <br/>
                <label forHTML='inPlace'>
                    {strings.showPopUpInPlace}
                    <input
                        type='radio'
                        onChange={() => {
                            layer.showPopUpInPlace = true;
                            if (this.props.state.autoRefresh)
                                layer.refreshPopUps();

                        } }
                        checked={layer.showPopUpInPlace}
                        name='placement'
                        id='inPlace'
                        />
                </label>
                <br/>
                {strings.or}
                <br/>
                <label forHTML='separate' style={{ marginTop: 0 }}>
                    {strings.showPopUpUpTop}
                    <input
                        type='radio'
                        onChange={() => {
                            layer.showPopUpInPlace = false;
                            if (this.props.state.autoRefresh)
                                layer.refreshPopUps();
                        } }
                        checked={!layer.showPopUpInPlace}
                        name='placement'
                        id='separate'
                        />

                </label>
            </div>
            {this.props.state.autoRefresh ? null :
                <button className='menuButton' onClick={() => {
                    this.saveValues();
                } }>{strings.refreshMap}</button>
            }
            <br/>
            <i>{strings.popupHelp}</i>
            {layer.clusterOptions.useClustering ?
                <div>
                    <i>{strings.popupClusterHelp}</i>
                </div>
                : null}
        </div >
        );
    }
}
