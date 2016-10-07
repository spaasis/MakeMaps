import * as React from 'react';
import { AppState } from '../../stores/States';
import { observer } from 'mobx-react';
import { Header } from '../../stores/Layer';
let Select = require('react-select');

@observer
export class ClusterMenu extends React.Component<{
    state: AppState,
}, {}>{
    render() {
        let strings = this.props.state.strings;
        let layer = this.props.state.editingLayer;
        let menuState = this.props.state.clusterMenuState;
        let options = layer.clusterOptions;
        let hoverHeader = menuState.selectedHeader ? options.hoverHeaders.filter(function(f) { return f.headerId == menuState.selectedHeader.id })[0] : undefined;
        return (
            <div className='makeMaps-options'>
                <label htmlFor='useClustering'>{strings.useClustering}
                    <input id='useClustering' type='checkbox' checked={options.useClustering} onChange={(e) => {
                        let val = (e.currentTarget as any).checked;
                        if (options.useClustering != val) {
                            options.useClustering = val;
                            layer.reDraw()
                        }
                    } }/>
                </label>
                {options.useClustering ?
                    <div>
                        <label htmlFor='useDefaultStyle'>{strings.clusterUseSymbolStyle}
                            <input id='useDefaultStyle' type='checkbox' checked={options.useSymbolStyle} onChange={(e) => {
                                options.useSymbolStyle = (e.currentTarget as any).checked;
                                layer.refreshCluster();
                            } }/>
                        </label>
                        <label htmlFor='showCount'>{strings.clusterShowCount}
                            <input id='showCount' type='checkbox' checked={options.showCount} onChange={(e) => {
                                options.showCount = (e.currentTarget as any).checked;
                                layer.refreshCluster();
                            } }/>
                        </label>
                        {options.showCount ?
                            <div>
                                <span>{strings.displayText}</span>
                                <input type='text' style={{ width: '100%' }} value={options.countText} onChange={(e) => {
                                    options.countText = (e.target as any).value;
                                    layer.refreshCluster();
                                } }/>
                            </div>
                            : null}
                        {strings.clusterInfo}
                        <Select
                            options={layer.numberHeaders}
                            onChange={(e: Header) => { menuState.selectedHeader = e; } }
                            value={menuState.selectedHeader}
                            clearable={true}
                            />
                        {menuState.selectedHeader ?
                            <div>
                                <label htmlFor='showAvg'>{strings.clusterShowAvg}
                                    <input id='showAvg' type='checkbox'
                                        checked={hoverHeader ? hoverHeader.showAvg : false}
                                        onChange={(e) => {
                                            let val: boolean = (e.currentTarget as any).checked;
                                            if (hoverHeader && val)
                                                hoverHeader.showAvg = val;
                                            else if (hoverHeader && !val) {
                                                if (!hoverHeader.showSum)
                                                    options.hoverHeaders = options.hoverHeaders.filter(function(f) { return f.headerId != menuState.selectedHeader.id }); //remove from hoverHeaders
                                            }
                                            else if (val && !hoverHeader) {
                                                options.hoverHeaders.push({ headerId: menuState.selectedHeader.id, showAvg: val, showSum: false, avgText: menuState.selectedHeader.label + ' avg: ', sumText: menuState.selectedHeader.label + ' sum: ' });
                                            }
                                            layer.refreshCluster();
                                        } }/>
                                </label>
                                {hoverHeader && hoverHeader.showAvg ?
                                    <div>
                                        <span>{strings.displayText}</span>
                                        <input type='text' style={{ width: '100%' }} value={hoverHeader.avgText}
                                            onChange={(e) => {
                                                hoverHeader.avgText = (e.target as any).value;
                                                layer.refreshCluster();
                                            } }/>
                                    </div>
                                    : null}
                                <label htmlFor='showSum'>{strings.clusterShowSum}
                                    <input id='showSum' type='checkbox'
                                        checked={hoverHeader ? hoverHeader.showSum : false}
                                        onChange={(e) => {
                                            let val: boolean = (e.currentTarget as any).checked;
                                            if (hoverHeader && val)
                                                hoverHeader.showSum = val;
                                            else if (hoverHeader && !val) {
                                                if (!hoverHeader.showAvg)
                                                    options.hoverHeaders = options.hoverHeaders.filter(function(f) { return f.headerId != menuState.selectedHeader.id }); //remove from hoverHeaders
                                            } else if (val && !hoverHeader) {
                                                options.hoverHeaders.push({ headerId: menuState.selectedHeader.id, showSum: val, showAvg: false, avgText: menuState.selectedHeader.label + ' avg: ', sumText: menuState.selectedHeader.label + ' sum: ' });
                                            }

                                            layer.refreshCluster();
                                        } }/>
                                </label>
                                {hoverHeader && hoverHeader.showSum ?

                                    <div>
                                        <span>{strings.displayText}</span>
                                        <input type='text' style={{ width: '100%' }} value={hoverHeader.sumText}
                                            onChange={(e) => {
                                                hoverHeader.sumText = (e.target as any).value;
                                                layer.refreshCluster();
                                            } }/>
                                    </div>
                                    : null}

                            </div>
                            : <i>{strings.clusterInfoHelpText}</i>}
                    </div> :
                    <div>
                        <i>{strings.clusterHelpText}</i>
                    </div>
                }

            </div>
        )
    }
}
