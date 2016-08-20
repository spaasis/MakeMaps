import * as React from 'react';
let Select = require('react-select');
import { AppState } from '../Stores/States';
import { observer } from 'mobx-react';

@observer
export class PopUpMenu extends React.Component<{
    state: AppState,
    /** Save the currently selected headers to the map*/
    saveValues: () => void,
}, {}>{

    componentWillUpdate() {
        if (this.props.state.autoRefresh)
            this.props.saveValues();
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
        return (this.props.state.visibleMenu !== 6 ? null :
            <div className="makeMaps-options">
                <label>Select the variables to show</label>
                <Select
                    options={this.props.state.editingLayer.headers.slice()}
                    multi
                    onChange={this.onSelectionChange}
                    value={this.props.state.editingLayer.popupHeaders.slice()}
                    backspaceRemoves={false}
                    />

                {this.props.state.autoRefresh ? null :
                    <button className='menuButton' onClick={() => {
                        this.props.saveValues();
                    } }>Refresh map</button>
                }
            </div >
        );
    }
}
