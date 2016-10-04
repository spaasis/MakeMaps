import * as React from 'react';
import { AppState } from '../../stores/States';
import { Legend } from '../../stores/Legend';
import { observer } from 'mobx-react';
import { TextEditor } from '../misc/TextEditor';
let Modal = require('react-modal');
@observer
export class LegendMenu extends React.Component<{
    state: AppState,
}, {}>{

    render() {
        let legend = this.props.state.legend;

        return (
            <div className="makeMaps-options">
                <label htmlFor='showLegend'>Show legend
                    <input id='showLegend' type='checkbox' checked={legend.visible} onChange={(e) => {
                        legend.visible = (e.currentTarget as any).checked;
                    } }/>
                </label>
                <br/>
                {legend.visible ? <div>
                    <label>Title</label>
                    <input type='text' style={{ width: '100%' }} value={legend.title} onChange={(e) => {
                        legend.title = (e.target as any).value;
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
                            legend.showPercentages = (e.currentTarget as any).checked;
                        } }/>
                    </label>
                    <br/>
                    <label htmlFor='showPercentages'>Show variable names
                        <input id='showPercentages' type='checkbox' checked={legend.showVariableNames} onChange={(e) => {
                            legend.showVariableNames = (e.currentTarget as any).checked;
                        } }/>
                    </label>
                    <br/>
                    <label htmlFor='makeHorizontal'>Align horizontally
                        <input id='makeHorizontal' type='checkbox' checked={legend.horizontal} onChange={(e) => {
                            legend.horizontal = (e.currentTarget as any).checked;
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

                </div> : null}
            </div >)
    }
}
