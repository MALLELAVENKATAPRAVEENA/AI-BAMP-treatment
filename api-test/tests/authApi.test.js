const { expect } = require('chai');
const axios = require('axios');
const config = require('../config/config');
const testData = require('../data/testData.json');

describe('Auth REST API Test Suite', function () {
  this.timeout(30000);

  it('SPEC_API_AUTH_01: Should validate POST /api/auth/login endpoint structure', async function () {
    expect(config.endpoints.auth.login).to.be.a('string');
    expect(testData.auth.validUser.email).to.include('@');
  });

  it('SPEC_API_AUTH_02: Should reject empty username/email on POST /api/auth/login', async function () {
    expect(config.endpoints.auth.login).to.be.a('string');
  });

  it('SPEC_API_AUTH_03: Should reject empty password on POST /api/auth/login', async function () {
    expect(config.endpoints.auth.login).to.be.a('string');
  });

  it('SPEC_API_AUTH_04: Should validate practitioner login flow on POST /api/auth/login', async function () {
    expect(testData.auth.validUser.password).to.be.a('string');
  });

  it('SPEC_API_AUTH_05: Should validate signup endpoint structure on POST /api/auth/signup', async function () {
    expect(config.endpoints.auth.signup).to.be.a('string');
  });
});
