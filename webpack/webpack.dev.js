const webpackMerge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')

module.exports = webpackMerge(commonConfig.module, {
  entry: {
    bundle: [commonConfig.PATHS.main]
  },
  output: {
    path: commonConfig.PATHS.dist,
    filename: '[name].js',
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    inline: true,
    compress: true,
    port: '3000'
  }
})
