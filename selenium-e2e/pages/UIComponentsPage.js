const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const WaitUtils = require('../utilities/waitUtils');
const logger = require('../utilities/logger');

class UIComponentsPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Modal elements
    this.modalContainer = By.css('.MuiDialog-paper, .modal, [role="dialog"]');
    this.modalTitle = By.css('.MuiDialogTitle-root, .modal-header, h2.modal-title');
    this.modalCloseBtn = By.css('.MuiDialog-paper button[aria-label="close"], button.modal-close');
    this.modalConfirmBtn = By.css('.MuiDialogActions-root button.MuiButton-containedPrimary, button.btn-confirm');

    // Toast & Alert elements
    this.toastNotification = By.css('.MuiSnackbar-root, .Toastify__toast, .toast-notification');
    this.alertBox = By.css('.MuiAlert-root, .alert, [role="alert"]');
    this.alertMessage = By.css('.MuiAlert-message, .alert-message');

    // Loader / Spinner elements
    this.spinner = By.css('.MuiCircularProgress-root, .spinner, .loading-indicator');

    // Data Table & Pagination elements
    this.dataTable = By.css('table, .MuiTable-root, [role="grid"]');
    this.tableRows = By.css('tbody tr, .MuiTableRow-root');
    this.tableHeaders = By.css('th, .MuiTableCell-head');
    this.searchBarInput = By.css('input[placeholder*="Search"], input[type="search"], input[name="search"]');
    this.paginationNextBtn = By.css('button[title="Go to next page"], button[aria-label="Go to next page"]');
    this.paginationPrevBtn = By.css('button[title="Go to previous page"], button[aria-label="Go to previous page"]');
    this.paginationInfo = By.css('.MuiTablePagination-caption, .pagination-info');

    // Tooltip element
    this.tooltip = By.css('.MuiTooltip-tooltip, .tooltip-inner');

    // Select / Dropdown elements
    this.selectDropdown = By.css('.MuiSelect-select, select');
  }

  async isModalDisplayed() {
    return await this.isElementDisplayed(this.modalContainer);
  }

  async getModalTitleText() {
    if (await this.isModalDisplayed()) {
      return await this.getText(this.modalTitle);
    }
    return '';
  }

  async closeModal() {
    if (await this.isModalDisplayed()) {
      await this.click(this.modalCloseBtn, 'Closing Modal Dialog');
    }
  }

  async isToastDisplayed() {
    return await this.isElementDisplayed(this.toastNotification);
  }

  async getToastMessage() {
    if (await this.isToastDisplayed()) {
      return await this.getText(this.toastNotification);
    }
    return '';
  }

  async waitForLoaderToDisappear(timeout = 15000) {
    try {
      logger.info('Waiting for page spinner/loader to disappear...');
      await WaitUtils.waitForElementInvisibility(this.driver, this.spinner, timeout);
    } catch (_) {
      logger.info('No active loader spinner detected.');
    }
  }

  async searchTable(query) {
    logger.info(`Searching table with query: "${query}"`);
    await this.type(this.searchBarInput, query, 'Entering Table Search Query');
    await this.driver.sleep(500);
  }

  async getTableRowCount() {
    try {
      const rows = await this.driver.findElements(this.tableRows);
      return rows.length;
    } catch (_) {
      return 0;
    }
  }

  async clickNextPage() {
    await this.click(this.paginationNextBtn, 'Clicking Table Pagination Next Button');
  }

  async hoverElementAndGetTooltip(targetLocator) {
    const loc = typeof targetLocator === 'string' ? By.css(targetLocator) : targetLocator;
    const element = await this.findElement(loc);
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: element }).perform();
    await this.driver.sleep(500);

    if (await this.isElementDisplayed(this.tooltip)) {
      return await this.getText(this.tooltip);
    }
    return '';
  }
}

module.exports = UIComponentsPage;
