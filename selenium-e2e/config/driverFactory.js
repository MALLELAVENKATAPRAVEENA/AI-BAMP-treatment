const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('./config');
const logger = require('../utilities/logger');

class DriverFactory {
  static async createDriver(browserName = config.browser, isHeadless = config.headless) {
    logger.info(`Initializing Selenium WebDriver for [Browser: ${browserName}, Headless: ${isHeadless}]`);
    let builder = new Builder();

    switch (browserName.toLowerCase()) {
      case 'firefox': {
        const firefoxOptions = new firefox.Options();
        if (isHeadless) {
          firefoxOptions.addArguments('-headless');
        }
        firefoxOptions.setPreference('dom.webnotifications.enabled', false);
        builder = builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
        break;
      }

      case 'edge': {
        const edgeOptions = new edge.Options();
        if (isHeadless) {
          edgeOptions.addArguments('--headless=new');
        }
        edgeOptions.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800');
        builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(edgeOptions);
        break;
      }

      case 'chrome':
      default: {
        const chromeOptions = new chrome.Options();
        if (isHeadless) {
          chromeOptions.addArguments('--headless=new');
        }
        chromeOptions.addArguments(
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1280,800',
          '--disable-notifications',
          '--ignore-certificate-errors'
        );
        builder = builder.forBrowser('chrome').setChromeOptions(chromeOptions);
        break;
      }
    }

    const driver = await builder.build();
    await driver.manage().setTimeouts({
      implicit: config.implicitWaitMs,
      pageLoad: config.pageLoadTimeoutMs
    });
    try {
      await driver.manage().window().setRect({ width: config.viewport.width, height: config.viewport.height });
    } catch (_) {
      try {
        await driver.manage().window().maximize();
      } catch (__) {}
    }
    
    logger.info(`Selenium WebDriver session created successfully.`);
    return driver;
  }
}

module.exports = DriverFactory;
