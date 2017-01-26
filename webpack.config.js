var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src', 'entry.js'),
    output: {
        path: './docs',
        filename: 'scripts.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            {
              test: /\.(jpg|png)$/,
              loader: 'url-loader',
              options: {
                limit: 25000,
              },
            },
            {
              test: /\.()$/,
              loader: 'file-loader',
              options: {
                name: './docs/images/[path][name].[hash].[ext]',
              },
            }
        ]
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['docs'] }
          }
        ),

        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
            title: 'studio_studio map'
        })
    ]
};
