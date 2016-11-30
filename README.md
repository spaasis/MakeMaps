[Integrating](#integrating)|
[Embedding](#embedding)|
[Hosting](#hosting)|


#MakeMaps

 [![build status](https:// travis-ci.org/simopaasisalo/MakeMaps.svg?branch=master)](http:// travis-ci.org/simopaasisalo/MakeMaps)

![alt text](https:// github.com/simopaasisalo/MakeMaps/blob/master/misc/map_preview.png "Map previews")



MakeMaps is a map creation tool that takes in data in multiple formats and outputs a powerfully visualized map.

It is built on Leaflet and OpenStreetMaps by React/TypeScript using MobX for state control.

Integrating
===========

You can integrate MakeMaps as a part of a larger React application through React properties.

Sample of an integration baseline: https:// github.com/simopaasisalo/MakeMapsIntegrationTests

**Installing** 

Make sure you have these loaders in package.json:
```
"devDependencies": {
    "css-loader": "^0.26.0",
    "file-loader": "^0.9.0",
    "json-loader": "^0.5.4",
    "style-loader": "^0.13.1",
    "url-loader": "^0.5.7",
    ...
  },
```
webpack.config:
```
loaders : [
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.png$/,
        loader: 'url-loader',
        query: { mimetype: 'image/png' }
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'url-loader'
      }
    ]
```

```
1. npm i makeMaps --save
2. npm install
```
In your typescript (tsx) file:
```
import { MakeMaps } from 'makeMaps';
```


**API**

```
var data = [{
    id: 1,
    type: 'general',
    content: '{ "field1": [1, null, 3, 4, 5, 6], "field2": ["a", null, "c", "d", "e", "f"], "loc": [[27.68, 62.899], [27.68, 62.898], [27.68, 62.897], [27.68, 62.896], [27.68, 62.895], [27.68, 62.894]] }',
     // Use either data or content (see below)
    data: { field1: [1, null, 3, 4, 5, 6], field2: ["a", null, "c", "d", "e", "f"], loc: [[27.68, 62.899], [27.68, 62.898], [27.68, 62.897], [27.68, 62.896], [27.68, 62.895], [27.68, 62.894]] },
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer2'
}];

<MakeMaps
  data={data}
  viewOptions={{ showMenu: true, showExportOptions: true, allowLayerChanges: true, language: 'en', showWelcomeScreen:false }}
  mapOptions={{ attributionExtension: '', mapCenter: [15,16], zoomLevel: 4, baseMapName: 'OSM Black&White' }} />

```

**Data** - list of data to load to map
- **id (number)** unique data id
- **name** display name of the map layer created from this data
- **type** file type of the data
  - general|csv|gpx|kml|geojson|wkt
- **data** the data as JS object (optional. Use this for General or GeoJSON formats. Either data or content is required)
- **content** the data as a string (optional. Use this for CSV,GPX,KML,WKT formats. Can also be used for General or GeoJSON)
- **columns (string[])** the columns to use. If null, every column will be used.
- **projection** the map projection. If null, WGS84 will be used.
- **latName** name of the latitude column
- **lonName** name of the longitude column

**Map options** - general map options
- **attributionExtension** text to add to map attribution text
- **mapCenter ([number,number])** map center coordinate. Default null
- **zoomLevel (number)** map default zoom level. Default null
- **baseMapName** name of the map base layer. Default OSM Streets
  - OSM Streets | OSM Black&White | OpenTopoMap | Stamen Toner | Stamen Watercolor | null

**View options** - MakeMaps menu and general view options
- **showMenu (bool)** show MakeMaps menu. NOTE: if this is disabled, map elements will not be customizable. Default true
- **language (fi|en)** the menu display language. Default English
- **showExportOptions (bool)** show map download options on menu. Default true
- **allowLayerChanges (bool)** allow the creation and removal of additional layers through menu. Default false
- **showWelcomeScreen (bool)** show the MakeMaps welcome screen when there is no data to load. Setting this to false shows an empty map.

Embedding a map
=========
There are two ways to embed maps to your website/blog:

**Download the embed code from the editor**

1. Upload file to MakeMaps
2. Make visualizations
3. Go to the Download-menu
4. Click "Save embed code" and download the .html file
5. Copy&paste the code in the html file to your page

**Refer to a hosted file**

1. Create a .mmap file from your data
  1. Upload to MakeMaps
  2. Make visualizations
  2. Go to the Download-menu and click "Save as a file"
2. Host your file someplace where it can be accessed remotely
3. Use an IFrame to embed into your page:
  1. src - pointing to the `index.html` on a hosted MakeMaps instance
  2. mapURL - URL of the .mmap-file
```
<iframe style="height: 400px; width: 400px;"
src="https:// makemaps.online
?
mapURL=https:// makemaps.online/demos/symboldemo.mmap"</iframe>
```

Hosting
=======
```
1. git clone
2. npm install
3. open index.html

If you want the demos, fetch them from the gh-pages-branch
```



License: GPL V3

Author
-----
Simo Paasisalo [Mail](mailto:simopaasisalo@fastmail.com)|[LinkedIn](https:// linkedin.com/in/simopaasisalo)
