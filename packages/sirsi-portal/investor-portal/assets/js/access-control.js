/**
 * Access Control System
 * Manages document permissions, user roles, and access levels
 */
class AccessControlManager {
    constructor() {
        this.userRoles = new Map();
        this.documentPermissions = new Map();
        this.accessLevels = {
            'public': 0,
            'restricted': 1,
            'confidential': 2
        };
        this.userPermissions = {
            'viewer': ['read'],
            'contributor': ['read', 'create'],
            'editor': ['read', 'create', 'update'],
            'admin': ['read', 'create', 'update', 'delete', 'manage_permissions']
        };
        
        this.init();
    }

    init() {
        this.loadUserSession();
        this.loadDocumentPermissions();
    }

    /**
     * Load current user session and permissions
     */
    loadUserSession() {
        const auth = sessionStorage.getItem('investorAuth');
        if (auth) {
            try {
                const authData = JSON.parse(auth);
                this.currentUser = {
                    id: authData.id,
                    email: authData.email || 'investor@sirsinexus.com',
                    role: authData.role || 'viewer',
                    accessLevel: this.getAccessLevelFromRole(authData.role || 'viewer'),
                    permissions: this.getUserPermissions(authData.role || 'viewer'),
                    committees: authData.committees || [],
                    specialAccess: authData.specialAccess || []
                };
            } catch (error) {
                console.error('Error loading user session:', error);
                this.currentUser = this.getDefaultUser();
            }
        } else {
            this.currentUser = this.getDefaultUser();
        }
    }

    /**
     * Get default user for fallback
     */
    getDefaultUser() {
        return {
            id: 'guest',
            email: 'guest@sirsinexus.com',
            role: 'viewer',
            accessLevel: 0,
            permissions: ['read'],
            committees: [],
            specialAccess: []
        };
    }

    /**
     * Get access level from user role
     */
    getAccessLevelFromRole(role) {
        const roleLevels = {
            'viewer': 0,
            'contributor': 1,
            'editor': 1,
            'committee': 1,
            'admin': 2
        };
        return roleLevels[role] || 0;
    }

    /**
     * Get permissions from user role
     */
    getUserPermissions(role) {
        return this.userPermissions[role] || ['read'];
    }

    /**
     * Load document permissions from storage
     */
    loadDocumentPermissions() {
        const stored = localStorage.getItem('sirsi_document_permissions');
        if (stored) {
            try {
                const permissions = JSON.parse(stored);
                this.documentPermissions = new Map(Object.entries(permissions));
            } catch (error) {
                console.error('Error loading document permissions:', error);
                this.documentPermissions = new Map();
            }
        }
    }

    /**
     * Save document permissions to storage
     */
    saveDocumentPermissions() {
        const permissions = Object.fromEntries(this.documentPermissions);
        localStorage.setItem('sirsi_document_permissions', JSON.stringify(permissions));
    }

    /**
     * Check if user can access a document
     */
    canAccessDocument(document) {
        if (!document) return false;

        // Admin can access everything
        if (this.currentUser.role === 'admin') {
            return true;
        }

        // Check access level
        const docAccessLevel = this.accessLevels[document.accessLevel] || 0;
        const userAccessLevel = this.currentUser.accessLevel;

        // Basic access level check
        if (userAccessLevel < docAccessLevel) {
            // Check for special access
            if (!this.hasSpecialAccess(document)) {
                return false;
            }
        }

        // Check committee access
        if (document.committee && !this.currentUser.committees.includes(document.committee)) {
            return false;
        }

        // Check specific document permissions
        const docPermissions = this.documentPermissions.get(document.id);
        if (docPermissions) {
            // If user is explicitly denied
            if (docPermissions.denied && docPermissions.denied.includes(this.currentUser.id)) {
                return false;
            }

            // If document has specific allowed users, check if user is included
            if (docPermissions.allowed && docPermissions.allowed.length > 0) {
                return docPermissions.allowed.includes(this.currentUser.id);
            }
        }

        return true;
    }

