/**
 * Role-Based Access Control (RBAC) System
 * Comprehensive access control management for SirsiNexus
 * @version 1.0.0
 */

class RBACSystem {
    constructor() {
        // Define all roles and their hierarchical levels
        this.roles = {
            'super_admin': {
                level: 100,
                name: 'Super Administrator',
                description: 'Full system access with all permissions',
                color: '#dc2626',
                icon: 'shield-check'
            },
            'admin': {
                level: 90,
                name: 'Administrator',
                description: 'Administrative access with most permissions',
                color: '#059669',
                icon: 'shield'
            },
            'manager': {
                level: 70,
                name: 'Manager',
                description: 'Management access with team oversight',
                color: '#7c3aed',
                icon: 'users-cog'
            },
            'investor': {
                level: 50,
                name: 'Investor',
                description: 'Access to investment data and reports',
                color: '#2563eb',
                icon: 'chart-line'
            },
            'committee': {
                level: 40,
                name: 'Committee Member',
                description: 'Access to committee-specific resources',
                color: '#0891b2',
                icon: 'users'
            },
            'contributor': {
                level: 30,
                name: 'Contributor',
                description: 'Can create and edit own content',
                color: '#f59e0b',
                icon: 'edit'
            },
            'viewer': {
                level: 20,
                name: 'Viewer',
                description: 'Read-only access to permitted content',
                color: '#6b7280',
                icon: 'eye'
            },
            'guest': {
                level: 10,
                name: 'Guest',
                description: 'Limited public access',
                color: '#94a3b8',
                icon: 'user'
            }
        };

        // Define permissions
        this.permissions = {
            // System permissions
            'system.manage': 'Manage system settings',
            'system.monitor': 'Monitor system health',
            'system.backup': 'Create system backups',
            
            // User permissions
            'users.create': 'Create new users',
            'users.read': 'View user information',
            'users.update': 'Update user information',
            'users.delete': 'Delete users',
            'users.manage_roles': 'Manage user roles',
            'users.invite': 'Send user invitations',
            
            // Document permissions
            'documents.create': 'Create documents',
            'documents.read': 'View documents',
            'documents.update': 'Edit documents',
            'documents.delete': 'Delete documents',
            'documents.download': 'Download documents',
            'documents.share': 'Share documents',
            'documents.manage_permissions': 'Manage document permissions',
            
            // Analytics permissions
            'analytics.view': 'View analytics',
            'analytics.export': 'Export analytics data',
            'analytics.advanced': 'Access advanced analytics',
            
            // Investment permissions
            'investment.view_portfolio': 'View investment portfolio',
            'investment.view_reports': 'View investment reports',
            'investment.manage_funds': 'Manage investment funds',
            
            // Committee permissions
            'committee.access': 'Access committee resources',
            'committee.create_reports': 'Create committee reports',
            'committee.manage': 'Manage committee settings',
            
            // Admin permissions
            'admin.access_dashboard': 'Access admin dashboard',
            'admin.manage_settings': 'Manage admin settings',
            'admin.view_logs': 'View system logs',
            'admin.security': 'Manage security settings'
        };

        // Define role permissions mapping
        this.rolePermissions = {
            'super_admin': Object.keys(this.permissions), // All permissions
            
            'admin': [
                'system.monitor',
                'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage_roles', 'users.invite',
                'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.download', 'documents.share', 'documents.manage_permissions',
                'analytics.view', 'analytics.export', 'analytics.advanced',
                'investment.view_portfolio', 'investment.view_reports',
                'committee.access', 'committee.create_reports', 'committee.manage',
                'admin.access_dashboard', 'admin.manage_settings', 'admin.view_logs'
            ],
            
            'manager': [
                'users.read', 'users.update', 'users.invite',
                'documents.create', 'documents.read', 'documents.update', 'documents.download', 'documents.share',
                'analytics.view', 'analytics.export',
                'investment.view_portfolio', 'investment.view_reports',
                'committee.access', 'committee.create_reports'
            ],
            
            'investor': [
                'users.read',
                'documents.read', 'documents.download',
                'analytics.view',
                'investment.view_portfolio', 'investment.view_reports',
                'committee.access'
            ],
            
            'committee': [
                'users.read',
                'documents.read', 'documents.download',
                'analytics.view',
                'committee.access', 'committee.create_reports'
            ],
            
            'contributor': [
                'users.read',
                'documents.create', 'documents.read', 'documents.update', 'documents.download',
                'analytics.view'
            ],
            
            'viewer': [
                'users.read',
                'documents.read',
                'analytics.view'
            ],
            
            'guest': [
                'documents.read'
            ]
        };

        // Define feature access by role
        this.featureAccess = {
            // Admin features
            'admin_dashboard': ['super_admin', 'admin', 'manager'],
            'user_management': ['super_admin', 'admin'],
            'system_monitoring': ['super_admin', 'admin'],
            'security_settings': ['super_admin', 'admin'],
            
            // Document features
            'document_upload': ['super_admin', 'admin', 'manager', 'contributor'],
            'document_edit': ['super_admin', 'admin', 'manager', 'contributor'],
            'document_delete': ['super_admin', 'admin'],
            'document_permissions': ['super_admin', 'admin'],
            
            // Investment features
            'investment_dashboard': ['super_admin', 'admin', 'manager', 'investor'],
            'investment_reports': ['super_admin', 'admin', 'manager', 'investor'],
            'fund_management': ['super_admin', 'admin'],
            
            // Analytics features
            'basic_analytics': ['super_admin', 'admin', 'manager', 'investor', 'committee', 'contributor', 'viewer'],
            'advanced_analytics': ['super_admin', 'admin', 'manager'],
            'export_analytics': ['super_admin', 'admin', 'manager'],
            
            // Committee features
            'committee_portal': ['super_admin', 'admin', 'manager', 'investor', 'committee'],
            'committee_reports': ['super_admin', 'admin', 'manager', 'committee']
        };

        // Initialize current user
        this.currentUser = null;
        this.loadCurrentUser();
    }

