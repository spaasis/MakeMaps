import * as React from 'react';
import { AppState } from '../../stores/States';
import { observer } from 'mobx-react';
import { IHeader } from '../../stores/Layer';
let Select = require('react-select');

@observer
export class ClusterMenu extends React.Component<{
    state: AppState,
}, {}>{
    render() {
        let layer = this.props.state.editingLayer;
        let menuState = this.props.state.clusterMenuState;
        let options = layer.clusterOptions;
        let hoverHeader = menuState.selectedHeader ? options.hoverHeaders.filter(function(f) { return f.header.value == menuState.selectedHeader.value })[0] : undefined;
        return (
            <div className='makeMaps-options'>
                <label htmlFor='useClustering'>Use clustering
                    <input id='useClustering' type='checkbox' checked={options.useClustering} onChange={(e) => {
                        options.useClustering = (e.currentTarget as any).checked;
                        layer.toggleRedraw = true;
                        layer.refresh();
                    } }/>
                </label>
                <label htmlFor='useDefaultStyle'>Use symbol style
                    <input id='useDefaultStyle' type='checkbox' checked={options.useSymbolStyle} onChange={(e) => {
                        options.useSymbolStyle = (e.currentTarget as any).checked;
                        layer.refreshCluster();
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
                Cluster info
                <Select
                    options={layer.numberHeaders}
                    onChange={(e: IHeader) => { menuState.selectedHeader = e; } }
                    value={menuState.selectedHeader}
                    clearable={true}
                    />
                {menuState.selectedHeader ?
                    <div>
                        <label htmlFor='showAvg'>Show average on hover
                            <input id='showAvg' type='checkbox'
                                checked={hoverHeader ? hoverHeader.showAvg : false}
                                onChange={(e) => {
                                    let val: boolean = (e.currentTarget as any).checked;
                                    if (hoverHeader && val)
                                        hoverHeader.showAvg = val;
                                    else if (hoverHeader && !val) {
                                        if (!hoverHeader.showSum)
                                            options.hoverHeaders = options.hoverHeaders.filter(function(f) { return f.header != menuState.selectedHeader }); //remove from hoverHeaders
                                    }
                                    else if (val && !hoverHeader) {
                                        options.hoverHeaders.push({ header: menuState.selectedHeader, showAvg: val, showSum: false, avgText: menuState.selectedHeader.label + ' avg: ', sumText: menuState.selectedHeader.label + ' sum: ' });
                                    }
                                    layer.refreshCluster();
                                } }/>
                        </label>
                        {hoverHeader && hoverHeader.showAvg ?
                            <div>
                                <span>Text</span>
                                <input type='text' style={{ width: '100%' }} value={hoverHeader.avgText}
                                    onChange={(e) => {
                                        hoverHeader.avgText = (e.target as any).value;
                                        layer.refreshCluster();
                                    } }/>
                            </div>
                            : null}
                        <label htmlFor='showSum'>Show sum on hover
                            <input id='showSum' type='checkbox'
                                checked={hoverHeader ? hoverHeader.showSum : false}
                                onChange={(e) => {
                                    let val: boolean = (e.currentTarget as any).checked;
                                    if (hoverHeader && val)
                                        hoverHeader.showSum = val;
                                    else if (hoverHeader && !val) {
                                        if (!hoverHeader.showAvg)
                                            options.hoverHeaders = options.hoverHeaders.filter(function(f) { return f.header != menuState.selectedHeader }); //remove from hoverHeaders
                                    } else if (val && !hoverHeader) {
                                        options.hoverHeaders.push({ header: menuState.selectedHeader, showSum: val, showAvg: false, avgText: menuState.selectedHeader.label + ' avg: ', sumText: menuState.selectedHeader.label + ' sum: ' });
                                    }

                                    layer.refreshCluster();
                                } }/>
                        </label>
                        {hoverHeader && hoverHeader.showSum ?

                            <div>
                                <span>Text</span>
                                <input type='text' style={{ width: '100%' }} value={hoverHeader.sumText}
                                    onChange={(e) => {
                                        hoverHeader.sumText = (e.target as any).value;
                                        layer.refreshCluster();

                                    } }/>
                            </div>
                            : null}

                    </div>
                    : <i>Select a header from the list and choose what kind of information about it is displayed when the cluster is hovered</i>}


            </div>
        )
    }
}
