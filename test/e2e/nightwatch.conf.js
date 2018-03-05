const seleniumServer = require('selenium-server');
const chromedriver = require('chromedriver');

// form dev server url, used as global
const devHost = process.env.WEBPACK_DEV_HOST || 'localhost';
const devPort = process.env.PORT || 8080;
const devServerUrl = `http://${devHost}:${devPort}`;

module.exports = {
  src_folders: ['test/e2e/specs'],
  output_folder: 'test/e2e/reports',
  selenium: {
    start_process: true,
    server_path: seleniumServer.path,
    cli_args: {
      'webdriver.chrome.driver': chromedriver.path,
    },
  },
  test_settings: {
    default: {
      globals: {
        devServerUrl,
        waitForConditionTimeout: 10000,
      },
    },
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
      },
    },
  },
};
