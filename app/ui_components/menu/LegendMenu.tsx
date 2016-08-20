import * as React from 'react';
import { AppState } from '../Stores/States';
import { Legend } from '../Stores/Legend';
import { observer } from 'mobx-react';
import { TextEditor } from '../misc/TextEditor';
let Modal = require('react-modal');
@observer
export class LegendMenu extends React.Component<{
    state: AppState,
}, {}>{

    render() {
        if (this.props.state.visibleMenu !== 5)
            return <div/>
        let legend = this.props.state.legend;
        let metaStyle = {
            overlay: {
                position: 'fixed',
                height: 600,
                width: 300,
                right: 230,
                bottom: '',
                top: 20,
                left: '',
                backgroundColor: ''

            },
            content: {
                border: '4px solid #6891e2',
                borderRadius: 15,
                padding: '0px',
                height: 650,
                width: 300,
                right: '',
                bottom: '',
                top: '',
                left: '',
            }
        }

        return (
            <div className="makeMaps-options">
                <label htmlFor='showLegend'>Show legend
                    <input id='showLegend' type='checkbox' checked={legend.visible} onChange={(e) => {
                        this.props.state.legend.visible = (e.currentTarget as any).checked;
                    } }/>
                </label>
                <br/>
                <label>Title</label>
                <input type='text' style={{ width: '100%' }} value={legend.title} onChange={(e) => {
                    this.props.state.legend.title = (e.target as any).value;
                } }/>
                <br/>
                <label htmlFor='showEdit'>Show legend edit options
                    <input id='showEdit' type='checkbox' checked={legend.edit} onChange={(e) => {
                        legend.edit = (e.currentTarget as any).checked;
                    } }/>
                </label>
                <br/>
                <label htmlFor='showPercentages'>Show distribution
                    <input id='showPercentages' type='checkbox' checked={legend.showPercentages} onChange={(e) => {
                        this.props.state.legend.showPercentages = (e.currentTarget as any).checked;
                    } }/>
                </label>
                <br/>
                <label htmlFor='makeHorizontal'>Align horizontally
                    <input id='makeHorizontal' type='checkbox' checked={legend.horizontal} onChange={(e) => {
                        this.props.state.legend.horizontal = (e.currentTarget as any).checked;
                    } }/>
                </label>
                <hr/>
                <label>Legend position</label>
                <table style={{ cursor: 'pointer', border: "1px solid #999999", width: 50, height: 50, margin: '0 auto' }}>
                    <tbody>
                        <tr>
                            <td style={{
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.top && legend.left ? "#FFF" : ""
                            }}
                                onClick={() => { legend.top = true; legend.left = true; legend.bottom = false; legend.right = false; } }/>
                            <td style={{
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.top && legend.right ? "#FFF" : ""
                            }}
                                onClick={() => { legend.top = true; legend.right = true; legend.bottom = false; legend.left = false; } }/>
                        </tr>
                        <tr>
                            <td style={{
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.bottom && legend.left ? "#FFF" : ""
                            }}
                                onClick={() => { legend.bottom = true; legend.left = true; legend.top = false; legend.right = false; } }/>
                            <td style={{
                                border: "1px solid #999999", borderRadius: 5,
                                background: legend.bottom && legend.right ? "#FFF" : ""
                            }}
                                onClick={() => { legend.bottom = true; legend.right = true; legend.top = false; legend.left = false; } }/>
                        </tr>
                    </tbody>
                </table>

            </div >)
    }
}
