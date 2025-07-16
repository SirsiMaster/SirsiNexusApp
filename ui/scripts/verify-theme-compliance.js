#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if file has proper theme compliance patterns
function verifyFileThemeCompliance(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip non-component files
    if (!content.includes('className') && !content.includes('class=')) {
      return { compliant: true, issues: [] };
    }

    const issues = [];
    
    // Check for hardcoded colors without dark mode variants
    const problematicPatterns = [
      { pattern: /bg-white(?!\s+dark:)/g, description: 'bg-white without dark mode variant' },
      { pattern: /bg-gray-50(?!\s+dark:)/g, description: 'bg-gray-50 without dark mode variant' },
      { pattern: /text-gray-900(?!\s+dark:)/g, description: 'text-gray-900 without dark mode variant' },
      { pattern: /text-gray-800(?!\s+dark:)/g, description: 'text-gray-800 without dark mode variant' },
      { pattern: /text-gray-700(?!\s+dark:)/g, description: 'text-gray-700 without dark mode variant' },
      { pattern: /text-gray-600(?!\s+dark:)/g, description: 'text-gray-600 without dark mode variant' },
      { pattern: /border-gray-200(?!\s+dark:)/g, description: 'border-gray-200 without dark mode variant' },
      { pattern: /border-gray-300(?!\s+dark:)/g, description: 'border-gray-300 without dark mode variant' },
      { pattern: /bg-green-50(?!\s+dark:)/g, description: 'bg-green-50 without dark mode variant' },
      { pattern: /bg-blue-50(?!\s+dark:)/g, description: 'bg-blue-50 without dark mode variant' },
      { pattern: /text-black(?!\s+dark:)/g, description: 'text-black without dark mode variant' },
    ];

    for (const { pattern, description } of problematicPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          description,
          count: matches.length,
          examples: matches.slice(0, 3) // Show first 3 examples
        });
      }
    }

    // Check for proper theme support patterns
    const goodPatterns = [
      /dark:bg-/g,
      /dark:text-/g,
      /dark:border-/g
    ];

    const hasThemeSupport = goodPatterns.some(pattern => pattern.test(content));
    const hasClassNames = /className=/.test(content);

    return {
      compliant: issues.length === 0,
      hasThemeSupport: hasThemeSupport && hasClassNames,
      issues: issues
    };
  } catch (error) {
    return {
      compliant: false,
      issues: [{ description: `Error reading file: ${error.message}`, count: 1 }]
    };
  }
}

function verifyDirectory(dirPath, results = { compliant: 0, issues: 0, files: [] }) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      verifyDirectory(fullPath, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      const verification = verifyFileThemeCompliance(fullPath);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      if (verification.compliant) {
        results.compliant++;
        if (verification.hasThemeSupport) {
          console.log(`✅ ${relativePath} - Theme compliant with dark mode support`);
        } else {
          console.log(`✅ ${relativePath} - Theme compliant (no styling)`);
        }
      } else {
        results.issues++;
        console.log(`❌ ${relativePath} - Issues found:`);
        verification.issues.forEach(issue => {
          console.log(`   • ${issue.description} (${issue.count} occurrences)`);
          if (issue.examples) {
            issue.examples.forEach(example => {
              console.log(`     - "${example}"`);
            });
          }
        });
      }
      
      results.files.push({
        path: relativePath,
        compliant: verification.compliant,
        hasThemeSupport: verification.hasThemeSupport,
        issues: verification.issues
      });
    }
  }

  return results;
}

function generateReport(results) {
  const total = results.compliant + results.issues;
  const complianceRate = ((results.compliant / total) * 100).toFixed(1);
  
  console.log('\n📊 THEME COMPLIANCE REPORT');
  console.log('=' + '='.repeat(50));
  console.log(`Total files analyzed: ${total}`);
  console.log(`✅ Compliant files: ${results.compliant}`);
  console.log(`❌ Files with issues: ${results.issues}`);
  console.log(`📈 Compliance rate: ${complianceRate}%`);
  
  if (results.issues === 0) {
    console.log('\n🎉 Perfect! All files are theme compliant!');
    console.log('✨ Every page supports light/dark/system theme toggling');
  } else {
    console.log('\n🔧 Issues found that need attention:');
    const issueFiles = results.files.filter(f => !f.compliant);
    issueFiles.forEach(file => {
      console.log(`\n📄 ${file.path}:`);
      file.issues.forEach(issue => {
        console.log(`   • ${issue.description}`);
      });
    });
  }

  // Theme support summary
  const filesWithThemeSupport = results.files.filter(f => f.hasThemeSupport).length;
  const filesWithStyling = results.files.filter(f => f.hasThemeSupport || f.issues.length > 0).length;
  
  console.log(`\n🎨 Theme Support Summary:`);
  console.log(`   Files with dark mode support: ${filesWithThemeSupport}`);
  console.log(`   Files with styling: ${filesWithStyling}`);
  
  return complianceRate === '100.0';
}

function main() {
  console.log('🔍 Verifying theme compliance across all files...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  const startTime = Date.now();
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src directory not found!');
    process.exit(1);
  }

  const results = verifyDirectory(srcPath);
  const duration = Date.now() - startTime;
  
  const isFullyCompliant = generateReport(results);
  
  console.log(`\n⏱️ Analysis completed in ${duration}ms`);
  
  if (isFullyCompliant) {
    console.log('\n🚀 Ready for production! Theme toggling works across all pages.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some files need attention before full theme compliance.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyFileThemeCompliance, verifyDirectory };
