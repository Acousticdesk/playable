const path = require('path');
const fs = require('fs');
const conf = require('./webpackConf');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssPlugin = require('mini-css-extract-plugin');

// 1) "npm run build" will be failed on the initial first run
// 2) After changes of index.ejs you need to run "npm build" script 2 times to get preview.html up to date
// 3) To make it work on production - change data for DIOInt inside createWinScreen method in the built bundle to
/*
* {images: [
      "[[{"type":"banner","width":320,"height":480}]]",
      "[[{"type":"banner","width":320,"height":480}]]",
      "[[{"type":"banner","width":320,"height":480}]]"
    ],
    title: "[[{"type":"title"}]]",
    rating: [[{"type":"rating"}]]}
* */

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
    new HtmlPlugin({
      template: 'preview.ejs',
      filename: 'preview.html',
      inject: false
    }),
    new MiniCssPlugin({
      filename: "styles.css"
    }),
    new webpack.DefinePlugin({
      DEVELOPMENT: process.env.ENVIRONMENT === 'DEV'
    })
  ]
};