    /**
     * Load current user from session
     */
    loadCurrentUser() {
        const sessionData = sessionStorage.getItem('sirsi_admin_session');
        const authData = sessionStorage.getItem('investorAuth');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.currentUser = session.user;
            } catch (error) {
                console.error('Error loading user session:', error);
            }
        } else if (authData) {
            try {
                const auth = JSON.parse(authData);
                this.currentUser = {
                    id: auth.id,
                    email: auth.email,
                    name: auth.name || 'User',
                    role: auth.role || 'viewer'
                };
            } catch (error) {
                console.error('Error loading auth data:', error);
            }
        }
    }

    /**
     * Set current user
     */
    setCurrentUser(user) {
        this.currentUser = user;
        this.dispatchRoleChangeEvent();
    }

    /**
     * Get current user role
     */
    getCurrentRole() {
        return this.currentUser?.role || 'guest';
    }

    /**
     * Check if current user has specific permission
     */
    hasPermission(permission) {
        const role = this.getCurrentRole();
        const permissions = this.rolePermissions[role] || [];
        return permissions.includes(permission);
    }

    /**
     * Check if current user has any of the specified permissions
     */
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Check if current user has all specified permissions
     */
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    /**
     * Check if current user has access to a feature
     */
    hasFeatureAccess(feature) {
        const role = this.getCurrentRole();
        const allowedRoles = this.featureAccess[feature] || [];
        return allowedRoles.includes(role);
    }

    /**
     * Check if current user's role level meets minimum requirement
     */
    meetsRoleLevel(minimumRole) {
        const currentRole = this.getCurrentRole();
        const currentLevel = this.roles[currentRole]?.level || 0;
        const requiredLevel = this.roles[minimumRole]?.level || 0;
        return currentLevel >= requiredLevel;
    }

    /**
     * Get all permissions for a role
     */
    getRolePermissions(role) {
        return this.rolePermissions[role] || [];
    }

    /**
     * Get all features accessible by a role
     */
    getRoleFeatures(role) {
        return Object.entries(this.featureAccess)
            .filter(([feature, roles]) => roles.includes(role))
            .map(([feature]) => feature);
    }

    /**
     * Get role information
     */
    getRoleInfo(role) {
        return this.roles[role] || null;
    }

    /**
     * Get all roles
     */
    getAllRoles() {
        return Object.entries(this.roles).map(([key, value]) => ({
            key,
            ...value
        }));
    }

    /**
     * Filter UI elements based on permissions
     */
    filterUIElements() {
        // Hide/show elements based on data-permission attribute
        document.querySelectorAll('[data-permission]').forEach(element => {
            const permission = element.dataset.permission;
            if (!this.hasPermission(permission)) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });

        // Hide/show elements based on data-feature attribute
        document.querySelectorAll('[data-feature]').forEach(element => {
            const feature = element.dataset.feature;
            if (!this.hasFeatureAccess(feature)) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });

        // Hide/show elements based on data-role attribute
        document.querySelectorAll('[data-role]').forEach(element => {
            const requiredRole = element.dataset.role;
            if (!this.meetsRoleLevel(requiredRole)) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });

        // Disable elements based on data-permission-disable attribute
        document.querySelectorAll('[data-permission-disable]').forEach(element => {
            const permission = element.dataset.permissionDisable;
            if (!this.hasPermission(permission)) {
                element.disabled = true;
                element.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                element.disabled = false;
                element.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    /**
     * Apply role-based styling
     */
    applyRoleStyling() {
        const role = this.getCurrentRole();
        const roleInfo = this.getRoleInfo(role);
        
        if (roleInfo) {
            // Add role class to body
            document.body.setAttribute('data-user-role', role);
            
            // Update role badge if exists
            const roleBadge = document.querySelector('.user-role-badge');
            if (roleBadge) {
                roleBadge.textContent = roleInfo.name;
                roleBadge.style.backgroundColor = roleInfo.color;
            }
        }
    }

    /**
     * Check route access
     */
    checkRouteAccess(route) {
        const routePermissions = {
            '/admin': ['admin.access_dashboard'],
            '/admin/users': ['users.read'],
            '/admin/security': ['admin.security'],
            '/admin/monitoring': ['system.monitor'],
            '/investor-portal': ['investment.view_portfolio'],
            '/investor-portal/committee': ['committee.access'],
            '/analytics': ['analytics.view']
        };

        const requiredPermissions = routePermissions[route] || [];
        return requiredPermissions.length === 0 || this.hasAnyPermission(requiredPermissions);
    }

    /**
     * Get accessible routes for current user
     */
    getAccessibleRoutes() {
        const allRoutes = [
            { path: '/', name: 'Home', icon: 'home' },
            { path: '/admin', name: 'Admin Dashboard', icon: 'dashboard' },
            { path: '/admin/users', name: 'User Management', icon: 'users' },
            { path: '/admin/security', name: 'Security', icon: 'shield' },
            { path: '/admin/monitoring', name: 'Monitoring', icon: 'activity' },
            { path: '/investor-portal', name: 'Investor Portal', icon: 'briefcase' },
            { path: '/investor-portal/committee', name: 'Committee Portal', icon: 'users' },
            { path: '/analytics', name: 'Analytics', icon: 'chart' }
        ];

        return allRoutes.filter(route => this.checkRouteAccess(route.path));
    }

    /**
     * Dispatch role change event
     */
    dispatchRoleChangeEvent() {
        const event = new CustomEvent('rbac-role-changed', {
            detail: {
                user: this.currentUser,
                role: this.getCurrentRole(),
                permissions: this.getRolePermissions(this.getCurrentRole())
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Initialize RBAC system
     */
    init() {
        // Apply initial UI filtering
        this.filterUIElements();
        this.applyRoleStyling();

        // Listen for dynamic content changes
        const observer = new MutationObserver(() => {
            this.filterUIElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Listen for role changes
        document.addEventListener('session-created', () => {
            this.loadCurrentUser();
            this.filterUIElements();
            this.applyRoleStyling();
        });

        document.addEventListener('session-ended', () => {
            this.currentUser = null;
            this.filterUIElements();
            this.applyRoleStyling();
        });
    }

    /**
     * Guard function for programmatic access control
     */
    guard(permission, callback, fallback = null) {
        if (this.hasPermission(permission)) {
            return callback();
        } else if (fallback) {
            return fallback();
        } else {
            console.warn(`Access denied: Missing permission '${permission}'`);
            return null;
        }
    }

    /**
     * Async guard function
     */
    async guardAsync(permission, callback, fallback = null) {
        if (this.hasPermission(permission)) {
            return await callback();
        } else if (fallback) {
            return await fallback();
        } else {
            console.warn(`Access denied: Missing permission '${permission}'`);
            throw new Error(`Insufficient permissions: ${permission} required`);
        }
    }
}

// Create global RBAC instance
const rbac = new RBACSystem();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => rbac.init());
} else {
    rbac.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RBACSystem;
} else {
    window.RBACSystem = RBACSystem;
    window.rbac = rbac;
}
