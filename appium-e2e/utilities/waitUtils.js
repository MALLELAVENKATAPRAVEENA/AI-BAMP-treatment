const logger = require('./logger');

class WaitUtils {
  static async waitForElement(driver, selector, timeoutMs = 15000, description = 'Element') {
    logger.info(`Waiting for element to be visible: [${description} -> ${selector}]`);
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const element = typeof selector === 'string' ? await driver.$(selector) : await driver.findElement(selector.using, selector.value);
        if (element && (typeof element.isDisplayed === 'function' ? await element.isDisplayed() : true)) {
          return element;
        }
      } catch (_) {}
      await driver.pause(500);
    }

    logger.warn(`Timeout waiting for element: [${description} -> ${selector}]`);
    return null;
  }

  static async waitForElementToDisappear(driver, selector, timeoutMs = 15000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const element = typeof selector === 'string' ? await driver.$(selector) : await driver.findElement(selector.using, selector.value);
        if (!element || !(await element.isDisplayed())) {
          return true;
        }
      } catch (_) {
        return true;
      }
      await driver.pause(500);
    }
    return false;
  }

  static async waitForActivity(driver, expectedActivity, timeoutMs = 15000) {
    logger.info(`Waiting for Android Activity: ${expectedActivity}`);
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        if (typeof driver.getCurrentActivity === 'function') {
          const currentActivity = await driver.getCurrentActivity();
          if (currentActivity && currentActivity.includes(expectedActivity)) {
            return true;
          }
        }
      } catch (_) {}
      await driver.pause(500);
    }
    return false;
  }

  static async handleAlert(driver, accept = true) {
    try {
      if (typeof driver.getAlertText === 'function') {
        const alertText = await driver.getAlertText();
        logger.info(`Mobile Alert Detected: "${alertText}" -> Action: ${accept ? 'Accept' : 'Dismiss'}`);
        if (accept) {
          await driver.acceptAlert();
        } else {
          await driver.dismissAlert();
        }
        return alertText;
      }
    } catch (_) {}
    return null;
  }

  static async retryAction(actionFn, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await actionFn();
      } catch (err) {
        logger.warn(`Action failed (Attempt ${attempt}/${maxRetries}): ${err.message}`);
        if (attempt === maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
}

module.exports = WaitUtils;
