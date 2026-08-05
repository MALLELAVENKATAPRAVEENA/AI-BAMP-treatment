const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class ScreenshotUtils {
  static async captureScreenshot(driver, screenshotName) {
    try {
      if (!fs.existsSync(config.paths.screenshots)) {
        fs.mkdirSync(config.paths.screenshots, { recursive: true });
      }
      if (!fs.existsSync(config.paths.failures)) {
        fs.mkdirSync(config.paths.failures, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeName = screenshotName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `FAIL_${safeName}_${timestamp}.png`;
      const filePath = path.join(config.paths.failures, filename);

      const imageBuffer = await driver.takeScreenshot();
      fs.writeFileSync(filePath, imageBuffer, 'base64');
      logger.info(`Screenshot captured successfully: ${filePath}`);
      return filePath;
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
      return null;
    }
  }
}

module.exports = ScreenshotUtils;
