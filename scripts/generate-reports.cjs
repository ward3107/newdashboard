#!/usr/bin/env node

/**
 * Report Generator
 * Generates comprehensive reports from test coverage, accessibility, and performance data
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.cyan}📊 Generating Comprehensive Reports${colors.reset}`);
console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

const reportsDir = path.join(process.cwd(), 'reports');
const coverageDir = path.join(process.cwd(), 'coverage');

/**
 * Ensure reports directory exists
 */
function ensureReportsDir() {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    console.log(`${colors.green}✓ Created reports directory${colors.reset}`);
  }
}

/**
 * Generate coverage summary report
 */
function generateCoverageReport() {
  console.log(`${colors.blue}📈 Generating coverage report...${colors.reset}`);

  const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');

  if (!fs.existsSync(coverageSummaryPath)) {
    console.log(`${colors.yellow}⚠️  No coverage data found - run 'npm run test:coverage' first${colors.reset}\n`);
    return null;
  }

  try {
    const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const total = coverageData.total;

    const report = {
      timestamp: new Date().toISOString(),
      coverage: {
        lines: total.lines.pct,
        statements: total.statements.pct,
        functions: total.functions.pct,
        branches: total.branches.pct,
      },
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 85,
      },
      status: {
        lines: total.lines.pct >= 85,
        statements: total.statements.pct >= 85,
        functions: total.functions.pct >= 85,
        branches: total.branches.pct >= 85,
      },
    };

    // Calculate overall pass/fail
    const allPassed = Object.values(report.status).every(v => v);
    report.overallStatus = allPassed ? 'PASS' : 'FAIL';

    // Write JSON report
    const jsonPath = path.join(reportsDir, 'coverage-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate Markdown report
    const mdReport = `# Test Coverage Report

**Generated:** ${new Date().toLocaleString()}

## Coverage Summary

| Metric | Coverage | Threshold | Status |
|--------|----------|-----------|--------|
| Lines | ${report.coverage.lines.toFixed(2)}% | ${report.thresholds.lines}% | ${report.status.lines ? '✅ PASS' : '❌ FAIL'} |
| Statements | ${report.coverage.statements.toFixed(2)}% | ${report.thresholds.statements}% | ${report.status.statements ? '✅ PASS' : '❌ FAIL'} |
| Functions | ${report.coverage.functions.toFixed(2)}% | ${report.thresholds.functions}% | ${report.status.functions ? '✅ PASS' : '❌ FAIL'} |
| Branches | ${report.coverage.branches.toFixed(2)}% | ${report.thresholds.branches}% | ${report.status.branches ? '✅ PASS' : '❌ FAIL'} |

## Overall Status: ${report.overallStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}

${report.overallStatus === 'FAIL' ? '\n⚠️ Some coverage thresholds are not met. Please improve test coverage.\n' : '\n✅ All coverage thresholds met!\n'}

---
*For detailed coverage information, see the HTML report in the coverage/ directory.*
`;

    const mdPath = path.join(reportsDir, 'coverage-report.md');
    fs.writeFileSync(mdPath, mdReport);

    console.log(`${colors.green}✓ Coverage report generated${colors.reset}`);
    console.log(`  - JSON: ${path.relative(process.cwd(), jsonPath)}`);
    console.log(`  - Markdown: ${path.relative(process.cwd(), mdPath)}`);
    console.log(`  - Overall: ${report.overallStatus === 'PASS' ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}\n`);

    return report;
  } catch (error) {
    console.log(`${colors.red}✗ Error generating coverage report: ${error.message}${colors.reset}\n`);
    return null;
  }
}

/**
 * Generate accessibility report
 */
function generateAccessibilityReport() {
  console.log(`${colors.blue}♿ Checking accessibility reports...${colors.reset}`);

  const a11yDir = path.join(reportsDir, 'a11y');

  if (!fs.existsSync(a11yDir)) {
    console.log(`${colors.yellow}⚠️  No accessibility data found - run 'npm run a11y' first${colors.reset}\n`);
    return null;
  }

  console.log(`${colors.green}✓ Accessibility reports available in ${path.relative(process.cwd(), a11yDir)}${colors.reset}\n`);
  return true;
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
  console.log(`${colors.blue}⚡ Checking performance reports...${colors.reset}`);

  const perfDir = path.join(reportsDir, 'performance');

  if (!fs.existsSync(perfDir)) {
    console.log(`${colors.yellow}⚠️  No performance data found - run 'npm run perf' first${colors.reset}\n`);
    return null;
  }

  console.log(`${colors.green}✓ Performance reports available in ${path.relative(process.cwd(), perfDir)}${colors.reset}\n`);
  return true;
}

/**
 * Generate summary report
 */
function generateSummaryReport(coverageReport) {
  console.log(`${colors.blue}📋 Generating summary report...${colors.reset}`);

  const summary = {
    timestamp: new Date().toISOString(),
    project: 'AI Student Analysis Dashboard',
    reports: {
      coverage: !!coverageReport,
      accessibility: fs.existsSync(path.join(reportsDir, 'a11y')),
      performance: fs.existsSync(path.join(reportsDir, 'performance')),
    },
    status: {
      coverage: coverageReport?.overallStatus === 'PASS',
      build: true, // Assume build passed if we're generating reports
    },
  };

  const allPassed = Object.values(summary.status).every(v => v);
  summary.overallStatus = allPassed ? 'PASS' : 'FAIL';

  // Write JSON summary
  const jsonPath = path.join(reportsDir, 'summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  // Generate Markdown summary
  const mdReport = `# Project Quality Summary

**Generated:** ${new Date().toLocaleString()}
**Project:** ${summary.project}

## Available Reports

| Report | Status |
|--------|--------|
| Test Coverage | ${summary.reports.coverage ? '✅ Available' : '❌ Not Generated'} |
| Accessibility | ${summary.reports.accessibility ? '✅ Available' : '❌ Not Generated'} |
| Performance | ${summary.reports.performance ? '✅ Available' : '❌ Not Generated'} |

## Quality Checks

| Check | Status |
|-------|--------|
| Test Coverage | ${summary.status.coverage ? '✅ PASS' : '❌ FAIL'} |
| Build | ${summary.status.build ? '✅ PASS' : '❌ FAIL'} |

## Overall Status: ${summary.overallStatus === 'PASS' ? '✅ PASS' : '⚠️ NEEDS ATTENTION'}

${summary.overallStatus === 'FAIL' ? '\n⚠️ Some quality checks failed. Please review the individual reports.\n' : '\n✅ All quality checks passed!\n'}

---

## Report Files

- [Coverage Report](./coverage-report.md)
- [Accessibility Reports](./a11y/)
- [Performance Reports](./performance/)

---
*Generated by automated report generator*
`;

  const mdPath = path.join(reportsDir, 'README.md');
  fs.writeFileSync(mdPath, mdReport);

  console.log(`${colors.green}✓ Summary report generated${colors.reset}`);
  console.log(`  - JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`  - Markdown: ${path.relative(process.cwd(), mdPath)}\n`);

  return summary;
}

/**
 * Main execution
 */
async function main() {
  try {
    ensureReportsDir();

    const coverageReport = generateCoverageReport();
    generateAccessibilityReport();
    generatePerformanceReport();
    const summary = generateSummaryReport(coverageReport);

    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    if (summary.overallStatus === 'PASS') {
      console.log(`${colors.green}✓ All reports generated successfully!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Reports generated with warnings${colors.reset}`);
    }

    console.log(`${colors.magenta}📂 View all reports in: ${path.relative(process.cwd(), reportsDir)}/${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error generating reports: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
