const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const AddPatientPage = require('../pages/AddPatientPage');
const LoginPage = require('../pages/LoginPage');
const testData = require('../data/testData.json');

describe('Form Validation Test Suite', function () {
  this.timeout(60000);
  let driver;
  let addPatientPage;
  let loginPage;

  before(async function () {
    driver = getDriver();
    loginPage = new LoginPage(driver);
    addPatientPage = new AddPatientPage(driver);

    // Ensure logged in
    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
  });

  it('TC_FORM_01: Should validate required field errors on empty submission', async function () {
    await addPatientPage.open();
    await addPatientPage.fillForm('', '', '', '');
    const errorsCount = await addPatientPage.getValidationErrorsCount();
    expect(errorsCount).to.be.greaterThan(0);
  });

  it('TC_FORM_02: Should validate numeric range for age field', async function () {
    await addPatientPage.open();
    await addPatientPage.fillForm('Test Patient', '-5', 'Male', 'Skeletal Class III');
    const errorsCount = await addPatientPage.getValidationErrorsCount();
    expect(errorsCount).to.be.greaterThan(0);
  });

  it('TC_FORM_03: Should fill and register valid patient record successfully', async function () {
    await addPatientPage.open();
    await addPatientPage.fillForm(
      testData.patientForm.validPatient.name,
      testData.patientForm.validPatient.age,
      testData.patientForm.validPatient.gender,
      testData.patientForm.validPatient.malocclusionType
    );
    const url = await addPatientPage.getCurrentUrl();
    expect(url).to.include('/patients');
  });
});
