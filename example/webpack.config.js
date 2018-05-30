const path = require('path');
const webpack = require('webpack');

// const env = process.env.NODE_ENV;
// const isDevelopment = env === 'development';

// console.log('NODE_ENV:', env, 'process.env.NODE_ENV:', process.env.NODE_ENV);
console.log(path.join(__dirname, 'app.js'));

module.exports = {
  mode: 'development',
  entry: {
    index: [path.join(__dirname, 'main.js')],
  },
  output: {
    filename: 'bundle.js',
  },
  externals: {
    moment: 'moment',
    accounting: 'accounting',
    axios: 'axios',
  },
  serve: {
    content: [__dirname],
    host: process.env.WEBPACK_DEV_HOST,
    port: process.env.WEBPACK_DEV_PORT,
  },
};
