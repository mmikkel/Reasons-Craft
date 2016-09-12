const webpack = require('webpack')
const path = require('path')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  
  devtool: 'source-map',
  
  entry: './src/main.js',
  
  output: {
    path: './reasons/resources/',
    filename: 'reasons.js'
  },
  
  externals: {
    jquery: 'jQuery',
    craft: 'Craft',
    garnish: 'Garnish'
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss'],
    root: [path.resolve('src'), path.resolve('node_modules')]
  },
  
  plugins: [
    //new WebpackCleanupPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new CopyWebpackPlugin([
      {from: './src/static', to: './'}
    ])
  ],

  module: {
    loaders: [
      {
        test: /\.(css|scss)?$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.(js|jsx)?$/,
        loaders: ['babel'],
        exclude: /node_modules/
      }
    ]
  }

}