    /**
     * Check if user has special access to document
     */
    hasSpecialAccess(document) {
        return this.currentUser.specialAccess.some(access => 
            access.documentId === document.id || 
            access.category === document.category ||
            access.type === 'all'
        );
    }

    /**
     * Check if user can perform specific action on document
     */
    canPerformAction(document, action) {
        if (!this.canAccessDocument(document)) {
            return false;
        }

        // Check if user has the required permission
        if (!this.currentUser.permissions.includes(action)) {
            return false;
        }

        // Additional checks for specific actions
        switch (action) {
            case 'delete':
                // Only allow deletion of own documents or if admin
                return this.currentUser.role === 'admin' || 
                       document.uploadedBy === this.currentUser.id;
            
            case 'update':
                // Allow update if user is editor/admin or owns the document
                return this.currentUser.role === 'admin' || 
                       this.currentUser.role === 'editor' ||
                       document.uploadedBy === this.currentUser.id;
            
            case 'manage_permissions':
                // Only admins can manage permissions
                return this.currentUser.role === 'admin';
            
            default:
                return true;
        }
    }

    /**
     * Filter documents based on user access
     */
    filterAccessibleDocuments(documents) {
        return documents.filter(doc => this.canAccessDocument(doc));
    }

    /**
     * Get access summary for document
     */
    getDocumentAccessSummary(document) {
        const canAccess = this.canAccessDocument(document);
        const actions = ['read', 'create', 'update', 'delete', 'manage_permissions'];
        const allowedActions = actions.filter(action => 
            this.canPerformAction(document, action)
        );

        return {
            canAccess,
            accessLevel: document.accessLevel,
            userAccessLevel: this.currentUser.accessLevel,
            allowedActions,
            restrictions: this.getDocumentRestrictions(document),
            reason: canAccess ? null : this.getAccessDeniedReason(document)
        };
    }

    /**
     * Get reason why access was denied
     */
    getAccessDeniedReason(document) {
        const docAccessLevel = this.accessLevels[document.accessLevel] || 0;
        const userAccessLevel = this.currentUser.accessLevel;

        if (userAccessLevel < docAccessLevel) {
            return `Document requires ${document.accessLevel} access level. Your access level: ${this.getAccessLevelName(userAccessLevel)}`;
        }

        if (document.committee && !this.currentUser.committees.includes(document.committee)) {
            return `Document restricted to ${document.committee} committee members`;
        }

        const docPermissions = this.documentPermissions.get(document.id);
        if (docPermissions) {
            if (docPermissions.denied && docPermissions.denied.includes(this.currentUser.id)) {
                return 'You have been explicitly denied access to this document';
            }

            if (docPermissions.allowed && !docPermissions.allowed.includes(this.currentUser.id)) {
                return 'You are not on the allowed users list for this document';
            }
        }

        return 'Access denied for unknown reason';
    }

    /**
     * Get access level name from numeric value
     */
    getAccessLevelName(level) {
        const levels = ['Public', 'Restricted', 'Confidential'];
        return levels[level] || 'Unknown';
    }

    /**
     * Get document restrictions
     */
    getDocumentRestrictions(document) {
        const restrictions = [];

        if (document.accessLevel === 'confidential') {
            restrictions.push('Confidential - Admin only');
        } else if (document.accessLevel === 'restricted') {
            restrictions.push('Restricted - Committee members only');
        }

        if (document.committee) {
            restrictions.push(`Committee: ${document.committee}`);
        }

        const docPermissions = this.documentPermissions.get(document.id);
        if (docPermissions) {
            if (docPermissions.allowed && docPermissions.allowed.length > 0) {
                restrictions.push(`Specific users only (${docPermissions.allowed.length} users)`);
            }
            if (docPermissions.denied && docPermissions.denied.length > 0) {
                restrictions.push(`Denied users: ${docPermissions.denied.length}`);
            }
        }

        return restrictions;
    }

