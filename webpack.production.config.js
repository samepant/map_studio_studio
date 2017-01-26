var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src', 'entry.js'),
    output: {
        path: './docs',
        filename: 'scripts.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") },
            {
              test: /\.(jpg|png)$/,
              loader: 'url-loader',
              options: {
                limit: 25000,
              },
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
            title: 'studio_studio map'
        })
    ]
};
