const { By, until } = require('selenium-webdriver');
const config = require('../config/config');
const logger = require('./logger');

class WaitUtils {
  static async waitForElementVisible(driver, locator, timeout = config.explicitWaitMs) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    logger.info(`Waiting for element to be visible: ${loc}`);
    return await driver.wait(until.elementLocated(loc), timeout).then(el =>
      driver.wait(until.elementIsVisible(el), timeout)
    );
  }

  static async waitForElementInvisibility(driver, locator, timeout = config.explicitWaitMs) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    logger.info(`Waiting for element to disappear: ${loc}`);
    try {
      const el = await driver.findElement(loc);
      return await driver.wait(until.stalenessOf(el), timeout);
    } catch (_) {
      return true; // Already invisible or removed from DOM
    }
  }

  static async waitForElementClickable(driver, locator, timeout = config.explicitWaitMs) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    const element = await this.waitForElementVisible(driver, loc, timeout);
    return await driver.wait(until.elementIsEnabled(element), timeout);
  }

  static async clickWithRetry(driver, locator, maxRetries = config.retryAttempts) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const element = await this.waitForElementClickable(driver, loc);
        await element.click();
        return;
      } catch (err) {
        attempt++;
        logger.warn(`Click failed on ${loc}. Attempt ${attempt}/${maxRetries}. Retrying JS click...`);
        if (attempt >= maxRetries) {
          const el = await driver.findElement(loc);
          await driver.executeScript("arguments[0].click();", el);
          return;
        }
        await driver.sleep(1000);
      }
    }
  }

  static async typeText(driver, locator, text) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    const element = await this.waitForElementVisible(driver, loc);
    await element.clear();
    await element.sendKeys(text);
  }

  static async scrollToElement(driver, locator) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    const element = await driver.findElement(loc);
    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element);
    await driver.sleep(500);
  }

  static async executeScript(driver, script, ...args) {
    return await driver.executeScript(script, ...args);
  }

  static async handleAlert(driver, accept = true) {
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      logger.info(`Alert present with text: "${alertText}"`);
      if (accept) {
        await alert.accept();
      } else {
        await alert.dismiss();
      }
      return alertText;
    } catch (_) {
      return null;
    }
  }

  static async switchToWindowByTitle(driver, expectedTitleSubstring) {
    const handles = await driver.getAllWindowHandles();
    for (const handle of handles) {
      await driver.switchTo().window(handle);
      const title = await driver.getTitle();
      if (title.includes(expectedTitleSubstring)) {
        logger.info(`Switched to window with title matching: "${expectedTitleSubstring}"`);
        return true;
      }
    }
    return false;
  }

  static async getBrowserConsoleLogs(driver) {
    try {
      const logs = await driver.manage().logs().get('browser');
      return logs.map(entry => `[${entry.level.name}] ${entry.message}`).join('\n');
    } catch (_) {
      return 'Console logs unavailable for browser vendor.';
    }
  }
}

module.exports = WaitUtils;
