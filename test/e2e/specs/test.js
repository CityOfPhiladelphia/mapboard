
// forms the url for the atlas example on the dev server
function getAtlasExampleUrl(browser) {
  const { devServerUrl } = browser.globals;
  return `${devServerUrl}/examples/cityatlas`;
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
      .setValue('.mb-search-control-input', '1234 mkt')
      .click('.mb-search-control-button')
      .waitForElementVisible('.topic-panel-content')



    // TOPIC: DEEDS
      .waitForElementNotVisible(`a[data-topic-key="deeds"] .loading`)
      .click(`a[data-topic-key="deeds"]`)

    // check table "Parcel Details"
      .waitForElementVisible(`.topic-body[data-topic-key="deeds"] .tabs-content .table-container table`);
    browser.expect.element(`.topic-body[data-topic-key="deeds"] .tabs-content .table-container h4`).text.to.contain('Parcel Details');

    // check table "Documents"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="deeds"] .tabs-content .topic-component:nth-of-type(4)`)
      .waitForElementVisible(`.topic-body[data-topic-key="deeds"] .tabs-content .topic-component:nth-of-type(4) .mb-horizontal-table-body table`);
    browser.expect.element(`.topic-body[data-topic-key="deeds"] .tabs-content .topic-component:nth-of-type(4) .mb-horizontal-table-body h4`).text.to.contain('Documents');



    // TOPIC: L&I
    browser
      .waitForElementNotVisible(`a[data-topic-key="li"] .loading`)
      .click(`a[data-topic-key="li"]`)
    // check table "Permits"
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(2)`)
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(2) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(2) h4`).text.to.contain('Permits');

    // check table "Inspections"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(3)`)
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(3) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(3) h4`).text.to.contain('Inspections');

    // check table "Violations"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(4)`)
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(4) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(4) h4`).text.to.contain('Violations');

    // check table "Business Licenses"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(5)`)
      .waitForElementVisible(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(5) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="li"] .topic-component:nth-of-type(5) h4`).text.to.contain('Business Licenses');



    // TOPIC: ZONING
    browser
      .waitForElementNotVisible(`a[data-topic-key="zoning"] .loading`)
      .click(`a[data-topic-key="zoning"]`)

    // check badge
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(2)`)
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(2) .mb-badge-header`);
    browser.expect.element(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(2) .mb-badge-header`).text.to.contain('Base District');

    // check table "Overlays"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(3)`)
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(3) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(3) h4`).text.to.contain('Overlays');

    // check table "Appeals"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(4)`)
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(4) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(4) h4`).text.to.contain('Appeals');

    // check table "Archived Documents"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(5)`)
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(5) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(5) h4`).text.to.contain('Archived Documents');

    // check table "Registered Community Organizations"
    browser
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(6)`)
      .waitForElementVisible(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(6) .mb-horizontal-table-body`);
    browser.expect.element(`.topic-body[data-topic-key="zoning"] .topic-component:nth-of-type(6) h4`).text.to.contain('Registered Community Organizations');



    // TOPIC: NEARBY
    browser
      .waitForElementNotVisible(`a[data-topic-key="nearby"] .loading`)
      .click(`a[data-topic-key="nearby"]`)

      .waitForElementVisible(`.topic-body[data-topic-key="nearby"] .topic-component:nth-of-type(2) .topic-component:nth-of-type(1)`)
      .waitForElementVisible(`.topic-body[data-topic-key="nearby"] .topic-component:nth-of-type(2) .topic-component:nth-of-type(1) .mb-horizontal-table-body`);
      browser.expect.element(`.topic-body[data-topic-key="nearby"] .topic-component:nth-of-type(2) .topic-component:nth-of-type(1) h4`).text.to.contain('Nearby Service Requests');

    browser
      .click(`.easy-button-container:nth-of-type(3)`)
      .waitForElementVisible(`#inCycloDiv`);

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
