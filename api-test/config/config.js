const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://bamp-1de96.web.app',
    timeoutMs: parseInt(process.env.API_TIMEOUT_MS || '15000', 10)
  },

  endpoints: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      verifyOtp: '/api/auth/verify-otp'
    },
    patients: {
      list: '/api/patients',
      add: '/api/patients/add',
      details: '/api/patients/:id'
    },
    ai: {
      predict: '/api/ai/predict',
      growth: '/api/ai/growth'
    },
    dashboard: {
      summary: '/api/dashboard/summary'
    },
    reports: {
      generate: '/api/reports/generate'
    }
  },

  paths: {
    root: ROOT_DIR,
    reports: path.join(ROOT_DIR, 'reports'),
    failures: path.join(ROOT_DIR, 'reports', 'failures'),
    logs: path.join(ROOT_DIR, 'logs'),
    excel: path.join(ROOT_DIR, 'excel'),
    data: path.join(ROOT_DIR, 'data'),
    excelReportFile: path.join(ROOT_DIR, 'excel', 'API_Testing_Report.xlsx')
  }
};
