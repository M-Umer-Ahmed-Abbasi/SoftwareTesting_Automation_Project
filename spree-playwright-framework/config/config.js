require('dotenv').config();

/**
 * ConfigReader - Centralized configuration management
 * Reads from .env and provides typed getters
 */
class ConfigReader {
  static get baseURL() {
    return process.env.BASE_URL || 'https://demo.spreecommerce.org/us/en';
  }

  static get email() {
    return process.env.EMAIL || 'm.umer.ahmed.abbasi@gmail.com';
  }

  static get password() {
    return process.env.PASSWORD || 'Secret#123';
  }

  static get browser() {
    return process.env.BROWSER || 'chromium';
  }

  static get headless() {
    return process.env.HEADLESS !== 'false';
  }

  static get defaultTimeout() {
    return parseInt(process.env.DEFAULT_TIMEOUT || '30000');
  }
}

module.exports = ConfigReader;
