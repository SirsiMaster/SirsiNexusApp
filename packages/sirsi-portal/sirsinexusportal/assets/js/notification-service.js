/**
 * Notification Service
 * Handles in-app notifications, push notifications, and alerts
 */

class NotificationService {
    constructor() {
        this.messaging = null;
        this.token = null;
        this.notifications = [];
        this.maxNotifications = 50;
        this.unreadCount = 0;
        
        this.config = {
            enablePush: true,
            enableInApp: true,
            enableSound: true,
            enableDesktop: true,
            persistNotifications: true,
            vapidKey: 'BKagOny0KF_2pCJQ3m...', // Replace with your VAPID key
            serviceWorkerPath: '/firebase-messaging-sw.js'
        };
        
        this.notificationTypes = {
            info: { icon: 'ℹ️', color: 'blue' },
            success: { icon: '✅', color: 'green' },
            warning: { icon: '⚠️', color: 'yellow' },
            error: { icon: '❌', color: 'red' },
            message: { icon: '💬', color: 'purple' },
            payment: { icon: '💳', color: 'green' },
            security: { icon: '🔒', color: 'orange' },
            system: { icon: '⚙️', color: 'gray' }
        };
        
        this.init();
    }
    
    async init() {
        // Initialize Firebase Cloud Messaging
        if (typeof firebase !== 'undefined' && firebase.messaging) {
            try {
                this.messaging = firebase.messaging();
                console.log('[Notification Service] Firebase Messaging initialized');
                
                // Request permission and get token
                await this.requestPermission();
                
                // Set up message handlers
                this.setupMessageHandlers();
                
                // Load persisted notifications
                this.loadPersistedNotifications();
                
            } catch (error) {
                console.error('[Notification Service] Failed to initialize:', error);
            }
        } else {
            console.warn('[Notification Service] Firebase Messaging not available');
        }
        
        // Set up in-app notification container
        this.createNotificationContainer();
        
        // Request browser notification permission
        if (this.config.enableDesktop) {
            this.requestBrowserPermission();
        }
    }
    
