const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * LoginPage - Page Object for https://demo.spreecommerce.org/us/en/account (Login/Register)
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.emailInput = 'input#email';
    this.passwordInput = 'input#password';
    this.signInButton = 'button:has-text("Sign In")';
    this.signUpLink = 'a[href="/us/en/account/register"]';
    this.forgotPasswordLink = 'a[href="/us/en/account/forgot-password"]';
    this.showPasswordButton = 'button[aria-label="Show password"]';
    this.errorMessage = 'text=Invalid email or password';
    this.signOutButton = 'button:has-text("Sign Out")';
  }

  /**
   * Open the login page
   */
  async open() {
    Logger.info('Opening Spree Commerce login page');
    await this.navigate('/account');
  }

  /**
   * Perform login with given credentials
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    Logger.info(`Logging in as: ${email}`);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.signInButton);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get the error message text after a failed login
   * @returns {string}
   */
  async getErrorMessage() {
    await this.page.waitForTimeout(1500);
    const errorLocator = this.page.getByText('Invalid email or password');
    const visible = await errorLocator.isVisible();
    if (visible) {
      return await errorLocator.textContent();
    }
    // Check for other error messages
    const alerts = this.page.locator('[role="alert"]');
    if (await alerts.count() > 0) {
      return await alerts.first().textContent();
    }
    return '';
  }

  /**
   * Check if error message is displayed
   * @returns {boolean}
   */
  async isErrorVisible() {
    await this.page.waitForTimeout(1000);
    const errorLocator = this.page.getByText('Invalid email or password');
    return await errorLocator.isVisible();
  }

  async isLoginFormVisible() {
    try {
      await this.page.locator(this.emailInput).first().waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  async isLoggedIn() {
    try {
      await this.page.locator(this.signOutButton).first().waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Perform logout
   */
  async logout() {
    Logger.info('Logging out');
    await this.click(this.signOutButton);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Click the Sign Up / Register link
   */
  async clickSignUp() {
    Logger.info('Clicking Sign Up link');
    await this.click(this.signUpLink);
  }
}

module.exports = LoginPage;
