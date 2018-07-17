var merge = require('webpack-merge')
const outputPath = __dirname + '/dist'

const common = {
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
    libraryTarget: 'commonjs2',
    path: outputPath,
    filename: 'index.node.js'
  }
})

const clientConfig = merge(common, {
  target: 'web', // <=== can be omitted as default is 'web'
  output: {
    path: outputPath,
    filename: 'index.js'
  }
})

module.exports = [serverConfig, clientConfig]