    /**
     * Request permission and get FCM token
     */
    async requestPermission() {
        if (!this.messaging) return;
        
        try {
            // Request permission
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('[Notification Service] Permission granted');
                
                // Get token
                this.token = await this.messaging.getToken({
                    vapidKey: this.config.vapidKey
                });
                
                if (this.token) {
                    console.log('[Notification Service] FCM Token:', this.token);
                    
                    // Save token to server
                    await this.saveTokenToServer(this.token);
                    
                    // Monitor token refresh
                    this.setupTokenRefresh();
                } else {
                    console.warn('[Notification Service] No registration token available');
                }
            } else {
                console.warn('[Notification Service] Permission denied');
            }
        } catch (error) {
            console.error('[Notification Service] Error getting permission:', error);
        }
    }
    
    /**
     * Set up message handlers
     */
    setupMessageHandlers() {
        if (!this.messaging) return;
        
        // Handle foreground messages
        this.messaging.onMessage((payload) => {
            console.log('[Notification Service] Message received:', payload);
            
            // Show notification
            this.showNotification({
                title: payload.notification?.title || 'New Notification',
                body: payload.notification?.body || '',
                icon: payload.notification?.icon,
                data: payload.data,
                timestamp: Date.now()
            });
            
            // Update unread count
            this.incrementUnreadCount();
        });
    }
    
    /**
     * Set up token refresh monitoring
     */
    setupTokenRefresh() {
        if (!this.messaging) return;
        
        this.messaging.onTokenRefresh(async () => {
            try {
                const newToken = await this.messaging.getToken({
                    vapidKey: this.config.vapidKey
                });
                
                if (newToken && newToken !== this.token) {
                    console.log('[Notification Service] Token refreshed');
                    this.token = newToken;
                    await this.saveTokenToServer(newToken);
                }
            } catch (error) {
                console.error('[Notification Service] Error refreshing token:', error);
            }
        });
    }
    
    /**
     * Save FCM token to server
     */
    async saveTokenToServer(token) {
        if (!firebase.auth || !firebase.firestore) return;
        
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        try {
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .update({
                    fcmToken: token,
                    fcmTokenUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            console.log('[Notification Service] Token saved to server');
        } catch (error) {
            console.error('[Notification Service] Failed to save token:', error);
        }
    }
    
    /**
     * Request browser notification permission
     */
    async requestBrowserPermission() {
        if (!('Notification' in window)) {
            console.warn('[Notification Service] Browser notifications not supported');
            return;
        }
        
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('[Notification Service] Browser permission:', permission);
        }
    }
    
    /**
     * Create notification container for in-app notifications
     */
    createNotificationContainer() {
        // Check if container already exists
        if (document.getElementById('notification-container')) return;
        
        // Create container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            pointer-events: none;
        `;
        
        document.body.appendChild(container);
        
        // Create notification bell
        this.createNotificationBell();
    }
    
    /**
     * Create notification bell icon
     */
    createNotificationBell() {
        // Check if bell already exists
        if (document.getElementById('notification-bell')) return;
        
        const bell = document.createElement('div');
        bell.id = 'notification-bell';
        bell.innerHTML = `
            <style>
                #notification-bell {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: #1f2937;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    z-index: 9998;
                    transition: transform 0.2s;
                }
                #notification-bell:hover {
                    transform: scale(1.1);
                }
                #notification-bell .bell-icon {
                    font-size: 24px;
                }
                #notification-bell .badge {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: #ef4444;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                }
            </style>
            <span class="bell-icon">🔔</span>
            <span class="badge" style="display: none;">0</span>
        `;
        
        bell.onclick = () => this.toggleNotificationPanel();
        document.body.appendChild(bell);
    }
    
    /**
     * Show notification (in-app)
     */
    showNotification(options) {
        const {
            title,
            body,
            type = 'info',
            duration = 5000,
            persistent = false,
            actions = [],
            data = {}
        } = options;
        
        // Create notification object
        const notification = {
            id: this.generateNotificationId(),
            title,
            body,
            type,
            timestamp: Date.now(),
            read: false,
            data,
            actions
        };
        
        // Add to notifications array
        this.notifications.unshift(notification);
        
        // Trim if needed
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.pop();
        }
        
        // Persist if enabled
        if (this.config.persistNotifications) {
            this.persistNotifications();
        }
        
        // Show in-app notification
        if (this.config.enableInApp) {
            this.showInAppNotification(notification, duration, persistent);
        }
        
        // Show desktop notification
        if (this.config.enableDesktop && Notification.permission === 'granted') {
            this.showDesktopNotification(notification);
        }
        
        // Play sound if enabled
        if (this.config.enableSound) {
            this.playNotificationSound();
        }
        
        // Update badge
        this.updateBadge();
        
        return notification;
    }
    
    /**
     * Show in-app notification
     */
    showInAppNotification(notification, duration, persistent) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const typeConfig = this.notificationTypes[notification.type] || this.notificationTypes.info;
        
        const notificationEl = document.createElement('div');
        notificationEl.id = `notification-${notification.id}`;
        notificationEl.style.cssText = `
            background: white;
            border-left: 4px solid ${this.getColor(typeConfig.color)};
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            pointer-events: auto;
            animation: slideIn 0.3s ease-out;
            position: relative;
        `;
        
        notificationEl.innerHTML = `
            <style>
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
            <div style="display: flex; align-items: start;">
                <span style="font-size: 24px; margin-right: 12px;">${typeConfig.icon}</span>
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-weight: 600; color: #1f2937;">${notification.title}</h4>
                    ${notification.body ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${notification.body}</p>` : ''}
                    ${notification.actions.length > 0 ? this.renderActions(notification.actions) : ''}
                </div>
                <button onclick="window.notificationService.dismissNotification('${notification.id}')" 
                        style="background: none; border: none; cursor: pointer; padding: 4px; color: #9ca3af;">
                    ✕
                </button>
            </div>
        `;
        
        container.appendChild(notificationEl);
        
        // Auto-dismiss if not persistent
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.dismissNotification(notification.id);
            }, duration);
        }
    }
    
    /**
     * Show desktop notification
     */
    showDesktopNotification(notification) {
        const typeConfig = this.notificationTypes[notification.type] || this.notificationTypes.info;
        
        const desktopNotification = new Notification(notification.title, {
            body: notification.body,
            icon: '/assets/images/Sirsi_Logo_300ppi_cguiyg.png',
            badge: '/assets/images/badge.png',
            tag: notification.id,
            requireInteraction: false,
            data: notification.data
        });
        
        desktopNotification.onclick = () => {
            window.focus();
            this.handleNotificationClick(notification);
            desktopNotification.close();
        };
    }
    
    /**
     * Render notification actions
     */
    renderActions(actions) {
        return `
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                ${actions.map(action => `
                    <button onclick="window.notificationService.handleAction('${action.id}')"
                            style="padding: 6px 12px; background: ${action.primary ? '#3b82f6' : '#e5e7eb'}; 
                                   color: ${action.primary ? 'white' : '#374151'}; border: none; 
                                   border-radius: 4px; cursor: pointer; font-size: 14px;">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Handle notification action
     */
    handleAction(actionId) {
        console.log('[Notification Service] Action clicked:', actionId);
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('notificationAction', {
            detail: { actionId }
        }));
    }
    
    /**
     * Handle notification click
     */
    handleNotificationClick(notification) {
        // Mark as read
        this.markAsRead(notification.id);
        
        // Navigate if URL provided
        if (notification.data?.url) {
            window.location.href = notification.data.url;
        }
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('notificationClick', {
            detail: notification
        }));
    }
    
    /**
     * Dismiss notification
     */
    dismissNotification(notificationId) {
        const el = document.getElementById(`notification-${notificationId}`);
        if (el) {
            el.style.animation = 'slideOut 0.3s ease-in';
            el.style.animationFillMode = 'forwards';
            
            setTimeout(() => {
                el.remove();
            }, 300);
        }
        
        // Mark as dismissed
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.dismissed = true;
            this.persistNotifications();
        }
    }
    
    /**
     * Mark notification as read
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.decrementUnreadCount();
            this.persistNotifications();
        }
    }
    
    /**
     * Mark all as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.updateBadge();
        this.persistNotifications();
    }
    
    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.updateBadge();
        this.persistNotifications();
        
        // Clear UI
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    /**
     * Toggle notification panel
     */
    toggleNotificationPanel() {
        // This would open a full notification panel
        console.log('[Notification Service] Toggle panel - implement UI');
        
        // For now, show recent notifications
        this.showRecentNotifications();
    }
    
    /**
     * Show recent notifications
     */
    showRecentNotifications() {
        const recent = this.notifications.slice(0, 5);
        
        recent.forEach(notification => {
            if (!notification.dismissed) {
                this.showInAppNotification(notification, 0, true);
            }
        });
    }
    
    /**
     * Increment unread count
     */
    incrementUnreadCount() {
        this.unreadCount++;
        this.updateBadge();
    }
    
    /**
     * Decrement unread count
     */
    decrementUnreadCount() {
        if (this.unreadCount > 0) {
            this.unreadCount--;
            this.updateBadge();
        }
    }
    
    /**
     * Update notification badge
     */
    updateBadge() {
        const badge = document.querySelector('#notification-bell .badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGVzvLTgjMGHm7A7+OZURE');
            audio.volume = 0.5;
            audio.play();
        } catch (e) {
            // Ignore audio errors
        }
    }
    
    /**
     * Persist notifications to localStorage
     */
    persistNotifications() {
        if (!this.config.persistNotifications) return;
        
        try {
            localStorage.setItem('notifications', JSON.stringify({
                notifications: this.notifications,
                unreadCount: this.unreadCount,
                lastUpdated: Date.now()
            }));
        } catch (e) {
            console.error('[Notification Service] Failed to persist:', e);
        }
    }
    
    /**
     * Load persisted notifications
     */
    loadPersistedNotifications() {
        if (!this.config.persistNotifications) return;
        
        try {
            const stored = localStorage.getItem('notifications');
            if (stored) {
                const data = JSON.parse(stored);
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
                this.updateBadge();
                
                console.log(`[Notification Service] Loaded ${this.notifications.length} notifications`);
            }
        } catch (e) {
            console.error('[Notification Service] Failed to load persisted:', e);
        }
    }
    
    /**
     * Subscribe to topic
     */
    async subscribeToTopic(topic) {
        if (!this.token) {
            console.warn('[Notification Service] No token available');
            return;
        }
        
        try {
            // This would call a Firebase Function to subscribe
            const subscribe = firebase.functions().httpsCallable('subscribeToTopic');
            await subscribe({ token: this.token, topic });
            
            console.log(`[Notification Service] Subscribed to topic: ${topic}`);
        } catch (error) {
            console.error('[Notification Service] Failed to subscribe:', error);
        }
    }
    
    /**
     * Unsubscribe from topic
     */
    async unsubscribeFromTopic(topic) {
        if (!this.token) {
            console.warn('[Notification Service] No token available');
            return;
        }
        
        try {
            // This would call a Firebase Function to unsubscribe
            const unsubscribe = firebase.functions().httpsCallable('unsubscribeFromTopic');
            await unsubscribe({ token: this.token, topic });
            
            console.log(`[Notification Service] Unsubscribed from topic: ${topic}`);
        } catch (error) {
            console.error('[Notification Service] Failed to unsubscribe:', error);
        }
    }
    
    /**
     * Get color for notification type
     */
    getColor(color) {
        const colors = {
            blue: '#3b82f6',
            green: '#10b981',
            yellow: '#f59e0b',
            red: '#ef4444',
            purple: '#8b5cf6',
            orange: '#f97316',
            gray: '#6b7280'
        };
        
        return colors[color] || colors.blue;
    }
    
    /**
     * Generate notification ID
     */
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Get notification statistics
     */
    getStatistics() {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        
        return {
            total: this.notifications.length,
            unread: this.unreadCount,
            read: this.notifications.filter(n => n.read).length,
            today: this.notifications.filter(n => now - n.timestamp < day).length,
            byType: this.notifications.reduce((acc, n) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notificationService = new NotificationService();
    });
} else {
    window.notificationService = new NotificationService();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
