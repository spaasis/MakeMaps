import * as React from 'react';
import { DemoPreview } from './DemoPreview';
let Dropzone = require('react-dropzone');
import { LoadExternalMap, ShowLoading, ShowNotification } from '../../common_items/common';
import { WelcomeScreenState } from '../../stores/States';
import { Strings } from '../../localizations/strings';

import { observer } from 'mobx-react';
@observer
export class WelcomeScreen extends React.Component<{
    state: WelcomeScreenState,
    loadMap: (json) => void,
    openLayerImport: () => void,
    strings: Strings,
}, {}>{

    componentDidMount() {
        this.startScrolling();
    }

    startScrolling() {
        this.props.state.scroller = setInterval(this.moveDemosLeft.bind(this), 6000);
    }

    stopScrolling() {
        clearInterval(this.props.state.scroller);
    }
    /**
     * loadDemo - Loads the specified demo from the /demos - folder
     *
     * @param  filename  Name of the file (without extension) to load
     */
    loadDemo(filename: string) {
        ShowLoading();
        let loadMap = this.props.loadMap;
        setTimeout(function() { LoadExternalMap('demos/' + filename + '.mmap', loadMap); }, 10)

    }
    createNewMap() {
        this.props.openLayerImport();
    }

    moveDemosLeft() {
        let order = this.props.state.demoOrder;
        let first = order.shift();
        order.push(first);
    }
    moveDemosRight() {
        let order = this.props.state.demoOrder;
        let last = order.pop();
        order.unshift(last);
    }

    highlightDemo(index: number) {
        let order = this.props.state.demoOrder;
        while (order.indexOf(index) > 0) {
            this.moveDemosLeft();
        }
    }

    onDrop(files) {
        let reader = new FileReader();
        let fileName, content;
        let state = this.props.state;
        let load = this.loadMap.bind(this);
        reader.onload = contentUploaded.bind(this);
        files.forEach((file) => {
            fileName = file.name;
            reader.readAsText(file);
        });
        function contentUploaded(e) {
            let contents: any = e.target;
            let ext: string = fileName.split('.').pop().toLowerCase();
            if (ext === 'mmap') {
                state.loadedMap = JSON.parse(contents.result);
                state.fileName = fileName;
                load();
            }
            else {
                ShowNotification('Select a .mmap file!');
            }

        }
    }
    loadMap() {
        ShowLoading();
        let load = this.props.loadMap;
        let json = this.props.state.loadedMap;

        setTimeout(function() { load(json) }, 10);
    }


    render() {
        let strings = this.props.strings;
        let dropStyle = {
            width: 300,
            marginRight: 5,
        }
        let blockHeaderStyle = { display: 'block', fontFamily: 'dejavu_sansextralight' };
        let infoDivStyle = { width: 200, border: '1px solid #cecece', borderRadius: '15px', padding: 10 }

        let infoBlocks =
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', maxWidth: '85%' }}>
                <div style={infoDivStyle}>
                    <b style={blockHeaderStyle}>{strings.welcomeOpenness}</b>
                    <a style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" href="https://github.com/simopaasisalo/MakeMaps"><i className='fa fa-github-square' style={{ display: 'block', fontSize: '80px', color: '#cecece' }}/></a>
                    {strings.welcomeOpennessText1}<br/>{strings.welcomeOpennessText2}<a target="_blank" rel="noopener noreferrer" href="https://github.com/simopaasisalo/MakeMaps">GitHub</a>
                </div>
                <div style={infoDivStyle}>
                    <b style={blockHeaderStyle}>{strings.welcomeAccessibility}</b>
                    <i className='fa fa-eye' style={{ display: 'block', fontSize: '80px', color: '#cecece' }}/>
                    {strings.welcomeAccessibilityText1}
                    <a target="_blank" rel="noopener noreferrer" href="http://colorbrewer2.org/">Color Brewer</a>
                    {strings.welcomeAccessibilityText2}
                </div>
                <div style={infoDivStyle}>
                    <b style={blockHeaderStyle}>{strings.welcomeUsability}</b>
                    <i className='fa fa-bolt' style={{ display: 'block', fontSize: '80px', color: '#cecece' }}/>
                    {strings.welcomeUsabilityText1} <a target="_blank" rel="noopener noreferrer" href="https://github.com/simopaasisalo/MakeMaps/wiki">{strings.wiki}</a> {strings.welcomeUsabilityText2}
                </div>
                <div style={infoDivStyle}>
                    <b style={blockHeaderStyle}>{strings.welcomeFileSupport}</b>
                    <i className='fa fa-file-text-o' style={{ display: 'block', fontSize: '80px', color: '#cecece' }}/>
                    {strings.welcomeFileSupportText}<br/><a target="_blank" rel="noopener noreferrer"  href="https://github.com/simopaasisalo/MakeMaps/wiki/Supported-file-types-and-their-requirements">{strings.welcomeFileSupportLink}</a>
                </div>
                <div style={infoDivStyle}>
                    <b style={blockHeaderStyle}>{strings.welcomeDataFiltering}</b>
                    <i className='fa fa-sliders' style={{ display: 'block', fontSize: '80px', color: '#cecece' }}/>
                    {strings.welcomeDataFilteringText}
                </div>
            </div>;


        return (<div style={{ textAlign: 'center' }}>
            <div style={{ display: 'block', margin: '0 auto', padding: 5 }}>
                <img src='app/images/favicon.png' style={{ display: 'inline-block', width: 50, height: 50, verticalAlign: 'middle' }}/>
                <img src='app/images/logo.png' style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
                <img src='app/images/favicon.png' style={{ display: 'inline-block', width: 50, height: 50, verticalAlign: 'middle' }}/>

            </div>
            <hr/>
            {this.getDemoButtons().map(function(d) { return d; })}
            <div
                style={{
                    overflowX: 'hidden', overflowY: 'hidden', height: 250, maxWidth: '85%',
                    margin: '0 auto', whiteSpace: 'nowrap', position: 'relative'
                }}
                onMouseEnter={() => { this.stopScrolling() } }
                onMouseLeave={() => { this.startScrolling() } }>
                <button className='primaryButton' style={{ height: '100%', width: 40, position: 'absolute', left: 0, top: 0 }} onClick={() => this.moveDemosRight()}>{'<'}</button>
                <div style={{ marginLeft: 40, marginRight: 40 }}>
                    {this.getHighlightedDemo()}
                </div>
                <button className='primaryButton' style={{ height: '100%', width: 40, position: 'absolute', right: 0, top: 0 }} onClick={() => this.moveDemosLeft()}>{'>'}</button>

            </div>
            <hr/>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', padding: 20 }}>
                <Dropzone
                    className='primaryButton dropButton'
                    style={dropStyle}
                    onDrop={this.onDrop.bind(this)}
                    accept={'.mmap'}
                    >
                    {strings.uploadSavedMap}
                </Dropzone>
                <button style={{ width: 300, marginLeft: 5 }} className='primaryButton' onClick={this.createNewMap.bind(this)}>{strings.createNewMap}</button>
            </div>
            <br/>
            {infoBlocks}
            <br/>

        </div >);
    }

    getDemoButtons() {
        let buttons = [];
        for (let i = 0; i < this.props.state.demoOrder.length; i++) {
            buttons.push(
                <button key={i}
                    className={'welcomeDemoButton' + (this.props.state.demoOrder[0] == i ? ' active' : '')}
                    onClick={() => { this.highlightDemo(i) } }
                    onMouseEnter={() => { this.stopScrolling() } }
                    onMouseLeave={() => { this.startScrolling() } }
                    />
            );
        }
        return buttons;
    }

    getHighlightedDemo() {
        let strings = this.props.strings;
        let demos = [<DemoPreview
            key={0}
            strings = {strings}
            imageURL='demos/chorodemo.png'
            description={strings.chorodemoDescription}
            loadDemo={this.loadDemo.bind(this, 'chorodemo')}
            onClick={() => { this.highlightDemo(0) } }
            />,
        <DemoPreview
            key={1}
            strings = {strings}
            imageURL='demos/symboldemo.png'
            description={strings.symboldemoDescription}
            loadDemo={this.loadDemo.bind(this, 'symboldemo')}
            onClick={() => { this.highlightDemo(1) } }
            />,
        <DemoPreview
            key={2}
            strings = {strings}
            imageURL='demos/hki_chartdemo.png'
            description={strings.chartDemoDescription}
            loadDemo={this.loadDemo.bind(this, 'hki_chartdemo')}
            onClick={() => { this.highlightDemo(2) } }
            />,
        <DemoPreview
            key={3}
            strings = {strings}
            imageURL='demos/hki_heatdemo.png'
            description={strings.heatDemoDescription}
            loadDemo={this.loadDemo.bind(this, 'hki_heatdemo')}
            onClick={() => { this.highlightDemo(3) } }
            />,
        <DemoPreview
            key={4}
            strings = {strings}
            imageURL='demos/clusterdemo.png'
            description={strings.clusterDemoDescription}
            loadDemo={this.loadDemo.bind(this, 'clusterdemo')}
            onClick={() => { this.highlightDemo(4) } }
            />];
        return demos[this.props.state.demoOrder[0]];

    }

}
