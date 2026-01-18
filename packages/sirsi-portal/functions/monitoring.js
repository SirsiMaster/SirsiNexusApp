const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Configure email transporter for alerts
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail?.email || process.env.GMAIL_EMAIL,
        pass: functions.config().gmail?.password || process.env.GMAIL_PASSWORD
    }
});

/**
 * Monitor error logs and send alerts
 */
exports.monitorErrors = functions.firestore
    .document('error_logs/{errorId}')
    .onCreate(async (snap, context) => {
        const error = snap.data();
        
        // Check error severity
        const isCritical = error.type === 'unhandled_promise_rejection' || 
                          error.message?.includes('CRITICAL') ||
                          error.message?.includes('FATAL');
        
        // Store error metrics
        await updateErrorMetrics(error);
        
        // Send alert for critical errors
        if (isCritical) {
            await sendErrorAlert(error);
        }
        
        // Check for error rate threshold
        await checkErrorRateThreshold();
        
        return null;
    });

/**
 * Monitor performance metrics and generate reports
 */
exports.generatePerformanceReport = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        try {
            // Aggregate performance metrics
            const metrics = await aggregatePerformanceMetrics(yesterday, now);
            
            // Generate report
            const report = generateReport(metrics);
            
            // Store report
            await db.collection('performance_reports').add({
                date: now,
                period: 'daily',
                metrics: metrics,
                report: report,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Send report email
            await sendPerformanceReport(report);
            
            console.log('Performance report generated successfully');
        } catch (error) {
            console.error('Error generating performance report:', error);
        }
        
        return null;
    });

/**
 * Clean up old monitoring data
 */
exports.cleanupMonitoringData = functions.pubsub
    .schedule('every 7 days')
    .onRun(async (context) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days of data
        
        try {
            // Clean up old error logs
            const errorLogsSnapshot = await db.collection('error_logs')
                .where('timestamp', '<', cutoffDate)
                .get();
            
            const batch = db.batch();
            errorLogsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log(`Deleted ${errorLogsSnapshot.size} old error logs`);
            
            // Clean up old performance reports
            const reportsSnapshot = await db.collection('performance_reports')
                .where('date', '<', cutoffDate)
                .get();
            
            const reportBatch = db.batch();
            reportsSnapshot.forEach(doc => {
                reportBatch.delete(doc.ref);
            });
            
            await reportBatch.commit();
            console.log(`Deleted ${reportsSnapshot.size} old performance reports`);
            
        } catch (error) {
            console.error('Error cleaning up monitoring data:', error);
        }
        
        return null;
    });

/**
 * Real-time alert for high error rate
 */
exports.checkErrorRate = functions.https.onCall(async (data, context) => {
    const timeWindow = data.timeWindow || 5; // minutes
    const threshold = data.threshold || 10; // errors
    
    const cutoff = new Date(Date.now() - timeWindow * 60 * 1000);
    
    try {
        const snapshot = await db.collection('error_logs')
            .where('timestamp', '>', cutoff)
            .get();
        
        const errorCount = snapshot.size;
        
        if (errorCount > threshold) {
            await sendHighErrorRateAlert(errorCount, timeWindow);
            
            return {
                alert: true,
                errorCount: errorCount,
                message: `High error rate detected: ${errorCount} errors in ${timeWindow} minutes`
            };
        }
        
        return {
            alert: false,
            errorCount: errorCount,
            message: 'Error rate is normal'
        };
    } catch (error) {
        console.error('Error checking error rate:', error);
        throw new functions.https.HttpsError('internal', 'Failed to check error rate');
    }
});

/**
 * Get monitoring dashboard data
 */
exports.getDashboardData = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    try {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Get recent errors
        const recentErrors = await db.collection('error_logs')
            .where('timestamp', '>', last24Hours)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        // Get error counts by type
        const errorsByType = {};
        const allErrors = await db.collection('error_logs')
            .where('timestamp', '>', last7Days)
            .get();
        
        allErrors.forEach(doc => {
            const error = doc.data();
            errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
        });
        
        // Get latest performance report
        const latestReport = await db.collection('performance_reports')
            .orderBy('date', 'desc')
            .limit(1)
            .get();
        
        // Get user activity metrics
        const activeUsers = await getActiveUserCount(last24Hours);
        
        return {
            recentErrors: recentErrors.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })),
            errorsByType: errorsByType,
            totalErrors24h: recentErrors.size,
            totalErrors7d: allErrors.size,
            latestPerformanceReport: latestReport.empty ? null : latestReport.docs[0].data(),
            activeUsers: activeUsers,
            timestamp: now
        };
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get dashboard data');
    }
});

// Helper Functions

