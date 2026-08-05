const DriverFactory = require('../config/driverFactory');
const ScreenshotUtils = require('../utilities/screenshotUtils');
const ExcelReporter = require('../utilities/excelReporter');
const logger = require('../utilities/logger');
const config = require('../config/config');

let globalDriver = null;

before(async function () {
  this.timeout(60000);
  logger.info('=== STARTING ENTERPRISE E2E AUTOMATION TEST SUITE ===');
  globalDriver = await DriverFactory.createDriver();
});

after(async function () {
  this.timeout(30000);
  if (globalDriver) {
    logger.info('Closing Selenium WebDriver session...');
    await globalDriver.quit();
  }
  logger.info('Generating final ExcelJS E2E Execution Report...');
  await ExcelReporter.generateFinalReport();
  logger.info('=== ENTERPRISE E2E AUTOMATION TEST SUITE COMPLETED ===');
});

beforeEach(function () {
  this.currentTest.startTime = new Date();
  logger.info(`>>> Launching Test: [${this.currentTest.title}]`);
});

afterEach(async function () {
  const test = this.currentTest;
  const endTime = new Date();
  const durationSeconds = ((endTime - test.startTime) / 1000).toFixed(2);
  let status = test.state === 'passed' ? 'PASSED' : test.state === 'failed' ? 'FAILED' : 'SKIPPED';
  let screenshotPath = null;
  let currentUrl = '';

  if (globalDriver) {
    try {
      currentUrl = await globalDriver.getCurrentUrl();
    } catch (_) {}
  }

  if (status === 'FAILED') {
    logger.error(`❌ Test FAILED: [${test.title}] - ${test.err?.message}`);
    if (globalDriver) {
      screenshotPath = await ScreenshotUtils.captureScreenshot(globalDriver, test.title);
    }
  } else {
    logger.info(`✅ Test PASSED: [${test.title}] (${durationSeconds}s)`);
  }

  ExcelReporter.recordTestResult({
    testId: `TC-${Math.floor(1000 + Math.random() * 9000)}`,
    module: test.parent?.title || 'E2E Core Suite',
    scenarioName: test.title,
    browser: config.browser.toUpperCase(),
    status,
    startTime: test.startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: `${durationSeconds} s`,
    failureReason: test.err ? test.err.message : '',
    screenshotPath: screenshotPath || 'N/A',
    url: currentUrl
  });
});

module.exports = {
  getDriver: () => globalDriver
};
