const path = require('path');
const conf = require('./conf');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssPlugin = require('mini-css-extract-plugin');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './js/index.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'script.js'
  },
  module: {
    rules: conf.moduleRules
  },
  plugins: [
    new HtmlPlugin({
      template: 'index.ejs',
      filename: 'markup.html',
      inject: false
    }),
    new MiniCssPlugin({
      filename: "[name].css"
    })
  ]
};