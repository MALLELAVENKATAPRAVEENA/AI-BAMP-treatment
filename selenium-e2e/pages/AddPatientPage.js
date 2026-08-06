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
  }

  async fillForm(name, age, gender, malocclusion) {
    if (name !== undefined) {
      const nameEl = await this.findElement(this.nameInput);
      await nameEl.clear();
      if (name !== '') await this.type(this.nameInput, name, 'Entering Patient Name');
    }
    if (age !== undefined) {
      const ageEl = await this.findElement(this.ageInput);
      await ageEl.clear();
      if (age !== '') await this.type(this.ageInput, age, 'Entering Patient Age');
    }
    await this.click(this.submitBtn, 'Submitting Patient Registration Form');
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
