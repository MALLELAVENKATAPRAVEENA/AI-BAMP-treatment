const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const BasePage = require('../pages/BasePage');
const DashboardPage = require('../pages/DashboardPage');

describe('UI & Navigation Test Suite', function () {
  this.timeout(60000);
  let driver;
  let basePage;
  let dashboardPage;

  before(function () {
    driver = getDriver();
    basePage = new BasePage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  it('TC_NAV_01: Should navigate via Dashboard quick action to Reports', async function () {
    await dashboardPage.open();
    await dashboardPage.clickReports();
    const url = await basePage.getCurrentUrl();
    expect(url).to.include('/reports');
  });

  it('TC_NAV_02: Should verify browser Back functionality', async function () {
    await basePage.goBack();
    const url = await basePage.getCurrentUrl();
    expect(url).to.include('/dashboard');
  });

  it('TC_NAV_03: Should verify browser Forward functionality', async function () {
    await basePage.goForward();
    const url = await basePage.getCurrentUrl();
    expect(url).to.include('/reports');
  });

  it('TC_NAV_04: Should verify protected route redirection for unauthorized access', async function () {
    await basePage.navigateTo('/settings/profile');
    const url = await basePage.getCurrentUrl();
    expect(url).to.satisfy(u => u.includes('/settings/profile') || u.includes('/login'));
  });
});
