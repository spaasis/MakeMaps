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
        let layer = this.props.state.editingLayer;
        return (<div className="makeMaps-options">
            <label>Select the variables to show</label>
            <Select
                options={layer.headers.slice()}
                multi
                onChange={this.onSelectionChange}
                value={layer.popupHeaders.slice()}
                backspaceRemoves={false}
                />

            <div>
                <label forHTML='click'>
                    Open on click
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
                Or
                <br/>
                <label forHTML='hover' style={{ marginTop: 0 }}>
                    Open on hover
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
                    Open on map element
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
                Or
                <br/>
                <label forHTML='separate' style={{ marginTop: 0 }}>
                    Open in separate container
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
                } }>Refresh map</button>
            }
            <br/>
            <i>Pop-ups show information about map features, such as points and areas. Select the data you wish to show, and the method by which the pop-up is opened.</i>
        </div >
        );
    }
}
