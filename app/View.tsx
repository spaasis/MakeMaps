import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { MakeMaps } from './MakeMaps';
import { MakeMapsData } from './stores/Main';

ReactDOM.render(
    <div>
        <MakeMaps data={null} viewOptions={null} mapOptions={null} />
    </div>, document.getElementById('content')
);
