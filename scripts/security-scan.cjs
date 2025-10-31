#!/usr/bin/env node

/**
 * Security Scanner
 * Scans codebase for common security issues and vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let hasErrors = false;
let hasWarnings = false;

console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.cyan}🔒 Security Scanner${colors.reset}`);
console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

/**
 * Check for hardcoded secrets and API keys
 */
function checkForSecrets() {
  console.log(`${colors.blue}📝 Checking for hardcoded secrets...${colors.reset}`);

  const patterns = [
    { regex: /sk-[a-zA-Z0-9]{20,}/g, name: 'OpenAI API Key' },
    { regex: /AIza[0-9A-Za-z_-]{35}/g, name: 'Google API Key' },
    { regex: /[0-9a-f]{32}/g, name: 'MD5 Hash / Token' },
    { regex: /(password|passwd|pwd)\s*=\s*["'][^"']+["']/gi, name: 'Hardcoded Password' },
    { regex: /token\s*=\s*["'][^"']+["']/gi, name: 'Hardcoded Token' },
    { regex: /api[_-]?key\s*=\s*["'][^"']+["']/gi, name: 'API Key' },
    { regex: /secret\s*=\s*["'][^"']+["']/gi, name: 'Secret' },
  ];

  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx']);

  let foundSecrets = false;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);

    patterns.forEach(({ regex, name }) => {
      const matches = content.match(regex);
      if (matches && !content.includes('.env') && !content.includes('example')) {
        console.log(`${colors.yellow}⚠️  Potential ${name} found in: ${relativePath}${colors.reset}`);
        hasWarnings = true;
        foundSecrets = true;
      }
    });
  });

  if (!foundSecrets) {
    console.log(`${colors.green}✓ No hardcoded secrets detected${colors.reset}\n`);
  } else {
    console.log();
  }
}

/**
 * Check for security vulnerabilities in dependencies
 */
function checkDependencies() {
  console.log(`${colors.blue}📦 Checking dependencies for vulnerabilities...${colors.reset}`);

  try {
    const result = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(result);

    if (audit.metadata.vulnerabilities) {
      const { info, low, moderate, high, critical } = audit.metadata.vulnerabilities;

      console.log(`${colors.cyan}Vulnerability Summary:${colors.reset}`);
      console.log(`  Info: ${info}`);
      console.log(`  Low: ${low}`);
      console.log(`  Moderate: ${moderate}`);
      console.log(`  High: ${high}`);
      console.log(`  Critical: ${critical}`);

      if (critical > 0 || high > 0) {
        console.log(`${colors.red}✗ Critical or high vulnerabilities found!${colors.reset}\n`);
        hasErrors = true;
      } else if (moderate > 0) {
        console.log(`${colors.yellow}⚠️  Moderate vulnerabilities found${colors.reset}\n`);
        hasWarnings = true;
      } else {
        console.log(`${colors.green}✓ No significant vulnerabilities${colors.reset}\n`);
      }
    }
  } catch (error) {
    // npm audit exits with non-zero code if vulnerabilities found
    console.log(`${colors.yellow}⚠️  Vulnerabilities detected - run 'npm audit' for details${colors.reset}\n`);
    hasWarnings = true;
  }
}

/**
 * Check for insecure patterns in code
 */
function checkInsecurePatterns() {
  console.log(`${colors.blue}🔍 Checking for insecure code patterns...${colors.reset}`);

  const insecurePatterns = [
    { regex: /eval\s*\(/g, name: 'eval() usage', severity: 'high' },
    { regex: /dangerouslySetInnerHTML/g, name: 'dangerouslySetInnerHTML', severity: 'medium' },
    { regex: /innerHTML\s*=/g, name: 'innerHTML assignment', severity: 'medium' },
    { regex: /document\.write/g, name: 'document.write', severity: 'medium' },
    { regex: /target="_blank"(?![^>]*rel="noopener)/g, name: 'target="_blank" without rel="noopener"', severity: 'low' },
  ];

  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx']);

  let foundIssues = false;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);

    insecurePatterns.forEach(({ regex, name, severity }) => {
      const matches = content.match(regex);
      if (matches) {
        const color = severity === 'high' ? colors.red : severity === 'medium' ? colors.yellow : colors.blue;
        console.log(`${color}${severity === 'high' ? '✗' : '⚠️'}  ${name} found in: ${relativePath}${colors.reset}`);
        foundIssues = true;

        if (severity === 'high') {
          hasErrors = true;
        } else {
          hasWarnings = true;
        }
      }
    });
  });

  if (!foundIssues) {
    console.log(`${colors.green}✓ No insecure patterns detected${colors.reset}\n`);
  } else {
    console.log();
  }
}

/**
 * Check environment configuration
 */
function checkEnvironmentConfig() {
  console.log(`${colors.blue}⚙️  Checking environment configuration...${colors.reset}`);

  const envExample = path.join(process.cwd(), '.env.example');
  const envLocal = path.join(process.cwd(), '.env.local');
  const env = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envExample)) {
    console.log(`${colors.yellow}⚠️  Missing .env.example file${colors.reset}`);
    hasWarnings = true;
  } else {
    console.log(`${colors.green}✓ .env.example exists${colors.reset}`);
  }

  if (fs.existsSync(env)) {
    console.log(`${colors.yellow}⚠️  .env file should not be committed${colors.reset}`);
    hasWarnings = true;
  }

  console.log();
}

/**
 * Helper: Get all files recursively
 */
function getAllFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && file !== '.git') {
        getAllFiles(filePath, extensions, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Main execution
 */
async function main() {
  try {
    checkForSecrets();
    checkDependencies();
    checkInsecurePatterns();
    checkEnvironmentConfig();

    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    if (hasErrors) {
      console.log(`${colors.red}✗ Security scan completed with ERRORS${colors.reset}`);
      console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
      process.exit(1);
    } else if (hasWarnings) {
      console.log(`${colors.yellow}⚠️  Security scan completed with WARNINGS${colors.reset}`);
      console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
      process.exit(0); // Don't fail CI on warnings
    } else {
      console.log(`${colors.green}✓ Security scan passed - no issues found!${colors.reset}`);
      console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}Error during security scan: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
