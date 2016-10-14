import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppState, ImportWizardState, WelcomeScreenState, ColorMenuState, SymbolMenuState, FilterMenuState, LegendMenuState, LayerMenuState, ExportMenuState, ClusterMenuState, SaveState } from '../stores/States';
import { Layer, ColorOptions, SymbolOptions, ClusterOptions, Header, LayerTypes } from '../stores/Layer';
import { Map } from './Map';
import { Locale } from '../localizations/Locale';
import { Strings } from '../localizations/Strings';
import { WelcomeScreen } from './misc/WelcomeScreen';
import { LayerImportWizard } from './import_wizard/LayerImportWizard';
import { MakeMapsMenu } from './menu/Menu';
import { HideLoading, HideNotification } from '../common_items/common';
import { observer } from 'mobx-react';

let Modal = require('react-modal');



const state = new AppState();


@observer
export class View extends React.Component<{ state: AppState }, {}>{

    componentWillMount() {
        if (!this.props.state.embed) {
            window.onpopstate = this.onBackButtonEvent.bind(this);
        }
        let parameters = decodeURIComponent(window.location.search.substring(1)).split('&');
        for (let i of parameters) {
            if (i.indexOf('mapURL') > -1)
                this.props.state.embed = true;
        }
        this.props.state.language = Locale.getLanguage();
        //Hack - get all the string options visible in the IDE
        let strings: Strings = (Locale as any);
        this.props.state.strings = strings;

    }
    changeLanguage(lang: string) {
        Locale.setLanguage(lang);
        this.props.state.language = lang;
    }

    reset() {
        let state = this.props.state;
        for (let layer of state.layers) {
            state.map.removeLayer(layer.displayLayer);
        }
        for (let filter of state.filters) {
            filter.show = false;
        }
        state.menuShown = false;
        state.layers = [];
        state.filters = [];
        if (state.legend) {
            state.legend.visible = false;
            state.legend = null;
        }
        state.welcomeScreenState = new WelcomeScreenState();
        state.colorMenuState = new ColorMenuState();
        state.symbolMenuState = new SymbolMenuState();
        state.filterMenuState = new FilterMenuState();
        state.legendMenuState = new LegendMenuState();
        state.layerMenuState = new LayerMenuState();
        state.exportMenuState = new ExportMenuState();
        state.clusterMenuState = new ClusterMenuState();
        state.editingLayer = undefined;
        state.importWizardShown = false;
        state.welcomeShown = true;
        state.currentLayerId = 0;
        state.standardLayerOrder = [];
        state.heatLayerOrder = [];
    }
    onBackButtonEvent(e) {
        if (!this.props.state.welcomeShown && !this.props.state.importWizardShown) {
            e.preventDefault();
            this.reset();
        }
    }

    render() {

        let modalStyle = {
            content: {
                border: '1px solid #cecece',
                borderRadius: '15px',
                padding: '0px',
                maxWidth: 1900,
            }
        }
        return <div>
            <Map state={state}/>
            {this.props.state.embed ? null :
                <div>
                    <Modal
                        isOpen={this.props.state.welcomeShown}
                        style = {modalStyle}>
                        <WelcomeScreen
                            state={this.props.state.welcomeScreenState}
                            appState={state}
                            changeLanguage ={this.changeLanguage.bind(this)}
                            />
                    </Modal>
                    {this.props.state.importWizardShown ?
                        <Modal
                            isOpen={this.props.state.importWizardShown}
                            style = {modalStyle}>
                            <LayerImportWizard   state={state}   />
                        </Modal>
                        : null}
                    {this.props.state.menuShown ?
                        <MakeMapsMenu  state = {state}     />
                        : null}
                </div>
            }

            <div className='notification' id='loading'>
                <span style={{ lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}>{this.props.state.strings.loading}</span>
                <div className="sk-double-bounce">
                    <div className="sk-child sk-double-bounce1"></div>
                    <div className="sk-child sk-double-bounce2"></div>
                </div>
            </div>
            <div className='notification' id='notification'>
                <span id='notificationText' style={{ lineHeight: '40px', paddingLeft: 10, paddingRight: 10 }}>{this.props.state.strings.notification}</span>
                <br/>
                <button className='menuButton' onClick={() => { HideNotification() } }>Ok</button>
            </div>
        </div>
    }
}
ReactDOM.render(
    <View state={state}/>, document.getElementById('content')
);
