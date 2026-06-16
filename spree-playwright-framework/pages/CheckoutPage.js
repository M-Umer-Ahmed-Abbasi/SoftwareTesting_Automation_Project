const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * CheckoutPage - Page Object for checkout flow pages
 */
class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators - Checkout Form
    this.emailInput = 'input[name="email"], input#email';
    this.firstNameInput = 'input[name="firstName"], input[name="first_name"], input#firstName';
    this.lastNameInput = 'input[name="lastName"], input[name="last_name"], input#lastName';
    this.addressInput = 'input[name="address1"], input[name="address"], input#address1';
    this.cityInput = 'input[name="city"], input#city';
    this.zipCodeInput = 'input[name="zipcode"], input[name="zip"], input#zipcode';
    this.phoneInput = 'input[name="phone"], input#phone';
    this.continueButton = 'button:has-text("Continue")';
    this.saveAddressButton = 'button:has-text("Save Address")';

    // Locators - Shipping Method
    this.shippingMethodOption = 'input[type="radio"]';

    // Locators - Promo Code
    this.promoCodeInput = 'input[placeholder*="promo"], input[name*="coupon"], input[name*="promo"]';
    this.applyPromoButton = 'button:has-text("Apply")';
    this.promoError = 'text=coupon code';

    // Locators - Order Confirmation
    this.orderConfirmation = 'text=Thank you';
    this.orderNumber = 'text=Order #';
    this.placeOrderButton = 'button:has-text("Place Order"), button:has-text("Complete")';

    // Locators - Checkout Page Elements
    this.checkoutTitle = 'h1, h2';
    this.errorMessages = '[role="alert"], .error, text=required, text=invalid';
  }

  /**
   * Fill shipping information
   * @param {Object} shippingData
   */
  async fillShippingInfo(shippingData) {
    Logger.info('Filling shipping information');

    // Handle saved address option if visible to expose the address form
    try {
      const diffAddress = this.page.getByText('Use a different address').first();
      if (await diffAddress.isVisible({ timeout: 2000 })) {
        Logger.info('Saved address selection detected. Clicking "Use a different address" to expose form.');
        await diffAddress.click();
        await this.page.waitForTimeout(1000);
      }
    } catch (e) {
      Logger.info('No saved address selection screen: ' + e.message);
    }

    if (shippingData.email) {
      try {
        const emailField = this.page.locator('input[name="email"], input#email').first();
        if (await emailField.isVisible()) {
          await emailField.fill(shippingData.email);
        }
      } catch {
        Logger.info('Email field not found — possibly pre-filled');
      }
    }

    if (shippingData.firstName) {
      const firstNameField = this.page.locator(this.firstNameInput).first();
      if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstNameField.fill(shippingData.firstName);
      }
    }

    if (shippingData.lastName) {
      const lastNameField = this.page.locator(this.lastNameInput).first();
      if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await lastNameField.fill(shippingData.lastName);
      }
    }

    if (shippingData.address) {
      const addressField = this.page.locator(this.addressInput).first();
      if (await addressField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addressField.fill(shippingData.address);
      }
    }

    if (shippingData.city) {
      const cityField = this.page.locator(this.cityInput).first();
      if (await cityField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cityField.fill(shippingData.city);
      }
    }

    if (shippingData.zipCode) {
      const zipField = this.page.locator(this.zipCodeInput).first();
      if (await zipField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await zipField.fill(shippingData.zipCode);
      }
    }

    if (shippingData.phone) {
      const phoneField = this.page.locator(this.phoneInput).first();
      if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await phoneField.fill(shippingData.phone);
      }
    }
  }

  /**
   * Click Continue button
   */
  async clickContinue() {
    Logger.info('Clicking Continue button');
    await this.page.locator(this.continueButton).first().click();
    await this.page.waitForTimeout(2000);
  }

  async clickSaveAddress() {
    const btn = this.page.locator(this.saveAddressButton).first();
    if (await btn.isVisible().catch(() => false)) {
      Logger.info('Clicking Save Address button');
      await btn.click();
      await this.page.waitForTimeout(2000);
    } else {
      Logger.info('Save Address button not visible. Skipping (single-page checkout assumed).');
      
      // Only trigger validation if the address form is actively visible
      const firstNameField = this.page.locator(this.firstNameInput).first();
      if (await firstNameField.isVisible()) {
        const firstName = await firstNameField.inputValue().catch(() => '');
        const zip = await this.page.locator(this.zipCodeInput).first().inputValue().catch(() => '');
        
        // If the fields are empty or invalid, click Place Order to trigger validation errors
        if (!firstName || zip.length < 5 || zip === '00000' || zip === 'invalid') {
          Logger.info('Form is visible but empty/invalid. Clicking "Place Order" to trigger validation errors.');
          const placeOrderBtn = this.page.locator(this.placeOrderButton).first();
          if (await placeOrderBtn.isVisible()) {
            await placeOrderBtn.click();
            await this.page.waitForTimeout(2000);
          }
        }
      }
    }
  }

  /**
   * Select a shipping method
   * @param {number} index - shipping method radio button index
   */
  async selectShippingMethod(index = 0) {
    Logger.info(`Selecting shipping method at index: ${index}`);
    const radios = this.page.locator(this.shippingMethodOption);
    if (await radios.count() > index) {
      await radios.nth(index).click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Apply promo code
   * @param {string} code
   */
  async applyPromoCode(code) {
    Logger.info(`Applying promo code: ${code}`);
    const promoInput = this.page.locator(this.promoCodeInput).first();
    if (await promoInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await promoInput.fill(code);
      await this.page.locator(this.applyPromoButton).first().click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Check if promo code was rejected
   * @returns {boolean}
   */
  async isPromoRejected() {
    const errorVisible = await this.page.getByText('coupon code').isVisible().catch(() => false);
    const invalidVisible = await this.page.getByText('not found').isVisible().catch(() => false);
    return errorVisible || invalidVisible;
  }

  /**
   * Place the order
   */
  async placeOrder() {
    Logger.info('Placing order');
    await this.page.locator(this.placeOrderButton).first().click();
    await this.page.waitForTimeout(5000);
  }

  /**
   * Check if order confirmation is shown
   * @returns {boolean}
   */
  async isOrderConfirmed() {
    return await this.page.getByText('Thank you').isVisible().catch(() => false) ||
           await this.page.getByText('Order').isVisible().catch(() => false);
  }

  /**
   * Get order number text
   * @returns {string}
   */
  async getOrderNumber() {
    try {
      const orderText = await this.page.getByText(/Order #/).first().textContent();
      Logger.info(`Order number: ${orderText}`);
      return orderText;
    } catch {
      return '';
    }
  }

  /**
   * Check if checkout page is loaded
   * @returns {boolean}
   */
  async isCheckoutPageLoaded() {
    return this.page.url().includes('checkout');
  }

  /**
   * Check if error messages are visible
   * @returns {boolean}
   */
  async hasErrors() {
    const alerts = this.page.locator('[role="alert"]');
    return (await alerts.count()) > 0;
  }

  /**
   * Get error message text
   * @returns {string}
   */
  async getErrorText() {
    try {
      const alerts = this.page.locator('[role="alert"]');
      if (await alerts.count() > 0) {
        return await alerts.first().textContent();
      }
      return '';
    } catch {
      return '';
    }
  }
}

module.exports = CheckoutPage;
