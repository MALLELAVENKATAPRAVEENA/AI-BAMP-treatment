const logger = require('./logger');

class GestureUtils {
  static async tap(driver, xOrElement, y) {
    logger.info(`Executing Mobile Tap action`);
    try {
      if (typeof xOrElement === 'object' && xOrElement !== null) {
        if (typeof xOrElement.click === 'function') {
          await xOrElement.click();
          return;
        }
      }
      if (typeof driver.performActions === 'function') {
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: xOrElement, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      }
    } catch (err) {
      logger.warn(`Tap action fallback executed: ${err.message}`);
    }
  }

  static async doubleTap(driver, xOrElement, y) {
    logger.info(`Executing Mobile Double Tap action`);
    try {
      await this.tap(driver, xOrElement, y);
      await driver.pause(100);
      await this.tap(driver, xOrElement, y);
    } catch (err) {
      logger.warn(`Double Tap failed: ${err.message}`);
    }
  }

  static async longPress(driver, xOrElement, y, durationMs = 1500) {
    logger.info(`Executing Mobile Long Press action (${durationMs}ms)`);
    try {
      if (typeof driver.performActions === 'function') {
        const x = typeof xOrElement === 'number' ? xOrElement : 300;
        const targetY = typeof y === 'number' ? y : 500;
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y: targetY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: durationMs },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      }
    } catch (err) {
      logger.warn(`Long Press failed: ${err.message}`);
    }
  }

  static async swipe(driver, direction = 'down', distancePercentage = 0.5) {
    logger.info(`Executing Mobile Swipe -> Direction: ${direction.toUpperCase()}`);
    try {
      if (typeof driver.performActions === 'function') {
        let startX = 500, startY = 800, endX = 500, endY = 300;

        switch (direction.toLowerCase()) {
          case 'up':
            startY = 1200; endY = 400; break;
          case 'down':
            startY = 400; endY = 1200; break;
          case 'left':
            startX = 800; endX = 200; startY = 600; endY = 600; break;
          case 'right':
            startX = 200; endX = 800; startY = 600; endY = 600; break;
        }

        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 600, x: endX, y: endY },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      }
    } catch (err) {
      logger.warn(`Swipe failed: ${err.message}`);
    }
  }

  static async scrollUntilVisible(driver, selector, maxSwipes = 5) {
    logger.info(`Scrolling until element visible: ${selector}`);
    for (let i = 0; i < maxSwipes; i++) {
      try {
        const element = typeof selector === 'string' ? await driver.$(selector) : await driver.findElement(selector.using, selector.value);
        if (element && (typeof element.isDisplayed === 'function' ? await element.isDisplayed() : true)) {
          return element;
        }
      } catch (_) {}
      await this.swipe(driver, 'down');
      await driver.pause(500);
    }
    return null;
  }

  static async dragAndDrop(driver, startX, startY, endX, endY) {
    logger.info(`Executing Mobile Drag and Drop from (${startX},${startY}) to (${endX},${endY})`);
    try {
      if (typeof driver.performActions === 'function') {
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 800, x: endX, y: endY },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
      }
    } catch (err) {
      logger.warn(`Drag and Drop failed: ${err.message}`);
    }
  }

  static async pinch(driver, centerX = 500, centerY = 500) {
    logger.info(`Executing Mobile Pinch Gesture`);
    try {
      if (typeof driver.performActions === 'function') {
        await driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: centerX - 200, y: centerY },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 600, x: centerX - 50, y: centerY },
              { type: 'pointerUp', button: 0 }
            ]
          },
          {
            type: 'pointer',
            id: 'finger2',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: centerX + 200, y: centerY },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 600, x: centerX + 50, y: centerY },
              { type: 'pointerUp', button: 0 }
            ]
          }
        ]);
      }
    } catch (err) {
      logger.warn(`Pinch gesture failed: ${err.message}`);
    }
  }

  static async zoom(driver, centerX = 500, centerY = 500) {
    logger.info(`Executing Mobile Zoom Gesture`);
    try {
      if (typeof driver.performActions === 'function') {
        await driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: centerX - 50, y: centerY },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 600, x: centerX - 250, y: centerY },
              { type: 'pointerUp', button: 0 }
            ]
          },
          {
            type: 'pointer',
            id: 'finger2',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: centerX + 50, y: centerY },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 600, x: centerX + 250, y: centerY },
              { type: 'pointerUp', button: 0 }
            ]
          }
        ]);
      }
    } catch (err) {
      logger.warn(`Zoom gesture failed: ${err.message}`);
    }
  }
}

module.exports = GestureUtils;
