const path = require('path')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const pkg = require('../package.json')

const IS_PROD = (process.env.NODE_ENV === 'production')

const PATHS = {
  main: path.join(__dirname, '../src/index.js'),
  app: path.join(__dirname, '../src'),
  build: path.join(__dirname, '../build'),
  dist: path.join(__dirname, '../dist'),
  node_modules: path.join(__dirname, '../node_modules')
}
const scssTextPlugin = new ExtractTextPlugin('app-1.[contenthash:10].css')
const cssTextPlugin = new ExtractTextPlugin('app-2.[contenthash:10].css')

function getPlugins () {
  const plugins = [
    // Always expose NODE_ENV to webpack, you can now use `process.env.NODE_ENV`
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'VERSION': JSON.stringify(pkg.version),
      }
    }),
    new HtmlWebpackPlugin({template: 'index.html', inject: 'body'}),
    new webpack.IgnorePlugin(/^\.\/locale$/, /date-and-time/),
    new CaseSensitivePathsPlugin({debug: false}),
    scssTextPlugin, cssTextPlugin,
    new LodashModuleReplacementPlugin({
      shorthands: true,
      guards: true,
      currying: true,
      collections: true,
      flattening: true,
      paths: true
    })
  ]

  return plugins
}

exports.S3PATH = 'test'
exports.module = {
  context: PATHS.app,
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', 'scss'],
    modules: [
      PATHS.node_modules,
      PATHS.app
    ]
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    assert: 'empty'
  },
  module: {
    rules: [
      {   // All the images that are used in the Code\CSS files will be extracted to a hashed file and compressed
        test: /\.(jpe?g|png|gif|svg)(?:\?.*|)$/i,
        include: PATHS.images,
        exclude: /node_modules/,
        use: [{
          loader: 'file-loader',
          options: {
            hash: 'sha512',
            digest: 'hex',
            name: './assets/images/[hash].[ext]'
          }
        },
          'image-webpack-loader'] // Compression of the images
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: scssTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              sourceMap: !IS_PROD
            }
          },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('autoprefixer')
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'expanded',
                sourceMap: !IS_PROD,
                sourceMapContents: true
              }
            }]
        })
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: cssTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              sourceMap: !IS_PROD
            }
          },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('autoprefixer')
                ]
              }
            }]
        })
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: './webpack_cache/'
          }
        }]
      }
    ]
  },
  plugins: getPlugins(),
  devServer: {
    historyApiFallback: true
  }
}

exports.PATHS = PATHS
