const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class AddPatientPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameInput = By.css('input[name="name"], input[label="Full Name"]');
    this.ageInput = By.css('input[name="age"], input[label="Chronological Age"]');
    this.genderSelect = By.css('select[name="gender"], [role="combobox"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.validationErrors = By.css('p.MuiFormHelperText-root.Mui-error, .Mui-error, .error-text');
  }

  async open() {
    await this.navigateTo('/patients/add');
    await this.driver.sleep(1000);
  }

  async fillForm(name, age, gender, malocclusion) {
    try {
      if (name !== undefined) {
        const elements = await this.driver.findElements(this.nameInput);
        if (elements.length > 0) {
          try { await elements[0].clear(); } catch (_) {}
          if (name !== '') await elements[0].sendKeys(name);
        }
      }
      if (age !== undefined) {
        const elements = await this.driver.findElements(this.ageInput);
        if (elements.length > 0) {
          try { await elements[0].clear(); } catch (_) {}
          if (age !== '') await elements[0].sendKeys(age);
        }
      }
      const submitElements = await this.driver.findElements(this.submitBtn);
      if (submitElements.length > 0) {
        await submitElements[0].click();
      }
    } catch (_) {}
  }

  async getValidationErrorsCount() {
    try {
      await this.driver.sleep(500);
      const elements = await this.driver.findElements(this.validationErrors);
      return elements.length;
    } catch (_) {
      return 0;
    }
  }
}

module.exports = AddPatientPage;
