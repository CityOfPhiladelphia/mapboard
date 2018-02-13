module.exports = {
  src_folders: ['tests'],
  selenium: {
    start_process: true,
    server_path: './bin/selenium-server-standalone-3.8.1.jar',
    cli_args: {
      'webdriver.chrome.driver': './bin/chromedriver.exe',
    },
  },
  test_settings: {
    default: {
      launch_url: 'http://localhost',
      screenshots: {
        enabled: false,
      },
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
  },
};
