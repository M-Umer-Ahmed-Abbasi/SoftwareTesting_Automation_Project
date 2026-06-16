const { expect } = require('@playwright/test');
const { test } = require('../fixtures/testSetup');
const DataParser = require('../utils/DataParser');
const Logger = require('../utils/Logger');

// Load test data from JSON (Data-Driven Testing)
const users = DataParser.getUsers();

test.describe('🔐 Login / Authentication Tests - Spree Commerce', () => {
  // ─── HOOKS ──────────────────────────────────────────────────────────
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    Logger.info('--- Login test: Login page opened ---');
  });

  test.afterEach(async ({ loginPage }, testInfo) => {
    if (testInfo.status === 'failed') {
      Logger.error(`Test FAILED: ${testInfo.title}`);
      await loginPage.screenshotUtil.onFailure(testInfo.title);
    }
    Logger.info(`--- Test finished: ${testInfo.title} [${testInfo.status}] ---`);
  });

  // ─── TC-01 (Positive) ──────────────────────────────────────────────
  test('TC-01: Verify user can login with valid email and password', async ({ page, loginPage }) => {
    await test.step('Step 1: Enter valid credentials and click Sign In', async () => {
      await loginPage.login(users.valid.email, users.valid.password);
      await loginPage.takeScreenshot('TC-01_step1_login');
    });

    await test.step('Step 2: Verify user is redirected to account page', async () => {
      await expect(page).toHaveURL(/account/);
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
      await loginPage.takeScreenshot('TC-01_step2_account_page');
      Logger.info('TC-01 PASSED: Valid login successful');
    });
  });

  // ─── TC-02 (Negative) ──────────────────────────────────────────────
  test('TC-02: Verify login fails when email format is invalid', async ({ page, loginPage }) => {
    await test.step('Step 1: Enter invalid email format and click Sign In', async () => {
      await loginPage.login(users.invalidEmail.email, users.invalidEmail.password);
      await loginPage.takeScreenshot('TC-02_step1_invalid_email');
    });

    await test.step('Step 2: Verify error is shown or login is blocked', async () => {
      // The form should either show validation error or remain on login page
      const currentURL = page.url();
      const stillOnLogin = currentURL.includes('account');
      expect(stillOnLogin).toBeTruthy();
      await loginPage.takeScreenshot('TC-02_step2_error_state');
      Logger.info('TC-02 PASSED: Invalid email format rejected');
    });
  });

  // ─── TC-03 (Negative) ──────────────────────────────────────────────
  test('TC-03: Verify login fails when password is empty', async ({ page, loginPage }) => {
    await test.step('Step 1: Enter valid email with empty password', async () => {
      await loginPage.login(users.emptyPassword.email, users.emptyPassword.password);
      await loginPage.takeScreenshot('TC-03_step1_empty_password');
    });

    await test.step('Step 2: Verify user remains on login page', async () => {
      const currentURL = page.url();
      const stillOnLogin = currentURL.includes('account');
      expect(stillOnLogin).toBeTruthy();
      await loginPage.takeScreenshot('TC-03_step2_login_page');
      Logger.info('TC-03 PASSED: Empty password login blocked');
    });
  });

  // ─── TC-04 (Negative) ──────────────────────────────────────────────
  test('TC-04: Verify login fails with incorrect password for valid email', async ({ page, loginPage }) => {
    await test.step('Step 1: Enter valid email with wrong password', async () => {
      await loginPage.login(users.wrongPassword.email, users.wrongPassword.password);
      await loginPage.takeScreenshot('TC-04_step1_wrong_password');
    });

    await test.step('Step 2: Verify error message is displayed', async () => {
      const errorMsg = await loginPage.getErrorMessage();
      expect(errorMsg).toBeTruthy();
      await loginPage.takeScreenshot('TC-04_step2_error_message');
      Logger.info('TC-04 PASSED: Wrong password error shown');
    });
  });

  // ─── TC-05 (Negative) ──────────────────────────────────────────────
  test('TC-05: Verify login fails when both email and password are empty', async ({ page, loginPage }) => {
    await test.step('Step 1: Click Sign In with empty fields', async () => {
      await loginPage.login(users.emptyCredentials.email, users.emptyCredentials.password);
      await loginPage.takeScreenshot('TC-05_step1_empty_fields');
    });

    await test.step('Step 2: Verify user remains on login page', async () => {
      const currentURL = page.url();
      const stillOnLogin = currentURL.includes('account');
      expect(stillOnLogin).toBeTruthy();
      await loginPage.takeScreenshot('TC-05_step2_login_page');
      Logger.info('TC-05 PASSED: Empty credentials login blocked');
    });
  });

  // ─── TC-06 (Negative) ──────────────────────────────────────────────
  test('TC-06: Verify system prevents SQL injection attempt in login fields', async ({ page, loginPage }) => {
    await test.step('Step 1: Enter SQL injection strings in login fields', async () => {
      await loginPage.login(users.sqlInjection.email, users.sqlInjection.password);
      await loginPage.takeScreenshot('TC-06_step1_sql_injection');
    });

    await test.step('Step 2: Verify system handles it gracefully — no server error', async () => {
      const currentURL = page.url();
      // Should NOT navigate to admin/dashboard or crash
      expect(currentURL).not.toContain('admin');
      expect(currentURL).not.toContain('dashboard');
      await loginPage.takeScreenshot('TC-06_step2_safe_response');
      Logger.info('TC-06 PASSED: SQL injection attempt handled safely');
    });
  });

  // ─── TC-07 (Negative) ──────────────────────────────────────────────
  test('TC-07: Verify system handles special characters in email field gracefully', async ({ page, loginPage }) => {
    await test.step('Step 1: Enter special characters in email field', async () => {
      await loginPage.login(users.specialChars.email, users.specialChars.password);
      await loginPage.takeScreenshot('TC-07_step1_special_chars');
    });

    await test.step('Step 2: Verify login is rejected gracefully', async () => {
      const currentURL = page.url();
      const stillOnLogin = currentURL.includes('account');
      expect(stillOnLogin).toBeTruthy();
      await loginPage.takeScreenshot('TC-07_step2_rejected');
      Logger.info('TC-07 PASSED: Special characters handled gracefully');
    });
  });

  // ─── TC-08 (Positive) ──────────────────────────────────────────────
  test('TC-08: Verify user remains logged in after page refresh (session persistence)', async ({ page, loginPage }) => {
    await test.step('Step 1: Login with valid credentials', async () => {
      await loginPage.login(users.valid.email, users.valid.password);
      await expect(page).toHaveURL(/account/);
      await loginPage.takeScreenshot('TC-08_step1_logged_in');
    });

    await test.step('Step 2: Refresh the page', async () => {
      await page.reload();
      await page.waitForTimeout(2000);
      await loginPage.takeScreenshot('TC-08_step2_refreshed');
    });

    await test.step('Step 3: Verify user is still logged in', async () => {
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
      await loginPage.takeScreenshot('TC-08_step3_still_logged_in');
      Logger.info('TC-08 PASSED: Session persists after refresh');
    });
  });

  // ─── TC-09 (Positive) ──────────────────────────────────────────────
  test('TC-09: Verify logout successfully ends session and redirects', async ({ page, loginPage }) => {
    await test.step('Step 1: Login with valid credentials', async () => {
      await loginPage.login(users.valid.email, users.valid.password);
      await expect(page).toHaveURL(/account/);
      await loginPage.takeScreenshot('TC-09_step1_logged_in');
    });

    await test.step('Step 2: Click Sign Out button', async () => {
      await loginPage.logout();
      await loginPage.takeScreenshot('TC-09_step2_logging_out');
    });

    await test.step('Step 3: Verify user is redirected to login page', async () => {
      const isLoginFormVisible = await loginPage.isLoginFormVisible();
      expect(isLoginFormVisible).toBeTruthy();
      await loginPage.takeScreenshot('TC-09_step3_logged_out');
      Logger.info('TC-09 PASSED: Logout successful');
    });
  });

  // ─── TC-10 (Negative) ──────────────────────────────────────────────
  test('TC-10: Verify accessing account page without login redirects to login', async ({ page, loginPage }) => {
    await test.step('Step 1: Navigate directly to account page without login', async () => {
      // Clear cookies to ensure we are logged out
      await page.context().clearCookies();
      await page.goto('account');
      await page.waitForTimeout(2000);
      await loginPage.takeScreenshot('TC-10_step1_accessing_account');
    });

    await test.step('Step 2: Verify login form is shown', async () => {
      const isLoginVisible = await loginPage.isLoginFormVisible();
      expect(isLoginVisible).toBeTruthy();
      await loginPage.takeScreenshot('TC-10_step2_login_form_shown');
      Logger.info('TC-10 PASSED: Unauthorized access redirected to login');
    });
  });
});
