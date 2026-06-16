const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * ProductDetailPage - Page Object for individual product detail pages
 */
class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.productTitle = 'h1';
    this.productPrice = 'main span:has-text("$")';
    this.addToCartButton = 'button:has-text("Add to Cart")';
    this.quantityIncreaseButton = 'button[aria-label="Increase quantity"]';
    this.quantityDecreaseButton = 'button[aria-label="Decrease quantity"]';
    this.inStockLabel = 'text=In Stock';
    this.productDescription = 'text=Description';
  }

  /**
   * Get product name on detail page
   * @returns {string}
   */
  async getProductName() {
    const name = await this.page.locator(this.productTitle).first().textContent();
    Logger.info(`Product name: ${name}`);
    return name;
  }

  /**
   * Get product price as string
   * @returns {string}
   */
  async getProductPrice() {
    const priceText = await this.page.locator(this.productPrice).first().textContent();
    Logger.info(`Product price: ${priceText}`);
    return priceText;
  }

  /**
   * Add the product to cart
   */
  async addToCart() {
    Logger.info('Adding product to cart from detail page');
    await this.click(this.addToCartButton);
    // Wait for the button to change back to "Add to Cart" (indicating "Adding..." state has finished)
    await this.page.locator(this.addToCartButton).first().waitFor({ state: 'visible', timeout: 8000 });
    // Wait for cart drawer to slide open to ensure the item is registered in the session
    try {
      await this.page.locator('button[aria-label="Close cart"]').first().waitFor({ state: 'visible', timeout: 6000 });
      Logger.info('Cart drawer open - product successfully added to cart');
    } catch (e) {
      Logger.info('Cart drawer did not open within 6s: ' + e.message);
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Increase product quantity
   */
  async increaseQuantity() {
    Logger.info('Increasing product quantity');
    await this.click(this.quantityIncreaseButton);
  }

  /**
   * Decrease product quantity
   */
  async decreaseQuantity() {
    Logger.info('Decreasing product quantity');
    await this.click(this.quantityDecreaseButton);
  }

  /**
   * Select a variant by title (e.g., color variant)
   * @param {string} variantTitle - e.g., "Matte Black", "Silver"
   */
  async selectVariant(variantTitle) {
    Logger.info(`Selecting variant: ${variantTitle}`);
    await this.page.locator(`button[title="${variantTitle}"]`).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if Add to Cart button is visible
   * @returns {boolean}
   */
  async isAddToCartVisible() {
    return await this.isVisible(this.addToCartButton);
  }

  /**
   * Check if product is in stock
   * @returns {boolean}
   */
  async isInStock() {
    return await this.page.getByText('In Stock').isVisible();
  }

  /**
   * Check if product detail page is loaded
   * @returns {boolean}
   */
  async isLoaded() {
    return await this.page.locator(this.productTitle).first().isVisible();
  }
}

module.exports = ProductDetailPage;
