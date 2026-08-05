const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

class RouteFormDiscoverer {
  static discoverRoutesAndForms() {
    const srcDir = config.paths.reactSrcDir;
    const routesFilePath = path.join(srcDir, 'routes', 'AppRoutes.jsx');

    logger.info(`Scanning React routes from: ${routesFilePath}`);
    const discovered = {
      timestamp: new Date().toISOString(),
      routes: [],
      forms: [],
      generatedScenarios: []
    };

    if (!fs.existsSync(routesFilePath)) {
      logger.warn(`AppRoutes.jsx not found at ${routesFilePath}. Using fallback routes.`);
      discovered.routes = [
        { path: '/login', protected: false, component: 'LoginPage' },
        { path: '/signup', protected: false, component: 'SignupPage' },
        { path: '/dashboard', protected: true, component: 'OrthodontistDashboard' },
        { path: '/patients/add', protected: true, component: 'AddPatientPage' },
        { path: '/ai/xray-upload', protected: true, component: 'XRayUploadPage' },
        { path: '/reports', protected: true, component: 'ReportsListPage' }
      ];
    } else {
      const content = fs.readFileSync(routesFilePath, 'utf8');
      const routeRegex = /<Route\s+path=["']([^"']+)["']\s+element=\{<([^/>\s]+)/g;
      let match;
      while ((match = routeRegex.exec(content)) !== null) {
        const routePath = match[1];
        const componentName = match[2];
        if (routePath !== '*') {
          discovered.routes.push({
            path: routePath,
            protected: !routePath.startsWith('/login') && !routePath.startsWith('/signup') && !routePath.startsWith('/forgot'),
            component: componentName
          });
        }
      }
    }

    // Scan Pages for Forms & Input Validation Rules
    const pagesDir = path.join(srcDir, 'pages');
    if (fs.existsSync(pagesDir)) {
      this.scanDirectoryForForms(pagesDir, discovered.forms);
    }

    // Generate Dynamic E2E Test Scenarios based on Discovered Validation Rules
    discovered.forms.forEach(form => {
      form.fields.forEach(field => {
        // Negative test scenario (Empty Required)
        if (field.required) {
          discovered.generatedScenarios.push({
            id: `DYN-${form.pageName}-${field.name}-EMPTY`,
            route: form.route,
            pageName: form.pageName,
            fieldName: field.name,
            testType: 'REQUIRED_FIELD_VALIDATION',
            inputValue: '',
            expectedOutcome: 'ERROR_MESSAGE_DISPLAYED',
            description: `Validate empty ${field.name} on ${form.pageName}`
          });
        }

        // Email validation scenario
        if (field.type === 'email' || field.name.toLowerCase().includes('email')) {
          discovered.generatedScenarios.push({
            id: `DYN-${form.pageName}-${field.name}-INVALID-EMAIL`,
            route: form.route,
            pageName: form.pageName,
            fieldName: field.name,
            testType: 'EMAIL_FORMAT_VALIDATION',
            inputValue: 'invalid-email-format',
            expectedOutcome: 'INVALID_EMAIL_ERROR',
            description: `Validate invalid email format on ${field.name}`
          });
        }

        // Password complexity scenario
        if (field.type === 'password' || field.name.toLowerCase().includes('password')) {
          discovered.generatedScenarios.push({
            id: `DYN-${form.pageName}-${field.name}-WEAK-PWD`,
            route: form.route,
            pageName: form.pageName,
            fieldName: field.name,
            testType: 'PASSWORD_COMPLEXITY',
            inputValue: '123',
            expectedOutcome: 'WEAK_PASSWORD_ERROR',
            description: `Validate weak password rejection on ${field.name}`
          });
        }
      });
    });

    const dataDir = config.paths.data;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const outputPath = path.join(dataDir, 'discoveredRoutes.json');
    fs.writeFileSync(outputPath, JSON.stringify(discovered, null, 2));

    logger.info(`🔍 Discovery complete: Discovered ${discovered.routes.length} routes, ${discovered.forms.length} forms, generated ${discovered.generatedScenarios.length} dynamic test scenarios.`);
    return discovered;
  }

  static scanDirectoryForForms(dirPath, formsList) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        this.scanDirectoryForForms(fullPath, formsList);
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const code = fs.readFileSync(fullPath, 'utf8');
        if (code.includes('<form') || code.includes('<TextField') || code.includes('<input') || code.includes('<Select')) {
          const pageName = path.basename(file, path.extname(file));
          const fields = [];

          const inputRegex = /<TextField[^>]*name=["']([^"']+)["'][^>]*>/g;
          let m;
          while ((m = inputRegex.exec(code)) !== null) {
            const fieldName = m[1];
            const isRequired = m[0].includes('required') || code.includes(`${fieldName}: required`);
            const type = m[0].includes('type="password"') ? 'password' : m[0].includes('type="email"') ? 'email' : 'text';
            fields.push({ name: fieldName, type, required: isRequired });
          }

          if (fields.length > 0) {
            formsList.push({
              pageName,
              file: fullPath,
              route: `/${pageName.toLowerCase().replace('page', '')}`,
              fields
            });
          }
        }
      }
    });
  }
}

if (require.main === module) {
  RouteFormDiscoverer.discoverRoutesAndForms();
}

module.exports = RouteFormDiscoverer;
