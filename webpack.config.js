var merge = require('webpack-merge')
const outputPath = __dirname + '/dist'

const common = {
  devtool: 'source-map',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  }
}


const serverConfig = merge(common, {
  target: 'node',
  output: {
    path: outputPath,
    filename: 'index.node.js',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'this'
  }
})

const clientConfig = merge(common, {
  output: {
    path: outputPath,
    libraryTarget: 'umd',
    globalObject: 'this',
    filename: 'index.js'
  }
})

module.exports = [serverConfig, clientConfig]