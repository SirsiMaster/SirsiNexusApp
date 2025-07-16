const nodemailer = require('nodemailer');
const cron = require('node-cron');

class NotificationService {
  constructor(io = null) {
    this.io = io;
    this.transporter = null;
    this.userPreferences = new Map();
    this.isHealthy = false;
  }

  async initialize() {
    try {
      // Configure email transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        } : undefined,
        // For development, use ethereal email or local SMTP
        ...(process.env.NODE_ENV === 'development' && {
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
          }
        })
      });

      // Verify email configuration
      if (process.env.SMTP_HOST || process.env.NODE_ENV === 'development') {
        await this.transporter.verify();
        console.log('Email service configured successfully');
      }

      // Schedule weekly reports
      this.scheduleWeeklyReports();
      
      this.isHealthy = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      // Don't throw - allow app to continue without email
      this.isHealthy = false;
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    try {
      const emailContent = {
        from: process.env.FROM_EMAIL || 'noreply@sirsinexus.com',
        to: user.email,
        subject: 'Welcome to SirsiNexus - AI Infrastructure Management',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to SirsiNexus</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">AI-Powered Infrastructure Management</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333;">Hi ${user.name}!</h2>
              
              <p>Welcome to SirsiNexus! Your account has been successfully created and you're ready to start managing your infrastructure with AI-powered insights.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #495057; margin-top: 0;">Get Started:</h3>
                <ul style="color: #6c757d; line-height: 1.6;">
                  <li>Configure your cloud provider credentials</li>
                  <li>Set up infrastructure monitoring</li>
                  <li>Enable AI optimization suggestions</li>
                  <li>Customize your notification preferences</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" 
                   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Configure Settings
                </a>
              </div>
              
              <p style="color: #6c757d; font-size: 14px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
              <p>© ${new Date().getFullYear()} SirsiNexus. All rights reserved.</p>
            </div>
          </div>
        `
      };

      if (this.transporter) {
        await this.transporter.sendMail(emailContent);
        console.log(`Welcome email sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  // Send security alert email
  async sendSecurityAlert(user, alertType, details) {
    try {
      const emailContent = {
        from: process.env.FROM_EMAIL || 'security@sirsinexus.com',
        to: user.email,
        subject: `🔒 Security Alert - ${alertType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc3545; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🔒 Security Alert</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #dc3545;">Security Event Detected</h2>
              
              <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Alert Type:</strong> ${alertType}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                <strong>IP Address:</strong> ${details.ip || 'Unknown'}<br>
                <strong>User Agent:</strong> ${details.userAgent || 'Unknown'}
              </div>
              
              <p>If this was you, you can ignore this email. If you don't recognize this activity, please:</p>
              
              <ul>
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
                <li>Review your account settings</li>
                <li>Contact support if needed</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/security" 
                   style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review Security Settings
                </a>
              </div>
            </div>
          </div>
        `
      };

      if (this.transporter) {
        await this.transporter.sendMail(emailContent);
        console.log(`Security alert sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // Send infrastructure alert
  async sendInfrastructureAlert(user, resource, alertType, message) {
    try {
      const emailContent = {
        from: process.env.FROM_EMAIL || 'alerts@sirsinexus.com',
        to: user.email,
        subject: `⚠️ Infrastructure Alert - ${resource.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ffc107; padding: 20px; text-align: center;">
              <h1 style="color: #212529; margin: 0;">⚠️ Infrastructure Alert</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #856404;">Alert: ${alertType}</h2>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Resource:</strong> ${resource.name}<br>
                <strong>Type:</strong> ${resource.type}<br>
                <strong>Provider:</strong> ${resource.provider}<br>
                <strong>Region:</strong> ${resource.region}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </div>
              
              <p><strong>Details:</strong> ${message}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/infrastructure" 
                   style="background: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Infrastructure
                </a>
              </div>
            </div>
          </div>
        `
      };

      if (this.transporter) {
        await this.transporter.sendMail(emailContent);
        console.log(`Infrastructure alert sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Failed to send infrastructure alert:', error);
    }
  }

  // Send weekly report
  async sendWeeklyReport(user, reportData) {
    try {
      const emailContent = {
        from: process.env.FROM_EMAIL || 'reports@sirsinexus.com',
        to: user.email,
        subject: `📊 Weekly Infrastructure Report - ${new Date().toLocaleDateString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">📊 Weekly Report</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #155724;">Infrastructure Summary</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="background: #d4edda; padding: 15px; border-radius: 8px;">
                  <h3 style="margin-top: 0; color: #155724;">Resources</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #155724;">${reportData.totalResources || 0}</p>
                </div>
                <div style="background: #cce7ff; padding: 15px; border-radius: 8px;">
                  <h3 style="margin-top: 0; color: #004085;">Cost Savings</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #004085;">$${reportData.costSavings || 0}</p>
                </div>
              </div>
              
              <h3 style="color: #495057;">This Week's Highlights:</h3>
              <ul style="color: #6c757d; line-height: 1.6;">
                <li>${reportData.optimizations || 0} AI optimizations applied</li>
                <li>${reportData.alerts || 0} alerts resolved</li>
                <li>${reportData.uptime || '99.9%'} average uptime</li>
                <li>${reportData.scaling || 0} auto-scaling events</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                   style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Full Dashboard
                </a>
              </div>
            </div>
          </div>
        `
      };

      if (this.transporter) {
        await this.transporter.sendMail(emailContent);
        console.log(`Weekly report sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Failed to send weekly report:', error);
    }
  }

  // Real-time notification via WebSocket
  async sendRealTimeNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.created_at || new Date().toISOString()
      });
    }
  }

  // Setting toggle methods
  async toggleEmailNotifications(userId, enabled) {
    this.userPreferences.set(`${userId}_email`, enabled);
    console.log(`Email notifications ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
  }

  async togglePushNotifications(userId, enabled) {
    this.userPreferences.set(`${userId}_push`, enabled);
    console.log(`Push notifications ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
  }

  async toggleSecurityAlerts(userId, enabled) {
    this.userPreferences.set(`${userId}_security`, enabled);
    console.log(`Security alerts ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
  }

  async toggleDeploymentAlerts(userId, enabled) {
    this.userPreferences.set(`${userId}_deployment`, enabled);
    console.log(`Deployment alerts ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
  }

  async togglePerformanceAlerts(userId, enabled) {
    this.userPreferences.set(`${userId}_performance`, enabled);
    console.log(`Performance alerts ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
  }

  async enableWeeklyReports(userId) {
    this.userPreferences.set(`${userId}_weekly`, true);
    console.log(`Weekly reports enabled for user ${userId}`);
  }

  async disableWeeklyReports(userId) {
    this.userPreferences.set(`${userId}_weekly`, false);
    console.log(`Weekly reports disabled for user ${userId}`);
  }

  // Check if user has specific notification type enabled
  isNotificationEnabled(userId, type) {
    return this.userPreferences.get(`${userId}_${type}`) !== false; // Default to true
  }

  // Schedule weekly reports
  scheduleWeeklyReports() {
    // Run every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('Generating weekly reports...');
      
      // In a real implementation, you would:
      // 1. Query all users who have weekly reports enabled
      // 2. Generate report data for each user
      // 3. Send the reports
      
      // For now, this is a placeholder
      console.log('Weekly reports job completed');
    });
  }

  // Send notification based on user preferences
  async sendNotification(userId, type, title, message, data = {}, user = null) {
    try {
      // Check if this notification type is enabled for the user
      if (!this.isNotificationEnabled(userId, type)) {
        return;
      }

      // Send real-time notification via WebSocket
      const notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        data,
        created_at: new Date().toISOString()
      };

      await this.sendRealTimeNotification(userId, notification);

      // Send email notification if enabled and user provided
      if (user && this.isNotificationEnabled(userId, 'email')) {
        switch (type) {
          case 'security':
            await this.sendSecurityAlert(user, title, data);
            break;
          case 'infrastructure':
            if (data.resource) {
              await this.sendInfrastructureAlert(user, data.resource, title, message);
            }
            break;
          // Add more email types as needed
        }
      }

    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  isHealthy() {
    return this.isHealthy;
  }

  setWebSocketServer(io) {
    this.io = io;
  }
}

module.exports = NotificationService;
