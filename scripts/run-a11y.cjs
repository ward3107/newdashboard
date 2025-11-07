#!/usr/bin/env node

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs').promises;
const path = require('path');

const ROUTES_TO_TEST = [
  '/',
  '/students',
  '/analytics',
  '/settings',
];

const WCAG_STANDARDS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

async function runAccessibilityTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'he-IL',
    colorScheme: 'light',
  });

  const page = await context.newPage();
  const results = {
    timestamp: new Date().toISOString(),
    routes: {},
    summary: {
      totalViolations: 0,
      criticalViolations: 0,
      seriousViolations: 0,
      moderateViolations: 0,
      minorViolations: 0,
    },
  };

  console.log('🔍 Starting accessibility tests...\n');

  for (const route of ROUTES_TO_TEST) {
    console.log(`Testing route: ${route}`);

    try {
      await page.goto(`http://localhost:3000${route}`, {
        waitUntil: 'networkidle',
      });

      // Wait for any dynamic content
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(WCAG_STANDARDS)
        .analyze();

      results.routes[route] = {
        violations: accessibilityScanResults.violations,
        passes: accessibilityScanResults.passes.length,
        incomplete: accessibilityScanResults.incomplete.length,
      };

      // Count violations by impact
      accessibilityScanResults.violations.forEach(violation => {
        results.summary.totalViolations++;

        switch (violation.impact) {
          case 'critical':
            results.summary.criticalViolations++;
            console.log(`  ❌ CRITICAL: ${violation.description}`);
            break;
          case 'serious':
            results.summary.seriousViolations++;
            console.log(`  ⚠️  SERIOUS: ${violation.description}`);
            break;
          case 'moderate':
            results.summary.moderateViolations++;
            console.log(`  ⚠️  MODERATE: ${violation.description}`);
            break;
          case 'minor':
            results.summary.minorViolations++;
            console.log(`  ℹ️  MINOR: ${violation.description}`);
            break;
        }
      });

      if (accessibilityScanResults.violations.length === 0) {
        console.log('  ✅ No accessibility violations found');
      }

    } catch (error) {
      console.error(`  ❌ Error testing ${route}:`, error.message);
      results.routes[route] = { error: error.message };
    }

    console.log('');
  }

  // Test RTL support
  console.log('Testing RTL support...');
  await context.close();

  const rtlContext = await browser.newContext({
    locale: 'ar',
    colorScheme: 'light',
  });

  const rtlPage = await rtlContext.newPage();
  await rtlPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const rtlResults = await new AxeBuilder({ rtlPage })
    .withTags(WCAG_STANDARDS)
    .analyze();

  results.rtlSupport = {
    violations: rtlResults.violations.length,
    passes: rtlResults.passes.length,
  };

  await rtlContext.close();

  // Test dark mode
  console.log('Testing dark mode accessibility...');
  const darkContext = await browser.newContext({
    locale: 'he-IL',
    colorScheme: 'dark',
  });

  const darkPage = await darkContext.newPage();
  await darkPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const darkResults = await new AxeBuilder({ darkPage })
    .withTags(WCAG_STANDARDS)
    .analyze();

  results.darkMode = {
    violations: darkResults.violations.length,
    passes: darkResults.passes.length,
  };

  await darkContext.close();
  await browser.close();

  // Generate reports
  await generateReports(results);

  // Print summary
  console.log('\n📊 Accessibility Test Summary:');
  console.log('================================');
  console.log(`Total violations: ${results.summary.totalViolations}`);
  console.log(`  Critical: ${results.summary.criticalViolations}`);
  console.log(`  Serious: ${results.summary.seriousViolations}`);
  console.log(`  Moderate: ${results.summary.moderateViolations}`);
  console.log(`  Minor: ${results.summary.minorViolations}`);

  // Exit with error if critical violations found
  if (results.summary.criticalViolations > 0) {
    console.error('\n❌ Critical accessibility violations found!');
    process.exit(1);
  }

  if (results.summary.seriousViolations > 0) {
    console.warn('\n⚠️  Serious accessibility violations found.');
    process.exit(1);
  }

  console.log('\n✅ Accessibility tests completed!');
}

async function generateReports(results) {
  const reportsDir = path.join(process.cwd(), 'reports', 'a11y');

  await fs.mkdir(reportsDir, { recursive: true });

  // Save JSON report
  await fs.writeFile(
    path.join(reportsDir, 'a11y-report.json'),
    JSON.stringify(results, null, 2)
  );

  // Generate HTML report
  const htmlReport = generateHTMLReport(results);
  await fs.writeFile(path.join(reportsDir, 'index.html'), htmlReport);

  console.log(`\n📁 Reports saved to ${reportsDir}`);
}

function generateHTMLReport(results) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .route { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .violation { margin: 10px 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; }
        .critical { border-left-color: #dc3545; background: #f8d7da; }
        .serious { border-left-color: #fd7e14; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <h1>Accessibility Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${results.timestamp}</p>
        <p>Total Violations: ${results.summary.totalViolations}</p>
        <ul>
            <li>Critical: ${results.summary.criticalViolations}</li>
            <li>Serious: ${results.summary.seriousViolations}</li>
            <li>Moderate: ${results.summary.moderateViolations}</li>
            <li>Minor: ${results.summary.minorViolations}</li>
        </ul>
    </div>
    ${Object.entries(results.routes).map(([route, data]) => `
        <div class="route">
            <h3>Route: ${route}</h3>
            ${data.error ? `<p class="error">Error: ${data.error}</p>` : `
                <p>Violations: ${data.violations?.length || 0}</p>
                <p>Passes: ${data.passes || 0}</p>
                ${data.violations?.map(v => `
                    <div class="violation ${v.impact}">
                        <strong>${v.impact.toUpperCase()}: ${v.description}</strong>
                        <p>${v.help}</p>
                        <p>Elements affected: ${v.nodes.length}</p>
                    </div>
                `).join('') || '<p class="success">No violations found!</p>'}
            `}
        </div>
    `).join('')}
</body>
</html>`;
}

// Run tests
runAccessibilityTests().catch(console.error);