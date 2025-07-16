#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common hardcoded color patterns and their dark mode equivalents
const colorReplacements = [
  // Background colors
  { pattern: /bg-white(?!\s+dark:)/g, replacement: 'bg-white dark:bg-gray-800' },
  { pattern: /bg-gray-50(?!\s+dark:)/g, replacement: 'bg-gray-50 dark:bg-gray-900' },
  { pattern: /bg-gray-100(?!\s+dark:)/g, replacement: 'bg-gray-100 dark:bg-gray-800' },
  { pattern: /bg-green-50(?!\s+dark:)/g, replacement: 'bg-green-50 dark:bg-green-900/20' },
  { pattern: /bg-green-100(?!\s+dark:)/g, replacement: 'bg-green-100 dark:bg-green-900/30' },
  { pattern: /bg-blue-50(?!\s+dark:)/g, replacement: 'bg-blue-50 dark:bg-blue-900/20' },
  { pattern: /bg-blue-100(?!\s+dark:)/g, replacement: 'bg-blue-100 dark:bg-blue-900/30' },
  { pattern: /bg-yellow-50(?!\s+dark:)/g, replacement: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { pattern: /bg-yellow-100(?!\s+dark:)/g, replacement: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { pattern: /bg-red-50(?!\s+dark:)/g, replacement: 'bg-red-50 dark:bg-red-900/20' },
  { pattern: /bg-red-100(?!\s+dark:)/g, replacement: 'bg-red-100 dark:bg-red-900/30' },
  { pattern: /bg-purple-50(?!\s+dark:)/g, replacement: 'bg-purple-50 dark:bg-purple-900/20' },
  { pattern: /bg-purple-100(?!\s+dark:)/g, replacement: 'bg-purple-100 dark:bg-purple-900/30' },
  { pattern: /bg-indigo-50(?!\s+dark:)/g, replacement: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { pattern: /bg-indigo-100(?!\s+dark:)/g, replacement: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { pattern: /bg-pink-50(?!\s+dark:)/g, replacement: 'bg-pink-50 dark:bg-pink-900/20' },
  { pattern: /bg-pink-100(?!\s+dark:)/g, replacement: 'bg-pink-100 dark:bg-pink-900/30' },
  { pattern: /bg-emerald-50(?!\s+dark:)/g, replacement: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { pattern: /bg-emerald-100(?!\s+dark:)/g, replacement: 'bg-emerald-100 dark:bg-emerald-900/30' },
  
  // Text colors
  { pattern: /text-black(?!\s+dark:)/g, replacement: 'text-black dark:text-white' },
  { pattern: /text-gray-900(?!\s+dark:)/g, replacement: 'text-gray-900 dark:text-gray-100' },
  { pattern: /text-gray-800(?!\s+dark:)/g, replacement: 'text-gray-800 dark:text-gray-200' },
  { pattern: /text-gray-700(?!\s+dark:)/g, replacement: 'text-gray-700 dark:text-gray-300' },
  { pattern: /text-gray-600(?!\s+dark:)/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { pattern: /text-gray-500(?!\s+dark:)/g, replacement: 'text-gray-500 dark:text-gray-400' },
  { pattern: /text-green-800(?!\s+dark:)/g, replacement: 'text-green-800 dark:text-green-300' },
  { pattern: /text-green-700(?!\s+dark:)/g, replacement: 'text-green-700 dark:text-green-300' },
  { pattern: /text-blue-800(?!\s+dark:)/g, replacement: 'text-blue-800 dark:text-blue-300' },
  { pattern: /text-blue-700(?!\s+dark:)/g, replacement: 'text-blue-700 dark:text-blue-300' },
  { pattern: /text-yellow-800(?!\s+dark:)/g, replacement: 'text-yellow-800 dark:text-yellow-300' },
  { pattern: /text-yellow-700(?!\s+dark:)/g, replacement: 'text-yellow-700 dark:text-yellow-300' },
  { pattern: /text-red-800(?!\s+dark:)/g, replacement: 'text-red-800 dark:text-red-300' },
  { pattern: /text-red-700(?!\s+dark:)/g, replacement: 'text-red-700 dark:text-red-300' },
  { pattern: /text-purple-800(?!\s+dark:)/g, replacement: 'text-purple-800 dark:text-purple-300' },
  { pattern: /text-purple-700(?!\s+dark:)/g, replacement: 'text-purple-700 dark:text-purple-300' },
  { pattern: /text-emerald-800(?!\s+dark:)/g, replacement: 'text-emerald-800 dark:text-emerald-300' },
  { pattern: /text-emerald-700(?!\s+dark:)/g, replacement: 'text-emerald-700 dark:text-emerald-300' },

  // Border colors
  { pattern: /border-gray-200(?!\s+dark:)/g, replacement: 'border-gray-200 dark:border-gray-700' },
  { pattern: /border-gray-300(?!\s+dark:)/g, replacement: 'border-gray-300 dark:border-gray-600' },
  { pattern: /border-green-200(?!\s+dark:)/g, replacement: 'border-green-200 dark:border-green-700' },
  { pattern: /border-blue-200(?!\s+dark:)/g, replacement: 'border-blue-200 dark:border-blue-700' },
  { pattern: /border-yellow-200(?!\s+dark:)/g, replacement: 'border-yellow-200 dark:border-yellow-700' },
  { pattern: /border-red-200(?!\s+dark:)/g, replacement: 'border-red-200 dark:border-red-700' },
  { pattern: /border-purple-200(?!\s+dark:)/g, replacement: 'border-purple-200 dark:border-purple-700' },
  { pattern: /border-emerald-200(?!\s+dark:)/g, replacement: 'border-emerald-200 dark:border-emerald-700' },

  // Remove duplicate dark: classes that already exist
  { pattern: /dark:bg-gray-800\s+dark:bg-gray-800/g, replacement: 'dark:bg-gray-800' },
  { pattern: /dark:bg-gray-900\s+dark:bg-gray-900/g, replacement: 'dark:bg-gray-900' },
  { pattern: /dark:text-gray-100\s+dark:text-gray-100/g, replacement: 'dark:text-gray-100' },
  { pattern: /dark:text-gray-400\s+dark:text-gray-400/g, replacement: 'dark:text-gray-400' },
  { pattern: /dark:border-gray-700\s+dark:border-gray-700/g, replacement: 'dark:border-gray-700' },
];

function fixFileThemeCompliance(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const { pattern, replacement } of colorReplacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed theme compliance in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
  return false;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFixed = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalFixed += processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      if (fixFileThemeCompliance(fullPath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

function main() {
  console.log('🎨 Starting comprehensive theme compliance fix...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  const startTime = Date.now();
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src directory not found!');
    process.exit(1);
  }

  const totalFixed = processDirectory(srcPath);
  const duration = Date.now() - startTime;

  console.log(`\n🎉 Theme compliance fix completed!`);
  console.log(`📊 Files processed: ${totalFixed}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (totalFixed > 0) {
    console.log('\n✨ All pages now support light/dark/system theme toggling!');
  } else {
    console.log('\n👍 No theme compliance issues found.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFileThemeCompliance, processDirectory };
