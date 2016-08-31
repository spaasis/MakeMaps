var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'release');
var APP_DIR = path.resolve(__dirname, 'app');

module.exports = {
  entry: APP_DIR + '/ui_components/Map.js',
  output: {
    path: BUILD_DIR,
    filename: 'MakeMaps.js'
  },
  alias: {
    react: path.resolve('./node_modules/react'),
  },
  module:{
    loaders : [
      {
          test: /\.json$/,
          loader: "json-loader"
        }
    ]
  }

};
