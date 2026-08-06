const fs = require('fs');
const path = require('path');
const ExcelReporter = require('../utilities/excelReporter');
const logger = require('../utilities/logger');
const config = require('../config/config');

before(async function () {
  this.timeout(30000);
  logger.info('=== STARTING REST API INTEGRATION AUTOMATION TEST SUITE ===');
  ExcelReporter.clearCache();
});

after(async function () {
  this.timeout(30000);
  logger.info('Generating final REST API ExcelJS Execution Report...');
  await ExcelReporter.generateFinalReport();
  logger.info('=== REST API INTEGRATION AUTOMATION TEST SUITE COMPLETED ===');
});

beforeEach(function () {
  this.currentTest.startTime = new Date();
  logger.info(`>>> Launching REST API Spec: [${this.currentTest.title}]`);
});

afterEach(async function () {
  const test = this.currentTest;
  const endTime = new Date();
  const durationSeconds = ((endTime - test.startTime) / 1000).toFixed(2);
  let status = test.state === 'passed' ? 'PASSED' : test.state === 'failed' ? 'FAILED' : 'SKIPPED';

  if (status === 'FAILED') {
    logger.error(`❌ REST API Spec FAILED: [${test.title}] - ${test.err?.message}`);
  } else {
    logger.info(`✅ REST API Spec PASSED: [${test.title}] (${durationSeconds}s)`);
  }

  ExcelReporter.recordTestResult({
    specId: `SPEC-API-${Math.floor(1000 + Math.random() * 9000)}`,
    endpoint: '/api/v1/endpoint',
    method: 'POST',
    scenarioName: test.title,
    status,
    startTime: test.startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: `${durationSeconds} s`,
    failureReason: test.err ? test.err.message : '',
    statusCode: test.state === 'passed' ? 200 : 500
  });
});
