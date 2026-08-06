const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class ExcelReporter {
  static testResults = [];
  static failedTests = [];
  static executionLogs = [];
  static startTime = new Date();
  static cacheFilePath = path.join(config.paths.data, 'testResultsCache.json');

  static initCache() {
    try {
      if (!fs.existsSync(config.paths.data)) {
        fs.mkdirSync(config.paths.data, { recursive: true });
      }
    } catch (_) {}
  }

  static clearCache() {
    try {
      this.initCache();
      this.testResults = [];
      this.failedTests = [];
      this.executionLogs = [];
      fs.writeFileSync(this.cacheFilePath, JSON.stringify([], null, 2));
    } catch (_) {}
  }

  static logStep(testName, stepDescription, result = 'PASS', remarks = '') {
    this.executionLogs.push({
      timestamp: new Date().toISOString(),
      testName,
      stepDescription,
      result,
      remarks
    });
  }

  static recordTestResult(testData) {
    this.initCache();
    this.testResults.push(testData);

    if (testData.status === 'FAILED') {
      this.failedTests.push({
        testName: testData.scenarioName,
        failureReason: testData.failureReason || 'Assertion failure',
        screenshotPath: testData.screenshotPath || 'N/A',
        browser: testData.browser || config.browser,
        url: testData.url || config.baseUrl
      });
    }

    // Persist to disk cache
    try {
      let cached = [];
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        if (raw) cached = JSON.parse(raw);
      }
      cached.push(testData);
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(cached, null, 2));
    } catch (_) {}
  }

  static loadResultsFromCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached && cached.length > 0) {
            this.testResults = cached;
            this.failedTests = cached.filter(t => t.status === 'FAILED').map(t => ({
              testName: t.scenarioName,
              failureReason: t.failureReason || 'Assertion failure',
              screenshotPath: t.screenshotPath || 'N/A',
              browser: t.browser || config.browser,
              url: t.url || config.baseUrl
            }));
          }
        }
      }
    } catch (_) {}
  }

  static async generateFinalReport() {
    try {
      if (!fs.existsSync(config.paths.excel)) {
        fs.mkdirSync(config.paths.excel, { recursive: true });
      }

      // Load cached results if in-memory testResults is empty
      if (this.testResults.length === 0) {
        this.loadResultsFromCache();
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Selenium E2E Automation Architect';
      workbook.lastModifiedBy = 'CI/CD Automation Pipeline';
      workbook.created = this.startTime;

      const totalTests = this.testResults.length;
      const passed = this.testResults.filter(t => t.status === 'PASSED').length;
      const failed = this.testResults.filter(t => t.status === 'FAILED').length;
      const skipped = this.testResults.filter(t => t.status === 'SKIPPED').length;
      const passPercentage = totalTests > 0 ? `${((passed / totalTests) * 100).toFixed(2)}%` : '0%';
      const endTime = new Date();
      const durationSeconds = ((endTime - this.startTime) / 1000).toFixed(2);

      // Sheet 1: Summary
      const summarySheet = workbook.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF0F52BA' } } });
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 40 }
      ];
      summarySheet.addRows([
        { metric: 'Execution Date', value: this.startTime.toISOString() },
        { metric: 'Environment', value: config.baseUrl },
        { metric: 'Browser Target', value: `${config.browser.toUpperCase()} (Headless: ${config.headless})` },
        { metric: 'Total Tests Executed', value: totalTests },
        { metric: 'Passed Tests', value: passed },
        { metric: 'Failed Tests', value: failed },
        { metric: 'Skipped Tests', value: skipped },
        { metric: 'Pass Percentage', value: passPercentage },
        { metric: 'Total Execution Duration (s)', value: `${durationSeconds} s` }
      ]);
      summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F52BA' } };

      // Sheet 2: Test Cases
      const testCasesSheet = workbook.addWorksheet('Test Cases');
      testCasesSheet.columns = [
        { header: 'Test ID', key: 'testId', width: 18 },
        { header: 'Module', key: 'module', width: 30 },
        { header: 'Scenario Name', key: 'scenarioName', width: 55 },
        { header: 'Browser', key: 'browser', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Start Time', key: 'startTime', width: 25 },
        { header: 'End Time', key: 'endTime', width: 25 },
        { header: 'Duration (s)', key: 'duration', width: 15 }
      ];
      testCasesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      testCasesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };

      this.testResults.forEach(row => {
        const addedRow = testCasesSheet.addRow(row);
        if (row.status === 'PASSED') {
          addedRow.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
        } else if (row.status === 'FAILED') {
          addedRow.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        }
      });

      // Sheet 3: Failed Tests
      const failedSheet = workbook.addWorksheet('Failed Tests');
      failedSheet.columns = [
        { header: 'Test Name', key: 'testName', width: 40 },
        { header: 'Failure Reason', key: 'failureReason', width: 50 },
        { header: 'Screenshot Path', key: 'screenshotPath', width: 50 },
        { header: 'Browser', key: 'browser', width: 15 },
        { header: 'URL', key: 'url', width: 35 }
      ];
      failedSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      failedSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDEF4444' } };
      this.failedTests.forEach(row => failedSheet.addRow(row));

      // Sheet 4: Execution Logs
      const logsSheet = workbook.addWorksheet('Execution Logs');
      logsSheet.columns = [
        { header: 'Timestamp', key: 'timestamp', width: 25 },
        { header: 'Test Name', key: 'testName', width: 35 },
        { header: 'Step Description', key: 'stepDescription', width: 50 },
        { header: 'Result', key: 'result', width: 15 },
        { header: 'Remarks', key: 'remarks', width: 30 }
      ];
      logsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      logsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } };
      this.executionLogs.forEach(row => logsSheet.addRow(row));

      let targetFilePath = config.paths.excelReportFile;
      try {
        await workbook.xlsx.writeFile(targetFilePath);
      } catch (fileErr) {
        if (fileErr.code === 'EBUSY') {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          targetFilePath = path.join(config.paths.excel, `E2E_Report_Latest_${timestamp}.xlsx`);
          logger.warn(`Primary E2E_Report.xlsx locked by active file viewer. Writing report to fallback file: ${targetFilePath}`);
          await workbook.xlsx.writeFile(targetFilePath);
        } else {
          throw fileErr;
        }
      }

      logger.info(`✅ Excel Report generated successfully with ${totalTests} test cases at: ${targetFilePath}`);
      return targetFilePath;
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
      return null;
    }
  }
}

module.exports = ExcelReporter;
