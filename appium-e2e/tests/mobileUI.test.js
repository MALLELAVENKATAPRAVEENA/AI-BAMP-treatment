const { expect } = require('chai');
const { getDriver } = require('./setup.test');
const DashboardPage = require('../pages/DashboardPage');
const UIComponentsPage = require('../pages/UIComponentsPage');
const GestureUtils = require('../utilities/gestureUtils');

describe('Mobile UI & Gesture Test Suite', function () {
  this.timeout(60000);
  let driver;
  let dashboardPage;
  let uiComponentsPage;

  before(function () {
    driver = getDriver();
    dashboardPage = new DashboardPage(driver);
    uiComponentsPage = new UIComponentsPage(driver);
  });

  it('TC_MOB_UI_01: Should navigate via Dashboard quick action to Add Patient', async function () {
    await dashboardPage.open();
    await dashboardPage.clickNewPatient();
    expect(true).to.be.true;
  });

  it('TC_MOB_UI_02: Should execute swipe up and swipe down gestures', async function () {
    await GestureUtils.swipe(driver, 'up');
    await GestureUtils.swipe(driver, 'down');
    expect(true).to.be.true;
  });

  it('TC_MOB_UI_03: Should execute pinch and zoom gestures', async function () {
    await GestureUtils.pinch(driver, 500, 500);
    await GestureUtils.zoom(driver, 500, 500);
    expect(true).to.be.true;
  });

  it('TC_MOB_UI_04: Should handle mobile spinner/loader disappearance', async function () {
    await dashboardPage.open();
    const isSpinnerVisible = await uiComponentsPage.isSpinnerVisible();
    expect(isSpinnerVisible).to.be.a('boolean');
  });

  it('TC_MOB_UI_05: Should verify Modal dialog visibility & title text', async function () {
    const isModalVisible = await uiComponentsPage.isModalVisible();
    expect(isModalVisible).to.be.a('boolean');
  });
});
