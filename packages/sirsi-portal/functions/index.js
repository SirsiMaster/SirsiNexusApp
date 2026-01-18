const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Import monitoring functions
const monitoringFunctions = require('./monitoring');

// Export all Cloud Functions
module.exports = {
    // Monitoring & Analytics Functions
    monitorErrors: monitoringFunctions.monitorErrors,
    generatePerformanceReport: monitoringFunctions.generatePerformanceReport,
    cleanupMonitoringData: monitoringFunctions.cleanupMonitoringData,
    checkErrorRate: monitoringFunctions.checkErrorRate,
    getDashboardData: monitoringFunctions.getDashboardData,
    
    // You can add other function modules here as they are created
    // Example:
    // ...require('./auth'),
    // ...require('./api'),
    // ...require('./payments'),
};
