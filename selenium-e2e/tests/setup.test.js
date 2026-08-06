const fs = require('fs');
const path = require('path');
const DriverFactory = require('../config/driverFactory');
const ScreenshotUtils = require('../utilities/screenshotUtils');
const WaitUtils = require('../utilities/waitUtils');
const ExcelReporter = require('../utilities/excelReporter');
const logger = require('../utilities/logger');
const config = require('../config/config');

let globalDriver = null;

before(async function () {
  this.timeout(60000);
  logger.info('=== STARTING ENTERPRISE E2E AUTOMATION TEST SUITE ===');
  ExcelReporter.clearCache();
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
  let consoleLogs = '';

  if (globalDriver) {
    try {
      currentUrl = await globalDriver.getCurrentUrl();
    } catch (_) {}
  }

  if (status === 'FAILED') {
    logger.error(`❌ Test FAILED: [${test.title}] - ${test.err?.message}`);
    if (globalDriver) {
      screenshotPath = await ScreenshotUtils.captureScreenshot(globalDriver, test.title);
      consoleLogs = await WaitUtils.getBrowserConsoleLogs(globalDriver);

      // Save detailed failure details under reports/failures/
      try {
        if (!fs.existsSync(config.paths.failures)) {
          fs.mkdirSync(config.paths.failures, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = test.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const failureLogPath = path.join(config.paths.failures, `FAIL_DETAILS_${safeName}_${timestamp}.txt`);
        const logContent = [
          `==================================================`,
          `FAILURE DETAILS LOG`,
          `==================================================`,
          `Test Scenario: ${test.title}`,
          `Module: ${test.parent?.title || 'E2E Core Suite'}`,
          `Timestamp: ${new Date().toISOString()}`,
          `Browser: ${config.browser.toUpperCase()}`,
          `URL: ${currentUrl}`,
          `Screenshot Path: ${screenshotPath || 'N/A'}`,
          `--------------------------------------------------`,
          `FAILURE REASON:`,
          `${test.err?.message || 'N/A'}`,
          `--------------------------------------------------`,
          `STACK TRACE:`,
          `${test.err?.stack || 'N/A'}`,
          `--------------------------------------------------`,
          `BROWSER CONSOLE LOGS:`,
          `${consoleLogs}`,
          `==================================================`
        ].join('\n');
        fs.writeFileSync(failureLogPath, logContent, 'utf8');
        logger.info(`Failure log details written to: ${failureLogPath}`);
      } catch (e) {
        logger.error(`Failed writing failure detail file: ${e.message}`);
      }
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
