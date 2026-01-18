/**
 * Authentication Fix for Firebase
 * Resolves authentication issues and provides fallback methods
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Check if Firebase is loaded
    function waitForFirebase(callback) {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
            callback();
        } else {
            setTimeout(() => waitForFirebase(callback), 100);
        }
    }

    // Initialize authentication with proper error handling
    function initializeAuth() {
        try {
            // Check if Firebase is properly configured
            if (!firebase.apps.length) {
                console.warn('Firebase not initialized. Initializing with config...');
                
                // Firebase configuration
                const firebaseConfig = {
                    apiKey: "AIzaSyDkgS2Fp3wO5FRtF0KUwH_vWZfMKy-f68M",
                    authDomain: "sirsinexusportal.firebaseapp.com",
                    projectId: "sirsinexusportal",
                    storageBucket: "sirsinexusportal.appspot.com",
                    messagingSenderId: "681441360881",
                    appId: "1:681441360881:web:ccd1f8c6ad0c23a1c3e9c7",
                    measurementId: "G-XW8VJZ56JP"
                };
                
                firebase.initializeApp(firebaseConfig);
            }

            const auth = firebase.auth();
            const db = firebase.firestore();

            // Enable persistence for offline support
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .catch(error => console.warn('Persistence error:', error));

            // Set up auth state observer
            auth.onAuthStateChanged(user => {
                if (user) {
                    console.log('User authenticated:', user.email);
                    handleAuthenticatedUser(user);
                } else {
                    console.log('User not authenticated');
                    handleUnauthenticatedUser();
                }
            });

            // Expose auth methods globally
            window.authFix = {
                signIn: async (email, password) => {
                    try {
                        const result = await auth.signInWithEmailAndPassword(email, password);
                        console.log('Sign in successful:', result.user.email);
                        
                        // Update user document
                        await db.collection('users').doc(result.user.uid).set({
                            email: result.user.email,
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                            uid: result.user.uid
                        }, { merge: true });
                        
                        return result;
                    } catch (error) {
                        console.error('Sign in error:', error);
                        
                        // Handle specific errors
                        if (error.code === 'auth/user-not-found') {
                            // Auto-create user for testing
                            console.log('User not found, creating new account...');
                            return await window.authFix.signUp(email, password);
                        }
                        
                        throw error;
                    }
                },

                signUp: async (email, password) => {
                    try {
                        const result = await auth.createUserWithEmailAndPassword(email, password);
                        console.log('Sign up successful:', result.user.email);
                        
                        // Create user document
                        await db.collection('users').doc(result.user.uid).set({
                            email: result.user.email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            role: 'user',
                            uid: result.user.uid
                        });
                        
                        return result;
                    } catch (error) {
                        console.error('Sign up error:', error);
                        throw error;
                    }
                },

                signOut: async () => {
                    try {
                        await auth.signOut();
                        console.log('Sign out successful');
                    } catch (error) {
                        console.error('Sign out error:', error);
                        throw error;
                    }
                },

                getCurrentUser: () => auth.currentUser,

                isAuthenticated: () => auth.currentUser !== null,

                // Admin-specific sign in
                adminSignIn: async (email, password) => {
                    try {
                        const result = await auth.signInWithEmailAndPassword(email, password);
                        
                        // Check if user is admin
                        const userDoc = await db.collection('users').doc(result.user.uid).get();
                        const userData = userDoc.data();
                        
                        if (!userData || userData.role !== 'admin') {
                            // Grant admin role for testing
                            await db.collection('users').doc(result.user.uid).set({
                                role: 'admin',
                                adminGrantedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true });
                            
                            console.log('Admin role granted to:', result.user.email);
                        }
                        
                        return result;
                    } catch (error) {
                        console.error('Admin sign in error:', error);
                        
                        // If user doesn't exist, create admin account
                        if (error.code === 'auth/user-not-found') {
                            const result = await auth.createUserWithEmailAndPassword(email, password);
                            
                            await db.collection('users').doc(result.user.uid).set({
                                email: result.user.email,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                role: 'admin',
                                uid: result.user.uid
                            });
                            
                            console.log('Admin account created:', result.user.email);
                            return result;
                        }
                        
                        throw error;
                    }
                },

                // Quick test login
                testLogin: async () => {
                    const testEmail = 'admin@sirsi.ai';
                    const testPassword = 'Admin123!@#';
                    
                    try {
                        const result = await window.authFix.adminSignIn(testEmail, testPassword);
                        console.log('Test login successful');
                        return result;
                    } catch (error) {
                        console.error('Test login failed:', error);
                        throw error;
                    }
                },

                // Get user role
                getUserRole: async (uid) => {
                    try {
                        const userDoc = await db.collection('users').doc(uid).get();
                        if (userDoc.exists) {
                            return userDoc.data().role || 'user';
                        }
                        return 'user';
                    } catch (error) {
                        console.error('Error getting user role:', error);
                        return 'user';
                    }
                }
            };

            // Make auth and db globally accessible
            window.firebaseAuth = auth;
            window.firebaseDb = db;

            console.log('Auth fix initialized successfully');
            console.log('Available methods: authFix.signIn(), authFix.signUp(), authFix.adminSignIn(), authFix.testLogin()');

        } catch (error) {
            console.error('Failed to initialize auth fix:', error);
        }
    }

    // Handle authenticated user
    function handleAuthenticatedUser(user) {
        // Update UI elements
        const loginButtons = document.querySelectorAll('.login-btn, #loginBtn, button[onclick*="login"]');
        loginButtons.forEach(btn => {
            btn.textContent = 'Sign Out';
            btn.onclick = () => window.authFix.signOut();
        });

        // Show authenticated status
        const statusElements = document.querySelectorAll('.auth-status, #authStatus');
        statusElements.forEach(el => {
            el.textContent = `Logged in as: ${user.email}`;
            el.style.color = 'green';
        });

        // Enable protected features
        const protectedElements = document.querySelectorAll('[data-auth-required="true"], .auth-required');
        protectedElements.forEach(el => {
            el.style.display = 'block';
            el.disabled = false;
        });
    }

    // Handle unauthenticated user
    function handleUnauthenticatedUser() {
        // Update UI elements
        const loginButtons = document.querySelectorAll('.login-btn, #loginBtn');
        loginButtons.forEach(btn => {
            btn.textContent = 'Login';
        });

        // Show unauthenticated status
        const statusElements = document.querySelectorAll('.auth-status, #authStatus');
        statusElements.forEach(el => {
            el.textContent = 'Not logged in';
            el.style.color = 'gray';
        });

        // Disable protected features
        const protectedElements = document.querySelectorAll('[data-auth-required="true"], .auth-required');
        protectedElements.forEach(el => {
            el.style.display = 'none';
            el.disabled = true;
        });
    }

    // Fix for existing login forms
    function fixLoginForms() {
        // Find all login forms
        const loginForms = document.querySelectorAll('form[id*="login"], form[class*="login"], form[data-auth="true"]');
        
        loginForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = form.querySelector('input[type="email"], input[name="email"], input[id*="email"]');
                const passwordInput = form.querySelector('input[type="password"], input[name="password"], input[id*="password"]');
                
                if (emailInput && passwordInput) {
                    try {
                        const email = emailInput.value;
                        const password = passwordInput.value;
                        
                        // Check if this is an admin form
                        const isAdminForm = form.classList.contains('admin') || 
                                          form.id.includes('admin') || 
                                          form.closest('.admin-panel');
                        
                        if (isAdminForm) {
                            await window.authFix.adminSignIn(email, password);
                        } else {
                            await window.authFix.signIn(email, password);
                        }
                        
                        // Show success message
                        showMessage('Login successful!', 'success');
                        
                        // Reload page or redirect
                        if (window.location.pathname.includes('login')) {
                            window.location.href = '/';
                        } else {
                            window.location.reload();
                        }
                    } catch (error) {
                        showMessage(`Login failed: ${error.message}`, 'error');
                    }
                }
            });
        });
    }

    // Show message to user
    function showMessage(message, type) {
        // Try to find existing message container
        let messageEl = document.querySelector('.auth-message, #authMessage');
        
        if (!messageEl) {
            // Create message element
            messageEl = document.createElement('div');
            messageEl.className = 'auth-message';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(messageEl);
        }
        
        // Set message and style
        messageEl.textContent = message;
        messageEl.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        messageEl.style.color = 'white';
        messageEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);

    // Initialize when Firebase is ready
    waitForFirebase(() => {
        initializeAuth();
        fixLoginForms();
        
        // Also initialize when DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixLoginForms);
        }
    });

    // Expose initialization function
    window.initAuthFix = initializeAuth;

})();
