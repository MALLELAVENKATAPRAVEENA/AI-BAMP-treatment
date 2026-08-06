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
  static cacheFilePath = path.join(config.paths.data, 'apiTestResultsCache.json');

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

  static logStep(specName, stepDescription, result = 'PASS', remarks = '') {
    this.executionLogs.push({
      timestamp: new Date().toISOString(),
      specName,
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
        specId: testData.specId || 'API-FAIL',
        endpoint: testData.endpoint || 'N/A',
        method: testData.method || 'POST',
        failureReason: testData.failureReason || 'Assertion failure',
        responseBody: testData.responseBody || 'N/A',
        statusCode: testData.statusCode || 500
      });
    }

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
              specId: t.specId || 'API-FAIL',
              endpoint: t.endpoint || 'N/A',
              method: t.method || 'POST',
              failureReason: t.failureReason || 'Assertion failure',
              responseBody: t.responseBody || 'N/A',
              statusCode: t.statusCode || 500
            }));
          }
        }
      }
    } catch (_) {}
  }

  static async generateFinalReport() {
    return await this.generateReport();
  }

  static async generateReport() {
    try {
      if (!fs.existsSync(config.paths.excel)) {
        fs.mkdirSync(config.paths.excel, { recursive: true });
      }

      if (this.testResults.length === 0) {
        this.loadResultsFromCache();
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Senior API QA Automation Architect';
      workbook.lastModifiedBy = 'REST API Integration CI/CD Pipeline';
      workbook.created = this.startTime;

      const totalTests = this.testResults.length;
      const passed = this.testResults.filter(t => t.status === 'PASSED').length;
      const failed = this.testResults.filter(t => t.status === 'FAILED').length;
      const skipped = this.testResults.filter(t => t.status === 'SKIPPED').length;
      const passPercentage = totalTests > 0 ? `${((passed / totalTests) * 100).toFixed(2)}%` : '0%';
      const endTime = new Date();
      const durationSeconds = ((endTime - this.startTime) / 1000).toFixed(2);

      // Sheet 1: Summary
      const summarySheet = workbook.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF8B5CF6' } } });
      summarySheet.columns = [
        { header: 'Metric Name', key: 'metric', width: 30 },
        { header: 'Measured Value', key: 'value', width: 45 }
      ];
      summarySheet.addRows([
        { metric: 'Execution Date', value: this.startTime.toISOString() },
        { metric: 'Target Base URL', value: config.api.baseUrl },
        { metric: 'Total API Specs Executed', value: totalTests },
        { metric: 'Passed API Specs', value: passed },
        { metric: 'Failed API Specs', value: failed },
        { metric: 'Skipped API Specs', value: skipped },
        { metric: 'Pass Percentage', value: passPercentage },
        { metric: 'Total Execution Duration (s)', value: `${durationSeconds} s` }
      ]);
      summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };

      // Sheet 2: API Test Cases
      const testCasesSheet = workbook.addWorksheet('API Test Cases');
      testCasesSheet.columns = [
        { header: 'Spec ID', key: 'specId', width: 18 },
        { header: 'Endpoint', key: 'endpoint', width: 30 },
        { header: 'Method', key: 'method', width: 12 },
        { header: 'Scenario Name', key: 'scenarioName', width: 55 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Response Time', key: 'duration', width: 18 },
        { header: 'HTTP Code', key: 'statusCode', width: 15 }
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
        { header: 'Spec ID', key: 'specId', width: 18 },
        { header: 'Endpoint', key: 'endpoint', width: 30 },
        { header: 'Method', key: 'method', width: 12 },
        { header: 'Failure Reason', key: 'failureReason', width: 45 },
        { header: 'Response Body', key: 'responseBody', width: 50 },
        { header: 'Status Code', key: 'statusCode', width: 15 }
      ];
      failedSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      failedSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDEF4444' } };
      this.failedTests.forEach(row => failedSheet.addRow(row));

      // Sheet 4: Execution Logs
      const logsSheet = workbook.addWorksheet('Execution Logs');
      logsSheet.columns = [
        { header: 'Timestamp', key: 'timestamp', width: 25 },
        { header: 'Spec Name', key: 'specName', width: 35 },
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
          targetFilePath = path.join(config.paths.excel, `API_Testing_Report_Latest_${timestamp}.xlsx`);
          logger.warn(`Primary API_Testing_Report.xlsx locked. Writing to fallback file: ${targetFilePath}`);
          await workbook.xlsx.writeFile(targetFilePath);
        } else {
          throw fileErr;
        }
      }

      logger.info(`✅ REST API Excel Report generated successfully with ${totalTests} specs at: ${targetFilePath}`);
      return targetFilePath;
    } catch (err) {
      logger.error(`Failed to generate REST API Excel report: ${err.message}`);
      return null;
    }
  }
}

module.exports = ExcelReporter;