    /**
     * Set document permissions (admin only)
     */
    setDocumentPermissions(documentId, permissions) {
        if (!this.canPerformAction({ id: documentId }, 'manage_permissions')) {
            throw new Error('Insufficient permissions to manage document access');
        }

        this.documentPermissions.set(documentId, {
            allowed: permissions.allowed || [],
            denied: permissions.denied || [],
            committee: permissions.committee || null,
            accessLevel: permissions.accessLevel || 'public',
            lastModified: new Date().toISOString(),
            modifiedBy: this.currentUser.id
        });

        this.saveDocumentPermissions();
        return true;
    }

    /**
     * Grant access to specific users
     */
    grantDocumentAccess(documentId, userIds) {
        if (!this.canPerformAction({ id: documentId }, 'manage_permissions')) {
            throw new Error('Insufficient permissions to grant document access');
        }

        let permissions = this.documentPermissions.get(documentId) || { allowed: [], denied: [] };
        
        // Add users to allowed list
        userIds.forEach(userId => {
            if (!permissions.allowed.includes(userId)) {
                permissions.allowed.push(userId);
            }
            // Remove from denied list if present
            permissions.denied = permissions.denied.filter(id => id !== userId);
        });

        permissions.lastModified = new Date().toISOString();
        permissions.modifiedBy = this.currentUser.id;

        this.documentPermissions.set(documentId, permissions);
        this.saveDocumentPermissions();
        return true;
    }

    /**
     * Revoke access from specific users
     */
    revokeDocumentAccess(documentId, userIds) {
        if (!this.canPerformAction({ id: documentId }, 'manage_permissions')) {
            throw new Error('Insufficient permissions to revoke document access');
        }

        let permissions = this.documentPermissions.get(documentId) || { allowed: [], denied: [] };
        
        // Add users to denied list
        userIds.forEach(userId => {
            if (!permissions.denied.includes(userId)) {
                permissions.denied.push(userId);
            }
            // Remove from allowed list if present
            permissions.allowed = permissions.allowed.filter(id => id !== userId);
        });

        permissions.lastModified = new Date().toISOString();
        permissions.modifiedBy = this.currentUser.id;

        this.documentPermissions.set(documentId, permissions);
        this.saveDocumentPermissions();
        return true;
    }

    /**
     * Get all users with access to a document
     */
    getDocumentUsers(documentId) {
        const permissions = this.documentPermissions.get(documentId);
        if (!permissions) {
            return { allowed: [], denied: [] };
        }

        return {
            allowed: permissions.allowed || [],
            denied: permissions.denied || [],
            committee: permissions.committee || null
        };
    }

    /**
     * Check if document is downloadable
     */
    canDownloadDocument(document) {
        return this.canPerformAction(document, 'read');
    }

    /**
     * Check if document is previewable
     */
    canPreviewDocument(document) {
        return this.canPerformAction(document, 'read');
    }

