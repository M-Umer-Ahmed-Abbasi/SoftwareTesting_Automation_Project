const Logger = require('./Logger');

/**
 * WaitUtils - Custom explicit wait helpers built on top of Playwright's built-in waits
 */
class WaitUtils {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - CSS or XPath selector
   * @param {number} timeout - Max wait time in ms
   */
  async waitForVisible(selector, timeout = 10000) {
    Logger.info(`Waiting for element to be visible: ${selector}`);
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for an element to be hidden
   * @param {string} selector
   * @param {number} timeout
   */
  async waitForHidden(selector, timeout = 10000) {
    Logger.info(`Waiting for element to be hidden: ${selector}`);
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Wait for URL to contain a specific string
   * @param {string} urlPart
   * @param {number} timeout
   */
  async waitForURL(urlPart, timeout = 15000) {
    Logger.info(`Waiting for URL to contain: ${urlPart}`);
    await this.page.waitForURL(`**/${urlPart}**`, { timeout });
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad() {
    Logger.info('Waiting for page to fully load');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for a specific text to appear on the page
   * @param {string} text
   * @param {number} timeout
   */
  async waitForText(text, timeout = 10000) {
    Logger.info(`Waiting for text: "${text}"`);
    await this.page.waitForFunction(
      (t) => document.body.innerText.includes(t),
      text,
      { timeout }
    );
  }

  /**
   * Simple sleep (use sparingly — prefer event-based waits)
   * @param {number} ms - Milliseconds to wait
   */
  async sleep(ms) {
    Logger.info(`Sleeping for ${ms}ms`);
    await this.page.waitForTimeout(ms);
  }
}

module.exports = WaitUtils;
