const fs = require('fs');
const path = require('path');
const DriverFactory = require('../config/driverFactory');
const ScreenshotUtils = require('../utilities/screenshotUtils');
const LogcatUtils = require('../utilities/logcatUtils');
const ExcelReporter = require('../utilities/excelReporter');
const logger = require('../utilities/logger');
const config = require('../config/config');

let globalDriver = null;

before(async function () {
  this.timeout(90000);
  logger.info('=== STARTING ENTERPRISE APPIUM MOBILE E2E TEST SUITE ===');
  ExcelReporter.clearCache();
  globalDriver = await DriverFactory.createDriver();
});

after(async function () {
  this.timeout(45000);
  if (globalDriver && typeof globalDriver.deleteSession === 'function') {
    logger.info('Closing Appium 2.x session...');
    try {
      await globalDriver.deleteSession();
    } catch (_) {}
  }
  logger.info('Generating final Mobile ExcelJS E2E Execution Report...');
  await ExcelReporter.generateFinalReport();
  logger.info('=== ENTERPRISE APPIUM MOBILE E2E TEST SUITE COMPLETED ===');
});

beforeEach(function () {
  this.currentTest.startTime = new Date();
  logger.info(`>>> Launching Mobile Test: [${this.currentTest.title}]`);
});

afterEach(async function () {
  const test = this.currentTest;
  const endTime = new Date();
  const durationSeconds = ((endTime - test.startTime) / 1000).toFixed(2);
  let status = test.state === 'passed' ? 'PASSED' : test.state === 'failed' ? 'FAILED' : 'SKIPPED';
  let screenshotPath = null;
  let currentActivity = '';
  let logcatLogs = '';

  if (globalDriver) {
    try {
      if (typeof globalDriver.getCurrentActivity === 'function') {
        currentActivity = await globalDriver.getCurrentActivity();
      }
    } catch (_) {}
  }

  if (status === 'FAILED') {
    logger.error(`❌ Mobile Test FAILED: [${test.title}] - ${test.err?.message}`);
    if (globalDriver) {
      screenshotPath = await ScreenshotUtils.captureScreenshot(globalDriver, test.title);
      logcatLogs = await LogcatUtils.captureDeviceLogs(globalDriver);

      try {
        if (!fs.existsSync(config.paths.failures)) {
          fs.mkdirSync(config.paths.failures, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = test.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const failureLogPath = path.join(config.paths.failures, `MOB_FAIL_DETAILS_${safeName}_${timestamp}.txt`);
        const logContent = [
          `==================================================`,
          `MOBILE FAILURE DETAILS LOG`,
          `==================================================`,
          `Test Scenario: ${test.title}`,
          `Module: ${test.parent?.title || 'Mobile E2E Suite'}`,
          `Timestamp: ${new Date().toISOString()}`,
          `Device: ${config.device.deviceName}`,
          `Android Version: ${config.device.platformVersion}`,
          `Activity Name: ${currentActivity || config.app.activity}`,
          `Screenshot Path: ${screenshotPath || 'N/A'}`,
          `--------------------------------------------------`,
          `FAILURE REASON:`,
          `${test.err?.message || 'N/A'}`,
          `--------------------------------------------------`,
          `STACK TRACE:`,
          `${test.err?.stack || 'N/A'}`,
          `--------------------------------------------------`,
          `ADB LOGCAT LOGS:`,
          `${logcatLogs}`,
          `==================================================`
        ].join('\n');
        fs.writeFileSync(failureLogPath, logContent, 'utf8');
        logger.info(`Mobile failure log details written to: ${failureLogPath}`);
      } catch (e) {
        logger.error(`Failed writing mobile failure detail file: ${e.message}`);
      }
    }
  } else {
    logger.info(`✅ Mobile Test PASSED: [${test.title}] (${durationSeconds}s)`);
  }

  ExcelReporter.recordTestResult({
    testId: `TC-MOB-${Math.floor(1000 + Math.random() * 9000)}`,
    module: test.parent?.title || 'Mobile E2E Suite',
    scenarioName: test.title,
    device: config.device.deviceName,
    status,
    startTime: test.startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: `${durationSeconds} s`,
    failureReason: test.err ? test.err.message : '',
    screenshotPath: screenshotPath || 'N/A',
    activityName: currentActivity || config.app.activity
  });
});

module.exports = {
  getDriver: () => globalDriver
};
