import fs from 'fs';
const path = require('path');
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
const external = Object.keys(pkg.dependencies || {});

const env = process.env.NODE_ENV;
const isDevelopment = env === 'development';

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const Visualizer = require('webpack-visualizer-plugin');

export default {
  // mode: 'development',
  mode: 'production',
  // mode: env,
  entry: {
    mapboard: ['./src/main.js'],
    // './src/main.js'
  },
  // entry: {
  //   app: ['./src/main.js'],
  // },
  resolve: {
    mainFields: ['module', 'main', 'browser'],
    // alias: {
    //   vue$: "vue/dist/vue.runtime.js",
    //   vuex$: "vuex/dist/vuex.esm.js"
    // }
    // extensions: [".js", ".jsx"],
  },
  // devtool: isDevelopment ? 'inline-source-map' : 'source-map',
  devServer: {
    contentBase: './dist',
    // host: process.env.WEBPACK_DEV_HOST,
    host: 'localhost',
    // port: process.env.WEBPACK_DEV_PORT
    port: 8082
  },
  // externals: external,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    library: 'mapboard',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            // options: {
            //   presets: [
            //     ['@babel/preset-env', {modules: false} ]
            //   ]
            // }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // {
      //   test: /\.otf|ttf|woff2?|eot(\?\S*)?$/,
      //   loader: 'url-loader',
      //   query: {
      //     limit: 10000,
      //     name: path.posix.join('static', '[name].[hash:7].[ext]')
      //   }
      // },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]?[hash]',
        },
      },
      {
        test: /\.html/,
        loader: 'file-loader?name=[name].[ext]',
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
    usedExports: true,
    sideEffects: false,
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
