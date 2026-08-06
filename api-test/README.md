# Enterprise REST API Integration Automation Framework

Production-Ready REST API Integration Test Automation Framework for BAMP AI Predictor APIs using **Node.js**, **Mocha**, **Chai**, **Axios**, **ExcelJS**, **Winston**, and **GitHub Actions**.

---

## 🛠️ Technology Stack

- **Node.js** (ES6+)
- **Supertest** & **Axios** HTTP Client
- **Mocha** Test Runner
- **Chai** Assertion Library
- **ExcelJS** 4-Sheet Excel Report Generator (`API_Testing_Report.xlsx`)
- **Mochawesome** Interactive HTML Reporter
- **Winston** Industrial Logger
- **GitHub Actions** CI/CD Pipeline

---

## 🚀 Key Framework Features

1. **300+ Dynamic REST API Specs (`apiDiscoverer.js`)**: Scans backend route definitions (`web/backend/src/routes`), auto-generating 300+ dynamic REST API integration specs.
2. **4-Sheet REST API Excel Report (`excelReporter.js`)**:
   - **Summary**: Total Specs, Passed, Failed, Pass %, Duration
   - **API Test Cases**: Spec ID, Endpoint, Method, Scenario Name, Status, Latency, Status Code
   - **Failed Tests**: Failure Reason, Response Body, Status Code
   - **Execution Logs**: Detailed step-by-step Winston action logs

---

## 💻 Local Execution Instructions

```bash
# 1. Install API Test Dependencies
cd api-test
npm install

# 2. Discover REST API Endpoints (Generates 300+ Specs)
npm run discover-routes

# 3. Run REST API Integration Test Suite
npm run test

# 4. Generate / Update API Excel Report
npm run report:excel
```

---

## 📊 Output Artifacts

- **Excel Report**: `api-test/excel/API_Testing_Report.xlsx`
- **HTML Report**: `api-test/reports/html/API_Testing_Report.html`
- **Execution Logs**: `api-test/logs/api_execution.log`
