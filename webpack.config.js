var webpack = require('webpack');

module.exports = {
    entry: {
        common: './dev/assets/js/common.js'
    },

    output: {
        publicPath: '/',
        path: __dirname + './htdocs/assets/js/',
        filename: '[name].js'
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
