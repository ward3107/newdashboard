#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

const ROUTES_TO_TEST = [
  '/',
  '/students',
  '/analytics',
];

const PERFORMANCE_TARGETS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 80,
  pwa: 80,
  // Core Web Vitals
  'first-contentful-paint': 1800, // ms
  'largest-contentful-paint': 2500, // ms
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 300, // ms
};

async function runPerformanceTests() {
  console.log('🚀 Starting performance tests...\n');

  const results = {
    timestamp: new Date().toISOString(),
    routes: {},
    summary: {
      passedRoutes: 0,
      failedRoutes: 0,
      avgPerformance: 0,
      avgLCP: 0,
      avgCLS: 0,
      avgTBT: 0,
    },
  };

  for (const route of ROUTES_TO_TEST) {
    console.log(`Testing route: ${route}`);

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const url = `http://localhost:3000${route}`;

    try {
      const runnerResult = await lighthouse(url, {
        port: chrome.port,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      });

      const lhr = runnerResult.lhr;
      const scores = {};
      const metrics = {};

      // Extract scores
      Object.keys(lhr.categories).forEach(category => {
        scores[category] = Math.round(lhr.categories[category].score * 100);
      });

      // Extract key metrics
      const audits = lhr.audits;
      metrics.FCP = audits['first-contentful-paint'].numericValue;
      metrics.LCP = audits['largest-contentful-paint'].numericValue;
      metrics.CLS = audits['cumulative-layout-shift'].numericValue;
      metrics.TBT = audits['total-blocking-time'].numericValue;
      metrics.SpeedIndex = audits['speed-index'].numericValue;

      results.routes[route] = { scores, metrics };

      // Check against targets
      let passed = true;

      if (scores.performance < PERFORMANCE_TARGETS.performance) {
        console.log(`  ❌ Performance: ${scores.performance} (target: ${PERFORMANCE_TARGETS.performance})`);
        passed = false;
      } else {
        console.log(`  ✅ Performance: ${scores.performance}`);
      }

      if (metrics.LCP > PERFORMANCE_TARGETS['largest-contentful-paint']) {
        console.log(`  ❌ LCP: ${metrics.LCP}ms (target: <${PERFORMANCE_TARGETS['largest-contentful-paint']}ms)`);
        passed = false;
      } else {
        console.log(`  ✅ LCP: ${metrics.LCP}ms`);
      }

      if (metrics.CLS > PERFORMANCE_TARGETS['cumulative-layout-shift']) {
        console.log(`  ❌ CLS: ${metrics.CLS} (target: <${PERFORMANCE_TARGETS['cumulative-layout-shift']})`);
        passed = false;
      } else {
        console.log(`  ✅ CLS: ${metrics.CLS}`);
      }

      if (passed) {
        results.summary.passedRoutes++;
      } else {
        results.summary.failedRoutes++;
      }

      // Update averages
      results.summary.avgPerformance += scores.performance;
      results.summary.avgLCP += metrics.LCP;
      results.summary.avgCLS += metrics.CLS;
      results.summary.avgTBT += metrics.TBT;

    } catch (error) {
      console.error(`  ❌ Error testing ${route}:`, error.message);
      results.routes[route] = { error: error.message };
      results.summary.failedRoutes++;
    } finally {
      await chrome.kill();
    }

    console.log('');
  }

  // Calculate averages
  const routeCount = ROUTES_TO_TEST.length;
  results.summary.avgPerformance = Math.round(results.summary.avgPerformance / routeCount);
  results.summary.avgLCP = Math.round(results.summary.avgLCP / routeCount);
  results.summary.avgCLS = Number((results.summary.avgCLS / routeCount).toFixed(3));
  results.summary.avgTBT = Math.round(results.summary.avgTBT / routeCount);

  // Test API performance
  console.log('Testing API performance...');
  const apiResults = await testAPIPerformance();
  results.api = apiResults;

  // Generate reports
  await generateReports(results);

  // Print summary
  console.log('\n📊 Performance Test Summary:');
  console.log('================================');
  console.log(`Routes passed: ${results.summary.passedRoutes}/${routeCount}`);
  console.log(`Average Performance Score: ${results.summary.avgPerformance}`);
  console.log(`Average LCP: ${results.summary.avgLCP}ms`);
  console.log(`Average CLS: ${results.summary.avgCLS}`);
  console.log(`Average TBT: ${results.summary.avgTBT}ms`);
  console.log(`\nAPI Performance:`);
  console.log(`  p50: ${results.api.p50}ms`);
  console.log(`  p95: ${results.api.p95}ms`);
  console.log(`  p99: ${results.api.p99}ms`);

  if (results.summary.failedRoutes > 0) {
    console.error('\n❌ Some routes failed performance targets!');
    process.exit(1);
  }

  if (results.api.p95 > 300) {
    console.error('\n❌ API p95 exceeds 300ms target!');
    process.exit(1);
  }

  console.log('\n✅ Performance tests completed!');
}

