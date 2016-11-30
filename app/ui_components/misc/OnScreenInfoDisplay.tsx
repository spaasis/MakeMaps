import * as React from 'react';
import { AppState } from '../../stores/States';
import { Header } from '../../stores/Layer';

import { observer } from 'mobx-react';

@observer
export class OnScreenInfoDisplay extends React.Component<{ state: AppState }, {}> {

    render() {
        return !this.props.state.infoScreenText ? null :
            <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translate(-50%, 0)', zIndex: 600 }} className='leaflet-popup-content-wrapper'>
                <a className='leaflet-popup-close-button' onClick={() => { this.props.state.infoScreenText = null; } }>x</a>
                <div className='leaflet-popup-content' dangerouslySetInnerHTML={{ __html: this.props.state.infoScreenText }} />
            </div>;
    }
}
