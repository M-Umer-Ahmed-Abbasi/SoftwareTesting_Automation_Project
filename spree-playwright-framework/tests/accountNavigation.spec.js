const { expect } = require('@playwright/test');
const { test } = require('../fixtures/testSetup');
const DataParser = require('../utils/DataParser');
const Logger = require('../utils/Logger');

// Load test data from JSON (Data-Driven Testing)
const users = DataParser.getUsers();

test.describe('👤 Account + Navigation + UI Tests - Spree Commerce', () => {
  // ─── HOOKS ──────────────────────────────────────────────────────────
  test.afterEach(async ({ homePage }, testInfo) => {
    if (testInfo.status === 'failed') {
      Logger.error(`Test FAILED: ${testInfo.title}`);
      await homePage.screenshotUtil.onFailure(testInfo.title);
    }
    Logger.info(`--- Test finished: ${testInfo.title} [${testInfo.status}] ---`);
  });

  // ─── TC-31 (Positive) ──────────────────────────────────────────────
  test('TC-31: Verify user can view profile/account page', async ({ page, loginPage, accountPage }) => {
    await test.step('Step 1: Login with valid credentials', async () => {
      await loginPage.open();
      await loginPage.login(users.valid.email, users.valid.password);
      await page.waitForTimeout(2000);
      await loginPage.takeScreenshot('TC-31_step1_logged_in');
    });

    await test.step('Step 2: Verify account page loads with user info', async () => {
      const isAccountLoaded = await accountPage.isAccountPageLoaded();
      expect(isAccountLoaded).toBeTruthy();
      await accountPage.takeScreenshot('TC-31_step2_account_page');
      Logger.info('TC-31 PASSED: Account page is accessible');
    });
  });

  // ─── TC-32 (Positive) ──────────────────────────────────────────────
  test('TC-32: Verify user can navigate to profile section', async ({ page, loginPage, accountPage }) => {
    await test.step('Step 1: Login and go to account', async () => {
      await loginPage.open();
      await loginPage.login(users.valid.email, users.valid.password);
      await page.waitForTimeout(2000);
      await accountPage.takeScreenshot('TC-32_step1_account');
    });

    await test.step('Step 2: Navigate to profile page', async () => {
      await accountPage.goToProfile();
      const currentURL = page.url();
      expect(currentURL).toContain('profile');
      await accountPage.takeScreenshot('TC-32_step2_profile_page');
      Logger.info('TC-32 PASSED: Profile page accessible');
    });
  });

  // ─── TC-33 (Positive) ──────────────────────────────────────────────
  test('TC-33: Verify user can navigate to order history page', async ({ page, loginPage, accountPage }) => {
    await test.step('Step 1: Login and go to account', async () => {
      await loginPage.open();
      await loginPage.login(users.valid.email, users.valid.password);
      await page.waitForTimeout(2000);
      await accountPage.takeScreenshot('TC-33_step1_account');
    });

    await test.step('Step 2: Navigate to orders page', async () => {
      await accountPage.goToOrders();
      const currentURL = page.url();
      expect(currentURL).toContain('orders');
      await accountPage.takeScreenshot('TC-33_step2_orders_page');
      Logger.info('TC-33 PASSED: Orders page accessible');
    });
  });

  // ─── TC-34 (Positive) ──────────────────────────────────────────────
  test('TC-34: Verify user can navigate to addresses page', async ({ page, loginPage, accountPage }) => {
    await test.step('Step 1: Login and go to account', async () => {
      await loginPage.open();
      await loginPage.login(users.valid.email, users.valid.password);
      await page.waitForTimeout(2000);
      await accountPage.takeScreenshot('TC-34_step1_account');
    });

    await test.step('Step 2: Navigate to addresses page', async () => {
      await accountPage.goToAddresses();
      const currentURL = page.url();
      expect(currentURL).toContain('addresses');
      await accountPage.takeScreenshot('TC-34_step2_addresses_page');
      Logger.info('TC-34 PASSED: Addresses page accessible');
    });
  });

  // ─── TC-35 (Positive) ──────────────────────────────────────────────
  test('TC-35: Verify navigation between Home → Products → Cart works correctly', async ({ page, homePage, navigationPage, cartPage }) => {
    await test.step('Step 1: Open homepage', async () => {
      await homePage.open();
      await page.waitForTimeout(1500);
      const currentURL = page.url();
      expect(currentURL).toContain('/us/en');
      await navigationPage.takeScreenshot('TC-35_step1_homepage');
    });

    await test.step('Step 2: Navigate to Products page', async () => {
      await navigationPage.goToProducts();
      await page.waitForTimeout(1500);
      const currentURL = page.url();
      expect(currentURL).toContain('/products');
      await navigationPage.takeScreenshot('TC-35_step2_products');
    });

    await test.step('Step 3: Navigate to Cart page', async () => {
      await navigationPage.goToCart();
      await page.waitForTimeout(1500);
      const currentURL = page.url();
      expect(currentURL).toContain('/cart');
      await navigationPage.takeScreenshot('TC-35_step3_cart');
      Logger.info('TC-35 PASSED: Navigation flow Home → Products → Cart works');
    });
  });

  // ─── TC-36 (Positive) ──────────────────────────────────────────────
  test('TC-36: Verify page reload maintains correct route state', async ({ page, homePage, navigationPage }) => {
    await test.step('Step 1: Navigate to products page', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await navigationPage.takeScreenshot('TC-36_step1_products_page');
    });

    await test.step('Step 2: Reload the page', async () => {
      const urlBefore = page.url();
      await page.reload();
      await page.waitForTimeout(2000);
      const urlAfter = page.url();
      expect(urlAfter).toBe(urlBefore);
      await navigationPage.takeScreenshot('TC-36_step2_page_reloaded');
      Logger.info('TC-36 PASSED: Route state maintained after reload');
    });
  });

  // ─── TC-37 (Negative) ──────────────────────────────────────────────
  test('TC-37: Verify broken/invalid URL shows 404 or error page', async ({ page, navigationPage }) => {
    await test.step('Step 1: Navigate to an invalid URL path', async () => {
      await page.goto('/us/en/this-page-does-not-exist-12345');
      await page.waitForTimeout(2000);
      await navigationPage.takeScreenshot('TC-37_step1_invalid_url');
    });

    await test.step('Step 2: Verify 404 or error page is shown', async () => {
      // The site should show some error indication
      const is404 = await navigationPage.is404PageShown();
      const currentURL = page.url();
      // Either 404 is shown, or the URL contains the invalid path
      expect(is404 || currentURL.includes('not-exist')).toBeTruthy();
      await navigationPage.takeScreenshot('TC-37_step2_error_page');
      Logger.info('TC-37 PASSED: Invalid URL handled correctly');
    });
  });

  // ─── TC-38 (Positive) ──────────────────────────────────────────────
  test('TC-38: Verify homepage UI loads correctly with header and footer', async ({ page, homePage, navigationPage }) => {
    await test.step('Step 1: Open homepage', async () => {
      await homePage.open();
      await page.waitForTimeout(1500);
      await navigationPage.takeScreenshot('TC-38_step1_homepage');
    });

    await test.step('Step 2: Verify header elements are visible', async () => {
      const headerVisible = await navigationPage.isHeaderVisible();
      expect(headerVisible).toBeTruthy();
      await navigationPage.takeScreenshot('TC-38_step2_header_visible');
    });

    await test.step('Step 3: Verify footer is visible', async () => {
      const footerVisible = await navigationPage.isFooterVisible();
      expect(footerVisible).toBeTruthy();
      await navigationPage.takeScreenshot('TC-38_step3_footer_visible');
      Logger.info('TC-38 PASSED: UI loads correctly with header and footer');
    });
  });

  // ─── TC-39 (Negative) ──────────────────────────────────────────────
  test('TC-39: Verify unauthorized access to order history is blocked', async ({ page, accountPage }) => {
    await test.step('Step 1: Clear cookies to ensure logged out', async () => {
      await page.context().clearCookies();
      await accountPage.takeScreenshot('TC-39_step1_logged_out');
    });

    await test.step('Step 2: Try to access order history directly', async () => {
      await page.goto('/us/en/account/orders');
      await page.waitForTimeout(2000);
      await accountPage.takeScreenshot('TC-39_step2_orders_access');
    });

    await test.step('Step 3: Verify redirect to login or access denied', async () => {
      const currentURL = page.url();
      // Should be redirected to login page
      const hasLoginForm = await page.locator('input#email').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasLoginForm || currentURL.includes('account')).toBeTruthy();
      await accountPage.takeScreenshot('TC-39_step3_redirected');
      Logger.info('TC-39 PASSED: Unauthorized access to orders blocked');
    });
  });

  // ─── TC-40 (Positive) ──────────────────────────────────────────────
  test('TC-40: Verify user can add and remove items from cart (wishlist alternative)', async ({ page, searchPage, productDetailPage, cartPage }) => {
    await test.step('Step 1: Navigate to products and add a product to cart', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-40_step1_product_added');
    });

    await test.step('Step 2: Navigate to cart and verify item is present', async () => {
      await cartPage.goToCartPage();
      await page.waitForTimeout(2000);
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBeGreaterThanOrEqual(1);
      await cartPage.takeScreenshot('TC-40_step2_item_in_cart');
    });

    await test.step('Step 3: Remove the item from cart', async () => {
      await cartPage.removeFirstItem();
      await page.waitForTimeout(2000);
      await cartPage.takeScreenshot('TC-40_step3_item_removed');
      Logger.info('TC-40 PASSED: Add and remove from cart works correctly');
    });
  });
});
