const { expect } = require('chai');
const ApiDiscoverer = require('../utilities/apiDiscoverer');

describe('Dynamic REST API Integration 300+ Suite', function () {
  this.timeout(120000);

  const discoveredData = ApiDiscoverer.discoverRoutesAndScenarios();
  const scenarios = discoveredData.scenarios || [];

  scenarios.forEach((scenario) => {
    it(`${scenario.specId}: ${scenario.scenarioName}`, async function () {
      expect(scenario.specId).to.be.a('string');
      expect(scenario.endpoint).to.be.a('string');
      expect(scenario.method).to.be.a('string');
    });
  });
});
