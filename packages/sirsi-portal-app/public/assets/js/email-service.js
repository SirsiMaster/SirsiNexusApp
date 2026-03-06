/**
 * Email Service
 * Handles transactional emails through Firebase Functions
 */

class EmailService {
    constructor() {
        this.functions = null;
        this.templates = {
            welcome: 'welcome',
            passwordReset: 'password-reset',
            emailVerification: 'email-verification',
            accountDeleted: 'account-deleted',
            paymentSuccess: 'payment-success',
            paymentFailed: 'payment-failed',
            subscriptionExpiring: 'subscription-expiring',
            newsletter: 'newsletter',
            announcement: 'announcement',
            invoice: 'invoice'
        };
        
        this.config = {
            fromEmail: 'noreply@sirsi.ai',
            fromName: 'SirsiNexus',
            replyTo: 'support@sirsi.ai',
            supportEmail: 'support@sirsi.ai',
            enableTracking: true,
            enableUnsubscribe: true
        };
        
        this.emailQueue = [];
        this.maxRetries = 3;
        
        this.init();
    }
    
    init() {
        if (typeof firebase !== 'undefined' && firebase.functions) {
            this.functions = firebase.functions();
            console.log('[Email Service] Initialized with Firebase Functions');
        } else {
            console.warn('[Email Service] Firebase Functions not available');
        }
        
        // Process any queued emails
        this.processQueue();
    }
    
    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(user) {
        const emailData = {
            to: user.email,
            template: this.templates.welcome,
            data: {
                userName: user.displayName || user.email.split('@')[0],
                userEmail: user.email,
                loginUrl: `${window.location.origin}/auth/login.html`,
                dashboardUrl: `${window.location.origin}/dashboard/`,
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: 'Welcome to SirsiNexus!'
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, resetLink) {
        const emailData = {
            to: email,
            template: this.templates.passwordReset,
            data: {
                resetLink: resetLink,
                expirationTime: '1 hour',
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: 'Reset Your Password - SirsiNexus'
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send email verification
     */
    async sendEmailVerification(user, verificationLink) {
        const emailData = {
            to: user.email,
            template: this.templates.emailVerification,
            data: {
                userName: user.displayName || user.email.split('@')[0],
                verificationLink: verificationLink,
                expirationTime: '24 hours',
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: 'Verify Your Email - SirsiNexus'
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send payment success notification
     */
    async sendPaymentSuccessEmail(user, payment) {
        const emailData = {
            to: user.email,
            template: this.templates.paymentSuccess,
            data: {
                userName: user.displayName || user.email.split('@')[0],
                amount: payment.amount,
                currency: payment.currency || 'USD',
                paymentId: payment.id,
                paymentDate: new Date(payment.created * 1000).toLocaleDateString(),
                description: payment.description,
                invoiceUrl: `${window.location.origin}/invoices/${payment.id}`,
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: 'Payment Successful - SirsiNexus'
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send payment failed notification
     */
    async sendPaymentFailedEmail(user, payment, error) {
        const emailData = {
            to: user.email,
            template: this.templates.paymentFailed,
            data: {
                userName: user.displayName || user.email.split('@')[0],
                amount: payment.amount,
                currency: payment.currency || 'USD',
                errorMessage: error.message || 'Payment processing failed',
                retryUrl: `${window.location.origin}/billing/`,
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: 'Payment Failed - Action Required'
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send subscription expiring notification
     */
    async sendSubscriptionExpiringEmail(user, subscription) {
        const daysRemaining = Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24));
        
        const emailData = {
            to: user.email,
            template: this.templates.subscriptionExpiring,
            data: {
                userName: user.displayName || user.email.split('@')[0],
                planName: subscription.planName,
                expirationDate: new Date(subscription.endDate).toLocaleDateString(),
                daysRemaining: daysRemaining,
                renewUrl: `${window.location.origin}/billing/renew`,
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: `Your Subscription Expires in ${daysRemaining} Days`
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send invoice email
     */
    async sendInvoiceEmail(user, invoice) {
        const emailData = {
            to: user.email,
            template: this.templates.invoice,
            data: {
                userName: user.displayName || user.email.split('@')[0],
                invoiceNumber: invoice.number,
                invoiceDate: new Date(invoice.date).toLocaleDateString(),
                dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                amount: invoice.amount,
                currency: invoice.currency || 'USD',
                items: invoice.items,
                invoiceUrl: `${window.location.origin}/invoices/${invoice.id}`,
                paymentUrl: `${window.location.origin}/billing/pay/${invoice.id}`,
                supportEmail: this.config.supportEmail,
                year: new Date().getFullYear()
            },
            subject: `Invoice #${invoice.number} - SirsiNexus`
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Send newsletter
     */
    async sendNewsletter(recipients, content) {
        const promises = recipients.map(recipient => {
            const emailData = {
                to: recipient.email,
                template: this.templates.newsletter,
                data: {
                    userName: recipient.name || recipient.email.split('@')[0],
                    content: content,
                    unsubscribeUrl: `${window.location.origin}/unsubscribe?token=${this.generateUnsubscribeToken(recipient.email)}`,
                    preferencesUrl: `${window.location.origin}/preferences`,
                    supportEmail: this.config.supportEmail,
                    year: new Date().getFullYear()
                },
                subject: content.subject || 'SirsiNexus Newsletter'
            };
            
            return this.sendEmail(emailData);
        });
        
        return Promise.allSettled(promises);
    }
    
    /**
     * Send announcement
     */
    async sendAnnouncement(recipients, announcement) {
        const promises = recipients.map(recipient => {
            const emailData = {
                to: recipient.email,
                template: this.templates.announcement,
                data: {
                    userName: recipient.name || recipient.email.split('@')[0],
                    title: announcement.title,
                    message: announcement.message,
                    actionUrl: announcement.actionUrl,
                    actionText: announcement.actionText || 'Learn More',
                    supportEmail: this.config.supportEmail,
                    year: new Date().getFullYear()
                },
                subject: announcement.subject || 'Important Announcement from SirsiNexus'
            };
            
            return this.sendEmail(emailData);
        });
        
        return Promise.allSettled(promises);
    }
    
    /**
     * Core email sending function
     */
    async sendEmail(emailData) {
        // Add metadata
        const email = {
            ...emailData,
            from: `${this.config.fromName} <${this.config.fromEmail}>`,
            replyTo: this.config.replyTo,
            timestamp: Date.now(),
            id: this.generateEmailId()
        };
        
        // Add to queue
        this.emailQueue.push(email);
        
        // Send via Firebase Function
        if (this.functions) {
            try {
                const sendEmail = this.functions.httpsCallable('sendEmail');
                const result = await sendEmail(email);
                
                // Log success
                this.logEmailSent(email, result.data);
                
                // Remove from queue
                this.removeFromQueue(email.id);
                
                return {
                    success: true,
                    messageId: result.data.messageId,
                    email: email
                };
            } catch (error) {
                console.error('[Email Service] Failed to send email:', error);
                
                // Retry logic
                if (email.retryCount < this.maxRetries) {
                    email.retryCount = (email.retryCount || 0) + 1;
                    setTimeout(() => this.sendEmail(email), 5000 * email.retryCount);
                } else {
                    // Log failure
                    this.logEmailFailed(email, error);
                    this.removeFromQueue(email.id);
                }
                
                return {
                    success: false,
                    error: error.message,
                    email: email
                };
            }
        } else {
            // Fallback: Store for later sending
            this.storeForLaterSending(email);
            
            return {
                success: false,
                error: 'Email service not available',
                queued: true,
                email: email
            };
        }
    }
    
    /**
     * Send raw email (without template)
     */
    async sendRawEmail(to, subject, htmlContent, textContent) {
        const emailData = {
            to: to,
            subject: subject,
            html: htmlContent,
            text: textContent || this.htmlToText(htmlContent)
        };
        
        return this.sendEmail(emailData);
    }
    
    /**
     * Process email queue
     */
    async processQueue() {
        if (this.emailQueue.length === 0) return;
        
        console.log(`[Email Service] Processing ${this.emailQueue.length} queued emails`);
        
        const promises = this.emailQueue.map(email => this.sendEmail(email));
        const results = await Promise.allSettled(promises);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;
        
        console.log(`[Email Service] Queue processed: ${successful} sent, ${failed} failed`);
        
        return { successful, failed, total: results.length };
    }
    
    /**
     * Generate email ID
     */
    generateEmailId() {
        return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate unsubscribe token
     */
    generateUnsubscribeToken(email) {
        // Simple token generation - in production, use proper JWT
        return btoa(`${email}:${Date.now()}`);
    }
    
    /**
     * Convert HTML to plain text
     */
    htmlToText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
    
    /**
     * Remove email from queue
     */
    removeFromQueue(emailId) {
        this.emailQueue = this.emailQueue.filter(e => e.id !== emailId);
    }
    
    /**
     * Store email for later sending
     */
    storeForLaterSending(email) {
        try {
            const stored = JSON.parse(localStorage.getItem('emailQueue') || '[]');
            stored.push(email);
            localStorage.setItem('emailQueue', JSON.stringify(stored));
            console.log('[Email Service] Email stored for later sending');
        } catch (e) {
            console.error('[Email Service] Failed to store email:', e);
        }
    }
    
    /**
     * Load and process stored emails
     */
    async processStoredEmails() {
        try {
            const stored = JSON.parse(localStorage.getItem('emailQueue') || '[]');
            if (stored.length > 0) {
                console.log(`[Email Service] Processing ${stored.length} stored emails`);
                
                const promises = stored.map(email => this.sendEmail(email));
                await Promise.allSettled(promises);
                
                // Clear stored emails
                localStorage.removeItem('emailQueue');
            }
        } catch (e) {
            console.error('[Email Service] Failed to process stored emails:', e);
        }
    }
    
    /**
     * Log email sent
     */
    logEmailSent(email, response) {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            firebase.firestore().collection('emailLogs').add({
                ...email,
                status: 'sent',
                response: response,
                sentAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(e => console.error('[Email Service] Failed to log email:', e));
        }
    }
    
    /**
     * Log email failed
     */
    logEmailFailed(email, error) {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            firebase.firestore().collection('emailLogs').add({
                ...email,
                status: 'failed',
                error: error.message,
                failedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(e => console.error('[Email Service] Failed to log email error:', e));
        }
    }
    
    /**
     * Get email statistics
     */
    async getStatistics(startDate, endDate) {
        if (!firebase.firestore) return null;
        
        try {
            const logs = await firebase.firestore()
                .collection('emailLogs')
                .where('timestamp', '>=', startDate)
                .where('timestamp', '<=', endDate)
                .get();
            
            const stats = {
                total: logs.size,
                sent: 0,
                failed: 0,
                byTemplate: {},
                byRecipient: {}
            };
            
            logs.forEach(doc => {
                const data = doc.data();
                
                if (data.status === 'sent') stats.sent++;
                if (data.status === 'failed') stats.failed++;
                
                // Count by template
                if (data.template) {
                    stats.byTemplate[data.template] = (stats.byTemplate[data.template] || 0) + 1;
                }
                
                // Count by recipient
                if (data.to) {
                    stats.byRecipient[data.to] = (stats.byRecipient[data.to] || 0) + 1;
                }
            });
            
            stats.successRate = stats.total > 0 ? (stats.sent / stats.total * 100).toFixed(2) : 0;
            
            return stats;
        } catch (error) {
            console.error('[Email Service] Failed to get statistics:', error);
            return null;
        }
    }
    
    /**
     * Test email sending
     */
    async testEmail(recipientEmail) {
        const testEmail = {
            to: recipientEmail,
            subject: 'Test Email from SirsiNexus',
            html: `
                <h2>Test Email</h2>
                <p>This is a test email from SirsiNexus Email Service.</p>
                <p>If you received this email, the email service is working correctly!</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    This is an automated test email. No action required.
                </p>
            `,
            text: 'This is a test email from SirsiNexus Email Service.'
        };
        
        return this.sendEmail(testEmail);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.emailService = new EmailService();
        
        // Process stored emails when online
        window.addEventListener('online', () => {
            window.emailService.processStoredEmails();
        });
    });
} else {
    window.emailService = new EmailService();
    
    // Process stored emails when online
    window.addEventListener('online', () => {
        window.emailService.processStoredEmails();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
