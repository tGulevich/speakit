const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
    const isProduction = options.mode === 'production';

    const config = {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'none' : 'source-map',
        watch: !isProduction,
        entry: ['./src/index.js', './src/sass/style.scss'],
        output: {
            filename: 'script.js', 
            path: path.join(__dirname, '/dist')
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                        presets: ['@babel/preset-env']
                        }
                    }
                }, {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'
                    ]
                }, {
                    test: /\.(png|svg|jpe?g|gif)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                                name: '[path][name].[ext]',
                                //context: './src/pages/'
                            }
                    }],
                }, {
                    test: /\.html$/i,
                    loader: 'html-loader',
                },
            ]
        },

        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: 'index.html'
            }),
            new MiniCssExtractPlugin({
                filename: 'style.css'
            }),
            // new CopyWebpackPlugin([
            // // {from: './src/static', to: './'},
            //  {from: './src/img/*', to: './img'},
            // ]),
            new CopyWebpackPlugin([
                //{ from: "./src/img/*", to: "./img" }
            ])
        ]
    }

    return config;
}