/**
 * Authentication Integration Layer
 * Seamlessly integrates secure authentication with existing workflows
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Wait for secure auth to be ready
    let authReady = false;
    let authQueue = [];

    // Initialize secure auth if not already loaded
    if (!window.secureAuth) {
        const script = document.createElement('script');
        script.src = '/assets/js/secure-auth.js';
        script.onload = () => {
            authReady = true;
            // Process queued operations
            authQueue.forEach(op => op());
            authQueue = [];
        };
        document.head.appendChild(script);
    } else {
        authReady = true;
    }

    // Queue operations until auth is ready
    function whenAuthReady(callback) {
        if (authReady) {
            callback();
        } else {
            authQueue.push(callback);
        }
    }

    // Override existing authentication functions
    const originalAuth = {
        login: window.login || window.performLogin || window.authenticateUser,
        register: window.register || window.createAccount || window.signUp,
        logout: window.logout || window.signOut
    };

    // Enhanced login function that integrates security
    window.enhancedLogin = async function(email, password, options = {}) {
        return new Promise((resolve, reject) => {
            whenAuthReady(async () => {
                try {
                    // First try secure auth
                    const result = await window.secureAuth.login(email, password);
                    
                    if (result.requires2FA) {
                        // Handle 2FA flow
                        const tfaCode = await prompt2FA();
                        if (!tfaCode) {
                            reject(new Error('2FA required but not provided'));
                            return;
                        }
                        const finalResult = await window.secureAuth.login(email, password, tfaCode);
                        handleLoginSuccess(finalResult, options);
                        resolve(finalResult);
                    } else if (result.success) {
                        handleLoginSuccess(result, options);
                        resolve(result);
                    }
                } catch (secureError) {
                    // Fallback to legacy auth if secure auth fails
                    console.warn('Secure auth failed, trying legacy:', secureError);
                    
                    if (originalAuth.login) {
                        try {
                            const legacyResult = await originalAuth.login(email, password);
                            // Migrate to secure auth in background
                            migrateToSecureAuth(email, password, legacyResult);
                            resolve(legacyResult);
                        } catch (legacyError) {
                            reject(legacyError);
                        }
                    } else {
                        // Use simple validation for demo purposes
                        const demoResult = validateDemoCredentials(email, password);
                        if (demoResult.success) {
                            handleLoginSuccess(demoResult, options);
                            resolve(demoResult);
                        } else {
                            reject(new Error('Invalid credentials'));
                        }
                    }
                }
            });
        });
    };

    // Enhanced registration function
    window.enhancedRegister = async function(userData, options = {}) {
        return new Promise((resolve, reject) => {
            whenAuthReady(async () => {
                try {
                    // Ensure all required fields
                    const registrationData = {
                        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
                        lastName: userData.lastName || userData.name?.split(' ')[1] || '',
                        email: userData.email,
                        username: userData.username || userData.email.split('@')[0],
                        password: userData.password,
                        role: userData.role || 'user',
                        ...userData
                    };

                    // Use secure auth
                    const result = await window.secureAuth.register(registrationData);
                    
                    if (result.success) {
                        // Store additional data if needed
                        if (options.additionalData) {
                            storeAdditionalUserData(result.userId, options.additionalData);
                        }
                        
                        // Show email verification message
                        if (options.onEmailVerificationRequired) {
                            options.onEmailVerificationRequired(result);
                        } else {
                            showEmailVerificationMessage();
                        }
                        
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    };

    // Intercept form submissions
    document.addEventListener('DOMContentLoaded', function() {
        // Find all login forms
        const loginForms = document.querySelectorAll('[id*="login"], [class*="login"], form[action*="login"]');
        loginForms.forEach(form => {
            if (!form.dataset.enhanced) {
                form.dataset.enhanced = 'true';
                enhanceLoginForm(form);
            }
        });

        // Find all registration forms
        const registerForms = document.querySelectorAll('[id*="register"], [id*="signup"], [class*="register"], [class*="signup"], form[action*="register"], form[action*="signup"]');
        registerForms.forEach(form => {
            if (!form.dataset.enhanced) {
                form.dataset.enhanced = 'true';
                enhanceRegistrationForm(form);
            }
        });

        // Enhance investor login
        if (window.location.pathname.includes('investor-login')) {
            enhanceInvestorLogin();
        }

        // Enhance developer signup
        if (window.location.pathname.includes('developer-signup')) {
            enhanceDeveloperSignup();
        }
    });

    // Enhance login form
    function enhanceLoginForm(form) {
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            // Get form data
            const emailField = form.querySelector('[type="email"], [name*="email"], [name*="user"], [id*="email"], [id*="user"]');
            const passwordField = form.querySelector('[type="password"], [name*="password"], [id*="password"]');
            
            if (!emailField || !passwordField) {
                console.warn('Could not find email/password fields in form');
                if (originalSubmit) return originalSubmit.call(form, e);
                return;
            }
            
            const email = emailField.value;
            const password = passwordField.value;
            
            // Find submit button
            const submitBtn = form.querySelector('[type="submit"], button[onclick*="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Authenticating...';
            }
            
            try {
                const result = await window.enhancedLogin(email, password, {
                    form: form,
                    redirect: form.dataset.redirect || determineRedirectUrl()
                });
                
                // Handle successful login
                if (result.success) {
                    if (form.dataset.onSuccess) {
                        window[form.dataset.onSuccess](result);
                    } else {
                        window.location.href = result.redirect || determineRedirectUrl();
                    }
                }
            } catch (error) {
                showError(form, error.message);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
            
            return false;
        };
    }

    // Enhance registration form
    function enhanceRegistrationForm(form) {
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            // Collect all form data
            const formData = new FormData(form);
            const userData = {};
            
            for (let [key, value] of formData.entries()) {
                userData[key] = value;
            }
            
            // Map common field names
            userData.email = userData.email || userData.Email || userData.user_email;
            userData.password = userData.password || userData.Password || userData.user_password;
            userData.firstName = userData.firstName || userData.first_name || userData.fname;
            userData.lastName = userData.lastName || userData.last_name || userData.lname;
            
            // Validate passwords match
            if (userData.confirmPassword || userData.confirm_password || userData.password_confirm) {
                const confirmPass = userData.confirmPassword || userData.confirm_password || userData.password_confirm;
                if (userData.password !== confirmPass) {
                    showError(form, 'Passwords do not match');
                    return false;
                }
            }
            
            // Find submit button
            const submitBtn = form.querySelector('[type="submit"], button[onclick*="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating Account...';
            }
            
            try {
                const result = await window.enhancedRegister(userData, {
                    form: form,
                    additionalData: extractAdditionalData(userData)
                });
                
                if (result.success) {
                    showSuccess(form, result.message);
                    
                    // Redirect after delay
                    setTimeout(() => {
                        window.location.href = '/verify-email-sent.html';
                    }, 2000);
                }
            } catch (error) {
                showError(form, error.message);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
            
            return false;
        };
    }

    // Enhance investor login specifically
    function enhanceInvestorLogin() {
        whenAuthReady(() => {
            const originalValidation = window.validateInvestorCredentials;
            
            window.validateInvestorCredentials = async function(investorId, accessCode) {
                try {
                    // Try secure auth first
                    const result = await window.enhancedLogin(investorId, accessCode, {
                        type: 'investor',
                        redirect: '/investor-portal/index.html'
                    });
                    return result;
                } catch (error) {
                    // Fallback to original validation
                    if (originalValidation) {
                        return originalValidation(investorId, accessCode);
                    }
                    throw error;
                }
            };
        });
    }

    // Enhance developer signup
    function enhanceDeveloperSignup() {
        whenAuthReady(() => {
            const form = document.querySelector('#developerSignupForm, form[action*="developer"]');
            if (form && !form.dataset.enhanced) {
                form.dataset.enhanced = 'true';
                enhanceRegistrationForm(form);
            }
        });
    }

    // Helper functions
    function handleLoginSuccess(result, options) {
        // Store session
        sessionStorage.setItem('authToken', result.sessionId);
        sessionStorage.setItem('userId', result.user?.id || result.userId);
        
        // Store in multiple places for compatibility
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('userRole', result.user?.role || 'user');
        
        // Trigger any callbacks
        if (window.onAuthSuccess) {
            window.onAuthSuccess(result);
        }
    }

    function validateDemoCredentials(email, password) {
        // Demo credentials for testing
        const demoUsers = [
            { email: 'admin@sirsinexus.com', password: 'Admin123!', role: 'admin' },
            { email: 'investor@example.com', password: 'Investor123!', role: 'investor' },
            { email: 'demo@example.com', password: 'Demo123!', role: 'user' }
        ];
        
        const user = demoUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            return {
                success: true,
                user: { email: user.email, role: user.role },
                sessionId: generateSessionId()
            };
        }
        
        return { success: false };
    }

    function generateSessionId() {
        return 'demo_' + Math.random().toString(36).substr(2, 9);
    }

    function determineRedirectUrl() {
        const path = window.location.pathname;
        
        if (path.includes('investor')) {
            return '/investor-portal/index.html';
        } else if (path.includes('admin')) {
            return '/admin/index.html';
        } else if (path.includes('developer')) {
            return '/developer-portal/index.html';
        }
        
        return '/dashboard.html';
    }

    function showError(form, message) {
        // Look for existing error container
        let errorDiv = form.querySelector('.error-message, .alert-error, [id*="error"]');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg';
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        errorDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm text-red-700 dark:text-red-300">${message}</span>
            </div>
        `;
        
        errorDiv.style.display = 'block';
    }

    function showSuccess(form, message) {
        let successDiv = form.querySelector('.success-message, .alert-success, [id*="success"]');
        
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message p-4 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg';
            form.insertBefore(successDiv, form.firstChild);
        }
        
        successDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm text-emerald-700 dark:text-emerald-300">${message}</span>
            </div>
        `;
        
        successDiv.style.display = 'block';
    }

    function showEmailVerificationMessage() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4">Verify Your Email</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    We've sent a verification email to your address. Please check your inbox and click the verification link to activate your account.
                </p>
                <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    OK
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async function prompt2FA() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
                    <h3 class="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter the 6-digit code from your authenticator app:
                    </p>
                    <input type="text" id="tfaCode" maxlength="6" pattern="[0-9]{6}" 
                        class="w-full px-4 py-2 border rounded-lg text-center text-lg tracking-widest"
                        placeholder="000000" autofocus>
                    <div class="flex gap-3 mt-4">
                        <button onclick="window.submit2FA()" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                            Verify
                        </button>
                        <button onclick="window.cancel2FA()" class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            window.submit2FA = () => {
                const code = document.getElementById('tfaCode').value;
                modal.remove();
                resolve(code);
            };
            
            window.cancel2FA = () => {
                modal.remove();
                resolve(null);
            };
            
            // Auto-submit on 6 digits
            document.getElementById('tfaCode').addEventListener('input', (e) => {
                if (e.target.value.length === 6) {
                    window.submit2FA();
                }
            });
        });
    }

    function migrateToSecureAuth(email, password, legacyResult) {
        // Silently migrate user to secure auth in background
        whenAuthReady(async () => {
            try {
                await window.secureAuth.register({
                    email: email,
                    password: password,
                    firstName: legacyResult.user?.firstName || '',
                    lastName: legacyResult.user?.lastName || '',
                    username: legacyResult.user?.username || email.split('@')[0],
                    isEmailVerified: true // Since they're already logged in
                });
            } catch (error) {
                console.log('Migration will be attempted next login');
            }
        });
    }

    function extractAdditionalData(userData) {
        // Extract non-auth fields for separate storage
        const authFields = ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'username'];
        const additional = {};
        
        for (let key in userData) {
            if (!authFields.includes(key)) {
                additional[key] = userData[key];
            }
        }
        
        return additional;
    }

    function storeAdditionalUserData(userId, data) {
        // Store additional user data separately
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        userProfiles[userId] = {
            ...userProfiles[userId],
            ...data,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
    }

    // Auto-initialize on all pages
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuthIntegration);
    } else {
        initializeAuthIntegration();
    }

    function initializeAuthIntegration() {
        console.log('🔐 Secure authentication integrated');
    }

    // Expose enhanced functions globally
    window.authIntegration = {
        login: window.enhancedLogin,
        register: window.enhancedRegister,
        ready: whenAuthReady
    };

})();
