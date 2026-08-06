const winston = require('winston');
const fs = require('fs');
const config = require('../config/config');

if (!fs.existsSync(config.paths.logs)) {
  fs.mkdirSync(config.paths.logs, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toLowerCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level}]: ${message}`)
      )
    }),
    new winston.transports.File({
      filename: `${config.paths.logs}/api_execution.log`,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

module.exports = logger;
