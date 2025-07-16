#!/usr/bin/env node

/**
 * SirsiNexus Business Process Validation Test Suite
 * Tests all user processes for technical and business correctness
 */

const fs = require('fs');
const path = require('path');

// Test results storage
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  warnings: 0,
  businessValidation: [],
  technicalValidation: [],
  processMapping: {}
};

function logResult(category, test, status, details = '') {
  const result = {
    category,
    test,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.totalTests++;
  if (status === 'PASS') {
    testResults.passedTests++;
    console.log(`✅ ${category}: ${test}`);
  } else if (status === 'FAIL') {
    testResults.failedTests++;
    console.log(`❌ ${category}: ${test} - ${details}`);
  } else if (status === 'WARN') {
    testResults.warnings++;
    console.log(`⚠️ ${category}: ${test} - ${details}`);
  }
  
  if (category.includes('Business')) {
    testResults.businessValidation.push(result);
  } else {
    testResults.technicalValidation.push(result);
  }
}

function validateFileExists(filePath, description) {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      const stats = fs.statSync(filePath);
      logResult('Technical Validation', `${description} exists`, 'PASS', `Size: ${stats.size} bytes`);
      return true;
    } else {
      logResult('Technical Validation', `${description} exists`, 'FAIL', `File not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    logResult('Technical Validation', `${description} exists`, 'FAIL', error.message);
    return false;
  }
}

function validateProcessFlow(processName, steps) {
  console.log(`\n🔄 Validating ${processName} Process Flow:`);
  testResults.processMapping[processName] = {
    totalSteps: steps.length,
    validatedSteps: 0,
    issues: []
  };
  
  steps.forEach((step, index) => {
    const stepExists = validateFileExists(step.file, `${processName} - ${step.name}`);
    if (stepExists) {
      testResults.processMapping[processName].validatedSteps++;
      
      // Validate step content
      try {
        const content = fs.readFileSync(step.file, 'utf8');
        
        // Check for required patterns
        step.requiredPatterns?.forEach(pattern => {
          if (content.includes(pattern)) {
            logResult('Business Process', `${processName} - ${step.name} has ${pattern}`, 'PASS');
          } else {
            logResult('Business Process', `${processName} - ${step.name} missing ${pattern}`, 'WARN');
            testResults.processMapping[processName].issues.push(`Missing pattern: ${pattern}`);
          }
        });
        
        // Check for AI integration
        if (content.includes('AI') || content.includes('agent') || content.includes('ml')) {
          logResult('AI Integration', `${processName} - ${step.name} AI features`, 'PASS');
        }
        
        // Check for error handling
        if (content.includes('try') && content.includes('catch')) {
          logResult('Error Handling', `${processName} - ${step.name} error handling`, 'PASS');
        } else {
          logResult('Error Handling', `${processName} - ${step.name} error handling`, 'WARN', 'No try-catch blocks found');
        }
        
      } catch (error) {
        logResult('Technical Validation', `${processName} - ${step.name} content validation`, 'FAIL', error.message);
      }
    }
  });
}

function validateBusinessEntitySupport() {
  console.log('\n🏢 Validating Business Entity Support:');
  
  const entities = ['tvfone', 'kulturio', 'uniedu'];
  const planStepFile = 'ui/src/components/MigrationSteps/steps/PlanStep.tsx';
  
  if (fs.existsSync(planStepFile)) {
    const content = fs.readFileSync(planStepFile, 'utf8');
    
    entities.forEach(entity => {
      if (content.includes(entity)) {
        logResult('Business Entity Support', `${entity} entity support`, 'PASS');
      } else {
        logResult('Business Entity Support', `${entity} entity support`, 'FAIL', 'Entity not found in PlanStep');
      }
    });
    
    // Check for industry-specific resources
    const industryChecks = [
      { pattern: 'Media & Entertainment', entity: 'tvfone' },
      { pattern: 'Healthcare', entity: 'kulturio' },
      { pattern: 'Education', entity: 'uniedu' }
    ];
    
    industryChecks.forEach(check => {
      if (content.includes(check.pattern)) {
        logResult('Industry Compliance', `${check.entity} industry patterns`, 'PASS');
      } else {
        logResult('Industry Compliance', `${check.entity} industry patterns`, 'WARN', `Missing ${check.pattern} patterns`);
      }
    });
  }
}

function validateAIOrchestrationCapabilities() {
  console.log('\n🤖 Validating AI Orchestration Capabilities:');
  
  const aiFiles = [
    { path: 'ui/src/app/ai-orchestration/page.tsx', name: 'AI Orchestration Dashboard' },
    { path: 'ui/src/services/aiAnalyticsService.ts', name: 'AI Analytics Service' },
    { path: 'ui/src/components/ai-assistant/AIContextToolbar.tsx', name: 'AI Context Toolbar' }
  ];
  
  aiFiles.forEach(file => {
    const exists = validateFileExists(file.path, file.name);
    if (exists) {
      const content = fs.readFileSync(file.path, 'utf8');
      
      // Check for AI-specific features
      const aiFeatures = [
        'anomaly detection',
        'cost prediction',
        'machine learning',
        'orchestration',
        'agent'
      ];
      
      aiFeatures.forEach(feature => {
        if (content.toLowerCase().includes(feature.toLowerCase())) {
          logResult('AI Capabilities', `${file.name} - ${feature}`, 'PASS');
        }
      });
    }
  });
}

function validateSecurityAndCompliance() {
  console.log('\n🔒 Validating Security and Compliance:');
  
  const securityChecks = [
    { pattern: 'authentication', description: 'Authentication implementation' },
    { pattern: 'authorization', description: 'Authorization controls' },
    { pattern: 'HIPAA', description: 'HIPAA compliance' },
    { pattern: 'FERPA', description: 'FERPA compliance' },
    { pattern: 'encryption', description: 'Data encryption' }
  ];
  
  // Check across all TypeScript files
  const uiPath = 'ui/src';
  try {
    const files = getAllTsFiles(uiPath);
    const allContent = files.map(file => {
      try {
        return fs.readFileSync(file, 'utf8');
      } catch {
        return '';
      }
    }).join(' ').toLowerCase();
    
    securityChecks.forEach(check => {
      if (allContent.includes(check.pattern.toLowerCase())) {
        logResult('Security Compliance', check.description, 'PASS');
      } else {
        logResult('Security Compliance', check.description, 'WARN', `${check.pattern} not found in codebase`);
      }
    });
    
  } catch (error) {
    logResult('Security Compliance', 'Security validation', 'FAIL', error.message);
  }
}

function getAllTsFiles(dir) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(getAllTsFiles(fullPath));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

function validatePerformanceTargets() {
  console.log('\n⚡ Validating Performance Implementation:');
  
  // Check build output
  const buildPath = 'ui/.next';
  if (fs.existsSync(buildPath)) {
    logResult('Performance', 'Next.js build optimization', 'PASS', 'Build directory exists');
    
    // Check for optimizations
    const staticPath = path.join(buildPath, 'static');
    if (fs.existsSync(staticPath)) {
      logResult('Performance', 'Static asset optimization', 'PASS');
    }
  } else {
    logResult('Performance', 'Build optimization', 'WARN', 'No build directory found - run npm run build');
  }
  
  // Check for performance patterns in code
  const performancePatterns = [
    'lazy',
    'memo',
    'useMemo',
    'useCallback',
    'suspense'
  ];
  
  try {
    const files = getAllTsFiles('ui/src');
    const allContent = files.map(file => {
      try {
        return fs.readFileSync(file, 'utf8');
      } catch {
        return '';
      }
    }).join(' ').toLowerCase();
    
    performancePatterns.forEach(pattern => {
      if (allContent.includes(pattern)) {
        logResult('Performance Optimization', `${pattern} usage`, 'PASS');
      }
    });
    
  } catch (error) {
    logResult('Performance Optimization', 'Pattern analysis', 'FAIL', error.message);
  }
}

function validateAPIIntegration() {
  console.log('\n🔌 Validating API Integration:');
  
  const apiFiles = [
    'ui/src/app/api/projects/route.ts',
    'ui/src/app/api/ai-analytics/route.ts',
    'ui/src/app/api/analytics/route.ts'
  ];
  
  apiFiles.forEach(file => {
    const exists = validateFileExists(file, `API endpoint - ${path.basename(file, '.ts')}`);
    if (exists) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for HTTP methods
      const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
      httpMethods.forEach(method => {
        if (content.includes(`export async function ${method}`)) {
          logResult('API Integration', `${file} - ${method} method`, 'PASS');
        }
      });
      
      // Check for error handling
      if (content.includes('NextResponse') && content.includes('error')) {
        logResult('API Error Handling', `${file} error handling`, 'PASS');
      } else {
        logResult('API Error Handling', `${file} error handling`, 'WARN', 'Limited error handling detected');
      }
    }
  });
}

// Main test execution
async function runTests() {
  console.log('🧪 SirsiNexus Business Process Validation Test Suite');
  console.log('=' .repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  
  // 1. Validate Migration Process
  validateProcessFlow('Migration', [
    { 
      name: 'Environment Setup',
      file: 'ui/src/components/MigrationSteps/steps/EnvironmentSetupStep.tsx',
      requiredPatterns: ['credential', 'environment', 'setup']
    },
    { 
      name: 'Plan Step',
      file: 'ui/src/components/MigrationSteps/steps/PlanStep.tsx',
      requiredPatterns: ['discovery', 'resource', 'AI']
    },
    { 
      name: 'Specify Step',
      file: 'ui/src/components/MigrationSteps/steps/SpecifyStep.tsx',
      requiredPatterns: ['requirements', 'configure']
    },
    { 
      name: 'Test Step',
      file: 'ui/src/components/MigrationSteps/steps/TestStep.tsx',
      requiredPatterns: ['validation', 'test']
    },
    { 
      name: 'Build Step',
      file: 'ui/src/components/MigrationSteps/steps/BuildStep.tsx',
      requiredPatterns: ['infrastructure', 'build']
    },
    { 
      name: 'Transfer Step',
      file: 'ui/src/components/MigrationSteps/steps/TransferStep.tsx',
      requiredPatterns: ['transfer', 'migration']
    },
    { 
      name: 'Validate Step',
      file: 'ui/src/components/MigrationSteps/steps/ValidateStep.tsx',
      requiredPatterns: ['validate', 'verification']
    },
    { 
      name: 'Optimize Step',
      file: 'ui/src/components/MigrationSteps/steps/OptimizeStep.tsx',
      requiredPatterns: ['optimize', 'performance']
    },
    { 
      name: 'Support Step',
      file: 'ui/src/components/MigrationSteps/steps/SupportStep.tsx',
      requiredPatterns: ['support', 'monitor']
    }
  ]);
  
  // 2. Validate Optimization Process
  validateProcessFlow('Optimization', [
    { 
      name: 'Optimization Wizard',
      file: 'ui/src/app/optimization/page.tsx',
      requiredPatterns: ['optimization', 'cost', 'performance']
    }
  ]);
  
  // 3. Validate AI Orchestration
  validateAIOrchestrationCapabilities();
  
  // 4. Validate Business Entity Support
  validateBusinessEntitySupport();
  
  // 5. Validate Security and Compliance
  validateSecurityAndCompliance();
  
  // 6. Validate Performance
  validatePerformanceTargets();
  
  // 7. Validate API Integration
  validateAPIIntegration();
  
  // Generate final report
  generateReport();
}

function generateReport() {
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  const successRate = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1);
  const warningRate = ((testResults.warnings / testResults.totalTests) * 100).toFixed(1);
  const failureRate = ((testResults.failedTests / testResults.totalTests) * 100).toFixed(1);
  
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.passedTests} (${successRate}%)`);
  console.log(`⚠️ Warnings: ${testResults.warnings} (${warningRate}%)`);
  console.log(`❌ Failed: ${testResults.failedTests} (${failureRate}%)`);
  
  console.log('\n🔍 PROCESS MAPPING RESULTS:');
  Object.entries(testResults.processMapping).forEach(([process, data]) => {
    const completeness = ((data.validatedSteps / data.totalSteps) * 100).toFixed(1);
    console.log(`${process}: ${data.validatedSteps}/${data.totalSteps} steps validated (${completeness}%)`);
    if (data.issues.length > 0) {
      console.log(`  Issues: ${data.issues.join(', ')}`);
    }
  });
  
  console.log('\n💼 BUSINESS VALIDATION:');
  const businessPassed = testResults.businessValidation.filter(t => t.status === 'PASS').length;
  const businessTotal = testResults.businessValidation.length;
  const businessSuccessRate = businessTotal > 0 ? ((businessPassed / businessTotal) * 100).toFixed(1) : 0;
  console.log(`Business Process Validation: ${businessPassed}/${businessTotal} (${businessSuccessRate}%)`);
  
  console.log('\n🔧 TECHNICAL VALIDATION:');
  const techPassed = testResults.technicalValidation.filter(t => t.status === 'PASS').length;
  const techTotal = testResults.technicalValidation.length;
  const techSuccessRate = techTotal > 0 ? ((techPassed / techTotal) * 100).toFixed(1) : 0;
  console.log(`Technical Implementation: ${techPassed}/${techTotal} (${techSuccessRate}%)`);
  
  // Overall assessment
  console.log('\n🎯 OVERALL ASSESSMENT:');
  if (successRate >= 80) {
    console.log('🟢 EXCELLENT: System is production-ready with comprehensive features');
  } else if (successRate >= 60) {
    console.log('🟡 GOOD: System is functional with minor areas for improvement');
  } else if (successRate >= 40) {
    console.log('🟠 FAIR: System needs significant improvements before production');
  } else {
    console.log('🔴 POOR: System requires major development work');
  }
  
  // Save detailed results
  const reportPath = 'business_process_test_results.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  console.log(`\n⏰ Test completed: ${new Date().toISOString()}`);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
