const { expect } = require('@playwright/test');
const { test } = require('../fixtures/testSetup');
const DataParser = require('../utils/DataParser');
const Logger = require('../utils/Logger');

// Load test data from JSON (Data-Driven Testing)
const users = DataParser.getUsers();
const products = DataParser.getProducts();
const checkoutData = DataParser.getCheckoutData();

test.describe('🚀 End-to-End Complete Workflow Test - Spree Commerce', () => {
  // ─── HOOKS ──────────────────────────────────────────────────────────
  test.afterEach(async ({ homePage }, testInfo) => {
    if (testInfo.status === 'failed') {
      Logger.error(`Test FAILED: ${testInfo.title}`);
      await homePage.screenshotUtil.onFailure(testInfo.title);
    }
    Logger.info(`--- Test finished: ${testInfo.title} [${testInfo.status}] ---`);
  });

  // ─── TC-43 (E2E - COMPLETE FLOW) ──────────────────────────────────
  test('TC-43: Verify complete user journey — Login → Search → Cart → Checkout → Logout', async ({
    page,
    homePage,
    loginPage,
    searchPage,
    productDetailPage,
    cartPage,
    checkoutPage,
    accountPage,
    navigationPage,
  }) => {
    // Set a generous timeout for the E2E test
    test.setTimeout(180000);

    // ─── STEP 1: Open the website ─────────────────────────────────
    await test.step('Step 1: Open Spree Commerce website', async () => {
      await homePage.open();
      await page.waitForTimeout(2000);

      const isLoaded = await homePage.isLoaded();
      expect(isLoaded).toBeTruthy();
      Logger.info('E2E Step 1: Website opened successfully');
      await homePage.takeScreenshot('TC-43_step1_homepage');
    });

    // ─── STEP 2: Login with valid credentials ─────────────────────
    await test.step('Step 2: Login with valid credentials', async () => {
      await loginPage.open();
      await loginPage.login(users.valid.email, users.valid.password);
      await page.waitForTimeout(2000);

      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
      Logger.info('E2E Step 2: User logged in successfully');
      await loginPage.takeScreenshot('TC-43_step2_logged_in');
    });

    // ─── STEP 3: Search for a product ─────────────────────────────
    await test.step('Step 3: Search for a product', async () => {
      await searchPage.searchFor(products.validSearch);
      await page.waitForTimeout(1500);

      const suggestionCount = await searchPage.getSuggestionCount();
      expect(suggestionCount).toBeGreaterThan(0);
      Logger.info(`E2E Step 3: Found ${suggestionCount} search suggestions`);
      await searchPage.takeScreenshot('TC-43_step3_search_results');
    });

    // ─── STEP 4: Click on a search result to open product ─────────
    await test.step('Step 4: Open product from search results', async () => {
      await searchPage.clickSuggestion(0);
      await page.waitForTimeout(2000);

      const productName = await productDetailPage.getProductName();
      expect(productName).toBeTruthy();
      Logger.info(`E2E Step 4: Opened product — ${productName}`);
      await productDetailPage.takeScreenshot('TC-43_step4_product_detail');
    });

    // ─── STEP 5: Add first product to cart ────────────────────────
    await test.step('Step 5: Add first product to cart', async () => {
      await productDetailPage.addToCart();
      await page.waitForTimeout(2000);

      Logger.info('E2E Step 5: First product added to cart');
      await productDetailPage.takeScreenshot('TC-43_step5_first_product_added');
    });

    // ─── STEP 6: Go back and add a second product ─────────────────
    await test.step('Step 6: Navigate to products and add second product', async () => {
      // Close cart drawer if open
      try {
        await page.locator('button[aria-label="Close cart"]').click({ timeout: 2000 });
        await page.waitForTimeout(500);
      } catch {
        // Cart drawer may not be open
      }

      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(1);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await page.waitForTimeout(2000);

      Logger.info('E2E Step 6: Second product added to cart');
      await productDetailPage.takeScreenshot('TC-43_step6_second_product_added');
    });

    // ─── STEP 7: Verify cart has multiple items ───────────────────
    await test.step('Step 7: Verify cart contains multiple items', async () => {
      await cartPage.goToCartPage();
      await page.waitForTimeout(2000);

      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBeGreaterThanOrEqual(2);
      Logger.info(`E2E Step 7: Cart has ${itemCount} items`);
      await cartPage.takeScreenshot('TC-43_step7_cart_items');
    });

    // ─── STEP 8: Verify cart subtotal ─────────────────────────────
    await test.step('Step 8: Verify cart subtotal is displayed', async () => {
      const subtotal = await cartPage.getSubtotalText();
      expect(subtotal).toBeTruthy();
      expect(subtotal).toContain('$');
      Logger.info(`E2E Step 8: Cart subtotal: ${subtotal}`);
      await cartPage.takeScreenshot('TC-43_step8_subtotal');
    });

    // ─── STEP 9: Proceed to checkout ──────────────────────────────
    await test.step('Step 9: Proceed to checkout', async () => {
      await cartPage.proceedToCheckout();
      await page.waitForTimeout(3000);

      const currentURL = page.url();
      expect(currentURL).toContain('checkout');
      Logger.info('E2E Step 9: Arrived at checkout page');
      await checkoutPage.takeScreenshot('TC-43_step9_checkout_page');
    });

    // ─── STEP 10: Fill shipping details ───────────────────────────
    await test.step('Step 10: Enter shipping details', async () => {
      await checkoutPage.fillShippingInfo(checkoutData.validShipping);
      await page.waitForTimeout(1000);
      Logger.info('E2E Step 10: Shipping details entered');
      await checkoutPage.takeScreenshot('TC-43_step10_shipping_filled');
    });

    // ─── STEP 11: Save address and continue ───────────────────────
    await test.step('Step 11: Save address and continue checkout', async () => {
      await checkoutPage.clickSaveAddress();
      await page.waitForTimeout(3000);

      // Try clicking Continue if available
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Save"), button:has-text("Next")');
      if (await continueBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await continueBtn.first().click();
        await page.waitForTimeout(3000);
      }

      Logger.info('E2E Step 11: Address saved, continuing checkout');
      await checkoutPage.takeScreenshot('TC-43_step11_checkout_progress');
    });

    // ─── STEP 12: Verify checkout state ───────────────────────────
    await test.step('Step 12: Verify checkout progression', async () => {
      const currentURL = page.url();
      expect(currentURL).toContain('checkout');
      Logger.info('E2E Step 12: Checkout state verified');
      await checkoutPage.takeScreenshot('TC-43_step12_checkout_state');
    });

    // ─── STEP 13: Navigate back to account ────────────────────────
    await test.step('Step 13: Navigate to account page', async () => {
      await page.goto('/us/en/account');
      await page.waitForTimeout(2000);

      const isAccountLoaded = await accountPage.isAccountPageLoaded();
      expect(isAccountLoaded).toBeTruthy();
      Logger.info('E2E Step 13: Account page accessible');
      await accountPage.takeScreenshot('TC-43_step13_account_page');
    });

    // ─── STEP 14: Logout ──────────────────────────────────────────
    await test.step('Step 14: Logout successfully', async () => {
      await accountPage.signOut();
      await page.waitForTimeout(2000);

      const isLoginFormVisible = await loginPage.isLoginFormVisible();
      expect(isLoginFormVisible).toBeTruthy();
      Logger.info('E2E Step 14: User logged out successfully');
      await loginPage.takeScreenshot('TC-43_step14_logged_out');
    });

    // ─── STEP 15: Verify session ended ────────────────────────────
    await test.step('Step 15: Verify session has ended', async () => {
      await page.goto('/us/en/account');
      await page.waitForTimeout(2000);

      // Should show login form, not account dashboard
      const hasLoginForm = await loginPage.isLoginFormVisible();
      expect(hasLoginForm).toBeTruthy();
      Logger.info('E2E Step 15: Session ended — login form shown');
      await loginPage.takeScreenshot('TC-43_step15_session_ended');

      Logger.info('═══════════════════════════════════════════');
      Logger.info('  TC-43 E2E TEST PASSED — COMPLETE FLOW  ');
      Logger.info('  Login → Search → Cart → Checkout → Logout');
      Logger.info('═══════════════════════════════════════════');
    });
  });
});
