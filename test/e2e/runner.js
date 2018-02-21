// adapted from https://github.com/vuejs-templates/webpack/blob/develop/template/test/e2e/runner.js

const webpack = require('webpack');
const DevServer = require('webpack-dev-server');
const webpackConfig = require('../../webpack.config');
const crossSpawn = require('cross-spawn');

// first, start the dev server using production settings
process.env.NODE_ENV = 'testing';
const devServerOptions = webpackConfig.devServer;
const compiler = webpack(webpackConfig);
const server = new DevServer(compiler, devServerOptions);
const { port, host } = devServerOptions;
server.listen(port, host);

// next, start nightwatch test runner
let opts = process.argv.slice(2);
if (opts.indexOf('--config') === -1) {
  opts = opts.concat(['--config', 'test/e2e/nightwatch.conf.js']);
}
if (opts.indexOf('--env') === -1) {
  opts = opts.concat(['--env', 'chrome']);
}

const runner = crossSpawn('./node_modules/.bin/nightwatch', opts, { stdio: 'inherit' });

runner.on('exit', code => {
  server.close();
  process.exit(code);
})

runner.on('error', err => {
  server.close();
  throw err;
})
