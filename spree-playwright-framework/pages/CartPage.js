const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * CartPage - Page Object for cart drawer and /us/en/cart page
 */
class CartPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators - Cart Drawer
    this.openCartButton = 'button[aria-label="Open cart"]';
    this.closeCartButton = 'button[aria-label="Close cart"]';
    this.viewCartLink = 'a[href="/us/en/cart"]';

    // Locators - Cart Page
    this.cartItemNames = 'a[href^="/us/en/products/"]';
    this.removeItemButton = 'button[aria-label^="Remove "]';
    this.quantityIncrease = 'button[aria-label="Increase quantity"]';
    this.quantityDecrease = 'button[aria-label="Decrease quantity"]';
    this.checkoutButton = 'a:has-text("Checkout")';
    this.continueShoppingLink = 'a:has-text("Continue Shopping")';
    this.subtotalText = 'text=Subtotal';
    this.emptyCartMessage = 'text=Your cart is empty';
    this.cartBadge = 'button[aria-label="Open cart"] span';
  }

  /**
   * Open cart drawer from header
   */
  async openCartDrawer() {
    Logger.info('Opening cart drawer');
    const isDrawerOpen = await this.page.locator(this.closeCartButton).first().isVisible().catch(() => false);
    if (isDrawerOpen) {
      Logger.info('Cart drawer is already open. Skipping open click.');
      return;
    }
    await this.click(this.openCartButton);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Close cart drawer
   */
  async closeCartDrawer() {
    Logger.info('Closing cart drawer');
    const isDrawerOpen = await this.page.locator(this.closeCartButton).first().isVisible().catch(() => false);
    if (isDrawerOpen) {
      await this.page.locator(this.closeCartButton).first().click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Navigate to full cart page
   */
  async goToCartPage() {
    Logger.info('Navigating to cart page');
    await this.navigate('/cart');
    await this.waitForCartPageToLoad();
  }

  /**
   * Click View Cart link from cart drawer
   */
  async clickViewCart() {
    Logger.info('Clicking View Cart link');
    await this.page.locator(this.viewCartLink).click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Wait for cart page to be fully loaded and settled
   */
  async waitForCartPageToLoad() {
    Logger.info('Waiting for cart page contents to render');
    try {
      await Promise.race([
        this.page.locator(this.removeItemButton).first().waitFor({ state: 'visible', timeout: 8000 }),
        this.page.locator(this.emptyCartMessage).first().waitFor({ state: 'visible', timeout: 8000 })
      ]);
    } catch (e) {
      Logger.info('Timeout waiting for cart page to render: ' + e.message);
    }
  }

  /**
   * Get cart item count
   * @returns {number}
   */
  async getCartItemCount() {
    await this.waitForCartPageToLoad();
    const removeButtons = this.page.locator(this.removeItemButton);
    const count = await removeButtons.count();
    Logger.info(`Cart item count: ${count}`);
    return count;
  }

  /**
   * Get cart item names
   * @returns {string[]}
   */
  async getCartItemNames() {
    await this.waitForCartPageToLoad();
    const mainArea = this.page.locator('main, [role="dialog"]');
    const names = await mainArea.locator('a[href^="/us/en/products/"]').allTextContents();
    const filtered = names.filter(n => n.trim().length > 0);
    Logger.info(`Cart item names: ${filtered.join(', ')}`);
    return filtered;
  }

  /**
   * Remove first item from cart
   */
  async removeFirstItem() {
    Logger.info('Removing first item from cart');
    await this.page.locator(this.removeItemButton).first().click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Remove item by name
   * @param {string} productName
   */
  async removeItemByName(productName) {
    Logger.info(`Removing item: ${productName}`);
    // Find the cart item block containing the product name, then click remove
    const itemBlock = this.page.locator(`text=${productName}`).locator('..').locator('..');
    await itemBlock.locator(this.removeItemButton).click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    Logger.info('Proceeding to checkout');
    await this.page.locator(this.checkoutButton).first().click();
    await this.page.waitForTimeout(3000);
  }

  /**
   * Click Continue Shopping
   */
  async continueShopping() {
    Logger.info('Clicking Continue Shopping');
    await this.page.locator(this.continueShoppingLink).first().click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Check if cart is empty
   * @returns {boolean}
   */
  async isCartEmpty() {
    await this.waitForCartPageToLoad();
    return await this.page.getByText('Your cart is empty').isVisible();
  }

  /**
   * Check if checkout button is visible
   * @returns {boolean}
   */
  async isCheckoutButtonVisible() {
    return await this.page.locator(this.checkoutButton).first().isVisible();
  }

  /**
   * Get cart badge count from header
   * @returns {number}
   */
  async getCartBadgeCount() {
    try {
      const badge = this.page.locator(this.cartBadge);
      const visible = await badge.isVisible();
      if (!visible) return 0;
      const text = await badge.textContent();
      return parseInt(text) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get subtotal text
   * @returns {string}
   */
  async getSubtotalText() {
    await this.waitForCartPageToLoad();
    const subtotal = this.page.locator('text=Subtotal').locator('..');
    return await subtotal.textContent();
  }
}

module.exports = CartPage;
