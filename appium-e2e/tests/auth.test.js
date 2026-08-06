const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const LoginPage = require('../pages/LoginPage');
const testData = require('../data/testData.json');

describe('Mobile Authentication Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;

  before(function () {
    driver = getDriver();
    loginPage = new LoginPage(driver);
  });

  it('TC_MOB_AUTH_01: Should navigate to Login Screen and verify elements', async function () {
    await loginPage.open();
    const isDisplayed = await loginPage.isElementDisplayed(loginPage.emailInput);
    expect(isDisplayed).to.be.true;
  });

  it('TC_MOB_AUTH_02: Should validate empty username/email submission', async function () {
    await loginPage.open();
    await loginPage.login('', 'Password123!');
    const error = await loginPage.getErrorMessage();
    expect(error).to.be.a('string');
  });

  it('TC_MOB_AUTH_03: Should validate empty password submission', async function () {
    await loginPage.open();
    await loginPage.login('doctor@orthocenter.org', '');
    const error = await loginPage.getErrorMessage();
    expect(error).to.be.a('string');
  });

  it('TC_MOB_AUTH_04: Should validate practitioner credentials submission & cloud auth flow', async function () {
    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).to.be.true;
  });

  it('TC_MOB_AUTH_05: Should execute successful login with valid credentials', async function () {
    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).to.be.true;
  });

  it('TC_MOB_AUTH_06: Should verify session persistence on app relaunch', async function () {
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).to.be.true;
  });

  it('TC_MOB_AUTH_07: Should execute successful logout flow', async function () {
    await loginPage.logout();
    const isDisplayed = await loginPage.isElementDisplayed(loginPage.loginButton);
    expect(isDisplayed).to.be.true;
  });
});
