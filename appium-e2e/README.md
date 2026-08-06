# Enterprise Appium 2.x E2E Mobile Automation Framework

Production-Ready End-to-End Mobile Test Automation Framework for Android Applications using **Appium 2.x**, **UiAutomator2**, **Node.js**, **Mocha**, **Chai**, **ExcelJS**, **Winston**, and **GitHub Actions**.

---

## 🛠️ Technology Stack

- **Node.js** (ES6+)
- **Appium 2.x** (UiAutomator2 Driver)
- **WebdriverIO Client**
- **Mocha** Test Runner
- **Chai** Assertion Library
- **ExcelJS** 4-Sheet Excel Report Generator (`Mobile_E2E_Report.xlsx`)
- **Mochawesome** Interactive HTML Reporter
- **Winston** Industrial Logger
- **GitHub Actions** CI/CD Pipeline

---

## 🚀 Key Framework Features

1. **Page Object Model (POM)**: Scalable, decoupled page object architecture (`pages/LoginPage.js`, `pages/DashboardPage.js`, `pages/AddPatientPage.js`, `pages/UIComponentsPage.js`).
2. **Dual Launch Modes**:
   - **APK Installation Mode**: `app: './app/app-release.apk'`
   - **Installed App Mode**: `appPackage: 'com.bamp.ai'`, `appActivity: 'com.bamp.ai.MainActivity'`
3. **Gesture Automation Utility (`gestureUtils.js`)**:
   - `tap()`, `doubleTap()`, `longPress()`, `swipe()`, `scrollUntilVisible()`, `dragAndDrop()`, `pinch()`, `zoom()`.
4. **Failure Trace & ADB Logcat Capture**: Automatically records full-screen PNG screenshots and ADB `logcat` dumps under `reports/failures/`.
5. **4-Sheet Mobile Excel Report (`excelReporter.js`)**:
   - **Summary**: Total, Passed, Failed, Pass %, Duration
   - **Test Cases**: ID, Module, Scenario, Device, Status, Timestamps
   - **Failed Tests**: Failure Reason, Screenshot Path, Activity Name
   - **Execution Logs**: Detailed step-by-step Winston action logs
6. **Smart Screen & Form Discoverer (`androidAppDiscoverer.js`)**:
   - Automatically scans Android activities and layouts, dynamically generating **300+ mobile test scenarios**.

---

## 💻 Local Execution Instructions

```bash
# 1. Install Appium E2E Dependencies
cd appium-e2e
npm install

# 2. Run Smart Screen & Form Scanner (Generates 300+ Test Scenarios)
npm run discover-routes

# 3. Run Mobile E2E Test Suite
npm run test

# 4. Target Android Emulator
npm run test:emulator

# 5. Target Connected Real Android Device
npm run test:device

# 6. Generate / Update Mobile Excel Report
npm run report:excel
```

---

## 📊 Output Artifacts

- **Excel Report**: `appium-e2e/excel/Mobile_E2E_Report.xlsx`
- **HTML Report**: `appium-e2e/reports/html/Mobile_E2E_Execution_Report.html`
- **Execution Logs**: `appium-e2e/logs/mobile_e2e_execution.log`
- **Failure Screenshots & Logs**: `appium-e2e/reports/failures/`
