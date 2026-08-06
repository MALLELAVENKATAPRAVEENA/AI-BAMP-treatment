const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[type="email"], input[name="email"], input[label="Email Address"]');
    this.passwordInput = By.css('input[type="password"], input[name="password"]');
    this.loginButton = By.css('button[type="submit"]');
    this.errorMessage = By.css('p.MuiFormHelperText-root.Mui-error, .MuiAlert-message, [role="alert"]');
    this.logoutButton = By.css('button[title*="Logout"], button[aria-label*="Logout"], header button');
    this.userAvatar = By.css('.MuiAvatar-root, [data-testid="user-avatar"]');
  }

  async open() {
    await this.navigateTo('/login');
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
    try {
      await this.driver.sleep(500);
      const elements = await this.driver.findElements(this.errorMessage);
      if (elements.length > 0) {
        const texts = [];
        for (const el of elements) {
          texts.push(await el.getText());
        }
        return texts.join(' | ');
      }
      return '';
    } catch (_) {
      return '';
    }
  }

  async isLoggedIn() {
    await this.driver.sleep(1500);
    const url = await this.getCurrentUrl();
    return url.includes('/dashboard') || await this.isElementDisplayed(this.userAvatar);
  }

  async logout() {
    if (await this.isElementDisplayed(this.logoutButton)) {
      await this.click(this.logoutButton, 'Clicking Logout Button');
    }
  }
}

module.exports = LoginPage;
