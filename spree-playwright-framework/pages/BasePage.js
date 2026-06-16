const WaitUtils = require('../utils/WaitUtils');
const ScreenshotUtil = require('../utils/ScreenshotUtil');
const Logger = require('../utils/Logger');

/**
 * BasePage - Base class for all Page Objects
 * Contains shared methods: navigate, click, fill, getText, etc.
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.waitUtils = new WaitUtils(page);
    this.screenshotUtil = new ScreenshotUtil(page);
  }

  /**
   * Navigate to a URL relative to baseURL
   * @param {string} path
   */
  async navigate(path = '') {
    const relativePath = path.startsWith('/') ? path.substring(1) : path;
    Logger.info(`Navigating to relative path: ${relativePath} (original: ${path})`);
    await this.page.goto(relativePath);
    await this.waitUtils.waitForPageLoad();
  }

  /**
   * Click an element by locator
   * @param {string} selector
   */
  async click(selector) {
    Logger.info(`Clicking element: ${selector}`);
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(selector).first().click();
  }

  /**
   * Fill an input field
   * @param {string} selector
   * @param {string} value
   */
  async fill(selector, value) {
    Logger.info(`Filling "${selector}" with value: ${value}`);
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(selector).first().fill(value);
  }

  /**
   * Get text content of an element
   * @param {string} selector
   * @returns {string}
   */
  async getText(selector) {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 });
    const text = await this.page.locator(selector).first().textContent();
    Logger.info(`Got text from "${selector}": ${text}`);
    return text;
  }

  /**
   * Check if an element is visible
   * @param {string} selector
   * @returns {boolean}
   */
  async isVisible(selector) {
    return await this.page.locator(selector).first().isVisible();
  }

  /**
   * Get current page URL
   * @returns {string}
   */
  getURL() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {string}
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Handle browser alert/dialog
   * @param {string} action - 'accept' or 'dismiss'
   */
  async handleDialog(action = 'accept') {
    this.page.once('dialog', async (dialog) => {
      Logger.info(`Dialog appeared: ${dialog.message()} — ${action}ing`);
      action === 'accept' ? await dialog.accept() : await dialog.dismiss();
    });
  }

  /**
   * Select a dropdown option by value
   * @param {string} selector
   * @param {string} value
   */
  async selectOption(selector, value) {
    Logger.info(`Selecting option "${value}" in: ${selector}`);
    await this.page.selectOption(selector, value);
  }

  /**
   * Take a screenshot
   * @param {string} name
   */
  async takeScreenshot(name) {
    return await this.screenshotUtil.take(name);
  }

  /**
   * Get count of elements matching selector
   * @param {string} selector
   * @returns {number}
   */
  async getElementCount(selector) {
    const count = await this.page.locator(selector).count();
    Logger.info(`Element count for "${selector}": ${count}`);
    return count;
  }
}

module.exports = BasePage;
