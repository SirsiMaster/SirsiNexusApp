/**
 * Enhanced Authentication Service
 * Handles all authentication operations with Firebase Auth
 */

class AuthService {
    constructor() {
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.userProfile = null;
        this.listeners = new Map();
        this.sessionTimeout = null;
        this.inactivityTimeout = null;
        this.initialized = false;
    }

    /**
     * Initialize the authentication service
     */
    async init() {
        if (this.initialized) return;

        try {
            // Wait for Firebase to be ready
            if (!window.firebase || !window.firebase.auth) {
                throw new Error('Firebase not initialized');
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // Enable persistence
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

            // Set up auth state listener
            this.auth.onAuthStateChanged(async (user) => {
                await this.handleAuthStateChange(user);
            });

            // Set up inactivity monitoring
            this.setupInactivityMonitoring();

            this.initialized = true;
            console.log('AuthService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AuthService:', error);
            throw error;
        }
    }

    /**
     * Handle authentication state changes
     */
    async handleAuthStateChange(user) {
        this.currentUser = user;

        if (user) {
            // User is signed in
            await this.loadUserProfile(user.uid);
            this.setupSessionManagement();
            this.notifyListeners('login', user);

            // Track login event
            await this.trackEvent('user_login', {
                userId: user.uid,
                method: user.providerData[0]?.providerId || 'email'
            });
        } else {
            // User is signed out
            this.userProfile = null;
            this.clearSessionManagement();
            this.notifyListeners('logout', null);
        }
    }

    /**
     * Load user profile from Firestore
     */
    async loadUserProfile(userId) {
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            
            if (doc.exists) {
                this.userProfile = { id: doc.id, ...doc.data() };
            } else {
                // Create profile if it doesn't exist
                await this.createUserProfile(this.currentUser);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    /**
     * Create user profile in Firestore
     */
    async createUserProfile(user) {
        const profile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            phoneNumber: user.phoneNumber || '',
            role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: user.emailVerified,
            settings: {
                notifications: true,
                newsletter: false,
                twoFactorEnabled: false
            },
            subscription: {
                plan: 'free',
                status: 'active',
                startDate: firebase.firestore.FieldValue.serverTimestamp()
            }
        };

        try {
            await this.db.collection('users').doc(user.uid).set(profile);
            this.userProfile = { id: user.uid, ...profile };
            
            // Send welcome email
            await this.sendWelcomeEmail(user.email);
            
            return this.userProfile;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     */
    async register(email, password, displayName = '') {
        try {
            // Create user with email and password
            const credential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = credential.user;

            // Update display name if provided
            if (displayName) {
                await user.updateProfile({ displayName });
            }

            // Send email verification
            await user.sendEmailVerification({
                url: `${window.location.origin}/auth/verify-email.html`
            });

            // Create user profile
            await this.createUserProfile(user);

            // Track registration event
            await this.trackEvent('user_registration', {
                userId: user.uid,
                method: 'email'
            });

            return { success: true, user, message: 'Registration successful! Please check your email to verify your account.' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign in user
     */
    async signIn(email, password, rememberMe = false) {
        try {
            // Set persistence based on remember me
            const persistence = rememberMe 
                ? firebase.auth.Auth.Persistence.LOCAL 
                : firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistence);

            // Sign in
            const credential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = credential.user;

            // Update last login
            await this.db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, user };
        } catch (error) {
            console.error('Sign in error:', error);
            
            // Track failed login attempt
            await this.trackEvent('failed_login_attempt', {
                email,
                error: error.code
            });

            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;

            // Check if this is a new user
            const isNewUser = result.additionalUserInfo?.isNewUser;
            
            if (isNewUser) {
                await this.createUserProfile(user);
            } else {
                await this.db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return { success: true, user, isNewUser };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign in with GitHub
     */
    async signInWithGitHub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');
            provider.addScope('read:user');

            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            const token = result.credential?.accessToken;

            // Check if this is a new user
            const isNewUser = result.additionalUserInfo?.isNewUser;
            
            if (isNewUser) {
                const profile = await this.createUserProfile(user);
                
                // Store GitHub token for developer features
                if (token) {
                    await this.db.collection('users').doc(user.uid).update({
                        githubToken: token,
                        isDeveloper: true
                    });
                }
            } else {
                await this.db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    ...(token && { githubToken: token })
                });
            }

            return { success: true, user, isNewUser, token };
        } catch (error) {
            console.error('GitHub sign in error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Sign out user
     */
    async signOut() {
        try {
            await this.auth.signOut();
            
            // Clear local data
            this.currentUser = null;
            this.userProfile = null;
            
            // Redirect to home
            window.location.href = '/';
            
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email) {
        try {
            await this.auth.sendPasswordResetEmail(email, {
                url: `${window.location.origin}/auth/login.html`
            });

            // Track password reset request
            await this.trackEvent('password_reset_requested', { email });

            return { success: true, message: 'Password reset email sent! Please check your inbox.' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            // Update Firebase Auth profile if display name or photo changed
            if (updates.displayName !== undefined || updates.photoURL !== undefined) {
                await this.currentUser.updateProfile({
                    displayName: updates.displayName || this.currentUser.displayName,
                    photoURL: updates.photoURL || this.currentUser.photoURL
                });
            }

            // Update Firestore profile
            await this.db.collection('users').doc(this.currentUser.uid).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reload profile
            await this.loadUserProfile(this.currentUser.uid);

            return { success: true, profile: this.userProfile };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.userProfile?.role === role || this.userProfile?.roles?.includes(role);
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.hasRole('admin') || this.userProfile?.admin === true;
    }

    /**
     * Check if user is developer
     */
    isDeveloper() {
        return this.hasRole('developer') || this.userProfile?.isDeveloper === true;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get user profile
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * Setup session management
     */
    setupSessionManagement() {
        // Clear any existing timeouts
        this.clearSessionManagement();

        // Set 24-hour session timeout
        this.sessionTimeout = setTimeout(() => {
            this.handleSessionTimeout();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Clear session management
     */
    clearSessionManagement() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
        }
    }

    /**
     * Setup inactivity monitoring
     */
    setupInactivityMonitoring() {
        let lastActivity = Date.now();
        const inactivityLimit = 30 * 60 * 1000; // 30 minutes
        const warningTime = 25 * 60 * 1000; // 25 minutes

        const resetTimer = () => {
            lastActivity = Date.now();
            
            if (this.inactivityTimeout) {
                clearTimeout(this.inactivityTimeout);
            }

            if (this.isAuthenticated()) {
                // Set warning timeout
                this.inactivityTimeout = setTimeout(() => {
                    this.showInactivityWarning();
                }, warningTime);
            }
        };

        // Monitor user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Check inactivity periodically
        setInterval(() => {
            if (this.isAuthenticated() && Date.now() - lastActivity > inactivityLimit) {
                this.handleInactivityTimeout();
            }
        }, 60000); // Check every minute

        resetTimer();
    }

    /**
     * Show inactivity warning
     */
    showInactivityWarning() {
        if (!this.isAuthenticated()) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 class="text-lg font-semibold mb-2">Session Timeout Warning</h3>
                <p class="text-gray-600 mb-4">You will be logged out in 5 minutes due to inactivity.</p>
                <div class="flex gap-2">
                    <button onclick="authService.extendSession()" class="btn btn-primary">Stay Logged In</button>
                    <button onclick="authService.signOut()" class="btn btn-secondary">Log Out</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto remove after 5 minutes
        setTimeout(() => {
            modal.remove();
        }, 5 * 60 * 1000);
    }

    /**
     * Extend session
     */
    extendSession() {
        // Remove warning modal if exists
        document.querySelector('.fixed.inset-0')?.remove();
        
        // Reset session management
        this.setupSessionManagement();
        
        // Track session extension
        this.trackEvent('session_extended', {
            userId: this.currentUser?.uid
        });
    }

    /**
     * Handle session timeout
     */
    async handleSessionTimeout() {
        await this.trackEvent('session_timeout', {
            userId: this.currentUser?.uid
        });
        
        await this.signOut();
        
        // Show timeout message
        this.showNotification('Your session has expired. Please sign in again.', 'warning');
    }

    /**
     * Handle inactivity timeout
     */
    async handleInactivityTimeout() {
        await this.trackEvent('inactivity_timeout', {
            userId: this.currentUser?.uid
        });
        
        await this.signOut();
        
        // Show timeout message
        this.showNotification('You have been logged out due to inactivity.', 'warning');
    }

    /**
     * Add auth state listener
     */
    addAuthListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Remove auth state listener
     */
    removeAuthListener(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }

    /**
     * Notify listeners
     */
    notifyListeners(event, data) {
        this.listeners.get(event)?.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    /**
     * Track analytics event
     */
    async trackEvent(eventName, data = {}) {
        try {
            // Track in Firebase Analytics if available
            if (window.gtag) {
                gtag('event', eventName, data);
            }

            // Also track in Firestore for custom analytics
            await this.db.collection('analytics_events').add({
                event: eventName,
                data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.currentUser?.uid || null,
                sessionId: this.getSessionId()
            });
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    /**
     * Get session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('sirsi_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sirsi_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Send welcome email (placeholder - would integrate with email service)
     */
    async sendWelcomeEmail(email) {
        // This would integrate with your email service
        console.log(`Welcome email would be sent to ${email}`);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' : 
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/user-disabled': 'This account has been disabled. Please contact support.',
            'auth/user-not-found': 'No account found with this email. Please register first.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
            'auth/cancelled-popup-request': 'Another sign-in popup is already open.',
            'auth/account-exists-with-different-credential': 'An account already exists with this email but with a different sign-in method.'
        };

        return errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.';
    }
}

// Create global instance
window.authService = new AuthService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authService.init().catch(console.error);
    });
} else {
    window.authService.init().catch(console.error);
}
