/**
 * Firebase Authentication Module for SirsiNexus
 * Complete authentication integration with Firebase Auth
 */

class FirebaseAuthModule {
  constructor() {
    this.auth = null;
    this.db = null;
    this.functions = null;
    this.currentUser = null;
    this.authStateListeners = [];
    this.initialized = false;
  }

  /**
   * Initialize Firebase and authentication
   */
  async init() {
    if (this.initialized) return;

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCq-4Cc2TmEwnG5JhNbOkNJ1z_t9JzMEwQ",
      authDomain: "sirsi-nexus-live.firebaseapp.com",
      projectId: "sirsi-nexus-live",
      storageBucket: "sirsi-nexus-live.firebasestorage.app",
      messagingSenderId: "299699102035",
      appId: "1:299699102035:web:f6f97c39f6f088b8c8f3e8"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.functions = firebase.functions();

    // Set up auth state listener
    this.auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      
      if (user) {
        // Update last login
        try {
          await this.db.doc(`users/${user.uid}`).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating last login:', error);
        }
      }

      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(user));
    });

    // Enable persistence for offline support
    try {
      await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (error) {
      console.error('Error setting persistence:', error);
    }

    this.initialized = true;
  }

  /**
   * Register auth state change listener
   */
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    // Call immediately with current state
    if (this.initialized) {
      callback(this.currentUser);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email, password, additionalData = {}) {
    try {
      const credential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = credential.user;

      // Send verification email
      await user.sendEmailVerification();

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: additionalData.displayName || email.split('@')[0],
        role: additionalData.role || 'user',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        emailVerified: false,
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${additionalData.displayName || 'User'}&background=10b981&color=fff`,
        ...additionalData
      };

      await this.db.doc(`users/${user.uid}`).set(userProfile);

      // Track signup event
      await this.trackEvent('user_signup', {
        method: 'email',
        userId: user.uid
      });

      return { success: true, user, message: 'Account created! Please check your email for verification.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      const credential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = credential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        return { 
          success: false, 
          error: 'Please verify your email before signing in.',
          needsVerification: true,
          user
        };
      }

      // Track login event
      await this.trackEvent('user_login', {
        method: 'email',
        userId: user.uid
      });

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
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
      
      const credential = await this.auth.signInWithPopup(provider);
      const user = credential.user;

      // Check if this is a new user
      const userDoc = await this.db.doc(`users/${user.uid}`).get();
      if (!userDoc.exists) {
        // Create user profile
        await this.db.doc(`users/${user.uid}`).set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          provider: 'google',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          emailVerified: true
        });
      }

      // Track login event
      await this.trackEvent('user_login', {
        method: 'google',
        userId: user.uid
      });

      return { success: true, user };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Sign in with GitHub (for developers)
   */
  async signInWithGitHub() {
    try {
      const provider = new firebase.auth.GithubAuthProvider();
      provider.addScope('repo');
      provider.addScope('user:email');
      
      const credential = await this.auth.signInWithPopup(provider);
      const user = credential.user;
      const accessToken = credential.credential.accessToken;

      // Check if this is a new user
      const userDoc = await this.db.doc(`users/${user.uid}`).get();
      if (!userDoc.exists) {
        // Create developer profile
        await this.db.doc(`users/${user.uid}`).set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'developer',
          provider: 'github',
          githubUsername: credential.additionalUserInfo.username,
          githubAccessToken: accessToken, // Store securely in production
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          emailVerified: true
        });
      }

      // Track login event
      await this.trackEvent('user_login', {
        method: 'github',
        userId: user.uid,
        isDeveloper: true
      });

      return { success: true, user, accessToken };
    } catch (error) {
      console.error('GitHub login error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously() {
    try {
      const credential = await this.auth.signInAnonymously();
      const user = credential.user;

      // Track anonymous login
      await this.trackEvent('user_login', {
        method: 'anonymous',
        userId: user.uid
      });

      return { success: true, user };
    } catch (error) {
      console.error('Anonymous login error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      
      // Track password reset event
      await this.trackEvent('password_reset_requested', {
        email: email
      });

      return { success: true, message: 'Password reset email sent! Check your inbox.' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail() {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return { success: false, error: 'No user signed in' };
      }

      await user.sendEmailVerification();
      return { success: true, message: 'Verification email sent!' };
    } catch (error) {
      console.error('Verification email error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return { success: false, error: 'No user signed in' };
      }

      // Update auth profile if display name or photo changed
      if (updates.displayName || updates.photoURL) {
        await user.updateProfile({
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL
        });
      }

      // Update email if changed
      if (updates.email && updates.email !== user.email) {
        await user.updateEmail(updates.email);
        await user.sendEmailVerification();
      }

      // Update Firestore profile
      await this.db.doc(`users/${user.uid}`).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Get current user profile from Firestore
   */
  async getUserProfile() {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const doc = await this.db.doc(`users/${user.uid}`).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check user role
   */
  async checkUserRole() {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const idTokenResult = await user.getIdTokenResult();
      return idTokenResult.claims.role || 'user';
    } catch (error) {
      console.error('Error checking user role:', error);
      return null;
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await this.auth.signOut();
      
      // Track logout event
      await this.trackEvent('user_logout', {
        userId: this.currentUser?.uid
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount() {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return { success: false, error: 'No user signed in' };
      }

      // Delete user data from Firestore (will be handled by Cloud Function)
      await user.delete();

      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Account deletion error:', error);
      
      // Re-authentication might be required
      if (error.code === 'auth/requires-recent-login') {
        return { 
          success: false, 
          error: 'Please sign in again before deleting your account',
          requiresReauth: true
        };
      }
      
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Track analytics event
   */
  async trackEvent(eventName, properties = {}) {
    try {
      const trackEventFunction = this.functions.httpsCallable('trackEvent');
      await trackEventFunction({
        eventName,
        properties,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('sirsi_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sirsi_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Convert Firebase error to user-friendly message
   */
  getErrorMessage(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
      'auth/popup-closed-by-user': 'Popup was closed before completing sign in.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/requires-recent-login': 'Please sign in again to perform this action.'
    };

    return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role) {
    const userRole = await this.checkUserRole();
    return userRole === role || userRole === 'admin';
  }

  /**
   * Check if user is admin
   */
  async isAdmin() {
    const userRole = await this.checkUserRole();
    return userRole === 'admin';
  }

  /**
   * Check if user is developer
   */
  async isDeveloper() {
    const userRole = await this.checkUserRole();
    return userRole === 'developer' || userRole === 'admin';
  }

  /**
   * Check if user is investor
   */
  async isInvestor() {
    const userRole = await this.checkUserRole();
    return userRole === 'investor' || userRole === 'committee' || userRole === 'admin';
  }
}

// Create and export singleton instance
const firebaseAuth = new FirebaseAuthModule();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => firebaseAuth.init());
} else {
  firebaseAuth.init();
}

// Export for use in other modules
window.SirsiAuth = firebaseAuth;
