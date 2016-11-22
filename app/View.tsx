import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { MakeMaps } from './MakeMaps';
import { MakeMapsData } from './stores/Main';

ReactDOM.render(
    <div>
        <MakeMaps data={null} viewOptions={{ showMenu: true, showExportOptions: true, allowLayerChanges: true, language: 'en' }} mapOptions={{ attributionExtension: '', mapCenter: null, zoomLevel: null }} />
    </div>, document.getElementById('content')
);
