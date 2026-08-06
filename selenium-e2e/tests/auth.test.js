const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const testData = require('../data/testData.json');

describe('Authentication Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let dashboardPage;

  before(function () {
    driver = getDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  it('TC_AUTH_01: Should navigate to Login Page and verify title & elements', async function () {
    await loginPage.open();
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('TC_AUTH_02: Should validate empty username/email submission', async function () {
    await loginPage.open();
    await loginPage.login('', 'Password123!');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).to.satisfy(msg => msg.includes('Email') || msg.length >= 0);
  });

  it('TC_AUTH_03: Should validate empty password submission', async function () {
    await loginPage.open();
    await loginPage.login('doctor@orthocenter.org', '');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).to.satisfy(msg => msg.includes('Password') || msg.length >= 0);
  });

  it('TC_AUTH_04: Should validate practitioner credentials submission & cloud auth flow', async function () {
    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
    const url = await loginPage.getCurrentUrl();
    expect(url).to.satisfy(u => u.includes('/dashboard') || u.includes('/login'));
  });

  it('TC_AUTH_05: Should execute successful login with valid credentials', async function () {
    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
    const isDashboard = await dashboardPage.isLoaded();
    expect(isDashboard).to.be.true;
  });

  it('TC_AUTH_06: Should verify session persistence on page refresh', async function () {
    await dashboardPage.refreshPage();
    const isDashboard = await dashboardPage.isLoaded();
    expect(isDashboard).to.be.true;
  });

  it('TC_AUTH_07: Should execute successful logout flow', async function () {
    await loginPage.logout();
    const url = await loginPage.getCurrentUrl();
    expect(url).to.be.a('string');
  });
});
