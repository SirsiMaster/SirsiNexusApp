#!/usr/bin/env node

/**
 * Version Update Script for SirsiNexus
 * Usage: node update-version.js [new-version] [environment]
 * Example: node update-version.js "0.8.0-beta" "staging"
 */

const fs = require('fs');
const path = require('path');

// Default values
const DEFAULT_VERSION = "0.7.9-alpha";
const DEFAULT_ENVIRONMENT = "production";

// Get command line arguments
const args = process.argv.slice(2);
const newVersion = args[0] || DEFAULT_VERSION;
const environment = args[1] || DEFAULT_ENVIRONMENT;

// Path to version file
const versionFilePath = path.join(__dirname, 'version.json');

// Generate build number from current timestamp
const buildNumber = new Date().toISOString().slice(0, 10).replace(/-/g, '');

// Generate commit hash placeholder (can be updated with actual git commit)
const commitHash = process.env.GITHUB_SHA || 'latest';

// Create updated version data
const versionData = {
  version: newVersion,
  build: buildNumber,
  status: getStatusFromEnvironment(environment),
  release_date: new Date().toISOString().slice(0, 10),
  release_notes: `Version ${newVersion} - Enhanced investor portal with dynamic version system and improved UI consistency`,
  environment: environment,
  commit_hash: commitHash,
  features: {
    investor_portal: true,
    committee_access: true,
    kpi_metrics: true,
    sales_strategy: true,
    product_roadmap: true,
    market_analysis: true
  },
  metadata: {
    last_updated: new Date().toISOString(),
    auto_update: true,
    cache_duration: 300
  }
};

/**
 * Get status based on environment
 */
function getStatusFromEnvironment(env) {
  switch (env.toLowerCase()) {
    case 'production':
      return 'Live';
    case 'staging':
      return 'Staging';
    case 'development':
      return 'Development';
    default:
      return 'Live';
  }
}

/**
 * Update version file
 */
function updateVersion() {
  try {
    // Write updated version data
    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
    
    console.log('✅ Version updated successfully!');
    console.log(`📦 Version: ${newVersion}`);
    console.log(`🏗️  Build: ${buildNumber}`);
    console.log(`🌍 Environment: ${environment}`);
    console.log(`📅 Release Date: ${versionData.release_date}`);
    console.log(`🔄 Last Updated: ${versionData.metadata.last_updated}`);
    
    // Show file location
    console.log(`📄 Updated: ${versionFilePath}`);
    
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

/**
 * Display current version
 */
function displayCurrentVersion() {
  try {
    if (fs.existsSync(versionFilePath)) {
      const currentVersion = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      console.log('📋 Current Version Info:');
      console.log(`   Version: ${currentVersion.version}`);
      console.log(`   Build: ${currentVersion.build}`);
      console.log(`   Environment: ${currentVersion.environment}`);
      console.log(`   Status: ${currentVersion.status}`);
      console.log(`   Last Updated: ${currentVersion.metadata?.last_updated || 'Unknown'}`);
      console.log('');
    }
  } catch (error) {
    console.log('⚠️  No existing version file found');
  }
}

// Main execution
if (args.includes('--help') || args.includes('-h')) {
  console.log('SirsiNexus Version Update Script');
  console.log('');
  console.log('Usage:');
  console.log('  node update-version.js [version] [environment]');
  console.log('');
  console.log('Examples:');
  console.log('  node update-version.js "0.8.0-beta" "staging"');
  console.log('  node update-version.js "1.0.0" "production"');
  console.log('  node update-version.js "0.7.10-alpha"');
  console.log('');
  console.log('Environments: production, staging, development');
  process.exit(0);
}

// Show current version first
displayCurrentVersion();

// Update version
updateVersion();

// Export for module usage
module.exports = {
  updateVersion,
  versionData
};
