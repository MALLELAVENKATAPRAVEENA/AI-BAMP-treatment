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

    let scenarioIndex = 1;
    const addScenario = (scenarioData) => {
      const idStr = String(scenarioIndex++).padStart(3, '0');
      discovered.generatedScenarios.push({
        id: `TC_E2E_${idStr}`,
        ...scenarioData
      });
    };

    // 1. Route Permutation Test Cases across Viewports (Desktop, Tablet, Mobile)
    const viewports = ['Desktop (1280x800)', 'Tablet (768x1024)', 'Mobile (375x812)'];
    discovered.routes.forEach(routeObj => {
      viewports.forEach(vp => {
        addScenario({
          module: 'Route Accessibility & Responsiveness',
          route: routeObj.path,
          pageName: routeObj.component,
          fieldName: 'Viewport Layout',
          testType: 'ROUTE_RESPONSIVENESS',
          inputValue: vp,
          expectedOutcome: 'ROUTE_LOADED_SUCCESSFULLY',
          description: `Validate route ${routeObj.path} accessibility on ${vp}`
        });
      });

      // Authorization & Security check for each route
      addScenario({
        module: 'Protected Route Access Control',
        route: routeObj.path,
        pageName: routeObj.component,
        fieldName: 'Session Auth Token',
        testType: routeObj.protected ? 'PROTECTED_ROUTE_GUARD' : 'PUBLIC_ROUTE_ACCESS',
        inputValue: 'NO_AUTH_HEADER',
        expectedOutcome: routeObj.protected ? 'REDIRECT_TO_LOGIN' : 'ALLOW_PUBLIC_ACCESS',
        description: `Verify auth guard rules on route ${routeObj.path}`
      });
    });

    // 2. Comprehensive Input Field Validation Scenarios
    const xssPayloads = ["<script>alert('xss')</script>", "<img src=x onerror=alert(1)>", "javascript:alert(1)"];
    const sqlPayloads = ["' OR '1'='1", "1; DROP TABLE users;--", "admin'--"];
    const emailInvalidVariations = ["plainaddress", "@domain.com", "user@.com", "user@domain..com", "user@domain,com"];
    const weakPasswords = ["123", "password", "NOPUNCTUATION123", "lowercaseonly", "NO_DIGITS_HERE!"];

    discovered.forms.forEach(form => {
      form.fields.forEach(field => {
        const fieldClean = field.name;

        // a. Empty field validation
        addScenario({
          module: `${form.pageName} Form Validation`,
          route: form.route,
          pageName: form.pageName,
          fieldName: fieldClean,
          testType: 'REQUIRED_FIELD_VALIDATION',
          inputValue: '',
          expectedOutcome: field.required ? 'REQUIRED_ERROR' : 'FIELD_OPTIONAL_ACCEPT',
          description: `Validate empty value submission on ${fieldClean}`
        });

        // b. XSS Payload Injection Testing
        xssPayloads.forEach((payload, idx) => {
          addScenario({
            module: `${form.pageName} Security`,
            route: form.route,
            pageName: form.pageName,
            fieldName: fieldClean,
            testType: 'XSS_INJECTION_PREVENTION',
            inputValue: payload,
            expectedOutcome: 'SANITIZED_OR_REJECTED',
            description: `Verify XSS injection payload ${idx + 1} rejection on ${fieldClean}`
          });
        });

        // c. SQL Injection Testing
        sqlPayloads.forEach((payload, idx) => {
          addScenario({
            module: `${form.pageName} Security`,
            route: form.route,
            pageName: form.pageName,
            fieldName: fieldClean,
            testType: 'SQL_INJECTION_PREVENTION',
            inputValue: payload,
            expectedOutcome: 'SQL_INJECTION_REJECTED',
            description: `Verify SQL injection payload ${idx + 1} rejection on ${fieldClean}`
          });
        });

        // d. Max Length Boundary Testing (300+ chars overflow)
        addScenario({
          module: `${form.pageName} Boundary Testing`,
          route: form.route,
          pageName: form.pageName,
          fieldName: fieldClean,
          testType: 'MAX_LENGTH_BOUNDARY',
          inputValue: 'A'.repeat(350),
          expectedOutcome: 'INPUT_TRUNCATED_OR_ERROR',
          description: `Validate 350-character boundary overflow on ${fieldClean}`
        });

        // e. Whitespace Trimming Validation
        addScenario({
          module: `${form.pageName} Form Validation`,
          route: form.route,
          pageName: form.pageName,
          fieldName: fieldClean,
          testType: 'WHITESPACE_TRIMMING',
          inputValue: '   Test Value   ',
          expectedOutcome: 'VALUE_AUTO_TRIMMED',
          description: `Validate whitespace auto-trimming on ${fieldClean}`
        });

        // f. Special Characters & Emojis Input
        addScenario({
          module: `${form.pageName} Unicode Testing`,
          route: form.route,
          pageName: form.pageName,
          fieldName: fieldClean,
          testType: 'UNICODE_EMOJI_INPUT',
          inputValue: 'John Doe 😀🎉 #1',
          expectedOutcome: 'UNICODE_ACCEPTED',
          description: `Validate Emoji and special character input on ${fieldClean}`
        });

        // Email Specific Scenarios
        if (field.type === 'email' || fieldClean.toLowerCase().includes('email')) {
          emailInvalidVariations.forEach((badEmail, idx) => {
            addScenario({
              module: `${form.pageName} Email Rules`,
              route: form.route,
              pageName: form.pageName,
              fieldName: fieldClean,
              testType: 'EMAIL_SYNTAX_VALIDATION',
              inputValue: badEmail,
              expectedOutcome: 'INVALID_EMAIL_ERROR',
              description: `Validate invalid email format variation ${idx + 1} (${badEmail}) on ${fieldClean}`
            });
          });
        }

        // Password Specific Scenarios
        if (field.type === 'password' || fieldClean.toLowerCase().includes('password')) {
          weakPasswords.forEach((badPwd, idx) => {
            addScenario({
              module: `${form.pageName} Password Rules`,
              route: form.route,
              pageName: form.pageName,
              fieldName: fieldClean,
              testType: 'PASSWORD_COMPLEXITY',
              inputValue: badPwd,
              expectedOutcome: 'WEAK_PASSWORD_ERROR',
              description: `Validate weak password pattern ${idx + 1} (${badPwd}) rejection on ${fieldClean}`
            });
          });
        }

        // Phone Number Specific Scenarios
        if (fieldClean.toLowerCase().includes('phone') || fieldClean.toLowerCase().includes('mobile')) {
          ['123', 'abc-def-ghij', '000000000000000'].forEach((badPhone, idx) => {
            addScenario({
              module: `${form.pageName} Phone Rules`,
              route: form.route,
              pageName: form.pageName,
              fieldName: fieldClean,
              testType: 'PHONE_FORMAT_VALIDATION',
              inputValue: badPhone,
              expectedOutcome: 'INVALID_PHONE_ERROR',
              description: `Validate invalid phone format ${idx + 1} (${badPhone}) on ${fieldClean}`
            });
          });
        }
      });
    });

    // 3. UI Widget & Interactive Component Tests across Pages
    const uiComponents = ['Modal Dialog', 'Toast Notification', 'Loading Spinner', 'Data Table Pagination', 'Search Filter', 'Tooltip Hover', 'Dropdown Selection', 'Checkbox Toggle'];
    uiComponents.forEach(comp => {
      discovered.routes.slice(0, 10).forEach(routeObj => {
        addScenario({
          module: 'React UI Component Testing',
          route: routeObj.path,
          pageName: routeObj.component,
          fieldName: comp,
          testType: 'UI_COMPONENT_BEHAVIOR',
          inputValue: 'USER_INTERACTION',
          expectedOutcome: 'COMPONENT_RENDERED_CORRECTLY',
          description: `Validate ${comp} state and user interaction on ${routeObj.component}`
        });
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
        if (code.includes('<form') || code.includes('<TextField') || code.includes('<input') || code.includes('<Select') || code.includes('onChange')) {
          const pageName = path.basename(file, path.extname(file));
          const fields = [];

          const inputRegex = /<(?:TextField|input|Select)[^>]*(?:name|label|id|placeholder)=["']([^"']+)["'][^>]*>/gi;
          let m;
          while ((m = inputRegex.exec(code)) !== null) {
            const fieldName = m[1];
            const tagSnippet = m[0];
            const isRequired = tagSnippet.includes('required') || code.includes(`${fieldName}: required`) || code.includes('required: true');
            const type = tagSnippet.includes('type="password"') ? 'password' : (tagSnippet.includes('type="email"') || fieldName.toLowerCase().includes('email')) ? 'email' : 'text';
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
