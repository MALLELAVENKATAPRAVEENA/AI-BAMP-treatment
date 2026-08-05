const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class AddPatientPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameInput = By.css('input[name="name"], input[name="patientName"]');
    this.ageInput = By.css('input[name="age"]');
    this.genderSelect = By.css('select[name="gender"], [role="combobox"]');
    this.malocclusionSelect = By.css('select[name="malocclusionType"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.validationErrors = By.css('.Mui-error, .error-text, p.MuiFormHelperText-root');
  }

  async open() {
    await this.navigateTo('/patients/add');
  }

  async fillForm(name, age, gender, malocclusion) {
    if (name !== undefined) await this.type(this.nameInput, name, 'Entering Patient Name');
    if (age !== undefined) await this.type(this.ageInput, age, 'Entering Patient Age');
    await this.click(this.submitBtn, 'Submitting Patient Registration Form');
  }

  async getValidationErrorsCount() {
    try {
      const elements = await this.driver.findElements(this.validationErrors);
      return elements.length;
    } catch (_) {
      return 0;
    }
  }
}

module.exports = AddPatientPage;
