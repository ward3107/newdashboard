// Bundle Analysis Script
// Run with: node analyze-bundle.js

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

console.log('🔍 Analyzing bundle size...\n');

async function analyzeBuild() {
  try {
    // Build the project
    console.log('📦 Building project...');
    await execAsync('npm run build');
    console.log('✅ Build complete!\n');

    // Get dist folder size
    const distPath = path.join(process.cwd(), 'dist');
    const stats = await getDirectorySize(distPath);

    console.log('📊 Bundle Size Report:');
    console.log('━'.repeat(50));
    console.log(`Total size: ${formatBytes(stats.totalSize)}`);
    console.log(`Total files: ${stats.fileCount}`);
    console.log('━'.repeat(50));

    // Analyze JS chunks
    const jsFiles = await findFiles(path.join(distPath, 'assets'), '.js');
    console.log('\n📄 JavaScript Chunks:');
    jsFiles.sort((a, b) => b.size - a.size).forEach(file => {
      console.log(`  ${file.name.padEnd(40)} ${formatBytes(file.size)}`);
    });

    // Analyze CSS files
    const cssFiles = await findFiles(path.join(distPath, 'assets'), '.css');
    console.log('\n🎨 CSS Files:');
    cssFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(40)} ${formatBytes(file.size)}`);
    });

    // Size recommendations
    console.log('\n💡 Recommendations:');
    const largeChunks = jsFiles.filter(f => f.size > 500 * 1024);
    if (largeChunks.length > 0) {
      console.log('  ⚠️  Large chunks detected (>500KB):');
      largeChunks.forEach(chunk => {
        console.log(`     - ${chunk.name}: Consider further splitting`);
      });
    } else {
      console.log('  ✅ All chunks are within optimal size!');
    }

    // Total size check
    if (stats.totalSize > 5 * 1024 * 1024) {
      console.log('  ⚠️  Total bundle size is large (>5MB)');
    } else if (stats.totalSize > 2 * 1024 * 1024) {
      console.log('  ✅ Total bundle size is acceptable (2-5MB)');
    } else {
      console.log('  ✅ Total bundle size is excellent (<2MB)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getDirectorySize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;

  async function traverse(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
        fileCount++;
      }
    }
  }

  await traverse(dirPath);
  return { totalSize, fileCount };
}

async function findFiles(dirPath, extension) {
  const files = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(extension)) {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);
        files.push({
          name: entry.name,
          size: stats.size,
          path: fullPath
        });
      }
    }
  } catch (error) {
    // Directory might not exist yet
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

analyzeBuild();
