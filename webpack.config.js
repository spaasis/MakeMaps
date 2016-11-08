var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'release');
var APP_DIR = path.resolve(__dirname, 'app');

module.exports = {
  entry: APP_DIR + '/ui_components/View.js',
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
      },
    ]
  },
  // required for xlsx to work with webpack
  node: {
    fs: 'empty'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ],
  externals: [
    {
      './cptable': 'var cptable'
    },
    {
      './jszip': 'jszip'
    }
  ],

};
