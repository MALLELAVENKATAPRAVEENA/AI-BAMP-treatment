const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[type="email"], input[name="email"]');
    this.passwordInput = By.css('input[type="password"], input[name="password"]');
    this.loginButton = By.css('button[type="submit"]');
    this.errorMessage = By.css('.MuiAlert-message, .error-message, [role="alert"]');
    this.logoutButton = By.css('button[title*="Logout"], button[aria-label*="Logout"]');
    this.userAvatar = By.css('.MuiAvatar-root, [data-testid="user-avatar"]');
  }

  async open() {
    await this.navigateTo('/login');
  }

  async login(email, password) {
    if (email !== undefined) await this.type(this.emailInput, email, 'Entering Email');
    if (password !== undefined) await this.type(this.passwordInput, password, 'Entering Password');
    await this.click(this.loginButton, 'Clicking Login Submit Button');
  }

  async getErrorMessage() {
    if (await this.isElementDisplayed(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }

  async isLoggedIn() {
    return await this.isElementDisplayed(this.userAvatar) || (await this.getCurrentUrl()).includes('/dashboard');
  }

  async logout() {
    if (await this.isElementDisplayed(this.logoutButton)) {
      await this.click(this.logoutButton, 'Clicking Logout Button');
    }
  }
}

module.exports = LoginPage;
