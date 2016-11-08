[Hosting](#hosting)|
[Embedding](#embedding)
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

Author
-----
Simo Paasisalo [Mail](mailto:simopaasisalo@fastmail.com)|[LinkedIn](https://linkedin.com/in/simopaasisalo)