    /**
     * Log access attempt
     */
    logAccessAttempt(document, action, success) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: this.currentUser.id,
            documentId: document.id,
            action: action,
            success: success,
            userRole: this.currentUser.role,
            documentAccessLevel: document.accessLevel
        };

        // In a real implementation, this would send to a logging service
        console.log('Access Log:', logEntry);
        
        // Store in local storage for demo purposes
        let accessLog = JSON.parse(localStorage.getItem('sirsi_access_log') || '[]');
        accessLog.push(logEntry);
        
        // Keep only last 1000 entries
        if (accessLog.length > 1000) {
            accessLog = accessLog.slice(-1000);
        }
        
        localStorage.setItem('sirsi_access_log', JSON.stringify(accessLog));
    }

    /**
     * Get access audit log
     */
    getAccessAuditLog(filters = {}) {
        if (this.currentUser.role !== 'admin') {
            throw new Error('Only admins can access audit logs');
        }

        let accessLog = JSON.parse(localStorage.getItem('sirsi_access_log') || '[]');

        // Apply filters
        if (filters.userId) {
            accessLog = accessLog.filter(entry => entry.userId === filters.userId);
        }

        if (filters.documentId) {
            accessLog = accessLog.filter(entry => entry.documentId === filters.documentId);
        }

        if (filters.action) {
            accessLog = accessLog.filter(entry => entry.action === filters.action);
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            accessLog = accessLog.filter(entry => new Date(entry.timestamp) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            accessLog = accessLog.filter(entry => new Date(entry.timestamp) <= toDate);
        }

        return accessLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Generate access report
     */
    generateAccessReport(timeframe = '30d') {
        if (this.currentUser.role !== 'admin') {
            throw new Error('Only admins can generate access reports');
        }

        const accessLog = this.getAccessAuditLog();
        const cutoffDate = new Date();
        
        switch (timeframe) {
            case '7d':
                cutoffDate.setDate(cutoffDate.getDate() - 7);
                break;
            case '30d':
                cutoffDate.setDate(cutoffDate.getDate() - 30);
                break;
            case '90d':
                cutoffDate.setDate(cutoffDate.getDate() - 90);
                break;
            default:
                cutoffDate.setDate(cutoffDate.getDate() - 30);
        }

        const recentLog = accessLog.filter(entry => 
            new Date(entry.timestamp) >= cutoffDate
        );

        return {
            timeframe,
            totalAccess: recentLog.length,
            successfulAccess: recentLog.filter(entry => entry.success).length,
            deniedAccess: recentLog.filter(entry => !entry.success).length,
            uniqueUsers: [...new Set(recentLog.map(entry => entry.userId))].length,
            topDocuments: this.getTopAccessedDocuments(recentLog),
            accessByRole: this.getAccessByRole(recentLog),
            accessTrends: this.getAccessTrends(recentLog)
        };
    }

    /**
     * Get top accessed documents
     */
    getTopAccessedDocuments(accessLog) {
        const documentCounts = {};
        
        accessLog.forEach(entry => {
            if (entry.success) {
                documentCounts[entry.documentId] = (documentCounts[entry.documentId] || 0) + 1;
            }
        });

        return Object.entries(documentCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([documentId, count]) => ({ documentId, count }));
    }

    /**
     * Get access statistics by user role
     */
    getAccessByRole(accessLog) {
        const roleCounts = {};
        
        accessLog.forEach(entry => {
            const role = entry.userRole || 'unknown';
            if (!roleCounts[role]) {
                roleCounts[role] = { total: 0, successful: 0, denied: 0 };
            }
            roleCounts[role].total++;
            if (entry.success) {
                roleCounts[role].successful++;
            } else {
                roleCounts[role].denied++;
            }
        });

        return roleCounts;
    }

    /**
     * Get access trends over time
     */
    getAccessTrends(accessLog) {
        const trends = {};
        
        accessLog.forEach(entry => {
            const date = new Date(entry.timestamp).toISOString().split('T')[0];
            if (!trends[date]) {
                trends[date] = { total: 0, successful: 0, denied: 0 };
            }
            trends[date].total++;
            if (entry.success) {
                trends[date].successful++;
            } else {
                trends[date].denied++;
            }
        });

        return Object.entries(trends)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, stats]) => ({ date, ...stats }));
    }

    /**
     * Validate document access and log attempt
     */
    validateAndLogAccess(document, action = 'read') {
        const canAccess = this.canPerformAction(document, action);
        this.logAccessAttempt(document, action, canAccess);
        
        if (!canAccess) {
            const reason = this.getAccessDeniedReason(document);
            throw new Error(`Access Denied: ${reason}`);
        }
        
        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessControlManager;
} else {
    window.AccessControlManager = AccessControlManager;
}
