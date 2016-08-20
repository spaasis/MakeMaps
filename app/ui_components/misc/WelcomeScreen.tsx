import * as React from 'react';
import { DemoPreview } from './DemoPreview';
let Dropzone = require('react-dropzone');
import { LoadLocalMap } from '../common_items/common';


export class WelcomeScreen extends React.Component<IWelcomeScreenProps, IWelcomeScreenStates>{
    constructor() {
        super();
        this.state = { fileName: null };
    }

    /**
     * loadDemo - Loads the specified demo from the /demos - folder
     *
     * @param  filename  Name of the file (without extension) to load
     */
    loadDemo(filename: string) {
        LoadLocalMap(filename, this.props.loadMap);
    }
    createNewMap() {
        this.props.openLayerImport();
    }
    onDrop(files) {
        let reader = new FileReader();
        let fileName, content;

        reader.onload = contentUploaded.bind(this);
        files.forEach((file) => {
            fileName = file.name;
            reader.readAsText(file);
        });
        function contentUploaded(e) {
            let contents: any = e.target;
            let ext: string = fileName.split('.').pop().toLowerCase();
            if (ext === 'mmap') {
                this.setState({
                    savedJSON: JSON.parse(contents.result),
                    fileName: fileName,

                });
            }
            else {
                alert('Select a .mmap file!');
            }

        }
    }
    loadMap(e){
      e.preventDefault();
      e.stopPropagation();
      this.props.loadMap(this.state.savedJSON);
    }
    render() {
        let dropStyle = {
            height: 150,
            border: this.state.fileName ? '1px solid #549341' : '1px dotted #549341',
            borderRadius: 15,
            margin: 5,
            textAlign: 'center',
            color: 'grey',
            fontWeight: 'bold'
        }
        return (<div style={{ textAlign: 'center' }}>
            <a href="https://github.com/simopaasisalo/MakeMaps"><img style={{ position: 'absolute', top: 0, right: 0, border: 0 }} src="https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png"/></a>
            <img src='app/images/logo_pre.png' style={{ display: 'block', margin: '0 auto', padding:5 }}/>
            MakeMaps is an open source mapmaking tool that lets you create powerful visualizations from your spatial data
            <br/>
            Guides and feedback channels can be found in the <a href="https://github.com/simopaasisalo/MakeMaps">GitHub page</a>. Contributions and feature requests welcome!
            <hr/>
            <h3>Here's a few demos: </h3>
            <div style={{ overflowX: 'visible', overflowY: 'hidden', height: 440, whiteSpace: 'nowrap' }}>

                <DemoPreview
                    imageURL='demos/chorodemo.png'
                    description='This demo shows the choropleth map type by mapping the United States by population density.'
                    loadDemo={this.loadDemo.bind(this, 'chorodemo')}
                    />
                <DemoPreview
                    imageURL='demos/symboldemo.png'
                    description='This demo demonstrates the different symbol options of MakeMaps. Data random generated for demo purposes.'
                    loadDemo={this.loadDemo.bind(this, 'symboldemo')}
                    />
                <DemoPreview
                    imageURL='demos/hki_chartdemo.png'
                    description='This demo shows the chart-as-a-symbol map by visualizing distribution between different traffic types in Helsinki using a pie chart. Data acquired from hri.fi'
                    loadDemo={this.loadDemo.bind(this, 'hki_chartdemo')}
                    />
                <DemoPreview
                    imageURL='demos/hki_heatdemo.png'
                    description='This demo showcases the heat map by visualizing the total traffic in Helsinki. Data acquired from hri.fi'
                    loadDemo={this.loadDemo.bind(this, 'hki_heatdemo')}
                    />
            </div>
            <hr style={{ color: '#cecece', width: '75%' }}/>

            <div style={{display:'inline'}}>
                    <div style={{ width: '50%', display: 'inline-block' }}>
                        <h3>Load a previously made map</h3>
                        <Dropzone
                            style={dropStyle}
                            onDrop={this.onDrop.bind(this)}
                            accept={'.mmap'}
                            >
                            {this.state.fileName ?
                                <span>
                                    <i className='fa fa-check' style={{ color: '#549341', fontSize: 17 }}/>
                                    {this.state.fileName}
                                    <div style={{ margin: '0 auto' }}>
                                    <button  className='primaryButton' onClick={this.loadMap.bind(this)}>Show me</button>
                                    </div>
                                </span>
                                :
                                <div style={{ margin: '0 auto' }}>
                                    Have a map you worked on previously? Someone sent you a cool map to see for yourself? Upload it here!
                                    <br/>
                                    Drop a map here or click to upload
                                </div>
                            }
                        </Dropzone>

                    </div>
                {
                     <div style={{ width: '50%', display: 'inline-block' }}>
                       <h3>Create a new map</h3>
                        Start creating your own map from here. Select a layer type, upload your file and get visualizin'!
                        <br/>
                    <button className='primaryButton' onClick={this.createNewMap.bind(this)}>Create a map</button>
                    </div>

                }
            </div>
        </div >);
    }
}
