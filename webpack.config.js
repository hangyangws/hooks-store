const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const buildPath = 'build';

module.exports = {
  entry: path.resolve(__dirname, 'demo/index.jsx'),
  output: {
    path: path.resolve(__dirname, buildPath),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'demo/index.html'),
      filename: 'index.html'
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  devServer: {
    contentBase: path.resolve(__dirname, buildPath),
    compress: true,
    port: 8000
  },
  mode: 'development'
};
