
// forms the url for the atlas example on the dev server
function getAtlasExampleUrl(browser) {
  const { devServerUrl } = browser.globals;
  return `${devServerUrl}/examples/atlas`;
}

// partial function to bootstrap an atlas test
// function testAtlas(browser, callback) {
//   browser
//     .url(getAtlasExampleUrl(browser))
//     .waitForElementVisible('#mb-root', 5000);
//
//   callback()
//
//   end();''
// }

module.exports = {
  // TODO replace this with more meaningful tests
  '[Atlas] Basic Test': browser => {
    browser
      .url(getAtlasExampleUrl(browser))
      .waitForElementVisible('#mb-root', 5000);
      .setValue('.mb-search-control-input', '1913 green st')
      .click('.mb-search-control-button')

      // .assert.containsText('.greeting > h2', 'front door')

      .end();
  },

  // test to make sure an address with multiple dor parcels is rendering
  // correctly
  '[Atlas] Multiple Parcels': browser => {
    
  },
};
