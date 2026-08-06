const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboardTitle = 'h1, h2, [data-testid="dashboard-title"]';
    this.newPatientBtn = 'button[contains(., "New Patient")], //button[contains(text(),"Patient")]';
    this.reportsBtn = 'button[contains(., "Reports")]';
    this.patientTable = 'table, .MuiDataGrid-root, [role="grid"]';
    this.searchBar = 'input[type="search"], input[placeholder*="Search"]';
  }

  async open() {
    if (typeof this.driver.navigateTo === 'function') {
      await this.driver.navigateTo('/dashboard');
    }
  }

  async clickNewPatient() {
    await this.click(this.newPatientBtn, 'Quick Action: New Patient');
  }

  async isDashboardLoaded() {
    return await this.isElementDisplayed(this.dashboardTitle) || await this.isElementDisplayed(this.newPatientBtn);
  }
}

module.exports = DashboardPage;
