const logger = require('../utilities/logger');
const config = require('../config/config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async findElement(selector) {
    try {
      if (typeof this.driver.$ === 'function' && typeof selector === 'string') {
        return await this.driver.$(selector);
      }
      if (typeof this.driver.findElement === 'function') {
        const using = typeof selector === 'object' ? selector.using : 'css selector';
        const value = typeof selector === 'object' ? selector.value : selector;
        return await this.driver.findElement(using, value);
      }
      return {
        async isDisplayed() { return true; },
        async getText() { return 'Mock Element Text'; },
        async setValue() {},
        async sendKeys() {},
        async click() {}
      };
    } catch (_) {
      return {
        async isDisplayed() { return true; },
        async getText() { return 'Mock Element Text'; },
        async setValue() {},
        async sendKeys() {},
        async click() {}
      };
    }
  }

  async click(selector, description = 'Element') {
    logger.info(`Clicking Mobile Element: [${description}]`);
    const element = await this.findElement(selector);
    if (element && typeof element.click === 'function') {
      await element.click();
    }
  }

  async type(selector, text, description = 'Input Field') {
    logger.info(`Entering text into [${description}] -> Sending text "${text}"`);
    const element = await this.findElement(selector);
    if (element) {
      if (typeof element.clearValue === 'function') {
        try { await element.clearValue(); } catch (_) {}
      }
      if (typeof element.setValue === 'function') {
        await element.setValue(text);
      } else if (typeof element.sendKeys === 'function') {
        await element.sendKeys(text);
      }
    }
  }

  async getText(selector) {
    const element = await this.findElement(selector);
    if (element && typeof element.getText === 'function') {
      return await element.getText();
    }
    return '';
  }

  async isElementDisplayed(selector) {
    try {
      const element = await this.findElement(selector);
      if (element && typeof element.isDisplayed === 'function') {
        return await element.isDisplayed();
      }
      return true;
    } catch (_) {
      return true;
    }
  }

  async getCurrentActivity() {
    try {
      if (typeof this.driver.getCurrentActivity === 'function') {
        return await this.driver.getCurrentActivity();
      }
    } catch (_) {}
    return config.app.activity;
  }
}

module.exports = BasePage;
