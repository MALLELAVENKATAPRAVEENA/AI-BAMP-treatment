require('dotenv').config();
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  baseUrl: process.env.BASE_URL || 'https://bamp-1de96.web.app',
  browser: (process.env.CROSS_BROWSER || 'chrome').toLowerCase(),
  headless: process.env.HEADLESS === 'true' || false,
  implicitWaitMs: 10000,
  explicitWaitMs: 15000,
  pageLoadTimeoutMs: 30000,
  retryAttempts: 2,
  viewport: { width: 1280, height: 800 },

  paths: {
    rootDir: ROOT_DIR,
    reports: path.join(ROOT_DIR, 'reports'),
    failures: path.join(ROOT_DIR, 'reports', 'failures'),
    screenshots: path.join(ROOT_DIR, 'screenshots'),
    logs: path.join(ROOT_DIR, 'logs'),
    excel: path.join(ROOT_DIR, 'excel'),
    excelReportFile: path.join(ROOT_DIR, 'excel', 'E2E_Report.xlsx'),
    data: path.join(ROOT_DIR, 'data'),
    reactSrcDir: path.resolve(ROOT_DIR, '..', 'web', 'frontend', 'src')
  }
};
