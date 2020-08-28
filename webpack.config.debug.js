const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const DiContainerWebpackPlugin = require('./dist/src/webpack').default;

module.exports = {
    entry: './dir-tests/index.ts',
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.ts'],
        plugins: [new TsconfigPathsPlugin()]
    },
    output: {
        path: path.resolve(__dirname, 'dist2'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    compiler: 'ttypescript',
                    transpileOnly: true,
                }
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(),
        new DiContainerWebpackPlugin(),
    ]
};