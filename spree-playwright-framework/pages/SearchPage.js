const BasePage = require('./BasePage');
const Logger = require('../utils/Logger');

/**
 * SearchPage - Page Object for search overlay and search results page
 */
class SearchPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators - Search Overlay
    this.openSearchButton = 'button[aria-label="Open search"]';
    this.searchInput = 'input[placeholder="Search..."]';
    this.closeSearchButton = 'button[aria-label="Close search"]';
    this.searchSuggestions = 'li[id^="search-option-"]';
    this.viewAllResultsButton = 'button:has-text("View all results for")';

    // Locators - Search Results / Products Listing Page
    this.productCards = 'a[href^="/us/en/products/"]';
    this.productCardTitles = 'h3';
    this.productCount = 'text=/\\d+ product/';
    this.clearAllFiltersButton = 'button:has-text("Clear all")';
  }

  /**
   * Open the search overlay
   */
  async openSearch() {
    Logger.info('Opening search overlay');
    await this.click(this.openSearchButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Search for a product by typing in the search overlay
   * @param {string} searchTerm
   */
  async searchFor(searchTerm) {
    Logger.info(`Searching for: ${searchTerm}`);
    await this.openSearch();
    await this.page.locator(this.searchInput).fill(searchTerm);
    await this.page.waitForTimeout(1500);
  }

  /**
   * Search and press Enter to go to results page
   * @param {string} searchTerm
   */
  async searchAndSubmit(searchTerm) {
    Logger.info(`Searching and submitting: ${searchTerm}`);
    await this.openSearch();
    await this.page.locator(this.searchInput).fill(searchTerm);
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.searchInput).press('Enter');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get search suggestion count
   * @returns {number}
   */
  async getSuggestionCount() {
    const count = await this.page.locator(this.searchSuggestions).count();
    Logger.info(`Search suggestion count: ${count}`);
    return count;
  }

  /**
   * Click on a search suggestion by index
   * @param {number} index
   */
  async clickSuggestion(index = 0) {
    Logger.info(`Clicking search suggestion at index: ${index}`);
    await this.page.locator(this.searchSuggestions).nth(index).click();
  }

  /**
   * Click the "View all results" button in search overlay
   */
  async clickViewAllResults() {
    Logger.info('Clicking View all results button');
    await this.page.locator(this.viewAllResultsButton).click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get product card count on results page
   * @returns {number}
   */
  async getProductCardCount() {
    await this.page.waitForTimeout(1000);
    const mainContent = this.page.locator('main');
    const cards = mainContent.locator('a[href^="/us/en/products/"] h3');
    const count = await cards.count();
    Logger.info(`Product card count: ${count}`);
    return count;
  }

  /**
   * Get product titles from listing page
   * @returns {string[]}
   */
  async getProductTitles() {
    const mainContent = this.page.locator('main');
    const titles = await mainContent.locator('a[href^="/us/en/products/"] h3').allTextContents();
    Logger.info(`Product titles: ${titles.join(', ')}`);
    return titles;
  }

  /**
   * Click on a product card by index
   * @param {number} index
   */
  async clickProductCard(index = 0) {
    Logger.info(`Clicking product card at index: ${index}`);
    const mainContent = this.page.locator('main');
    await mainContent.locator('a[href^="/us/en/products/"]').nth(index).click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Check if no results message is shown
   * @returns {boolean}
   */
  async isNoResultsShown() {
    await this.page.waitForTimeout(1500);
    // Check for "no results" or "0 products" type messages
    const noResultsText = this.page.getByText('No results found');
    const zeroProducts = this.page.getByText('0 product');
    return (await noResultsText.isVisible()) || (await zeroProducts.isVisible());
  }

  /**
   * Close the search overlay
   */
  async closeSearch() {
    Logger.info('Closing search overlay');
    await this.page.locator(this.closeSearchButton).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to category page
   * @param {string} categoryPath - e.g., '/us/en/c/kitchen'
   */
  async goToCategory(categoryPath) {
    Logger.info(`Navigating to category: ${categoryPath}`);
    await this.navigate(categoryPath);
  }
}

module.exports = SearchPage;
