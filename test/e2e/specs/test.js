
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
  // waitForConditionTimeout: 5000,
  // TODO replace this with more meaningful tests
  '[Atlas] Basic Test': browser => {
    browser
      .url(getAtlasExampleUrl(browser))
      .waitForElementVisible('#mb-root')
      .setValue('.mb-search-control-input', '943 sigel st')
      .click('.mb-search-control-button')
      .waitForElementVisible('.topic-panel-content')
      .waitForElementNotVisible(`a[data-topic-key="deeds"] .loading`)
      .click(`a[data-topic-key="deeds"]`)
      // .waitForElementVisible(`.topic-body[data-topic-key="property"]`)
      .waitForElementVisible(`.topic-body[data-topic-key="deeds"] table`)
      // .expect.element(`.topic-body[data-topic-key="deeds"] .table:nth-child(0)`).to.be.visible
      // .assert.containsText('.greeting > h2', 'front door')

      // .end();
  },

  // test to make sure an address with multiple dor parcels is rendering
  // correctly
  // '[Atlas] Multiple Parcels': browser => {
  //   browser
  //     .url(getAtlasExampleUrl(browser))
  //     .end();
  // },
};
