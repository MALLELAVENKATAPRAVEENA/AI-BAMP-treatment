const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboardTitle = By.xpath("//h6[contains(text(), 'Orthodontist Dashboard') or contains(text(), 'Dashboard')]");
    this.newPatientBtn = By.xpath("//button[contains(., 'New Patient')]");
    this.reportsBtn = By.xpath("//button[contains(., 'Reports')]");
    this.patientTable = By.css('table, .MuiTable-root, .MuiCard-root');
  }

  async open() {
    await this.navigateTo('/dashboard');
  }

  async isLoaded() {
    return (await this.getCurrentUrl()).includes('/dashboard');
  }

  async clickNewPatient() {
    await this.click(this.newPatientBtn, 'Clicking Quick Action: New Patient');
  }

  async clickReports() {
    await this.click(this.reportsBtn, 'Clicking Quick Action: Reports');
  }
}

module.exports = DashboardPage;
