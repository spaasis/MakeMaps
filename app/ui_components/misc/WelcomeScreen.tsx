import * as React from 'react';
import { DemoPreview } from './DemoPreview';
let Dropzone = require('react-dropzone');
import { LoadExternalMap, ShowLoading, ShowNotification } from '../../common_items/common';


export class WelcomeScreen extends React.Component<{loadMap:(json)=>void, openLayerImport:()=>void}, {fileName:string, savedJSON}>{
    constructor() {
        super();
        this.state ={fileName:null, savedJSON:null};
    }

    /**
     * loadDemo - Loads the specified demo from the /demos - folder
     *
     * @param  filename  Name of the file (without extension) to load
     */
    loadDemo(filename: string) {
      ShowLoading();
      let loadMap = this.props.loadMap;
      setTimeout(function(){LoadExternalMap('demos/'+filename+'.mmap', loadMap);}, 10)

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
                ShowNotification('Select a .mmap file!');
            }

        }
    }
    loadMap(e){
      ShowLoading();
      e.preventDefault();
      e.stopPropagation();
      let load = this.props.loadMap;
      let json  =this.state.savedJSON;

      setTimeout(function(){load(json)}, 10);
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
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/simopaasisalo/MakeMaps"><i className='fa fa-github' style={{position:'absolute', right:5, fontSize:'40px'}}/></a>
            <div style={{ display: 'block', margin: '0 auto', padding:5 }}>
              <img src='app/images/favicon.png' style={{ display:'inline-block', width:50, height:50, verticalAlign:'middle' }}/>
              <img src='app/images/logo_pre.png' style={{ display:'inline-block', verticalAlign:'middle'}}/>
              <img src='app/images/favicon.png' style={{ display:'inline-block', width:50, height:50, verticalAlign:'middle' }}/>

            </div>
            MakeMaps is an open source map creation tool that lets you make powerful visualizations from your spatial data
            <br/>
            Guides and feedback channels can be found in the <a target="_blank" rel="noopener noreferrer" href="https://github.com/simopaasisalo/MakeMaps/wiki">Project Wiki</a>. Contributions and feature requests welcome!
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
                    description='This demo showcases the heat map by visualizing the daily public transportation boardings by HSL'
                    loadDemo={this.loadDemo.bind(this, 'hki_heatdemo')}
                    />
                    <DemoPreview
                        imageURL='demos/clusterdemo.png'
                        description='This clustering demo utilizes the same data from HSL as the heatmap. Clustering is another excellent way to display large datasets efficiently'
                        loadDemo={this.loadDemo.bind(this, 'clusterdemo')}
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
                        Start creating your own map from here. Upload your file and get visualizin' in seconds!
                        <br/>
                    <button className='primaryButton' onClick={this.createNewMap.bind(this)}>Create a map</button>
                    </div>

                }
            </div>
        </div >);
    }
}
