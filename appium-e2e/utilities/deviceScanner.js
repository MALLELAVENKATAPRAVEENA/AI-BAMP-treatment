const { execSync } = require('child_process');
const logger = require('./logger');

class DeviceScanner {
  static getConnectedDevices() {
    try {
      const stdout = execSync('adb devices', { encoding: 'utf8' });
      const lines = stdout.split('\n');
      const devices = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('*')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 2 && parts[1] === 'device') {
            devices.push({
              udid: parts[0],
              isEmulator: parts[0].includes('emulator')
            });
          }
        }
      }

      logger.info(`📱 ADB Device Discovery: Found ${devices.length} connected device(s)`);
      return devices;
    } catch (err) {
      logger.warn(`ADB command failed or ADB not installed: ${err.message}. Falling back to default emulator configuration.`);
      return [];
    }
  }

  static getPrimaryDeviceCapabilities() {
    const devices = this.getConnectedDevices();
    if (devices.length > 0) {
      const primary = devices[0];
      logger.info(`Targeting primary Android device [UDID: ${primary.udid}, IsEmulator: ${primary.isEmulator}]`);
      return {
        udid: primary.udid,
        deviceName: primary.isEmulator ? 'Android_Emulator' : 'Real_Android_Device'
      };
    }
    return {
      deviceName: 'Android_Emulator'
    };
  }
}

module.exports = DeviceScanner;
