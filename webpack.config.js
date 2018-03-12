const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'mapboard.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'mapboard',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
};
