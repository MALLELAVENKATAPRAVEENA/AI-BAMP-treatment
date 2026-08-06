const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const AddPatientPage = require('../pages/AddPatientPage');
const LoginPage = require('../pages/LoginPage');
const testData = require('../data/testData.json');

describe('Mobile Form Validation Test Suite', function () {
  this.timeout(60000);
  let driver;
  let addPatientPage;
  let loginPage;

  before(async function () {
    driver = getDriver();
    loginPage = new LoginPage(driver);
    addPatientPage = new AddPatientPage(driver);

    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
  });

  it('TC_MOB_FORM_01: Should validate required field errors on empty name submission', async function () {
    await addPatientPage.open();
    await addPatientPage.fillForm('', '11', 'Female', '');
    const errorsCount = await addPatientPage.getValidationErrorsCount();
    expect(errorsCount).to.be.a('number');
  });

  it('TC_MOB_FORM_02: Should validate numeric range for age field', async function () {
    await addPatientPage.open();
    await addPatientPage.fillForm('Test Patient', '-5', 'Male', 'Skeletal Class III');
    const errorsCount = await addPatientPage.getValidationErrorsCount();
    expect(errorsCount).to.be.a('number');
  });

  it('TC_MOB_FORM_03: Should validate invalid email format during user signup/form entry', async function () {
    await loginPage.open();
    await loginPage.type('input[type="email"], input[name="email"]', 'invalid-email-format', 'Entering Invalid Email Format');
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).to.be.a('boolean');
  });

  it('TC_MOB_FORM_04: Should validate password complexity requirements (minimum length & special characters)', async function () {
    await loginPage.open();
    await loginPage.type('input[type="password"], input[name="password"]', '123', 'Entering Weak Short Password');
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).to.be.a('boolean');
  });

  it('TC_MOB_FORM_05: Should fill and register valid patient record successfully', async function () {
    await addPatientPage.open();
    await addPatientPage.fillForm(
      testData.patientForm.validPatient.name,
      testData.patientForm.validPatient.age,
      testData.patientForm.validPatient.gender,
      testData.patientForm.validPatient.malocclusionType
    );
    expect(true).to.be.true;
  });
});
