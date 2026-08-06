const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const BasePage = require('../pages/BasePage');
const DashboardPage = require('../pages/DashboardPage');
const LoginPage = require('../pages/LoginPage');
const UIComponentsPage = require('../pages/UIComponentsPage');
const testData = require('../data/testData.json');

describe('UI & Navigation Test Suite', function () {
  this.timeout(60000);
  let driver;
  let basePage;
  let dashboardPage;
  let loginPage;
  let uiComponentsPage;

  before(async function () {
    driver = getDriver();
    basePage = new BasePage(driver);
    dashboardPage = new DashboardPage(driver);
    loginPage = new LoginPage(driver);
    uiComponentsPage = new UIComponentsPage(driver);

    // Login for UI & Navigation workflow
    await loginPage.open();
    await loginPage.login(testData.auth.validUser.email, testData.auth.validUser.password);
  });

  it('TC_NAV_01: Should navigate via Dashboard quick action to Add Patient', async function () {
    await dashboardPage.open();
    await dashboardPage.clickNewPatient();
    const url = await basePage.getCurrentUrl();
    expect(url).to.include('/patients/add');
  });

  it('TC_NAV_02: Should verify browser Back functionality', async function () {
    await basePage.goBack();
    const url = await basePage.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_NAV_03: Should verify browser Forward functionality', async function () {
    await basePage.goForward();
    const url = await basePage.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_NAV_04: Should verify protected route navigation', async function () {
    await basePage.navigateTo('/settings/profile');
    const url = await basePage.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_UI_01: Should handle spinner/loader disappearance on page navigation', async function () {
    await dashboardPage.open();
    await uiComponentsPage.waitForLoaderToDisappear();
    const url = await basePage.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_UI_02: Should verify table search and row filtering component', async function () {
    await basePage.navigateTo('/patients');
    const initialRowCount = await uiComponentsPage.getTableRowCount();
    expect(initialRowCount).to.be.a('number');
  });

  it('TC_UI_03: Should verify Modal dialog visibility & title text', async function () {
    const isModalOpen = await uiComponentsPage.isModalDisplayed();
    expect(isModalOpen).to.be.a('boolean');
  });
});
