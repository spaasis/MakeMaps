import * as React from 'react';
let oldHTML: string;
export class TextEditor extends React.Component<{
    content: string, style: any, onChange: (target: any) => void
}, {}> {

    componentWillMount() {
        this.state = { html: this.props.content ? this.props.content : '' };
    }
    emitChange() {
        let editor = this.refs['editor'];
        let newHtml = (editor as any).innerHTML;
        if (newHtml !== oldHTML) {
            oldHTML = newHtml;
            this.props.onChange({
                target: {
                    value: newHtml
                }
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.content !== oldHTML;
    }

    addLink() {
        let linkURL = prompt('Enter a URL:', 'http://');
        if (linkURL !== null) {
            let selection = document.getSelection().toString();
            let linkText = selection === '' ? prompt('Enter the link text:', linkURL) : selection;
            if (linkText !== null)
                this.execCommand('insertHTML', '<a href="' + linkURL + '" target="_blank">' + linkText + '</a>');
        }
    }

    execCommand(command, arg) {
        document.execCommand(command, false, arg);
    }

    render() {
        //  customize css rules here
        let buttonSpacing = { marginRight: 2 },
            toolbarStyle = { marginBottom: 3 };

        return (
            <div>
                {

                    <div style={toolbarStyle}>

                        <div style={buttonSpacing}>
                            <button type='button' className='btn btn-default' onClick={this.execCommand.bind(this, 'bold')}>
                                <i className='fa fa-bold'></i>
                            </button>
                            <button type='button' className='btn btn-default' onClick={this.execCommand.bind(this, 'italic')}>
                                <i className='fa fa-italic'></i>
                            </button>
                            <button type='button' className='btn btn-default' onClick={this.execCommand.bind(this, 'underline')}>
                                <i className='fa fa-underline'></i>
                            </button>
                            <button type='button' className='btn btn-default' onClick={this.execCommand.bind(this, 'insertOrderedList')}>
                                <i className='fa fa-list-ol'></i>
                            </button>
                            <button type='button' className='btn btn-default' onClick={this.execCommand.bind(this, 'insertUnorderedList')}>
                                <i className='fa fa-list-ul'></i>
                            </button>

                            <button
                                type='button'
                                className='btn btn-default btn-xs'
                                onClick={this.addLink.bind(this)}>
                                <i className='fa fa-link'></i>
                            </button>

                            <button
                                type='button'
                                className='btn btn-default btn-xs'
                                onClick={this.execCommand.bind(this, 'removeFormat')}>
                                <i className='fa fa-eraser'></i>
                            </button>
                        </div>
                    </div>
                }
                < div
                    ref='editor'
                    className='form-control'
                    {...this.props }
                    contentEditable={true}
                    dangerouslySetInnerHTML={{ __html: this.props.content }}
                    onInput={this.emitChange.bind(this)} />
            </div >
        );
    }
};
