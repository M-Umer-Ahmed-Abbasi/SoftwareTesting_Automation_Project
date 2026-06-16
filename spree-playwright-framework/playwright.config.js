// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests sequentially (important for E2E flows)
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 1,

  // Reporter to use — HTML + Allure + List
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
  ],

  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://demo.spreecommerce.org/us/en/',

    // Collect traces and screenshots on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Global timeout per test
  timeout: 120000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Global setup file
  globalSetup: require.resolve('./hooks/globalSetup.js'),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/',
});
