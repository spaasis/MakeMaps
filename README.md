[Hosting](#hosting)|
[Embedding](#embedding)
[Integrating](#integrating)
#MakeMaps

 [![build status](https://travis-ci.org/simopaasisalo/MakeMaps.svg?branch=master)](http://travis-ci.org/simopaasisalo/MakeMaps)

![alt text](https://github.com/simopaasisalo/MakeMaps/blob/master/misc/map_preview.png "Map previews")



MakeMaps is a map creation tool that takes in data in multiple formats and outputs a powerfully visualized map.

It is built on Leaflet and OpenStreetMaps by React/TypeScript using MobX for state control.


License: GPL V3

Hosting
=======
```
1. git clone
2. npm install
3. open index.html

If you want the demos, fetch them from the gh-pages-branch
```

Embedding
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
src="https://makemaps.online
?
mapURL=https://makemaps.online/demos/symboldemo.mmap"</iframe>
```

Integrating
===========

You can integrate MakeMaps as a part of a larger React application.

**API**

The communication to MakeMaps is done through component properties.

```
var data = [{
    id: 1,
    type: 'geojson',
    content: '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.999]},"properties":{"category":"love it"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.998]},"properties":{"category":"fine dining"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.997]},"properties":{"category":"harbor?"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.996]},"properties":{"category":"trees"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.995]},"properties":{"category":"road"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[27.68,62.994]},"properties":{"category":"bugs"}}]}',
    columns: null,
    projection: null,
    latName: null,
    lonName: null,
    name: 'Layer2'
}];

<MakeMaps settings={{ data: null, viewOptions: { showMenu: true, showExportOptions: true, allowLayerChanges: true, language: 'en' }, mapOptions: { attributionExtension: '', mapCenter: [0, 0], zoomLevel: 0 } }} />



```

**Properties**
- **data** data list
- **mapOptions** map options object
- **viewOptions** options related to the MakeMaps UI

**Data**
- **id (number)** unique data id
- **name** display name of the map layer created from this data
- **type** file type of the data
  - csv|gpx|kml|geojson
- **content** the data as a string
- **columns (string[])** the columns to use. If null, every column will be used.
- **projection** the map projection. If null, WGS84 will be used.
- **latName** name of the latitude column
- **lonName** name of the longitude column

**Map options**
- **attributionExtension** text to add to map attribution text
- **mapCenter ([number,number])** map center coordinate. Default [0,0]
- **zoomLevel (number)** map default zoom level. Default 2

**View options**
- **showMenu (bool)** show MakeMaps menu. NOTE: if this is disabled, map elements will not be customizable
- **language (fi|en)** the menu display language. Default English
- **showExportOptions (bool)** show map download options on menu. Default true
- **allowLayerChanges (bool)** allow the creation and removal of additional layers through menu. Default false

**Example**



Author
-----
Simo Paasisalo [Mail](mailto:simopaasisalo@fastmail.com)|[LinkedIn](https://linkedin.com/in/simopaasisalo)
