const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * HomePage - Page Object for https://demo.spreecommerce.org/us/en (Homepage)
 */
class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.searchButton = 'button[aria-label="Open search"]';
    this.cartButton = 'button[aria-label="Open cart"]';
    this.accountButton = 'a[aria-label="Account"]';
    this.menuButton = 'button[aria-label="Open menu"]';
    this.logoLink = 'a[href="/us/en"]';
    this.shopAllButton = 'a[href="/us/en/products"]';
    this.featuredProducts = 'a[href^="/us/en/products/"]';
    this.productCardTitle = 'a.group h3';
    this.productCardPrice = 'a.group span';
  }

  /**
   * Open the homepage
   */
  async open() {
    Logger.info('Opening Spree Commerce homepage');
    await this.navigate('/');
  }

  /**
   * Check if the homepage is loaded
   * @returns {boolean}
   */
  async isLoaded() {
    return await this.isVisible(this.searchButton);
  }

  /**
   * Get featured product names from homepage
   * @returns {string[]}
   */
  async getFeaturedProductNames() {
    const names = await this.page.locator(this.productCardTitle).allTextContents();
    Logger.info(`Featured products: ${names.join(', ')}`);
    return names;
  }

  /**
   * Click on a featured product by index
   * @param {number} index
   */
  async clickFeaturedProduct(index = 0) {
    Logger.info(`Clicking featured product at index: ${index}`);
    await this.page.locator(this.featuredProducts).nth(index).click();
  }

  /**
   * Click the Shop All button
   */
  async clickShopAll() {
    Logger.info('Clicking Shop All button');
    await this.page.locator(this.shopAllButton).first().click();
  }

  /**
   * Open the navigation menu sidebar
   */
  async openMenu() {
    Logger.info('Opening navigation menu');
    await this.click(this.menuButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Open the cart drawer
   */
  async openCart() {
    Logger.info('Opening cart drawer');
    await this.click(this.cartButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to account page
   */
  async goToAccount() {
    Logger.info('Navigating to account page');
    await this.click(this.accountButton);
  }

  /**
   * Get cart badge count from header
   * @returns {number}
   */
  async getCartBadgeCount() {
    try {
      const badge = this.page.locator('button[aria-label="Open cart"] span');
      const visible = await badge.isVisible();
      if (!visible) return 0;
      const text = await badge.textContent();
      return parseInt(text) || 0;
    } catch {
      return 0;
    }
  }
}

module.exports = HomePage;
