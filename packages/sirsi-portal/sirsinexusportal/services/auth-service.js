// Firebase Authentication Service
// Handles all authentication operations for sirsi.ai

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ3Rk9peFR93Rt-51s6KJvlqLF3Hwy0vg",
  authDomain: "sirsi-nexus-live.firebaseapp.com",
  projectId: "sirsi-nexus-live",
  storageBucket: "sirsi-nexus-live.firebasestorage.app",
  messagingSenderId: "684058818916",
  appId: "1:684058818916:web:e1f086e088c12f09c993ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

class AuthService {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.currentUser = null;
    this.userProfile = null;
    this.sessionTimeout = null;
    this.inactivityTimeout = 30 * 60 * 1000; // 30 minutes
    
    // Initialize auth state listener
    this.initAuthStateListener();
    this.initInactivityDetection();
  }

  // Initialize auth state listener
  initAuthStateListener() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadUserProfile(user.uid);
        this.startSessionTimer();
        this.logActivity('login');
      } else {
        this.currentUser = null;
        this.userProfile = null;
        this.clearSessionTimer();
      }
      
      // Dispatch auth state change event
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { user: this.currentUser, profile: this.userProfile }
      }));
    });
  }

  // Initialize inactivity detection
  initInactivityDetection() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  // Reset inactivity timer
  resetInactivityTimer() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.startSessionTimer();
    }
  }

  // Start session timer
  startSessionTimer() {
    this.sessionTimeout = setTimeout(() => {
      this.showInactivityWarning();
    }, this.inactivityTimeout - 60000); // Show warning 1 minute before timeout
  }

  // Clear session timer
  clearSessionTimer() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  // Show inactivity warning
  showInactivityWarning() {
    const continueSession = confirm('Your session will expire in 1 minute due to inactivity. Continue?');
    if (continueSession) {
      this.resetInactivityTimer();
    } else {
      this.signOut();
    }
  }

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Set default role based on signup source
      const role = userData.role || 'visitor';
      
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || user.email.split('@')[0],
        role: role,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailVerified: false,
        profile: {
          company: userData.company || '',
          phone: userData.phone || '',
          country: userData.country || '',
          bio: userData.bio || '',
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.displayName || 'User'}&background=10b981&color=fff`
        },
        permissions: this.getDefaultPermissions(role),
        subscription: {
          plan: 'free',
          status: 'active',
          startedAt: serverTimestamp(),
          expiresAt: null
        },
        settings: {
          notifications: true,
          newsletter: true,
          twoFactor: false,
          theme: 'light'
        },
        metadata: {
          lastPasswordChange: serverTimestamp(),
          loginAttempts: 0,
          isLocked: false,
          ipAddress: await this.getUserIP(),
          userAgent: navigator.userAgent
        }
      };

      // Save to Firestore
      await setDoc(doc(this.db, 'users', user.uid), userProfile);

      // Send verification email
      await this.sendVerificationEmail();

      // Log activity
      await this.logActivity('signup', { role });

      return { success: true, user, profile: userProfile };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with email and password
  async signIn(email, password, rememberMe = false) {
    try {
      // Check if account is locked
      const lockStatus = await this.checkAccountLock(email);
      if (lockStatus.isLocked) {
        return { success: false, error: 'Account is locked due to multiple failed attempts. Please reset your password.' };
      }

      // Attempt sign in
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update last login
      await updateDoc(doc(this.db, 'users', user.uid), {
        lastLogin: serverTimestamp(),
        'metadata.loginAttempts': 0,
        'metadata.ipAddress': await this.getUserIP()
      });

      // Set session persistence
      if (rememberMe) {
        await this.auth.setPersistence('local');
      } else {
        await this.auth.setPersistence('session');
      }

      // Load user profile
      await this.loadUserProfile(user.uid);

      // Log activity
      await this.logActivity('login');

      return { success: true, user, profile: this.userProfile };
    } catch (error) {
      // Increment failed login attempts
      await this.incrementLoginAttempts(email);
      
      console.error('Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      const profileExists = await this.checkUserProfileExists(user.uid);
      
      if (!profileExists) {
        // Create profile for new Google user
        await this.createSocialUserProfile(user, 'google');
      }

      await this.loadUserProfile(user.uid);
      await this.logActivity('login', { method: 'google' });

      return { success: true, user, profile: this.userProfile };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with GitHub
  async signInWithGitHub() {
    try {
      githubProvider.addScope('repo');
      githubProvider.addScope('user:email');
      
      const result = await signInWithPopup(this.auth, githubProvider);
      const user = result.user;
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // Check if user profile exists
      const profileExists = await this.checkUserProfileExists(user.uid);
      
      if (!profileExists) {
        // Create profile for new GitHub user (developer by default)
        await this.createSocialUserProfile(user, 'github', 'developer');
      }

      // Store GitHub token for API access
      await updateDoc(doc(this.db, 'users', user.uid), {
        'integrations.github': {
          accessToken: token,
          username: result.additionalUserInfo.username,
          connectedAt: serverTimestamp()
        }
      });

      await this.loadUserProfile(user.uid);
      await this.logActivity('login', { method: 'github' });

      return { success: true, user, profile: this.userProfile, githubToken: token };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.logActivity('logout');
      await signOut(this.auth);
      this.currentUser = null;
      this.userProfile = null;
      this.clearSessionTimer();
      
      // Redirect to home
      window.location.href = '/';
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      await this.logActivity('password_reset_request', { email });
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Send email verification
  async sendVerificationEmail() {
    try {
      if (this.currentUser && !this.currentUser.emailVerified) {
        await sendEmailVerification(this.currentUser);
        return { success: true, message: 'Verification email sent' };
      }
      return { success: false, error: 'No user or already verified' };
    } catch (error) {
      console.error('Verification email error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No authenticated user' };
      }

      // Update auth profile if display name or photo URL changed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(this.currentUser, {
          displayName: updates.displayName || this.currentUser.displayName,
          photoURL: updates.photoURL || this.currentUser.photoURL
        });
      }

      // Update Firestore profile
      await updateDoc(doc(this.db, 'users', this.currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Reload profile
      await this.loadUserProfile(this.currentUser.uid);

      return { success: true, profile: this.userProfile };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check user role
  hasRole(requiredRole) {
    if (!this.userProfile) return false;
    
    const roleHierarchy = {
      admin: 4,
      investor: 3,
      developer: 2,
      visitor: 1
    };

    const userLevel = roleHierarchy[this.userProfile.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Check specific permission
  hasPermission(permission) {
    if (!this.userProfile) return false;
    if (this.userProfile.role === 'admin') return true; // Admins have all permissions
    
    return this.userProfile.permissions && this.userProfile.permissions.includes(permission);
  }

  // Load user profile from Firestore
  async loadUserProfile(uid) {
    try {
      const docSnap = await getDoc(doc(this.db, 'users', uid));
      if (docSnap.exists()) {
        this.userProfile = docSnap.data();
        return this.userProfile;
      }
      return null;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  // Check if user profile exists
  async checkUserProfileExists(uid) {
    const docSnap = await getDoc(doc(this.db, 'users', uid));
    return docSnap.exists();
  }

  // Create social user profile
  async createSocialUserProfile(user, provider, defaultRole = 'visitor') {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: defaultRole,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      emailVerified: user.emailVerified,
      profile: {
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=10b981&color=fff`,
        provider: provider
      },
      permissions: this.getDefaultPermissions(defaultRole),
      subscription: {
        plan: 'free',
        status: 'active',
        startedAt: serverTimestamp()
      },
      settings: {
        notifications: true,
        newsletter: true,
        theme: 'light'
      }
    };

    await setDoc(doc(this.db, 'users', user.uid), userProfile);
    return userProfile;
  }

  // Get default permissions for role
  getDefaultPermissions(role) {
    const permissions = {
      visitor: ['read:public'],
      developer: ['read:public', 'read:docs', 'create:project', 'read:api'],
      investor: ['read:public', 'read:dataroom', 'read:financials', 'download:documents'],
      admin: ['*'] // All permissions
    };
    
    return permissions[role] || permissions.visitor;
  }

  // Check account lock status
  async checkAccountLock(email) {
    const q = query(collection(this.db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return {
        isLocked: userData.metadata?.isLocked || false,
        attempts: userData.metadata?.loginAttempts || 0
      };
    }
    
    return { isLocked: false, attempts: 0 };
  }

  // Increment login attempts
  async incrementLoginAttempts(email) {
    const q = query(collection(this.db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const attempts = (userData.metadata?.loginAttempts || 0) + 1;
      const isLocked = attempts >= 5;
      
      await updateDoc(doc(this.db, 'users', userDoc.id), {
        'metadata.loginAttempts': attempts,
        'metadata.isLocked': isLocked,
        'metadata.lockedAt': isLocked ? serverTimestamp() : null
      });
    }
  }

  // Log user activity
  async logActivity(action, metadata = {}) {
    if (!this.currentUser) return;
    
    try {
      const activity = {
        uid: this.currentUser.uid,
        action: action,
        timestamp: serverTimestamp(),
        metadata: {
          ...metadata,
          ipAddress: await this.getUserIP(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };
      
      // Store in activity log collection
      await setDoc(doc(collection(this.db, 'activity_logs')), activity);
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  }

  // Get user IP address
  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Get error message
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed. Please contact support.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign in cancelled.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current user profile
  getUserProfile() {
    return this.userProfile;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if user email is verified
  isEmailVerified() {
    return this.currentUser?.emailVerified || false;
  }

  // Wait for auth to be ready
  async waitForAuth() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

// Create and export singleton instance
const authService = new AuthService();

// Make available globally
window.authService = authService;

export default authService;