async function testAPIPerformance() {
  const fetch = (await import('node-fetch')).default;
  const results = [];
  const endpoints = [
    'action=getAllStudents',
    'action=getStats',
  ];

  for (const endpoint of endpoints) {
    for (let i = 0; i < 100; i++) {
      const start = Date.now();

      try {
        await fetch(`http://localhost:3000/api?${endpoint}`);
        results.push(Date.now() - start);
      } catch (error) {
        console.error('API test failed:', error.message);
      }
    }
  }

  results.sort((a, b) => a - b);

  return {
    p50: results[Math.floor(results.length * 0.5)],
    p95: results[Math.floor(results.length * 0.95)],
    p99: results[Math.floor(results.length * 0.99)],
    min: results[0],
    max: results[results.length - 1],
  };
}

async function generateReports(results) {
  const reportsDir = path.join(process.cwd(), 'reports', 'performance');

  await fs.mkdir(reportsDir, { recursive: true });

  // Save JSON report
  await fs.writeFile(
    path.join(reportsDir, 'performance-report.json'),
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
    <title>Performance Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .route { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .score-high { background: #d4edda; padding: 5px 10px; border-radius: 3px; }
        .score-medium { background: #fff3cd; padding: 5px 10px; border-radius: 3px; }
        .score-low { background: #f8d7da; padding: 5px 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${results.timestamp}</p>
        <p>Routes Tested: ${Object.keys(results.routes).length}</p>
        <p>Passed: ${results.summary.passedRoutes} | Failed: ${results.summary.failedRoutes}</p>
        <div>
            <div class="metric">Avg Performance: <span class="${results.summary.avgPerformance >= 90 ? 'pass' : 'fail'}">${results.summary.avgPerformance}</span></div>
            <div class="metric">Avg LCP: <span class="${results.summary.avgLCP <= 2500 ? 'pass' : 'fail'}">${results.summary.avgLCP}ms</span></div>
            <div class="metric">Avg CLS: <span class="${results.summary.avgCLS <= 0.1 ? 'pass' : 'fail'}">${results.summary.avgCLS}</span></div>
            <div class="metric">Avg TBT: <span class="${results.summary.avgTBT <= 300 ? 'pass' : 'fail'}">${results.summary.avgTBT}ms</span></div>
        </div>
    </div>

    <div class="summary">
        <h2>API Performance</h2>
        <div>
            <div class="metric">p50: ${results.api.p50}ms</div>
            <div class="metric">p95: <span class="${results.api.p95 <= 300 ? 'pass' : 'fail'}">${results.api.p95}ms</span></div>
            <div class="metric">p99: ${results.api.p99}ms</div>
        </div>
    </div>

    ${Object.entries(results.routes).map(([route, data]) => `
        <div class="route">
            <h3>Route: ${route}</h3>
            ${data.error ? `<p class="fail">Error: ${data.error}</p>` : `
                <h4>Scores:</h4>
                ${Object.entries(data.scores).map(([key, value]) => `
                    <div class="metric">
                        ${key}: <span class="${value >= 90 ? 'score-high' : value >= 50 ? 'score-medium' : 'score-low'}">${value}</span>
                    </div>
                `).join('')}

                <h4>Metrics:</h4>
                <div>
                    <div class="metric">FCP: ${Math.round(data.metrics.FCP)}ms</div>
                    <div class="metric">LCP: ${Math.round(data.metrics.LCP)}ms</div>
                    <div class="metric">CLS: ${data.metrics.CLS.toFixed(3)}</div>
                    <div class="metric">TBT: ${Math.round(data.metrics.TBT)}ms</div>
                    <div class="metric">Speed Index: ${Math.round(data.metrics.SpeedIndex)}ms</div>
                </div>
            `}
        </div>
    `).join('')}
</body>
</html>`;
}

// Run tests
runPerformanceTests().catch(console.error);