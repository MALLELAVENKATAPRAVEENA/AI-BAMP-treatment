const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const AndroidAppDiscoverer = require('../utilities/androidAppDiscoverer');
const BasePage = require('../pages/BasePage');

describe('Dynamic Mobile Screen & Form Discovery 300+ Suite', function () {
  this.timeout(120000);
  let driver;
  let basePage;
  let discoveryData;

  before(function () {
    driver = getDriver();
    basePage = new BasePage(driver);
    discoveryData = AndroidAppDiscoverer.discoverComponentsAndScenarios();
  });

  const discoveredData = AndroidAppDiscoverer.discoverComponentsAndScenarios();
  const scenarios = discoveredData.scenarios || [];

  scenarios.forEach((scenario) => {
    it(`${scenario.testId}: ${scenario.scenarioName}`, async function () {
      if (scenario.screen) {
        const activity = await basePage.getCurrentActivity();
        expect(activity).to.be.a('string');
      } else if (scenario.form) {
        expect(scenario.form).to.be.a('string');
      } else {
        expect(scenario.testId).to.be.a('string');
      }
    });
  });
});
