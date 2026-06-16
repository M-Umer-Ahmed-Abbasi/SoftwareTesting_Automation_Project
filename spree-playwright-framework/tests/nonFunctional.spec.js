const { expect } = require('@playwright/test');
const { test } = require('../fixtures/testSetup');
const Logger = require('../utils/Logger');

test.describe('⚡ Non-Functional Tests - Spree Commerce', () => {
  // ─── HOOKS ──────────────────────────────────────────────────────────
  test.afterEach(async ({ homePage }, testInfo) => {
    if (testInfo.status === 'failed') {
      Logger.error(`Test FAILED: ${testInfo.title}`);
      await homePage.screenshotUtil.onFailure(testInfo.title);
    }
    Logger.info(`--- Test finished: ${testInfo.title} [${testInfo.status}] ---`);
  });

  // ─── TC-41 (Performance Test) ──────────────────────────────────────
  test('TC-41: Verify homepage loads within acceptable time (< 5 seconds)', async ({ page, homePage }) => {
    await test.step('Step 1: Measure homepage load time', async () => {
      const startTime = Date.now();
      await page.goto('/us/en', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      Logger.info(`Homepage load time: ${loadTime}ms`);
      await homePage.takeScreenshot('TC-41_step1_page_loaded');

      // Verify load time is under 5 seconds
      expect(loadTime).toBeLessThan(5000);
      Logger.info('TC-41 PASSED: Homepage loads within acceptable time');
    });

    await test.step('Step 2: Verify page is interactive after load', async () => {
      const isLoaded = await homePage.isLoaded();
      expect(isLoaded).toBeTruthy();
      await homePage.takeScreenshot('TC-41_step2_interactive');
      Logger.info('Page is interactive after load');
    });
  });

  // ─── TC-42 (Compatibility Test) ────────────────────────────────────
  test('TC-42: Verify website works correctly on different viewport sizes (responsive)', async ({ page, homePage, navigationPage }) => {
    await test.step('Step 1: Test on Desktop viewport (1280x720)', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/us/en');
      await page.waitForTimeout(2000);

      const headerVisible = await navigationPage.isHeaderVisible();
      expect(headerVisible).toBeTruthy();
      await homePage.takeScreenshot('TC-42_step1_desktop_viewport');
      Logger.info('Desktop viewport: Header visible');
    });

    await test.step('Step 2: Test on Tablet viewport (768x1024)', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);

      // Page should still be functional
      const searchVisible = await page.locator('button[aria-label="Open search"]').isVisible();
      expect(searchVisible).toBeTruthy();
      await homePage.takeScreenshot('TC-42_step2_tablet_viewport');
      Logger.info('Tablet viewport: Search button visible');
    });

    await test.step('Step 3: Test on Mobile viewport (375x667)', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);

      // Page should still be functional on mobile
      const cartVisible = await page.locator('button[aria-label="Open cart"]').isVisible();
      expect(cartVisible).toBeTruthy();
      await homePage.takeScreenshot('TC-42_step3_mobile_viewport');
      Logger.info('TC-42 PASSED: Website is responsive across viewports');
    });
  });
});
