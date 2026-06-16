const Logger = require('../utils/Logger');

/**
 * globalSetup - Runs once before all tests
 * Used for one-time environment initialization
 */
async function globalSetup(config) {
  Logger.info('========================================');
  Logger.info('   PLAYWRIGHT TEST SUITE STARTING');
  Logger.info(`   Base URL: ${config.projects[0].use.baseURL || 'https://demo.spreecommerce.org/us/en'}`);
  Logger.info(`   Date: ${new Date().toLocaleString()}`);
  Logger.info('========================================');
}

module.exports = globalSetup;
