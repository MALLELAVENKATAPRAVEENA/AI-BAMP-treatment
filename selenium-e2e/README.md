# Enterprise Selenium E2E Automation Framework for BAMP React Web Application

A production-ready, highly scalable, enterprise End-to-End (E2E) Selenium WebDriver automation testing framework built using **Node.js**, **JavaScript (ES6+)**, **Mocha**, **Chai**, **ExcelJS**, **Mochawesome**, **Winston Logger**, and **GitHub Actions**.

---

## 🚀 Key Framework Features

1. **Page Object Model (POM) Architecture:** Strict decoupling of UI page locators and user interactions from test verification scripts.
2. **Dynamic React Route & Form Discovery Scanner (`utilities/routeFormDiscoverer.js`):** Automatically parses React Router routes (`AppRoutes.jsx`) and form validation rules (`required`, `email`, `minLength`, `pattern`) to generate dynamic test scenarios automatically.
3. **Cross-Browser & Multi-Mode Execution:** Out-of-the-box execution support for **Google Chrome**, **Microsoft Edge**, and **Mozilla Firefox** in both **Headed** and **Headless** modes.
4. **4-Sheet ExcelJS Reporting (`excel/E2E_Report.xlsx`):**
   - **Sheet 1: Summary** (Execution date, environment, pass/fail counts, duration)
   - **Sheet 2: Test Cases** (Detailed status per scenario, browser, execution time)
   - **Sheet 3: Failed Tests** (Failure trace, URL, screenshot path)
   - **Sheet 4: Execution Logs** (Step-by-step Winston action logs)
5. **Mochawesome HTML Reporting:** Generates rich, interactive HTML reports with embedded screenshots and video/log traces.
6. **Automatic Failure Handling & Screenshots:** Captures full-page screenshots, current page URL, browser console errors, and stack traces upon any test failure under `reports/failures/`.
7. **CI/CD Integration:** Ready-to-run `.github/workflows/selenium-e2e.yml` GitHub Actions pipeline with automated browser provisioning and artifact uploads.

---

## 📁 Framework Structure

```
selenium-e2e/
├── config/
│   ├── config.js               # Environment URL, timeouts, browser configs, retries
│   └── driverFactory.js        # Driver builder for Chrome, Edge, Firefox (Headed/Headless)
├── utilities/
│   ├── logger.js               # Winston logger configuration
│   ├── waitUtils.js            # Explicit waits, retry helper, JS execution, scrolling
│   ├── screenshotUtils.js      # Failure screenshot generator & path resolver
│   ├── excelReporter.js        # ExcelJS 4-sheet E2E report generator
│   └── routeFormDiscoverer.js  # AST/Regex scanner for dynamic route & form testing
├── pages/
│   ├── BasePage.js             # Reusable POM parent class
│   ├── LoginPage.js            # POM for Authentication testing
│   ├── DashboardPage.js        # POM for Orthodontist Dashboard
│   └── AddPatientPage.js       # POM for Form Validation testing
├── data/
│   ├── testData.json           # Valid/invalid credentials & patient data
│   └── discoveredRoutes.json   # Output cache from Route Discovery Scanner
├── tests/
│   ├── setup.test.js           # Base Test Setup hook & reporter initialization
│   ├── auth.test.js            # Authentication test suite
│   ├── formValidation.test.js  # Form validation test suite
│   ├── uiAndNavigation.test.js # UI & Navigation test suite
│   └── dynamicDiscovery.test.js# Dynamic Route & Form Discovery test suite
├── reports/
│   ├── failures/               # Failure screenshots & console logs
│   └── html/                   # Mochawesome HTML Report output
├── excel/                      # Generated E2E_Report.xlsx
├── logs/                       # Winston log output files
├── .github/workflows/
│   └── selenium-e2e.yml        # GitHub Actions CI/CD Pipeline
├── .mocharc.json               # Mocha test runner configuration
├── package.json
└── README.md
```

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
- **Node.js**: v16+ or v20+
- **Browsers**: Google Chrome, Mozilla Firefox, or Microsoft Edge installed locally.

### Step 1: Install Dependencies
```bash
cd selenium-e2e
npm install
```

---

## 🧪 Execution Commands

### 1. Run Dynamic Route & Form Discovery Scanner
Scans React routes (`AppRoutes.jsx`) and builds dynamic test scenarios:
```bash
npm run discover-routes
```

### 2. Run All E2E Tests (Default Chrome Headed)
```bash
npm test
```

### 3. Run Headless Mode Execution
```bash
npm run test:headless
```

### 4. Run Cross-Browser Tests
```bash
# Google Chrome
npm run test:chrome

# Mozilla Firefox
npm run test:firefox

# Microsoft Edge
npm run test:edge
```

---

## 📊 Reports & Output Artifacts

After every test run, reports are automatically compiled under:
1. **Excel Report:** `selenium-e2e/excel/E2E_Report.xlsx`
2. **HTML Report:** `selenium-e2e/reports/html/E2E_Execution_Report.html`
3. **Failure Screenshots:** `selenium-e2e/reports/failures/`
4. **Execution Logs:** `selenium-e2e/logs/e2e_execution.log`
