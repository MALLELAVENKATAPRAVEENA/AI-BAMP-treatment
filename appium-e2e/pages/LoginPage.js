const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = 'input[type="email"], input[name="email"], input[label="Email Address"]';
    this.passwordInput = 'input[type="password"], input[name="password"]';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = 'p.MuiFormHelperText-root.Mui-error, .MuiAlert-message, [role="alert"]';
    this.logoutButton = 'button[title*="Logout"], button[aria-label*="Logout"], header button';
    this.userAvatar = '.MuiAvatar-root, [data-testid="user-avatar"]';
  }

  async open() {
    if (typeof this.driver.navigateTo === 'function') {
      await this.driver.navigateTo('/login');
    }
  }

  async login(email, password) {
    if (email !== undefined && email !== '') {
      await this.type(this.emailInput, email, 'Entering Email');
    }
    if (password !== undefined && password !== '') {
      await this.type(this.passwordInput, password, 'Entering Password');
    }
    await this.click(this.loginButton, 'Clicking Login Submit Button');
  }

  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  async isLoggedIn() {
    await this.driver.pause(1000);
    let url = '';
    try {
      if (typeof this.driver.getUrl === 'function') {
        url = await this.driver.getUrl();
      }
    } catch (_) {}
    return url.includes('/dashboard') || await this.isElementDisplayed(this.userAvatar);
  }

  async logout() {
    if (await this.isElementDisplayed(this.logoutButton)) {
      await this.click(this.logoutButton, 'Clicking Logout Button');
    }
  }
}

module.exports = LoginPage;
