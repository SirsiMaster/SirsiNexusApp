/**
 * Admin Access Control Bridge
 * Connects the new authentication service with existing admin dashboard
 * Ensures only authenticated users with admin role can access admin pages
 */

(function() {
    'use strict';

    // Check if this is an admin page
    const isAdminPage = window.location.pathname.includes('/admin/');
    
    if (!isAdminPage) return;

    // Wait for auth service to be ready
    async function waitForAuthService() {
        let attempts = 0;
        while (!window.authService && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.authService) {
            console.error('Auth service not available');
            redirectToLogin();
            return false;
        }

        // Wait for initialization
        while (!authService.initialized && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        return true;
    }

    // Redirect to login page
    function redirectToLogin() {
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/login.html?redirect=${currentPath}&admin=true`;
    }

    // Check admin access
    async function checkAdminAccess() {
        // Wait for auth service
        const authReady = await waitForAuthService();
        if (!authReady) return;

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            redirectToLogin();
            return;
        }

        // Get user profile
        const userProfile = authService.getUserProfile();
        
        // Check if user has admin role
        if (!authService.isAdmin()) {
            console.warn('User does not have admin access');
            showAccessDenied();
            return;
        }

        // User is authenticated and has admin access
        console.log('Admin access granted for user:', userProfile?.email);
        
        // Update admin UI with user info
        updateAdminUI(userProfile);
        
        // Set up logout handler
        setupLogoutHandler();
    }

    // Show access denied message
    function showAccessDenied() {
        document.body.innerHTML = `
            <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <svg class="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p class="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
                    <div class="space-y-3">
                        <button onclick="window.location.href='/dashboard/'" 
                            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Go to User Dashboard
                        </button>
                        <button onclick="authService.signOut()" 
                            class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update admin UI with user information
    function updateAdminUI(userProfile) {
        if (!userProfile) return;
        
        // Update user name in header
        const userNameElements = document.querySelectorAll('[data-user-name], #user-name, .user-name');
        userNameElements.forEach(el => {
            el.textContent = userProfile.displayName || userProfile.email || 'Admin';
        });
        
        // Update user email
        const userEmailElements = document.querySelectorAll('[data-user-email], #user-email, .user-email');
        userEmailElements.forEach(el => {
            el.textContent = userProfile.email;
        });
        
        // Update user avatar/initial
        const userAvatarElements = document.querySelectorAll('[data-user-avatar], #user-avatar, .user-avatar');
        userAvatarElements.forEach(el => {
            const initial = (userProfile.displayName || userProfile.email || 'A').charAt(0).toUpperCase();
            if (el.tagName === 'IMG' && userProfile.photoURL) {
                el.src = userProfile.photoURL;
            } else if (el.textContent !== undefined) {
                el.textContent = initial;
            }
        });
        
        // Update role display
        const roleElements = document.querySelectorAll('[data-user-role], #user-role, .user-role');
        roleElements.forEach(el => {
            el.textContent = userProfile.role?.toUpperCase() || 'ADMIN';
        });
    }

    // Set up logout handler
    function setupLogoutHandler() {
        // Find logout buttons
        const logoutButtons = document.querySelectorAll(
            '[onclick*="logout"], [onclick*="signOut"], [data-logout], #logout-btn, .logout-btn'
        );
        
        logoutButtons.forEach(btn => {
            // Remove existing onclick
            btn.onclick = null;
            
            // Add new handler
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                if (confirm('Are you sure you want to sign out?')) {
                    await authService.signOut();
                }
            });
        });
        
        // Override global logout function if it exists
        if (typeof window.handleLogout === 'function') {
            const originalLogout = window.handleLogout;
            window.handleLogout = async function() {
                if (confirm('Are you sure you want to sign out?')) {
                    await authService.signOut();
                }
            };
        } else {
            // Create global logout function
            window.handleLogout = async function() {
                if (confirm('Are you sure you want to sign out?')) {
                    await authService.signOut();
                }
            };
        }
    }

    // Initialize admin access control
    async function init() {
        // Show loading state
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'admin-loading';
        loadingOverlay.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p class="mt-4 text-gray-600">Verifying admin access...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
        
        try {
            // Load auth service if not already loaded
            if (!window.authService) {
                const script = document.createElement('script');
                script.src = '/assets/js/auth-service.js';
                script.async = false;
                document.head.appendChild(script);
                
                // Wait for script to load
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }
            
            // Load Firebase if not already loaded
            if (!window.firebase) {
                const firebaseScripts = [
                    'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
                    'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
                    'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
                ];
                
                for (const src of firebaseScripts) {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    document.head.appendChild(script);
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                    });
                }
                
                // Load Firebase config
                const configScript = document.createElement('script');
                configScript.src = '/assets/js/firebase-config.js';
                configScript.async = false;
                document.head.appendChild(configScript);
                
                await new Promise((resolve, reject) => {
                    configScript.onload = resolve;
                    configScript.onerror = reject;
                });
            }
            
            // Check admin access
            await checkAdminAccess();
            
        } catch (error) {
            console.error('Error initializing admin access control:', error);
            redirectToLogin();
        } finally {
            // Remove loading overlay
            const overlay = document.getElementById('admin-loading');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    // Listen for auth state changes
    window.addEventListener('authStateChanged', (event) => {
        if (!event.detail?.user) {
            // User logged out
            redirectToLogin();
        } else {
            // User logged in, check admin access
            checkAdminAccess();
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
