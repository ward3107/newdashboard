/**
 * Script to replace console statements with proper logging
 * This is a one-time cleanup script
 */

const fs = require('fs');
const path = require('path');

// Files that need console statement cleanup
const filesToFix = [
  'src/contexts/AuthContext.tsx',
  'src/api.js',
  'src/pages/ApiTestPage.tsx',
  'src/services/optimizationAPI.ts',
  'src/utils/performanceMonitoring.ts',
  'src/service-worker/sw.ts'
];

const consoleReplacements = {
  'console.error(': 'logger.error(',
  'console.warn(': 'logger.warn(',
  'console.log(': 'logger.debug(',
  'console.info(': 'logger.info(',
  'console.debug(': 'logger.debug(',
};

function addLoggerImport(content) {
  // Check if logger is already imported
  if (content.includes("import { logger } from")) {
    return content;
  }

  // Find the last import statement and add logger import after it
  const importRegex = /import[^;]+;/g;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;

    return content.slice(0, insertIndex) +
           "\nimport { logger } from '../utils/logger';" +
           content.slice(insertIndex);
  }

  return content;
}

function fixConsoleStatements(content, filePath) {
  let fixed = content;

  // Replace console statements with logger calls
  Object.entries(consoleReplacements).forEach(([consoleCall, loggerCall]) => {
    const regex = new RegExp(consoleCall.replace('(', '\\(').replace(')', '\\)'), 'g');
    fixed = fixed.replace(regex, loggerCall);
  });

  // Update source names in logger calls to be more specific
  const fileName = path.basename(filePath, path.extname(filePath));
  fixed = fixed.replace(/logger\.(error|warn|info|debug)\(/g, (match, level) => {
    return `logger.${level}('${fileName}', `;
  });

  return fixed;
}

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping ${filePath} - file not found`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Add logger import if needed
    content = addLoggerImport(content);

    // Fix console statements
    content = fixConsoleStatements(content, filePath);

    // Write back
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed console statements in ${filePath}`);

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Console statement cleanup completed!');
console.log('Please review the changes and run tests to ensure everything works correctly.');