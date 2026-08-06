const LoadEngine = require('../utilities/loadEngine');
const ExcelReporter = require('../utilities/excelReporter');
const HtmlReporter = require('../utilities/htmlReporter');
const logger = require('../utilities/logger');

async function executeBaselineLoadTest() {
  try {
    logger.info('Starting Enterprise Baseline Load Test (100 VUs / 60s)...');
    const result = await LoadEngine.runBenchmark();
    
    // Cache results
    ExcelReporter.saveResults(result);

    // Generate Reports
    await ExcelReporter.generateReport(result);
    HtmlReporter.generateHtmlReport(result);

    logger.info('🎉 Baseline Load Test Execution completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error(`Load Test Execution Failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  executeBaselineLoadTest();
}

module.exports = executeBaselineLoadTest;
