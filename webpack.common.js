const path = require('path');

module.exports = {
    entry: './src/index.js',

    output: {
        filename: 'metaTicTacToe.js',
        path: path.resolve(__dirname, './')
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },

            {
                test: /\.html$/,
                use: [ { loader: 'html-loader' } ]
            }
        ]
    }

};

