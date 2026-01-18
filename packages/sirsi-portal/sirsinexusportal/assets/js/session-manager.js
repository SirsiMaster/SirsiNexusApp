/**
 * SirsiNexus Session Management System
 * Comprehensive session management with authentication, authorization, and security features
 * @version 1.0.0
 */

class SessionManager {
    constructor() {
        this.sessionKey = 'sirsi_admin_session';
        this.tokenKey = 'sirsi_auth_token';
        this.refreshKey = 'sirsi_refresh_token';
        this.maxIdleTime = 30 * 60 * 1000; // 30 minutes
        this.checkInterval = 60 * 1000; // 1 minute
        this.warningTime = 5 * 60 * 1000; // 5 minutes before expiry
        
        this.sessionData = null;
        this.idleTimer = null;
        this.checkTimer = null;
        this.warningShown = false;
        
        // Disable for initial development/testing
        // this.init();
    }

    /**
     * Initialize session management
     */
    init() {
        this.loadSession();
        this.startIdleTimer();
        this.startSessionCheck();
        this.bindEvents();
        
        // Check authentication on page load
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
        }
    }

    /**
     * Load session from storage
     */
    loadSession() {
        try {
            const sessionData = sessionStorage.getItem(this.sessionKey);
            const token = sessionStorage.getItem(this.tokenKey);
            
            if (sessionData && token) {
                this.sessionData = JSON.parse(sessionData);
                
                // Validate session expiry
                if (this.isSessionExpired()) {
                    this.clearSession();
                    return false;
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.clearSession();
        }
        return false;
    }

    /**
     * Create new session
     */
    createSession(userData, token, refreshToken = null) {
        const sessionData = {
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name || 'Admin User',
                role: userData.role || 'admin',
                permissions: userData.permissions || ['read', 'write', 'delete', 'admin'],
                avatar: userData.avatar || null,
                department: userData.department || 'Administration',
                lastLogin: new Date().toISOString()
            },
            session: {
                id: this.generateSessionId(),
                created: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                expiresAt: new Date(Date.now() + this.maxIdleTime).toISOString(),
                ipAddress: this.getClientIP(),
                userAgent: navigator.userAgent,
                isActive: true
            },
            security: {
                loginAttempts: 0,
                lastFailedLogin: null,
                securityLevel: userData.securityLevel || 'standard',
                twoFactorEnabled: userData.twoFactorEnabled || false,
                sessionToken: this.generateSecurityToken()
            }
        };

        // Store session data
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        sessionStorage.setItem(this.tokenKey, token);
        
        if (refreshToken) {
            sessionStorage.setItem(this.refreshKey, refreshToken);
        }

        this.sessionData = sessionData;
        
        // Start session monitoring
        this.startIdleTimer();
        this.startSessionCheck();
        
        // Dispatch session created event
        this.dispatchEvent('session-created', { user: sessionData.user });
        
        return true;
    }

    /**
     * Update session activity
     */
    updateActivity() {
        if (!this.sessionData) return;

        const now = new Date();
        this.sessionData.session.lastActivity = now.toISOString();
        this.sessionData.session.expiresAt = new Date(now.getTime() + this.maxIdleTime).toISOString();
        
        // Update stored session
        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.sessionData));
        
        // Reset warning
        this.warningShown = false;
        
        // Reset idle timer
        this.resetIdleTimer();
    }

    /**
     * Check if session is expired
     */
    isSessionExpired() {
        if (!this.sessionData) return true;
        
        const expiresAt = new Date(this.sessionData.session.expiresAt);
        return new Date() > expiresAt;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.sessionData && 
               sessionStorage.getItem(this.tokenKey) && 
               !this.isSessionExpired();
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        return this.sessionData ? this.sessionData.user : null;
    }

    /**
     * Get session info
     */
    getSessionInfo() {
        return this.sessionData ? this.sessionData.session : null;
    }

    /**
     * Get authentication token
     */
    getAuthToken() {
        return sessionStorage.getItem(this.tokenKey);
    }

    /**
     * Check user permissions
     */
    hasPermission(permission) {
        if (!this.sessionData) return false;
        return this.sessionData.user.permissions.includes(permission) || 
               this.sessionData.user.permissions.includes('admin');
    }

    /**
     * Check user role
     */
    hasRole(role) {
        if (!this.sessionData) return false;
        return this.sessionData.user.role === role || this.sessionData.user.role === 'admin';
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        const refreshToken = sessionStorage.getItem(this.refreshKey);
        if (!refreshToken) {
            this.logout();
            return false;
        }

        try {
            // TODO: Replace with actual API call
            const response = await this.mockRefreshToken(refreshToken);
            
            if (response.success) {
                sessionStorage.setItem(this.tokenKey, response.token);
                if (response.refreshToken) {
                    sessionStorage.setItem(this.refreshKey, response.refreshToken);
                }
                this.updateActivity();
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Mock token refresh (replace with actual API)
     */
    async mockRefreshToken(refreshToken) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock successful refresh
        return {
            success: true,
            token: this.generateSecurityToken(),
            refreshToken: this.generateSecurityToken(),
            expiresIn: 3600
        };
    }

    /**
     * Logout and clear session
     */
    logout(reason = 'user_logout') {
        // Dispatch logout event before clearing
        this.dispatchEvent('session-ended', { 
            reason,
            user: this.getCurrentUser(),
            duration: this.getSessionDuration()
        });
        
        this.clearSession();
        this.redirectToLogin();
    }

    /**
     * Clear all session data
     */
    clearSession() {
        // Clear timers
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
        
        // Clear storage
        sessionStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.refreshKey);
        localStorage.removeItem('admin-sidebar-collapsed');
        
        // Clear data
        this.sessionData = null;
        this.warningShown = false;
        
        // Clear any cached data
        this.clearCache();
    }

    /**
     * Clear application cache
     */
    clearCache() {
        // Clear any application-specific cache
        const cacheKeys = [
            'dashboard_metrics',
            'user_preferences',
            'recent_activities',
            'chart_data'
        ];
        
        cacheKeys.forEach(key => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
        });
    }

    /**
     * Start idle timer
     */
    startIdleTimer() {
        this.resetIdleTimer();
    }

    /**
     * Reset idle timer
     */
    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        this.idleTimer = setTimeout(() => {
            this.handleIdleTimeout();
        }, this.maxIdleTime - this.warningTime);
    }

    /**
     * Handle idle timeout warning
     */
    handleIdleTimeout() {
        if (!this.warningShown && this.isAuthenticated()) {
            this.showIdleWarning();
            
            // Set final timeout
            this.idleTimer = setTimeout(() => {
                this.logout('idle_timeout');
            }, this.warningTime);
        }
    }

    /**
     * Show idle warning dialog
     */
    showIdleWarning() {
        this.warningShown = true;
        
        const modal = document.createElement('div');
        modal.className = 'idle-warning-modal';
        modal.innerHTML = `
            <div class="idle-warning-backdrop"></div>
            <div class="idle-warning-content">
                <div class="idle-warning-header">
                    <svg class="idle-warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <h3>Session Expiring Soon</h3>
                </div>
                <p>Your session will expire in <span id="countdown">5:00</span>. Would you like to extend your session?</p>
                <div class="idle-warning-actions">
                    <button class="btn-extend" onclick="sessionManager.extendSession()">Extend Session</button>
                    <button class="btn-logout" onclick="sessionManager.logout('user_logout')">Logout Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.startCountdown();
        
        if (!document.getElementById('idle-warning-styles')) {
            const styles = document.createElement('style');
            styles.id = 'idle-warning-styles';
            styles.textContent = `
                .idle-warning-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .idle-warning-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }
                
                .idle-warning-content {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 400px;
                    margin: 1rem;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }
                
                .dark .idle-warning-content {
                    background: #1e293b;
                    color: #f1f5f9;
                }
                
                .idle-warning-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                
                .idle-warning-icon {
                    width: 24px;
                    height: 24px;
                    color: #f59e0b;
                }
                
                .idle-warning-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 2rem;
                }
                
                .btn-extend, .btn-logout {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-extend {
                    background: #059669;
                    color: white;
                }
                
                .btn-extend:hover {
                    background: #047857;
                }
                
                .btn-logout {
                    background: #dc2626;
                    color: white;
                }
                
                .btn-logout:hover {
                    background: #b91c1c;
                }
                
                #countdown {
                    font-weight: 700;
                    color: #dc2626;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    /**
     * Start countdown timer in warning dialog
     */
    startCountdown() {
        let timeLeft = this.warningTime / 1000;
        const countdownElement = document.getElementById('countdown');
        
        const updateCountdown = () => {
            if (timeLeft <= 0) {
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeLeft--;
            
            setTimeout(updateCountdown, 1000);
        };
        
        updateCountdown();
    }

    /**
     * Extend current session
     */
    extendSession() {
        this.updateActivity();
        this.closeIdleWarning();
        
        this.refreshToken();
        
        this.dispatchEvent('session-extended');
    }

    /**
     * Close idle warning dialog
     */
    closeIdleWarning() {
        const modal = document.querySelector('.idle-warning-modal');
        if (modal) {
            modal.remove();
        }
        this.warningShown = false;
    }

    /**
     * Start periodic session checks
     */
    startSessionCheck() {
        this.checkTimer = setInterval(() => {
            if (this.isSessionExpired()) {
                this.logout('session_expired');
            } else if (this.shouldRefreshToken()) {
                this.refreshToken();
            }
        }, this.checkInterval);
    }

    /**
     * Check if token should be refreshed
     */
    shouldRefreshToken() {
        const token = sessionStorage.getItem(this.tokenKey);
        if (!token) return true;
        
        const lastRefresh = sessionStorage.getItem('last_token_refresh');
        if (!lastRefresh) {
            sessionStorage.setItem('last_token_refresh', Date.now().toString());
            return false;
        }
        
        const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
        return timeSinceRefresh > 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated()) {
                    this.updateActivity();
                }
            }, true);
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isAuthenticated()) {
                this.updateActivity();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (this.sessionData) {
                this.sessionData.session.lastActivity = new Date().toISOString();
                sessionStorage.setItem(this.sessionKey, JSON.stringify(this.sessionData));
            }
        });
    }

    redirectToLogin() {
        if (window.location.pathname.includes('login')) {
            return;
        }
        
        sessionStorage.setItem('redirect_after_login', window.location.href);
        
        window.location.href = '/investor-login.html';
    }

    getSessionDuration() {
        if (!this.sessionData) return 0;
        
        const created = new Date(this.sessionData.session.created);
        const now = new Date();
        return Math.floor((now - created) / 1000); 
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSecurityToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    getClientIP() {
        return 'client_ip_placeholder';
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`session-${eventName}`, {
            detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    getSessionStats() {
        if (!this.sessionData) return null;
        
        return {
            duration: this.getSessionDuration(),
            created: this.sessionData.session.created,
            lastActivity: this.sessionData.session.lastActivity,
            expiresAt: this.sessionData.session.expiresAt,
            user: this.sessionData.user.name,
            role: this.sessionData.user.role
        };
    }
}

// Global session manager instance
const sessionManager = new SessionManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}
