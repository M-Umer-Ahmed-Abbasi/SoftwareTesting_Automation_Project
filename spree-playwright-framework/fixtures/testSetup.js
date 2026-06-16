const { test: base } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const SearchPage = require('../pages/SearchPage');
const ProductDetailPage = require('../pages/ProductDetailPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const AccountPage = require('../pages/AccountPage');
const NavigationPage = require('../pages/NavigationPage');

/**
 * testSetup - Custom test fixtures using Playwright's base.extend
 * Automatically injects page objects into every test via fixtures
 * Following the Hooks Manual pattern for fixture-based dependency injection
 */
const test = base.extend({
  // Login Page fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Home Page fixture
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  // Search Page fixture
  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },

  // Product Detail Page fixture
  productDetailPage: async ({ page }, use) => {
    const productDetailPage = new ProductDetailPage(page);
    await use(productDetailPage);
  },

  // Cart Page fixture
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // Checkout Page fixture
  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  // Account Page fixture
  accountPage: async ({ page }, use) => {
    const accountPage = new AccountPage(page);
    await use(accountPage);
  },

  // Navigation Page fixture
  navigationPage: async ({ page }, use) => {
    const navigationPage = new NavigationPage(page);
    await use(navigationPage);
  },
});

module.exports = { test };
