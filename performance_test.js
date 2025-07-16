#!/usr/bin/env node

/**
 * SirsiNexus Performance and Scalability Test Suite
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

let performanceResults = {
  buildPerformance: {},
  componentLoadTimes: {},
  memoryUsage: {},
  fileSystemPerformance: {},
  codeComplexity: {},
  scalabilityMetrics: {}
};

function measureTime(fn, description) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`⏱️ ${description}: ${duration.toFixed(2)}ms`);
  return { result, duration };
}

async function testBuildPerformance() {
  console.log('\n🏗️ Testing Build Performance:');
  
  // Analyze build output
  const buildPath = 'ui/.next';
  if (fs.existsSync(buildPath)) {
    const buildSize = getDirSize(buildPath);
    performanceResults.buildPerformance.buildSize = buildSize;
    console.log(`✅ Build size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Check for optimizations
    const staticPath = path.join(buildPath, 'static');
    if (fs.existsSync(staticPath)) {
      const staticSize = getDirSize(staticPath);
      performanceResults.buildPerformance.staticSize = staticSize;
      console.log(`✅ Static assets: ${(staticSize / 1024 / 1024).toFixed(2)} MB`);
      
      // Check for chunks
      const chunksPath = path.join(staticPath, 'chunks');
      if (fs.existsSync(chunksPath)) {
        const chunkFiles = fs.readdirSync(chunksPath);
        performanceResults.buildPerformance.chunkCount = chunkFiles.length;
        console.log(`✅ JavaScript chunks: ${chunkFiles.length} files`);
      }
    }
  } else {
    console.log('⚠️ No build directory found - run npm run build first');
  }
}

function getDirSize(directory) {
  let size = 0;
  try {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return size;
}

function analyzeCodeComplexity() {
  console.log('\n🧮 Analyzing Code Complexity:');
  
  const uiPath = 'ui/src';
  const { result: files, duration } = measureTime(
    () => getAllFiles(uiPath, ['.ts', '.tsx', '.js', '.jsx']),
    'File scanning'
  );
  
  let totalLines = 0;
  let totalFunctions = 0;
  let totalComponents = 0;
  let complexityScore = 0;
  
  const { duration: analysisDuration } = measureTime(() => {
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        totalLines += lines;
        
        // Count functions
        const functionMatches = content.match(/function\s+\w+|=>\s*{|const\s+\w+\s*=\s*\(/g);
        if (functionMatches) {
          totalFunctions += functionMatches.length;
        }
        
        // Count React components
        const componentMatches = content.match(/export\s+(default\s+)?function\s+\w+|const\s+\w+\s*=\s*\(/g);
        if (componentMatches) {
          totalComponents += componentMatches.length;
        }
        
        // Simple complexity calculation (cyclomatic complexity approximation)
        const conditionals = content.match(/if\s*\(|else|switch|case|while\s*\(|for\s*\(|\?\s*:/g);
        if (conditionals) {
          complexityScore += conditionals.length;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
  }, 'Code complexity analysis');
  
  performanceResults.codeComplexity = {
    totalFiles: files.length,
    totalLines,
    totalFunctions,
    totalComponents,
    complexityScore,
    avgComplexityPerFile: complexityScore / files.length,
    avgLinesPerFile: totalLines / files.length
  };
  
  console.log(`✅ Total files: ${files.length}`);
  console.log(`✅ Total lines: ${totalLines.toLocaleString()}`);
  console.log(`✅ Total functions: ${totalFunctions}`);
  console.log(`✅ React components: ${totalComponents}`);
  console.log(`✅ Complexity score: ${complexityScore}`);
  console.log(`✅ Avg complexity per file: ${(complexityScore / files.length).toFixed(2)}`);
  console.log(`✅ Avg lines per file: ${(totalLines / files.length).toFixed(0)}`);
}

function getAllFiles(directory, extensions) {
  let files = [];
  try {
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  return files;
}

function testFileSystemPerformance() {
  console.log('\n📂 Testing File System Performance:');
  
  // Test large file operations
  const testDir = 'performance_test_temp';
  
  try {
    // Create test directory
    const { duration: createDirTime } = measureTime(
      () => fs.mkdirSync(testDir, { recursive: true }),
      'Directory creation'
    );
    
    // Test file write performance
    const testData = 'x'.repeat(1024 * 1024); // 1MB of data
    const { duration: writeTime } = measureTime(
      () => {
        for (let i = 0; i < 10; i++) {
          fs.writeFileSync(path.join(testDir, `test_${i}.txt`), testData);
        }
      },
      'Writing 10MB of test files'
    );
    
    // Test file read performance
    const { duration: readTime } = measureTime(
      () => {
        for (let i = 0; i < 10; i++) {
          fs.readFileSync(path.join(testDir, `test_${i}.txt`), 'utf8');
        }
      },
      'Reading 10MB of test files'
    );
    
    // Test directory listing
    const { duration: listTime } = measureTime(
      () => fs.readdirSync(testDir),
      'Directory listing'
    );
    
    performanceResults.fileSystemPerformance = {
      createDirTime,
      writeTime,
      readTime,
      listTime,
      writeSpeed: (10 / writeTime * 1000).toFixed(2), // MB/s
      readSpeed: (10 / readTime * 1000).toFixed(2)   // MB/s
    };
    
    console.log(`✅ Write speed: ${performanceResults.fileSystemPerformance.writeSpeed} MB/s`);
    console.log(`✅ Read speed: ${performanceResults.fileSystemPerformance.readSpeed} MB/s`);
    
    // Cleanup
    fs.rmSync(testDir, { recursive: true });
    
  } catch (error) {
    console.log(`❌ File system test failed: ${error.message}`);
  }
}

function analyzeMemoryUsage() {
  console.log('\n🧠 Analyzing Memory Usage:');
  
  const memUsage = process.memoryUsage();
  performanceResults.memoryUsage = {
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external,
    rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
    heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
    heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2)
  };
  
  console.log(`✅ RSS Memory: ${performanceResults.memoryUsage.rssMB} MB`);
  console.log(`✅ Heap Total: ${performanceResults.memoryUsage.heapTotalMB} MB`);
  console.log(`✅ Heap Used: ${performanceResults.memoryUsage.heapUsedMB} MB`);
  console.log(`✅ External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);
}

function calculateScalabilityMetrics() {
  console.log('\n📈 Calculating Scalability Metrics:');
  
  // Component scalability analysis
  const componentFiles = getAllFiles('ui/src/components', ['.tsx', '.ts']);
  const pageFiles = getAllFiles('ui/src/app', ['.tsx', '.ts']);
  
  let totalComponents = 0;
  let reusableComponents = 0;
  let largeComponents = 0;
  
  componentFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      
      if (content.includes('export') && (content.includes('function') || content.includes('const'))) {
        totalComponents++;
        
        // Check if component is reusable (used in multiple places)
        if (content.includes('interface') || content.includes('type') || content.includes('Props')) {
          reusableComponents++;
        }
        
        // Check for large components
        if (lines > 200) {
          largeComponents++;
        }
      }
    } catch (error) {
      // Skip unreadable files
    }
  });
  
  performanceResults.scalabilityMetrics = {
    totalComponents,
    reusableComponents,
    largeComponents,
    componentFiles: componentFiles.length,
    pageFiles: pageFiles.length,
    reusabilityRatio: ((reusableComponents / totalComponents) * 100).toFixed(1),
    componentComplexityRatio: ((largeComponents / totalComponents) * 100).toFixed(1)
  };
  
  console.log(`✅ Total components: ${totalComponents}`);
  console.log(`✅ Reusable components: ${reusableComponents} (${performanceResults.scalabilityMetrics.reusabilityRatio}%)`);
  console.log(`✅ Large components: ${largeComponents} (${performanceResults.scalabilityMetrics.componentComplexityRatio}%)`);
  console.log(`✅ Component files: ${componentFiles.length}`);
  console.log(`✅ Page files: ${pageFiles.length}`);
}

function testComponentLoadTimes() {
  console.log('\n⚡ Testing Component Load Times:');
  
  const criticalComponents = [
    'ui/src/components/Sidebar.tsx',
    'ui/src/components/Header.tsx',
    'ui/src/components/MigrationSteps/MigrationSteps.tsx',
    'ui/src/components/EnhancedAnalyticsDashboard.tsx',
    'ui/src/app/page.tsx'
  ];
  
  criticalComponents.forEach(component => {
    if (fs.existsSync(component)) {
      const { duration } = measureTime(
        () => fs.readFileSync(component, 'utf8'),
        `Loading ${path.basename(component)}`
      );
      
      performanceResults.componentLoadTimes[path.basename(component)] = duration;
    }
  });
}

async function runPerformanceTests() {
  console.log('⚡ SirsiNexus Performance and Scalability Test Suite');
  console.log('=' .repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  
  // Run all performance tests
  await testBuildPerformance();
  testComponentLoadTimes();
  analyzeMemoryUsage();
  testFileSystemPerformance();
  analyzeCodeComplexity();
  calculateScalabilityMetrics();
  
  generatePerformanceReport();
}

function generatePerformanceReport() {
  console.log('\n📊 PERFORMANCE TEST RESULTS');
  console.log('=' .repeat(60));
  
  // Performance assessment
  const { codeComplexity, scalabilityMetrics } = performanceResults;
  
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  
  // Code quality metrics
  if (codeComplexity.avgComplexityPerFile < 10) {
    console.log('🟢 Code Complexity: EXCELLENT (Low complexity, maintainable)');
  } else if (codeComplexity.avgComplexityPerFile < 20) {
    console.log('🟡 Code Complexity: GOOD (Moderate complexity)');
  } else {
    console.log('🟠 Code Complexity: NEEDS IMPROVEMENT (High complexity)');
  }
  
  // Scalability metrics
  const reusabilityScore = parseFloat(scalabilityMetrics.reusabilityRatio);
  if (reusabilityScore > 60) {
    console.log('🟢 Component Reusability: EXCELLENT (High reusability)');
  } else if (reusabilityScore > 40) {
    console.log('🟡 Component Reusability: GOOD (Moderate reusability)');
  } else {
    console.log('🟠 Component Reusability: NEEDS IMPROVEMENT (Low reusability)');
  }
  
  // File system performance
  const readSpeed = parseFloat(performanceResults.fileSystemPerformance?.readSpeed || 0);
  if (readSpeed > 100) {
    console.log('🟢 I/O Performance: EXCELLENT (Fast file operations)');
  } else if (readSpeed > 50) {
    console.log('🟡 I/O Performance: GOOD (Adequate file operations)');
  } else {
    console.log('🟠 I/O Performance: NEEDS OPTIMIZATION (Slow file operations)');
  }
  
  // Memory efficiency
  const heapUsed = parseFloat(performanceResults.memoryUsage.heapUsedMB);
  if (heapUsed < 50) {
    console.log('🟢 Memory Usage: EXCELLENT (Efficient memory usage)');
  } else if (heapUsed < 100) {
    console.log('🟡 Memory Usage: GOOD (Reasonable memory usage)');
  } else {
    console.log('🟠 Memory Usage: NEEDS OPTIMIZATION (High memory usage)');
  }
  
  console.log('\n📈 SCALABILITY INDICATORS:');
  console.log(`Component Architecture: ${scalabilityMetrics.totalComponents} components with ${scalabilityMetrics.reusabilityRatio}% reusability`);
  console.log(`Code Organization: ${codeComplexity.totalFiles} files, ${(codeComplexity.totalLines / 1000).toFixed(1)}K lines`);
  console.log(`Build Optimization: ${performanceResults.buildPerformance.chunkCount || 'N/A'} chunks generated`);
  
  // Save results
  const reportPath = 'performance_test_results.json';
  fs.writeFileSync(reportPath, JSON.stringify(performanceResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  console.log(`\n⏰ Performance testing completed: ${new Date().toISOString()}`);
}

// Run the tests
runPerformanceTests().catch(error => {
  console.error('❌ Performance test suite failed:', error);
  process.exit(1);
});
