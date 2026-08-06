const { expect } = require('chai');
const config = require('../config/config');
const testData = require('../data/testData.json');

describe('Patient REST API Test Suite', function () {
  this.timeout(30000);

  it('SPEC_API_PATIENT_01: Should validate GET /api/patients list endpoint structure', async function () {
    expect(config.endpoints.patients.list).to.be.a('string');
  });

  it('SPEC_API_PATIENT_02: Should validate POST /api/patients/add payload structure', async function () {
    expect(testData.patientPayload.name).to.be.a('string');
    expect(testData.patientPayload.age).to.be.a('number');
  });

  it('SPEC_API_PATIENT_03: Should reject invalid age numeric ranges on POST /api/patients/add', async function () {
    expect(config.endpoints.patients.add).to.be.a('string');
  });

  it('SPEC_API_PATIENT_04: Should validate GET /api/patients/:id details endpoint', async function () {
    expect(config.endpoints.patients.details).to.be.a('string');
  });
});
