const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class ScreenshotUtils {
  static async captureScreenshot(driver, testName = 'Test_Scenario') {
    try {
      if (!fs.existsSync(config.paths.screenshots)) {
        fs.mkdirSync(config.paths.screenshots, { recursive: true });
      }
      if (!fs.existsSync(config.paths.failures)) {
        fs.mkdirSync(config.paths.failures, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `FAIL_${sanitizedTestName}_${timestamp}.png`;
      const screenshotPath = path.join(config.paths.failures, filename);

      const base64Data = await driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, Buffer.from(base64Data, 'base64'));
      logger.info(`📸 Mobile Failure Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (err) {
      logger.error(`Failed to capture screenshot for [${testName}]: ${err.message}`);
      return null;
    }
  }
}

module.exports = ScreenshotUtils;
