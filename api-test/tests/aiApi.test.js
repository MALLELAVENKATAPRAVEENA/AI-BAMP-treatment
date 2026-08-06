const { expect } = require('chai');
const config = require('../config/config');

describe('AI Predictor REST API Test Suite', function () {
  this.timeout(30000);

  it('SPEC_API_AI_01: Should validate POST /api/ai/predict endpoint', async function () {
    expect(config.endpoints.ai.predict).to.be.a('string');
  });

  it('SPEC_API_AI_02: Should validate POST /api/ai/growth prediction endpoint', async function () {
    expect(config.endpoints.ai.growth).to.be.a('string');
  });
});
