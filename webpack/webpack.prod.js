const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const WebpackMd5Hash = require('webpack-md5-hash')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const commonConfig = require('./webpack.common.js')
const CompressionPlugin = require('compression-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')

function getPlugins () {
  const plugins = [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new CleanWebpackPlugin([commonConfig.PATHS.dist], {root: process.cwd()}), // Clear the Dist directory on each production build
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => /node_modules/.test(module.resource)
    }), // Extract the external libs (vendors) and minify them in the vendors.js file
    new webpack.optimize.AggressiveMergingPlugin(),
    new WebpackMd5Hash(), // Hash all the resulted files and add the hash to the name
    new webpack.optimize.OccurrenceOrderPlugin(), // Prevent from the same Lib to be added to the bundler.js and to the vendor.js
    new webpack.optimize.UglifyJsPlugin({ // Minify all the JS files for the production
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true
      },
      sourceMap: false,
      comments: false,
      minimize: true,
      beautify: false
    })
  ]
  const compressPlugins = process.env.COMPRESS === 'true' ? [
    new CompressionPlugin({
      asset: '[path]',
      algorithm: 'gzip',
      test: /\.(js)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ] : [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: '../webpack/report.html'
    })
  ]

  const deployPlugins = process.env.UPLOAD === 'true' ? [
    new S3Plugin({
      s3Options: {
        region: 'us-west-2'
      },
      s3UploadOptions: {
        Bucket: commonConfig.S3PATH,
        ContentEncoding (fileName) {
          if (/\.js/.test(fileName)) { return 'gzip' }
        },

        ContentType (fileName) {
          if (/\.js/.test(fileName)) {
            return 'application/javascript'
          }
        }
      }
    })] : []

  return plugins.concat(compressPlugins, deployPlugins)
}

module.exports = webpackMerge(commonConfig.module, {
  bail: true,
  entry: {
    bundle: [commonConfig.PATHS.main]
  },
  output: {
    path: commonConfig.PATHS.dist,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  plugins: getPlugins()
})
