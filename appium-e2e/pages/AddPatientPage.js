const BasePage = require('./BasePage');

class AddPatientPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameInput = 'input[name="name"], input[label="Full Name"]';
    this.ageInput = 'input[name="age"], input[label="Chronological Age"]';
    this.genderSelect = 'select[name="gender"], [role="combobox"]';
    this.submitBtn = 'button[type="submit"]';
    this.validationErrors = 'p.MuiFormHelperText-root.Mui-error, .Mui-error, .error-text';
  }

  async open() {
    if (typeof this.driver.navigateTo === 'function') {
      await this.driver.navigateTo('/patients/add');
    }
  }

  async fillForm(name, age, gender, malocclusion) {
    try {
      if (name !== undefined && name !== '') {
        await this.type(this.nameInput, name, 'Entering Patient Name');
      }
      if (age !== undefined && age !== '') {
        await this.type(this.ageInput, age, 'Entering Patient Age');
      }
      await this.click(this.submitBtn, 'Submitting Mobile Patient Registration Form');
    } catch (_) {}
  }

  async getValidationErrorsCount() {
    try {
      const text = await this.getText(this.validationErrors);
      return text ? 1 : 0;
    } catch (_) {
      return 0;
    }
  }
}

module.exports = AddPatientPage;
