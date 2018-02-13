
// forms the url for the atlas example on the dev server
function getAtlasExampleUrl(browser) {
  const { devServerUrl } = browser.globals;
  return `${devServerUrl}/examples/atlas`;
}

module.exports = {
  'Atlas - Basic Test' : function (browser) {
    browser
      .url(getAtlasExampleUrl(browser))
      .assert.title('Atlas | phila.gov')
      .end();
  },
};
