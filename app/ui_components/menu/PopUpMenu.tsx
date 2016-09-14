import * as React from 'react';
let Select = require('react-select');
import { AppState } from '../Stores/States';
import { observer } from 'mobx-react';

@observer
export class PopUpMenu extends React.Component<{
    state: AppState,
}, {}>{

    saveValues() {
        this.props.state.editingLayer.refreshPopUps();
    }

    onSelectionChange = (e: IHeader[]) => {
        let headers = this.props.state.editingLayer.popupHeaders;
        if (e === null)
            e = [];
        headers.splice(0, headers.length) //empty headers
        for (let i in e) { //add new headers
            headers.push(e[i]);
        }
    }
    render() {
        let layer = this.props.state.editingLayer;
        return (this.props.state.visibleMenu !== 6 ? null :
            <div className="makeMaps-options">
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
                        Open on mouse over
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
                </div>
                {this.props.state.autoRefresh ? null :
                    <button className='menuButton' onClick={() => {
                        this.saveValues();
                    } }>Refresh map</button>
                }
            </div >
        );
    }
}
