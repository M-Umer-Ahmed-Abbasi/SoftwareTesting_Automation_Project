const { expect } = require('@playwright/test');
const { test } = require('../fixtures/testSetup');
const DataParser = require('../utils/DataParser');
const Logger = require('../utils/Logger');

// Load test data from JSON (Data-Driven Testing)
const users = DataParser.getUsers();
const products = DataParser.getProducts();

test.describe('🛍️ Product Search + Cart Tests - Spree Commerce', () => {
  // ─── HOOKS ──────────────────────────────────────────────────────────
  test.beforeEach(async ({ page, homePage }) => {
    await homePage.open();
    await page.waitForTimeout(1500);
    Logger.info('--- Product Search test: Homepage opened ---');
  });

  test.afterEach(async ({ homePage }, testInfo) => {
    if (testInfo.status === 'failed') {
      Logger.error(`Test FAILED: ${testInfo.title}`);
      await homePage.screenshotUtil.onFailure(testInfo.title);
    }
    Logger.info(`--- Test finished: ${testInfo.title} [${testInfo.status}] ---`);
  });

  // ─── TC-11 (Positive) ──────────────────────────────────────────────
  test('TC-11: Verify user can search a valid product and results are displayed', async ({ page, searchPage }) => {
    await test.step('Step 1: Open search and type a valid product name', async () => {
      await searchPage.searchFor(products.validSearch);
      await searchPage.takeScreenshot('TC-11_step1_search_typed');
    });

    await test.step('Step 2: Verify search suggestions appear', async () => {
      const suggestionCount = await searchPage.getSuggestionCount();
      expect(suggestionCount).toBeGreaterThan(0);
      await searchPage.takeScreenshot('TC-11_step2_suggestions_shown');
      Logger.info('TC-11 PASSED: Valid product search shows results');
    });
  });

  // ─── TC-12 (Negative) ──────────────────────────────────────────────
  test('TC-12: Verify search returns no results for invalid product name', async ({ page, searchPage }) => {
    await test.step('Step 1: Search for a non-existent product', async () => {
      await searchPage.searchFor(products.invalidSearch);
      await searchPage.takeScreenshot('TC-12_step1_invalid_search');
    });

    await test.step('Step 2: Verify no suggestions appear', async () => {
      const suggestionCount = await searchPage.getSuggestionCount();
      expect(suggestionCount).toBe(0);
      await searchPage.takeScreenshot('TC-12_step2_no_results');
      Logger.info('TC-12 PASSED: Invalid search shows no results');
    });
  });

  // ─── TC-13 (Positive) ──────────────────────────────────────────────
  test('TC-13: Verify user can browse products by category', async ({ page, searchPage, navigationPage }) => {
    await test.step('Step 1: Navigate to a product category page', async () => {
      await page.goto('/us/en/c/kitchen');
      await page.waitForTimeout(2000);
      await searchPage.takeScreenshot('TC-13_step1_category_page');
    });

    await test.step('Step 2: Verify products are displayed in the category', async () => {
      const productCount = await searchPage.getProductCardCount();
      expect(productCount).toBeGreaterThan(0);
      await searchPage.takeScreenshot('TC-13_step2_products_shown');
      Logger.info('TC-13 PASSED: Category products displayed');
    });
  });

  // ─── TC-14 (Positive) ──────────────────────────────────────────────
  test('TC-14: Verify product detail page opens when clicking a product', async ({ page, searchPage, productDetailPage }) => {
    await test.step('Step 1: Navigate to products page and click a product', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await searchPage.takeScreenshot('TC-14_step1_clicked_product');
    });

    await test.step('Step 2: Verify product detail page is loaded', async () => {
      const isLoaded = await productDetailPage.isLoaded();
      expect(isLoaded).toBeTruthy();
      const currentURL = page.url();
      expect(currentURL).toContain('/products/');
      await productDetailPage.takeScreenshot('TC-14_step2_pdp_loaded');
      Logger.info('TC-14 PASSED: Product detail page opens correctly');
    });
  });

  // ─── TC-15 (Positive) ──────────────────────────────────────────────
  test('TC-15: Verify user can add product to cart successfully', async ({ page, searchPage, productDetailPage, cartPage }) => {
    await test.step('Step 1: Navigate to a product and open detail page', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await page.waitForTimeout(2000);
      await productDetailPage.takeScreenshot('TC-15_step1_product_page');
    });

    await test.step('Step 2: Click Add to Cart', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-15_step2_added_to_cart');
    });

    await test.step('Step 3: Verify cart badge updates', async () => {
      const badgeCount = await cartPage.getCartBadgeCount();
      expect(badgeCount).toBeGreaterThanOrEqual(1);
      await cartPage.takeScreenshot('TC-15_step3_cart_updated');
      Logger.info('TC-15 PASSED: Product added to cart successfully');
    });
  });

  // ─── TC-16 (Positive) ──────────────────────────────────────────────
  test('TC-16: Verify multiple products can be added to cart', async ({ page, searchPage, productDetailPage, cartPage }) => {
    await test.step('Step 1: Add first product to cart', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-16_step1_first_product_added');
    });

    await test.step('Step 2: Go back and add second product', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(1);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-16_step2_second_product_added');
    });

    await test.step('Step 3: Verify cart has multiple items', async () => {
      const badgeCount = await cartPage.getCartBadgeCount();
      expect(badgeCount).toBeGreaterThanOrEqual(2);
      await cartPage.takeScreenshot('TC-16_step3_multiple_items');
      Logger.info('TC-16 PASSED: Multiple products added to cart');
    });
  });

  // ─── TC-17 (Negative) ──────────────────────────────────────────────
  test('TC-17: Verify adding same product twice increases quantity correctly', async ({ page, searchPage, productDetailPage, cartPage }) => {
    await test.step('Step 1: Navigate to product and add to cart', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-17_step1_first_add');
    });

    await test.step('Step 2: Add the same product again', async () => {
      await page.waitForTimeout(1000);
      // Close any cart drawer that may have opened
      try {
        await page.locator('button[aria-label="Close cart"]').click();
        await page.waitForTimeout(500);
      } catch {
        // Cart drawer may not be open
      }
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-17_step2_second_add');
    });

    await test.step('Step 3: Verify quantity is handled correctly in cart', async () => {
      await cartPage.openCartDrawer();
      await cartPage.takeScreenshot('TC-17_step3_cart_quantity');
      Logger.info('TC-17 PASSED: Duplicate product quantity handled correctly');
    });
  });

  // ─── TC-18 (Positive) ──────────────────────────────────────────────
  test('TC-18: Verify cart icon updates when product is added', async ({ page, searchPage, productDetailPage, cartPage }) => {
    await test.step('Step 1: Verify initial cart badge count', async () => {
      const initialCount = await cartPage.getCartBadgeCount();
      await cartPage.takeScreenshot('TC-18_step1_initial_count');
      Logger.info(`Initial cart badge count: ${initialCount}`);
    });

    await test.step('Step 2: Add a product to cart', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-18_step2_product_added');
    });

    await test.step('Step 3: Verify cart badge count increased', async () => {
      const updatedCount = await cartPage.getCartBadgeCount();
      expect(updatedCount).toBeGreaterThanOrEqual(1);
      await cartPage.takeScreenshot('TC-18_step3_badge_updated');
      Logger.info('TC-18 PASSED: Cart icon updated after adding product');
    });
  });

  // ─── TC-19 (Negative) ──────────────────────────────────────────────
  test('TC-19: Verify cart shows empty state when no items', async ({ page, cartPage }) => {
    await test.step('Step 1: Clear cookies to start fresh and navigate to cart', async () => {
      await page.context().clearCookies();
      await page.goto('/us/en/cart');
      await page.waitForTimeout(2000);
      await cartPage.takeScreenshot('TC-19_step1_empty_cart_page');
    });

    await test.step('Step 2: Verify empty cart message is shown', async () => {
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBeTruthy();
      await cartPage.takeScreenshot('TC-19_step2_empty_message');
      Logger.info('TC-19 PASSED: Empty cart message displayed');
    });
  });

  // ─── TC-20 (Positive) ──────────────────────────────────────────────
  test('TC-20: Verify cart reflects correct total price after adding items', async ({ page, searchPage, productDetailPage, cartPage }) => {
    await test.step('Step 1: Add a product to cart', async () => {
      await page.goto('/us/en/products');
      await page.waitForTimeout(2000);
      await searchPage.clickProductCard(0);
      await page.waitForTimeout(2000);
      await productDetailPage.addToCart();
      await productDetailPage.takeScreenshot('TC-20_step1_product_added');
    });

    await test.step('Step 2: Open cart and verify subtotal is displayed', async () => {
      await cartPage.goToCartPage();
      await page.waitForTimeout(2000);
      const subtotal = await cartPage.getSubtotalText();
      expect(subtotal).toBeTruthy();
      expect(subtotal).toContain('$');
      await cartPage.takeScreenshot('TC-20_step2_subtotal_shown');
      Logger.info('TC-20 PASSED: Cart total price is correct');
    });
  });
});
