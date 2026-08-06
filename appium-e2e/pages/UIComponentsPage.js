const BasePage = require('./BasePage');

class UIComponentsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.spinner = '.MuiCircularProgress-root, .spinner, .loading-indicator, [role="progressbar"]';
    this.modalDialog = '.MuiDialog-root, [role="dialog"], .modal';
    this.toastNotification = '.MuiSnackbar-root, .toast, [role="alert"]';
    this.tableRows = 'tr.MuiTableRow-root, .MuiDataGrid-row';
    this.drawer = '.MuiDrawer-root, [role="presentation"]';
    this.tabs = '.MuiTab-root, [role="tab"]';
  }

  async isSpinnerVisible() {
    return await this.isElementDisplayed(this.spinner);
  }

  async isModalVisible() {
    return await this.isElementDisplayed(this.modalDialog);
  }

  async isToastVisible() {
    return await this.isElementDisplayed(this.toastNotification);
  }

  async isDrawerVisible() {
    return await this.isElementDisplayed(this.drawer);
  }
}

module.exports = UIComponentsPage;
