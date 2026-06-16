const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * NavigationPage - Page Object for header, footer, and general navigation
 */
class NavigationPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators - Header
    this.logoLink = 'a[href="/us/en"]';
    this.menuButton = 'button[aria-label="Open menu"]';
    this.searchButton = 'button[aria-label="Open search"]';
    this.accountButton = 'a[aria-label="Account"]';
    this.cartButton = 'button[aria-label="Open cart"]';

    // Locators - Sidebar Menu
    this.menuCloseButton = 'button[aria-label="Close menu"]';
    this.kitchenCategory = 'button:has-text("Kitchen")';
    this.airClimateCategory = 'button:has-text("Air & Climate")';

    // Locators - Footer
    this.footerKitchenLink = 'footer a[href="/us/en/c/kitchen"]';
    this.footerAccountLink = 'footer a[href="/us/en/account"]';
    this.footerCartLink = 'footer a[href="/us/en/cart"]';
    this.footerPolicyLinks = 'footer a[href^="/us/en/policies/"]';
  }

  /**
   * Navigate to home page via logo
   */
  async goToHome() {
    Logger.info('Navigating to home via logo');
    await this.page.locator(this.logoLink).first().click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Navigate to products page
   */
  async goToProducts() {
    Logger.info('Navigating to products page');
    await this.navigate('/products');
  }

  /**
   * Navigate to cart page
   */
  async goToCart() {
    Logger.info('Navigating to cart page');
    await this.navigate('/cart');
  }

  /**
   * Navigate to account page
   */
  async goToAccount() {
    Logger.info('Navigating to account page');
    await this.click(this.accountButton);
    await this.page.waitForTimeout(1500);
  }

  /**
   * Open the sidebar menu
   */
  async openMenu() {
    Logger.info('Opening sidebar menu');
    await this.click(this.menuButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Close the sidebar menu
   */
  async closeMenu() {
    Logger.info('Closing sidebar menu');
    try {
      await this.page.locator(this.menuCloseButton).click();
    } catch {
      await this.page.press('body', 'Escape');
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to a category from sidebar menu
   * @param {string} categoryName
   */
  async navigateToCategory(categoryName) {
    Logger.info(`Navigating to category: ${categoryName}`);
    await this.openMenu();
    await this.page.getByText(categoryName, { exact: false }).first().click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Get current page URL
   * @returns {string}
   */
  getCurrentURL() {
    return this.page.url();
  }

  /**
   * Check if header elements are visible
   * @returns {boolean}
   */
  async isHeaderVisible() {
    const logo = await this.page.locator(this.logoLink).first().isVisible();
    const search = await this.page.locator(this.searchButton).isVisible();
    const cart = await this.page.locator(this.cartButton).isVisible();
    return logo && search && cart;
  }

  /**
   * Check if footer is visible
   * @returns {boolean}
   */
  async isFooterVisible() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
    return await this.page.locator('footer').isVisible();
  }

  /**
   * Navigate to an invalid URL and check for 404
   * @param {string} invalidPath
   */
  async navigateToInvalidURL(invalidPath) {
    Logger.info(`Navigating to invalid URL: ${invalidPath}`);
    await this.navigate(invalidPath);
  }

  /**
   * Check if 404 page is shown
   * @returns {boolean}
   */
  async is404PageShown() {
    const not_found = await this.page.getByText('not found').isVisible().catch(() => false);
    const four_oh_four = await this.page.getByText('404').isVisible().catch(() => false);
    const pageNotFound = await this.page.getByText('page not found').isVisible().catch(() => false);
    return not_found || four_oh_four || pageNotFound;
  }
}

module.exports = NavigationPage;