async function updateErrorMetrics(error) {
    const metricsRef = db.collection('metrics').doc('errors');
    
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(metricsRef);
            
            if (!doc.exists) {
                transaction.set(metricsRef, {
                    total: 1,
                    byType: { [error.type]: 1 },
                    lastError: error,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                const data = doc.data();
                const byType = data.byType || {};
                byType[error.type] = (byType[error.type] || 0) + 1;
                
                transaction.update(metricsRef, {
                    total: admin.firestore.FieldValue.increment(1),
                    byType: byType,
                    lastError: error,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    } catch (error) {
        console.error('Error updating error metrics:', error);
    }
}

async function sendErrorAlert(error) {
    const mailOptions = {
        from: 'SirsiNexus Monitoring <monitoring@sirsi.ai>',
        to: functions.config().alerts?.email || 'admin@sirsi.ai',
        subject: `[CRITICAL] Error Alert - ${error.type}`,
        html: `
            <h2>Critical Error Detected</h2>
            <p><strong>Type:</strong> ${error.type}</p>
            <p><strong>Message:</strong> ${error.message}</p>
            <p><strong>URL:</strong> ${error.url}</p>
            <p><strong>User:</strong> ${error.userId}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            ${error.stack ? `<p><strong>Stack:</strong><pre>${error.stack}</pre></p>` : ''}
            <hr>
            <p>This is an automated alert from SirsiNexus Monitoring.</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Error alert sent successfully');
    } catch (error) {
        console.error('Failed to send error alert:', error);
    }
}

async function checkErrorRateThreshold() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const snapshot = await db.collection('error_logs')
        .where('timestamp', '>', fiveMinutesAgo)
        .get();
    
    if (snapshot.size > 10) {
        await sendHighErrorRateAlert(snapshot.size, 5);
    }
}

async function sendHighErrorRateAlert(errorCount, timeWindow) {
    const mailOptions = {
        from: 'SirsiNexus Monitoring <monitoring@sirsi.ai>',
        to: functions.config().alerts?.email || 'admin@sirsi.ai',
        subject: '[ALERT] High Error Rate Detected',
        html: `
            <h2>High Error Rate Alert</h2>
            <p><strong>${errorCount} errors</strong> detected in the last <strong>${timeWindow} minutes</strong>.</p>
            <p>This exceeds the normal threshold and requires immediate attention.</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <hr>
            <p>Please check the monitoring dashboard for more details.</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('High error rate alert sent');
    } catch (error) {
        console.error('Failed to send high error rate alert:', error);
    }
}

async function aggregatePerformanceMetrics(startDate, endDate) {
    // This would aggregate data from Analytics API or custom metrics
    // For now, returning sample structure
    return {
        pageViews: Math.floor(Math.random() * 10000),
        uniqueUsers: Math.floor(Math.random() * 1000),
        avgSessionDuration: Math.floor(Math.random() * 300),
        bounceRate: (Math.random() * 100).toFixed(2),
        avgPageLoadTime: (Math.random() * 5).toFixed(2),
        errors: Math.floor(Math.random() * 50),
        conversions: Math.floor(Math.random() * 100)
    };
}

function generateReport(metrics) {
    return {
        summary: `Daily performance report for ${new Date().toDateString()}`,
        highlights: [
            `${metrics.pageViews} total page views`,
            `${metrics.uniqueUsers} unique users`,
            `${metrics.avgSessionDuration}s average session duration`,
            `${metrics.bounceRate}% bounce rate`,
            `${metrics.avgPageLoadTime}s average page load time`,
            `${metrics.errors} errors logged`,
            `${metrics.conversions} conversions`
        ],
        recommendations: generateRecommendations(metrics)
    };
}

function generateRecommendations(metrics) {
    const recommendations = [];
    
    if (parseFloat(metrics.avgPageLoadTime) > 3) {
        recommendations.push('Page load time is high. Consider optimizing assets and implementing lazy loading.');
    }
    
    if (parseFloat(metrics.bounceRate) > 50) {
        recommendations.push('High bounce rate detected. Review landing page content and user experience.');
    }
    
    if (metrics.errors > 20) {
        recommendations.push('Error rate is elevated. Review error logs for patterns and fixes.');
    }
    
    return recommendations;
}

async function sendPerformanceReport(report) {
    const mailOptions = {
        from: 'SirsiNexus Monitoring <monitoring@sirsi.ai>',
        to: functions.config().reports?.email || 'admin@sirsi.ai',
        subject: `Daily Performance Report - ${new Date().toDateString()}`,
        html: `
            <h2>${report.summary}</h2>
            <h3>Key Metrics</h3>
            <ul>
                ${report.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
            ${report.recommendations.length > 0 ? `
                <h3>Recommendations</h3>
                <ul>
                    ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            ` : ''}
            <hr>
            <p>Full dashboard available at <a href="https://sirsi.ai/admin/monitoring">sirsi.ai/admin/monitoring</a></p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Performance report sent successfully');
    } catch (error) {
        console.error('Failed to send performance report:', error);
    }
}

async function getActiveUserCount(since) {
    // This would query Analytics or Auth data
    // For now, returning sample count
    return Math.floor(Math.random() * 100);
}

module.exports = {
    monitorErrors: exports.monitorErrors,
    generatePerformanceReport: exports.generatePerformanceReport,
    cleanupMonitoringData: exports.cleanupMonitoringData,
    checkErrorRate: exports.checkErrorRate,
    getDashboardData: exports.getDashboardData
};
