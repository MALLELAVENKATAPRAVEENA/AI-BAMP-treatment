const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  target: {
    baseUrl: process.env.TARGET_URL || 'https://bamp-1de96.web.app',
    connections: parseInt(process.env.CONNECTIONS || '100', 10), // 100 Virtual Users
    duration: parseInt(process.env.DURATION || '60', 10), // 60 Seconds (1 Minute)
    pipelining: parseInt(process.env.PIPELINING || '1', 10),
    timeout: parseInt(process.env.TIMEOUT_SEC || '10', 10)
  },

  endpoints: [
    { name: 'Root Web App', path: '/', method: 'GET' },
    { name: 'Login Page', path: '/login', method: 'GET' },
    { name: 'Dashboard View', path: '/dashboard', method: 'GET' },
    { name: 'Add Patient Form', path: '/patients/add', method: 'GET' },
    { name: 'Patient Directory', path: '/patients', method: 'GET' },
    { name: 'Generate Report View', path: '/reports/generate', method: 'GET' }
  ],

  sla: {
    maxAvgLatencyMs: 500,
    maxErrorPercentage: 1.0,
    minRps: 50
  },

  paths: {
    root: ROOT_DIR,
    reports: path.join(ROOT_DIR, 'reports'),
    html: path.join(ROOT_DIR, 'reports', 'html'),
    excel: path.join(ROOT_DIR, 'excel'),
    logs: path.join(ROOT_DIR, 'logs'),
    data: path.join(ROOT_DIR, 'data'),
    excelReportFile: path.join(ROOT_DIR, 'excel', 'Load_Testing_Report.xlsx'),
    htmlReportFile: path.join(ROOT_DIR, 'reports', 'html', 'Load_Testing_Report.html')
  }
};
