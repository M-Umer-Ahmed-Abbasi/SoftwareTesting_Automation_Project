const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Logger - Winston-based logging utility
 * Logs to both console and file
 */
const Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n${stack}`
        : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    // Console output
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    }),
    // File output - all logs
    new transports.File({
      filename: path.join(logsDir, 'test-run.log'),
      options: { flags: 'a' },
    }),
    // File output - errors only
    new transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
    }),
  ],
});

module.exports = Logger;
