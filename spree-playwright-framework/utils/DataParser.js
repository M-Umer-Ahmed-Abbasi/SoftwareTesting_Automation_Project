const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

/**
 * DataParser - Reads and parses JSON test data files
 * Supports JSON format for data-driven testing
 */
class DataParser {
  /**
   * Read and parse a JSON data file
   * @param {string} filename - Filename inside /data directory (e.g., 'users.json')
   * @returns {Object} - Parsed JSON object
   */
  static readJSON(filename) {
    const filepath = path.join(process.cwd(), 'data', filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Data file not found: ${filepath}`);
    }
    const raw = fs.readFileSync(filepath, 'utf-8');
    const parsed = JSON.parse(raw);
    Logger.info(`Data loaded from: ${filename}`);
    return parsed;
  }

  /**
   * Get users data
   * @returns {Object} - Users test data
   */
  static getUsers() {
    return this.readJSON('users.json');
  }

  /**
   * Get products data
   * @returns {Object} - Products test data
   */
  static getProducts() {
    return this.readJSON('products.json');
  }

  /**
   * Get checkout data
   * @returns {Object} - Checkout test data
   */
  static getCheckoutData() {
    return this.readJSON('checkout.json');
  }

  /**
   * Get a specific user by type
   * @param {string} userType - e.g., 'valid', 'invalid', 'emptyCredentials'
   * @returns {Object} - { email, password }
   */
  static getUser(userType) {
    const users = this.getUsers();
    if (!users[userType]) {
      throw new Error(`User type '${userType}' not found in users.json`);
    }
    return users[userType];
  }
}

module.exports = DataParser;
