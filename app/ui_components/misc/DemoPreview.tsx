import * as React from 'react';
export class DemoPreview extends React.Component<IDemoPreviewProps, IDemoPreviewStates>{
    constructor() {
        super();
        this.state = { overlayOpen: false };
    }
    setOverlayState(state: boolean) {
        this.setState({
            overlayOpen: state
        })
    }
    loadClicked() {
        this.props.loadDemo();
    }
    render() {
        let style = {
            borderRadius: 15,
            backgroundImage: 'url(' + this.props.imageURL + ')',
            margin: 15,
            width: this.state.overlayOpen ? 400 : 200,
            height: 400,
            display: 'inline-flex',
            position: 'relative'
        };
        let overlayStyle = {
            border: '1px solid #c1c1c1',
            borderRadius: 15,
            position: 'absolute',
            width: 400,
            whiteSpace: 'normal',
            zIndex: 90,
            background: 'white',
            bottom: 0.
        }
        return (
            <div style = {style} onMouseOver={this.setOverlayState.bind(this, true)} onMouseLeave={this.setOverlayState.bind(this, false)}>
                {this.state.overlayOpen ?
                    <div style={overlayStyle}>
                        {this.props.description}
                        <button className='primaryButton' style={{ display: 'block', margin: '0 auto' }} onClick={this.loadClicked.bind(this)}>Check it out</button>
                    </div>

                    : null}
            </div>
        )
    }
}
