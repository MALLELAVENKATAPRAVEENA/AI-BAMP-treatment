const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  appium: {
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: process.env.APPIUM_PATH || '/'
  },

  app: {
    package: process.env.APP_PACKAGE || 'com.bamp.ai',
    activity: process.env.APP_ACTIVITY || 'com.bamp.ai.MainActivity',
    apkPath: process.env.APK_PATH || path.resolve(ROOT_DIR, '../BAMP_APP/app/build/outputs/apk/debug/app-debug.apk'),
    useApk: process.env.USE_APK === 'true'
  },

  device: {
    platformName: 'Android',
    automationName: 'UiAutomator2',
    deviceName: process.env.DEVICE_NAME || 'Android_Emulator',
    udid: process.env.DEVICE_UDID || '',
    platformVersion: process.env.PLATFORM_VERSION || '13.0',
    noReset: process.env.NO_RESET === 'true',
    fullReset: process.env.FULL_RESET === 'true',
    autoGrantPermissions: true,
    newCommandTimeout: 120
  },

  timeouts: {
    implicitWaitMs: parseInt(process.env.IMPLICIT_WAIT_MS || '10000', 10),
    explicitWaitMs: parseInt(process.env.EXPLICIT_WAIT_MS || '15000', 10),
    pageLoadTimeoutMs: parseInt(process.env.PAGE_LOAD_TIMEOUT_MS || '30000', 10)
  },

  paths: {
    root: ROOT_DIR,
    reports: path.join(ROOT_DIR, 'reports'),
    failures: path.join(ROOT_DIR, 'reports', 'failures'),
    screenshots: path.join(ROOT_DIR, 'screenshots'),
    logs: path.join(ROOT_DIR, 'logs'),
    excel: path.join(ROOT_DIR, 'excel'),
    data: path.join(ROOT_DIR, 'data'),
    excelReportFile: path.join(ROOT_DIR, 'excel', 'Mobile_E2E_Report.xlsx')
  }
};
