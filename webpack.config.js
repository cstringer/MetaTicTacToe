const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
    //devtool: 'inline-source-map',

    entry: './src/MT3Main.js',

    output: {
        filename: 'metaTicTacToe.js',
        path: path.resolve(__dirname, './')
    },

    plugins: [
        new MinifyPlugin()
    ],

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },

            {
                test: /\.html$/,
                use: [
                    { loader: 'html-loader' }
                ]
            }
        ]
    }

};

