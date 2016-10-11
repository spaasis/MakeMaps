import * as React from 'react';
import { Strings } from '../../localizations/Strings';
export class DemoPreview extends React.Component<{
    strings: Strings,
    imageURL: string,
    description: string,
    loadDemo: () => void,
    onClick: () => void,
}
    , {}>{
    loadClicked() {
        this.props.loadDemo();
    }
    render() {
        let style = {
            height: '100%',
            width: '100%',
            display: 'inline-flex',
            position: 'relative',
            MozUserSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            overflowX: 'hidden'
        };
        let overlayStyle = {
            border: '1px solid #c1c1c1',
            borderRadius: 15,
            position: 'absolute',
            maxWidth: 400,
            whiteSpace: 'normal',
            zIndex: 90,
            background: 'white',
            bottom: 0,
            left: 0,

        }
        return (
            <div style = {style}>
                <img  className='demoImage' src = {this.props.imageURL}/>
                <div style={overlayStyle}>
                    {this.props.description}
                    <button className='primaryButton' style={{ display: 'block', margin: '0 auto' }} onClick={this.loadClicked.bind(this)}>{this.props.strings.demoLoadButton}</button>
                </div>

            </div>

        )
    }
}
