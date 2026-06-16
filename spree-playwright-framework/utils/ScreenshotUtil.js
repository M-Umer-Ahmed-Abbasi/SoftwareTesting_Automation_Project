const path = require('path');
const fs = require('fs');
const Logger = require('./Logger');
const { test } = require('@playwright/test');

/**
 * ScreenshotUtil - Handles screenshot capture
 * Saves screenshots to /screenshots directory
 */
class ScreenshotUtil {
  constructor(page) {
    this.page = page;
    this.screenshotsDir = path.join(process.cwd(), 'screenshots');
    this._ensureDir();
  }

  _ensureDir() {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Take a screenshot with a given name
   * @param {string} name - Screenshot filename (without extension)
   * @returns {string} - Path to the saved screenshot
   */
  async take(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    await this.page.screenshot({ path: filepath, fullPage: true });
    Logger.info(`Screenshot saved: ${filename}`);

    // Automatically attach to the Playwright/Allure report if running inside a test context
    try {
      const testInfo = test.info();
      if (testInfo) {
        await testInfo.attach(name, {
          path: filepath,
          contentType: 'image/png'
        });
        Logger.info(`Screenshot attached to report: ${name}`);
      }
    } catch (e) {
      Logger.debug(`Could not attach screenshot to report: ${e.message}`);
    }

    return filepath;
  }

  /**
   * Take a screenshot on test failure
   * @param {string} testName - The name of the failed test
   */
  async onFailure(testName) {
    const safeName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    return await this.take(`FAILED_${safeName}`);
  }

  /**
   * Take a screenshot of a specific element
   * @param {import('@playwright/test').Locator} locator - The element locator
   * @param {string} name - Screenshot filename
   */
  async takeElement(locator, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_element_${timestamp}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    await locator.screenshot({ path: filepath });
    Logger.info(`Element screenshot saved: ${filename}`);

    // Automatically attach to the Playwright/Allure report if running inside a test context
    try {
      const testInfo = test.info();
      if (testInfo) {
        await testInfo.attach(name, {
          path: filepath,
          contentType: 'image/png'
        });
        Logger.info(`Element screenshot attached to report: ${name}`);
      }
    } catch (e) {
      Logger.debug(`Could not attach element screenshot to report: ${e.message}`);
    }

    return filepath;
  }
}

module.exports = ScreenshotUtil;
