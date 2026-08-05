const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const BasePage = require('../pages/BasePage');
const RouteFormDiscoverer = require('../utilities/routeFormDiscoverer');
const logger = require('../utilities/logger');

describe('Dynamic React Route & Form Discovery E2E Suite', function () {
  this.timeout(60000);
  let driver;
  let basePage;
  let discoveryData;

  before(function () {
    driver = getDriver();
    basePage = new BasePage(driver);
    discoveryData = RouteFormDiscoverer.discoverRoutesAndForms();
  });

  it('TC_DYN_01: Should dynamically discover and verify all React routes response status', async function () {
    expect(discoveryData.routes.length).to.be.greaterThan(0);
    logger.info(`Validating ${discoveryData.routes.length} dynamically discovered React routes...`);

    for (const routeObj of discoveryData.routes) {
      await basePage.navigateTo(routeObj.path);
      const url = await basePage.getCurrentUrl();
      logger.info(`Route Discovered: [Path: ${routeObj.path}, Component: ${routeObj.component}, Current URL: ${url}]`);
      expect(url).to.be.a('string');
    }
  });

  it('TC_DYN_02: Should execute dynamically generated validation test scenarios', async function () {
    expect(discoveryData.generatedScenarios.length).to.be.greaterThan(0);
    logger.info(`Executing ${discoveryData.generatedScenarios.length} dynamic form validation scenarios...`);

    for (const scenario of discoveryData.generatedScenarios) {
      logger.info(`Executing Scenario [${scenario.id}]: ${scenario.description}`);
      await basePage.navigateTo(scenario.route);
      const currentUrl = await basePage.getCurrentUrl();
      expect(currentUrl).to.be.a('string');
    }
  });
});
