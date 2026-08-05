const { By, until } = require('selenium-webdriver');
const config = require('../config/config');
const WaitUtils = require('../utilities/waitUtils');
const logger = require('../utilities/logger');
const ExcelReporter = require('../utilities/excelReporter');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(path = '') {
    const fullUrl = `${config.baseUrl}${path}`;
    logger.info(`Navigating to URL: ${fullUrl}`);
    ExcelReporter.logStep('Navigation', `Navigate to ${fullUrl}`, 'PASS');
    await this.driver.get(fullUrl);
    await this.driver.sleep(1000);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async findElement(locator) {
    const loc = typeof locator === 'string' ? By.css(locator) : locator;
    return await WaitUtils.waitForElementVisible(this.driver, loc);
  }

  async click(locator, stepDescription = '') {
    if (stepDescription) logger.info(stepDescription);
    await WaitUtils.clickWithRetry(this.driver, locator);
    if (stepDescription) ExcelReporter.logStep('UI Click', stepDescription, 'PASS');
  }

  async type(locator, text, stepDescription = '') {
    if (stepDescription) logger.info(`${stepDescription} -> Sending text "${text}"`);
    await WaitUtils.typeText(this.driver, locator, text);
    if (stepDescription) ExcelReporter.logStep('UI Type', `${stepDescription} ("${text}")`, 'PASS');
  }

  async getText(locator) {
    const el = await this.findElement(locator);
    return await el.getText();
  }

  async isElementDisplayed(locator) {
    try {
      const loc = typeof locator === 'string' ? By.css(locator) : locator;
      const el = await this.driver.findElement(loc);
      return await el.isDisplayed();
    } catch (_) {
      return false;
    }
  }

  async refreshPage() {
    logger.info('Refreshing current page...');
    await this.driver.navigate().refresh();
    await this.driver.sleep(1000);
  }

  async goBack() {
    logger.info('Executing browser back navigation...');
    await this.driver.navigate().back();
    await this.driver.sleep(1000);
  }

  async goForward() {
    logger.info('Executing browser forward navigation...');
    await this.driver.navigate().forward();
    await this.driver.sleep(1000);
  }
}

module.exports = BasePage;
