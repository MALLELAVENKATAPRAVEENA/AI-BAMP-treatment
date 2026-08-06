const { execSync } = require('child_process');
const logger = require('./logger');

class LogcatUtils {
  static async captureDeviceLogs(driver) {
    try {
      if (typeof driver.getLogs === 'function') {
        const logs = await driver.getLogs('logcat');
        if (Array.isArray(logs) && logs.length > 0) {
          return logs.slice(-100).map(l => `[${l.level}] ${l.message}`).join('\n');
        }
      }
    } catch (_) {}

    try {
      const stdout = execSync('adb logcat -d -t 100', { encoding: 'utf8', timeout: 3000 });
      return stdout || 'No logcat entries retrieved via ADB';
    } catch (_) {
      return 'Logcat extraction unavailable';
    }
  }

  static async getAppLaunchDuration(driver) {
    const startTime = Date.now();
    try {
      if (typeof driver.getCurrentActivity === 'function') {
        await driver.getCurrentActivity();
      }
    } catch (_) {}
    return ((Date.now() - startTime) / 1000).toFixed(2);
  }
}

module.exports = LogcatUtils;
