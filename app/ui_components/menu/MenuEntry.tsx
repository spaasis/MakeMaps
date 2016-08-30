import * as React from 'react';

export class MenuEntry extends React.Component<{ text: string, fa: string, id: number, active: boolean, onClick: (id: number) => void, hide?: boolean }, {}>{
    render() {
        if (this.props.hide)
            return null;
        else
            return <div className='menuHeaderDiv' style={{ backgroundColor: this.props.active ? '#ededed' : '#fefefe' }} onClick = {() => this.props.onClick(this.props.id)}>
                <i className={"menuHeader fa fa-" + this.props.fa}/>
                <span className='menuHover'>{this.props.text}</span>
            </div>
    }


}
