import * as React from 'react';
import { AppState } from '../../stores/States';
import { observer } from 'mobx-react';
let Modal = require('react-modal');
@observer
export class ClusterMenu extends React.Component<{
    state: AppState,
}, {}>{
    render() {
        let layer = this.props.state.editingLayer;
        let options = layer.clusterOptions;
        return (
            <div className='makeMaps-options'>
                <label htmlFor='useClustering'>Use clustering
                    <input id='useClustering' type='checkbox' checked={options.useClustering} onChange={(e) => {
                        options.useClustering = (e.currentTarget as any).checked;
                        layer.toggleRedraw = true;
                        layer.refresh();
                    } }/>
                </label>
                <label htmlFor='showCount'>Show point count on hover
                    <input id='showCount' type='checkbox' checked={options.showCount} onChange={(e) => {
                        options.showCount = (e.currentTarget as any).checked;
                        layer.refreshCluster();
                    } }/>
                </label>
                {options.showCount ?
                    <div>
                        <span>Text</span>
                        <input type='text' style={{ width: '100%' }} value={options.countText} onChange={(e) => {
                            options.countText = (e.target as any).value;
                            layer.refreshCluster();
                        } }/>
                    </div>
                    : null}
                <label htmlFor='showAvg'>Show average on hover
                    <input id='showAvg' type='checkbox' checked={options.showAvg} onChange={(e) => {
                        options.showAvg = (e.currentTarget as any).checked;
                        layer.refreshCluster();
                    } }/>
                </label>
                {options.showAvg ?
                    <div>
                        <span>Text</span>
                        <input type='text' style={{ width: '100%' }} value={options.avgText} onChange={(e) => {
                            options.avgText = (e.target as any).value;
                            layer.refreshCluster();
                        } }/>
                    </div>
                    : null}
                <label htmlFor='showSum'>Show sum on hover
                    <input id='showSum' type='checkbox' checked={options.showSum} onChange={(e) => {
                        options.showSum = (e.currentTarget as any).checked;
                        layer.refreshCluster();
                    } }/>
                </label>
                {options.showSum ?
                    <div>
                        <span>Text</span>
                        <input type='text' style={{ width: '100%' }} value={options.sumText} onChange={(e) => {
                            options.sumText = (e.target as any).value;
                            layer.refreshCluster();

                        } }/>
                    </div>
                    : null}



            </div>
        )
    }
}
