const MiniCssPlugin =  require('mini-css-extract-plugin');

module.exports = [
  {
    test: /\.css$/,
    use: [
      {loader: MiniCssPlugin.loader},
      {loader: 'css-loader'},
      {
        loader: 'postcss-loader',
        options: {
          config: {path: 'postcss.config.js'}
        }
      }
    ]
  },
  {
    test: /\.(png|jpg|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {}
      }
    ]
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader'
    }
  },
  {
    test: /\.html$/,
    use: {
      loader: 'html-loader'
    }
  }
];
