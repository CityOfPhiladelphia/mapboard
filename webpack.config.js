const path = require('path');

const env = process.env.NODE_ENV;
const isDevelopment = env === 'development';

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const Visualizer = require('webpack-visualizer-plugin');


module.exports = {
  // mode: 'development',
  // mode: 'production',
  mode: env,
  entry: {
    app: ['./src/main.js'],
  },
  devtool: isDevelopment ? 'inline-source-map' : 'source-map',
  devServer: {
    contentBase: './dist',
    host: process.env.WEBPACK_DEV_HOST,
    // host: 'localhost',
    // port: process.env.WEBPACK_DEV_PORT
    port: 8080
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mapboard.js',
    publicPath: '/',
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /(node_modules|bower_components)/,
      //   use: [
      //     {
      //       loader: 'babel-loader'
      //     }
      //   ]
      // },
      {
        test: /\.html/,
        loader: 'file-loader?name=[name].[ext]',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]?[hash]',
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new Visualizer({ filename: './statistics.html' })
  ],
  optimization: {
    // splitChunks: {
    //   // chunks: 'all'
    //   cacheGroups: {
    //     vendor: {
    //       test: /node_modules/,
    //       chunks: 'initial',
    //       name: 'vendor',
    //       enforce: true,
    //       priority: 5,
    //     },
    //     rollup_vue: {
    //       test: /rollup_vue_4/,
    //       chunks: 'initial',
    //       name: 'rollup_vue',
    //       priority: 10,
    //     },
    //   }
    // }
  }
};
