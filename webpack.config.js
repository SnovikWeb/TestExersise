const path = require('path'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    RemovePlugin = require('remove-files-webpack-plugin'),
    autoprefixer = require('autoprefixer');

const webpack = require('webpack');

const isDev = process.env.NODE_ENV !== 'production',
    dirSource = 'assets',
    dirPub = 'dist',
    dirDev = 'src',
    PATH = {
        pub: path.resolve(__dirname, dirSource, dirPub),
        dev: path.resolve(__dirname, dirSource, dirDev)
    };
const scripts = {
    'js/app': path.resolve(PATH.dev, 'js', 'app.js'),
};
const workers = {
    'js/workers/templatePosts': path.resolve(PATH.dev, 'js', 'workers', 'templatePosts.js'),
};
const styles = {
    'css/style': path.resolve(PATH.dev, 'scss', 'style.scss'),
};
const config = {
    entry: {...styles, ...scripts, ...workers},
    output: {
        filename: '[name].js',
        path: path.resolve(dirSource, dirPub),
        publicPath: isDev ? `http://localhost:8080/${dirSource}/${dirPub}/` : '/'
    },
    resolve: {
        extensions: [".js", ".json", ".scss"],
        alias: {
            'rootJs': path.join(PATH.dev, 'js'),
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new RemovePlugin({
            after: {
                test: [
                    {
                        folder: path.resolve(dirSource, dirPub, 'css'),
                        method: (filePath) => new RegExp(/\.js$/, 'm').test(filePath),
                        recursive: true
                    }
                ]
            }
        }),
        new webpack.DefinePlugin({
            pathPubJs: JSON.stringify("/assets/dist/js/"),
            pathDevJs: JSON.stringify('/assets/src/js/')
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/env',
                                {
                                    targets: {
                                        browsers: ["last 1 version", "ie >= 11"]
                                    }
                                }
                            ]
                        ],
                    }
                }
            }, {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ],
            }, {
                test: /\.(sa|sc|c)ss$/,
                use: {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            autoprefixer({
                                overrideBrowserslist: ['ie >= 11', 'last 4 version']
                            })
                        ],
                    }
                }
            }
        ]
    },
    devServer: {
        overlay: true
    },
};

module.exports = (env, options) => {
    config.devtool = isDev ? 'eval-sourcemap' : false;
    return config;
};