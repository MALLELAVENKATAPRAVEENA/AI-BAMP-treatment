const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboardTitle = By.xpath("//h6[contains(text(), 'Orthodontist Clinical Dashboard') or contains(text(), 'Dashboard')]");
    this.newPatientBtn = By.xpath("//button[contains(., 'New Patient')]");
    this.patientTable = By.css('table, .MuiTable-root, .MuiCard-root');
  }

  async open() {
    await this.navigateTo('/dashboard');
  }

  async isLoaded() {
    await this.driver.sleep(1500); // Wait for React router transition
    const url = await this.getCurrentUrl();
    return url.includes('/dashboard');
  }

  async clickNewPatient() {
    await this.click(this.newPatientBtn, 'Clicking Quick Action: New Patient');
  }
}

module.exports = DashboardPage;
