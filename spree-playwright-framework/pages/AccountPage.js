const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * AccountPage - Page Object for account dashboard pages
 */
class AccountPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators - Sidebar Navigation
    this.overviewLink = 'a[href*="/account"]:has-text("Overview")';
    this.ordersLink = 'a[href*="/account/orders"]';
    this.addressesLink = 'a[href*="/account/addresses"]';
    this.paymentMethodsLink = 'a[href*="/account/credit-cards"]';
    this.profileLink = 'a[href*="/account/profile"]';
    this.signOutButton = 'button:has-text("Sign Out")';

    // Locators - Dashboard Cards
    this.orderHistoryCard = 'a[href*="/account/orders"]:has-text("Order History")';
    this.addressesCard = 'a[href*="/account/addresses"]:has-text("Addresses")';
    this.paymentMethodsCard = 'a[href*="/account/credit-cards"]:has-text("Payment Methods")';
    this.profileCard = 'a[href*="/account/profile"]:has-text("Profile")';

    // Locators - Profile Form
    this.firstNameInput = 'input[name="firstName"], input#firstName, input[name="first_name"]';
    this.lastNameInput = 'input[name="lastName"], input#lastName, input[name="last_name"]';
    this.saveButton = 'button:has-text("Save"), button:has-text("Update")';
  }

  /**
   * Open the account overview page
   */
  async open() {
    Logger.info('Opening account overview page');
    await this.navigate('/account');
  }

  /**
   * Check if account page is loaded (user is logged in)
   * @returns {boolean}
   */
  async isAccountPageLoaded() {
    try {
      await this.page.locator(this.signOutButton).first().waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to Orders page
   */
  async goToOrders() {
    Logger.info('Navigating to orders page');
    await this.isAccountPageLoaded();
    await this.click(this.ordersLink);
    await this.page.waitForTimeout(1000);
    if (!this.page.url().includes('orders')) {
      Logger.info('Navigation to orders failed. Retrying click with fallback...');
      const card = this.page.locator(this.orderHistoryCard).first();
      if (await card.isVisible().catch(() => false)) {
        await card.click();
      } else {
        await this.page.locator(this.ordersLink).first().click().catch(() => {});
      }
      await this.page.waitForTimeout(2000);
    } else {
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Navigate to Addresses page
   */
  async goToAddresses() {
    Logger.info('Navigating to addresses page');
    await this.isAccountPageLoaded();
    await this.click(this.addressesLink);
    await this.page.waitForTimeout(1000);
    if (!this.page.url().includes('addresses')) {
      Logger.info('Navigation to addresses failed. Retrying click with fallback...');
      const card = this.page.locator(this.addressesCard).first();
      if (await card.isVisible().catch(() => false)) {
        await card.click();
      } else {
        await this.page.locator(this.addressesLink).first().click().catch(() => {});
      }
      await this.page.waitForTimeout(2000);
    } else {
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Navigate to Profile page
   */
  async goToProfile() {
    Logger.info('Navigating to profile page');
    await this.isAccountPageLoaded();
    await this.click(this.profileLink);
    await this.page.waitForTimeout(1000);
    if (!this.page.url().includes('profile')) {
      Logger.info('Navigation to profile failed. Retrying click with fallback...');
      const card = this.page.locator(this.profileCard).first();
      if (await card.isVisible().catch(() => false)) {
        await card.click();
      } else {
        await this.page.locator(this.profileLink).first().click().catch(() => {});
      }
      await this.page.waitForTimeout(2000);
    } else {
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Navigate to Payment Methods page
   */
  async goToPaymentMethods() {
    Logger.info('Navigating to payment methods page');
    await this.isAccountPageLoaded();
    await this.click(this.paymentMethodsLink);
    await this.page.waitForTimeout(1000);
    if (!this.page.url().includes('credit-cards') && !this.page.url().includes('payment')) {
      Logger.info('Navigation to payment methods failed. Retrying click with fallback...');
      const card = this.page.locator(this.paymentMethodsCard).first();
      if (await card.isVisible().catch(() => false)) {
        await card.click();
      } else {
        await this.page.locator(this.paymentMethodsLink).first().click().catch(() => {});
      }
      await this.page.waitForTimeout(2000);
    } else {
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Sign out from account page
   */
  async signOut() {
    Logger.info('Signing out from account page');
    await this.isAccountPageLoaded();
    await this.click(this.signOutButton);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get user display name
   * @returns {string}
   */
  async getUserDisplayName() {
    try {
      const heading = await this.page.locator('h1, h2').first().textContent();
      Logger.info(`User display name: ${heading}`);
      return heading;
    } catch {
      return '';
    }
  }

  /**
   * Check if overview sidebar links are visible
   * @returns {boolean}
   */
  async areNavigationLinksVisible() {
    const ordersVisible = await this.page.locator(this.ordersLink).first().isVisible();
    const addressesVisible = await this.page.locator(this.addressesLink).first().isVisible();
    const profileVisible = await this.page.locator(this.profileLink).first().isVisible();
    return ordersVisible && addressesVisible && profileVisible;
  }

  /**
   * Update profile first name and last name
   * @param {string} firstName
   * @param {string} lastName
   */
  async updateProfile(firstName, lastName) {
    Logger.info(`Updating profile: ${firstName} ${lastName}`);
    await this.goToProfile();

    const firstNameField = this.page.locator(this.firstNameInput).first();
    const lastNameField = this.page.locator(this.lastNameInput).first();

    if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstNameField.fill(firstName);
    }
    if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lastNameField.fill(lastName);
    }

    await this.page.locator(this.saveButton).first().click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Check if the current page URL contains the expected path
   * @param {string} path
   * @returns {boolean}
   */
  async isOnPage(path) {
    return this.page.url().includes(path);
  }
}

module.exports = AccountPage;
