#!/usr/bin/env node

/**
 * Fix Firebase Configuration Script
 * Updates all Firebase configurations to use the correct project ID
 */

const fs = require('fs');
const path = require('path');

// The correct Firebase configuration for sirsi-nexus-live
// You'll need to get these values from the Firebase Console
const CORRECT_CONFIG = {
  apiKey: "YOUR_API_KEY", // Get from Firebase Console
  authDomain: "sirsi-nexus-live.firebaseapp.com",
  projectId: "sirsi-nexus-live",
  storageBucket: "sirsi-nexus-live.appspot.com",
  messagingSenderId: "210890802638",
  appId: "YOUR_APP_ID", // Get from Firebase Console
  measurementId: "YOUR_MEASUREMENT_ID" // Get from Firebase Console (optional)
};

console.log(`
================================================================
FIREBASE CONFIGURATION FIX
================================================================

This script will help you update all Firebase configurations
to use the correct project: sirsi-nexus-live

IMPORTANT: You need to get the configuration values from:
https://console.firebase.google.com/project/sirsi-nexus-live/settings/general

1. Scroll down to "Your apps" section
2. If no web app exists, click "Add app" and select Web (</>) 
3. Register app with nickname "SirsiNexus Web"
4. Copy the configuration values
5. Update this script with the correct values

Current project ID that will be replaced: sirsinexus-platform
New project ID: sirsi-nexus-live

Files that will be updated:
`);

// List of files to update
const filesToUpdate = [
  'sirsinexusportal/assets/js/firebase-config.js',
  'sirsinexusportal/assets/js/firebase-auth-module.js',
  'sirsinexusportal/assets/js/auth-fix.js',
  'sirsinexusportal/config/firebase.config.js',
  'sirsinexusportal/services/auth-service.js',
  'sirsinexusportal/admin/seed-content.html',
  'sirsinexusportal/admin/seed-content-simple.html',
  'sirsinexusportal/admin/auth-test.html',
  'sirsinexusportal/developer-portal.html',
  'sirsinexusportal/investor-login.html',
  'sirsinexusportal/create-admin.html',
  'sirsinexusportal/firebase-test.html',
  'sirsinexusportal/test-functions.html',
  'sirsinexusportal/scripts/init-firebase-auth.js',
  'scripts/seed-content-web.html'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} (not found)`);
  }
});

console.log(`
================================================================
MANUAL STEPS REQUIRED:
================================================================

1. Go to: https://console.firebase.google.com/project/sirsi-nexus-live/settings/general
2. Find or create a Web app in "Your apps" section
3. Copy the Firebase configuration
4. Update the CORRECT_CONFIG object in this script
5. Run this script again with: node fix-firebase-config.js --update

================================================================
`);

// Check if we should perform the update
if (process.argv.includes('--update')) {
  console.log('Starting configuration update...\n');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  filesToUpdate.forEach(file => {
    const fullPath = path.join(__dirname, file);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        // Replace project ID
        content = content.replace(/sirsinexus-platform/g, 'sirsi-nexus-live');
        
        // Replace auth domain
        content = content.replace(/sirsinexus-platform\.firebaseapp\.com/g, 'sirsi-nexus-live.firebaseapp.com');
        
        // Replace storage bucket
        content = content.replace(/sirsinexus-platform\.appspot\.com/g, 'sirsi-nexus-live.appspot.com');
        
        // Replace messaging sender ID if different
        content = content.replace(/"messagingSenderId":\s*"[^"]+"/g, `"messagingSenderId": "${CORRECT_CONFIG.messagingSenderId}"`);
        
        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content);
          console.log(`✅ Updated: ${file}`);
          updatedCount++;
        } else {
          console.log(`⏭️  No changes needed: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${file}:`, error.message);
        errorCount++;
      }
    }
  });
  
  console.log(`
================================================================
UPDATE COMPLETE
================================================================
Files updated: ${updatedCount}
Errors: ${errorCount}

Next steps:
1. Review the changes with: git diff
2. Test authentication on the site
3. Commit changes: git add . && git commit -m "Fix Firebase configuration to use sirsi-nexus-live project"
4. Push to GitHub: git push origin main
================================================================
`);
} else {
  console.log(`
To proceed with the update after configuring the values:
  node fix-firebase-config.js --update
`);
}
