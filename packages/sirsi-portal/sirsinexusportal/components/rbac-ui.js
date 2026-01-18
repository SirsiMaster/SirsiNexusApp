/**
 * RBAC UI Component
 * Dynamic UI element management based on user roles and permissions
 * @version 1.0.0
 */

class RBACUIComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.roleInfo = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.updateUI();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .role-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 12px;
                    z-index: 9999;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .role-indicator:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }
                
                .role-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    margin-left: 5px;
                }
                
                .permissions-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    margin-bottom: 10px;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    min-width: 300px;
                    max-width: 400px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .role-indicator:hover .permissions-tooltip {
                    opacity: 1;
                    visibility: visible;
                }
                
                .permissions-tooltip h4 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    color: #60a5fa;
                }
                
                .permissions-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 5px;
                    font-size: 11px;
                }
                
                .permission-item {
                    padding: 3px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .features-section {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .feature-item {
                    display: inline-block;
                    padding: 3px 8px;
                    background: rgba(34, 197, 94, 0.2);
                    color: #86efac;
                    border-radius: 4px;
                    font-size: 11px;
                    margin: 2px;
                }
                
                /* Dark mode support */
                :host-context(.dark) .role-indicator {
                    background: rgba(30, 41, 59, 0.9);
                    color: #e2e8f0;
                }
                
                :host-context(.dark) .permissions-tooltip {
                    background: rgba(15, 23, 42, 0.95);
                }
                
                /* Hide in production */
                :host([production]) .role-indicator {
                    display: none;
                }
            </style>
            
            <div class="role-indicator" id="roleIndicator">
                <span>Current Role:</span>
                <span class="role-badge" id="roleBadge">Loading...</span>
                <div class="permissions-tooltip" id="permissionsTooltip">
                    <h4>Role Details</h4>
                    <div id="roleDetails"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Listen for role changes
        document.addEventListener('rbac-role-changed', (e) => {
            this.updateUI();
        });

        // Listen for session events
        document.addEventListener('session-created', () => {
            this.updateUI();
        });

        document.addEventListener('session-ended', () => {
            this.updateUI();
        });
    }

    updateUI() {
        if (!window.rbac) return;

        const role = window.rbac.getCurrentRole();
        const roleInfo = window.rbac.getRoleInfo(role);
        const permissions = window.rbac.getRolePermissions(role);
        const features = window.rbac.getRoleFeatures(role);

        if (roleInfo) {
            const roleBadge = this.shadowRoot.getElementById('roleBadge');
            roleBadge.textContent = roleInfo.name;
            roleBadge.style.backgroundColor = roleInfo.color;

            const roleDetails = this.shadowRoot.getElementById('roleDetails');
            roleDetails.innerHTML = `
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8;">
                    ${roleInfo.description}
                </p>
                <div class="permissions-list">
                    ${permissions.slice(0, 10).map(perm => `
                        <div class="permission-item" title="${perm}">
                            ${this.formatPermission(perm)}
                        </div>
                    `).join('')}
                    ${permissions.length > 10 ? `
                        <div class="permission-item" style="color: #94a3b8;">
                            +${permissions.length - 10} more...
                        </div>
                    ` : ''}
                </div>
                <div class="features-section">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">
                        Accessible Features:
                    </div>
                    ${features.slice(0, 8).map(feature => `
                        <span class="feature-item">
                            ${this.formatFeature(feature)}
                        </span>
                    `).join('')}
                    ${features.length > 8 ? `
                        <span class="feature-item" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8;">
                            +${features.length - 8} more
                        </span>
                    ` : ''}
                </div>
            `;
        }
    }

    formatPermission(permission) {
        return permission
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    formatFeature(feature) {
        return feature
            .split('_')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    // Allow toggling visibility
    toggle() {
        const indicator = this.shadowRoot.getElementById('roleIndicator');
        indicator.style.display = indicator.style.display === 'none' ? 'block' : 'none';
    }

    // Set production mode
    setProduction(isProduction) {
        if (isProduction) {
            this.setAttribute('production', '');
        } else {
            this.removeAttribute('production');
        }
    }
}

// Register the custom element
customElements.define('rbac-ui', RBACUIComponent);

// Create helper functions for easy integration
window.RBACUIHelpers = {
    /**
     * Show permission required message
     */
    showPermissionRequired(permission, element) {
        const message = document.createElement('div');
        message.className = 'rbac-permission-message';
        message.innerHTML = `
            <div style="
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #991b1b;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                margin: 10px 0;
            ">
                <strong>Permission Required:</strong> ${permission}
                <br>
                <span style="font-size: 12px; color: #7f1d1d;">
                    Your current role does not have access to this feature.
                </span>
            </div>
        `;
        
        if (element) {
            element.parentNode.insertBefore(message, element);
            element.style.opacity = '0.5';
            element.style.pointerEvents = 'none';
        }
        
        return message;
    },

    /**
     * Create role-specific content
     */
    createRoleContent(content) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rbac-content';
        
        Object.entries(content).forEach(([role, html]) => {
            const div = document.createElement('div');
            div.className = `rbac-content-${role}`;
            div.setAttribute('data-role', role);
            div.innerHTML = html;
            wrapper.appendChild(div);
        });
        
        return wrapper;
    },

    /**
     * Show role upgrade prompt
     */
    showUpgradePrompt(requiredRole, currentRole) {
        const prompt = document.createElement('div');
        prompt.className = 'rbac-upgrade-prompt';
        prompt.innerHTML = `
            <div style="
                background: #fef3c7;
                border: 1px solid #fde68a;
                color: #92400e;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                margin: 20px auto;
                max-width: 500px;
            ">
                <h3 style="margin: 0 0 10px 0; color: #92400e;">
                    Upgrade Required
                </h3>
                <p style="margin: 0 0 15px 0;">
                    This feature requires <strong>${requiredRole}</strong> access.
                    <br>
                    Your current role: <strong>${currentRole}</strong>
                </p>
                <button style="
                    background: #f59e0b;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                " onclick="alert('Contact your administrator to upgrade your role.')">
                    Request Upgrade
                </button>
            </div>
        `;
        
        return prompt;
    },

    /**
     * Initialize RBAC UI helpers
     */
    init() {
        // Add RBAC UI component to page if in development
        if (!document.querySelector('rbac-ui') && window.location.hostname === 'localhost') {
            const rbacUI = document.createElement('rbac-ui');
            document.body.appendChild(rbacUI);
        }

        // Add global styles for RBAC messages
        if (!document.getElementById('rbac-ui-styles')) {
            const styles = document.createElement('style');
            styles.id = 'rbac-ui-styles';
            styles.textContent = `
                .rbac-permission-message {
                    animation: fadeIn 0.3s ease;
                }
                
                .rbac-upgrade-prompt {
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Dark mode support */
                .dark .rbac-permission-message > div {
                    background: #7f1d1d !important;
                    border-color: #991b1b !important;
                    color: #fecaca !important;
                }
                
                .dark .rbac-permission-message span {
                    color: #fca5a5 !important;
                }
                
                .dark .rbac-upgrade-prompt > div {
                    background: #78350f !important;
                    border-color: #92400e !important;
                    color: #fef3c7 !important;
                }
                
                .dark .rbac-upgrade-prompt h3,
                .dark .rbac-upgrade-prompt strong {
                    color: #fde68a !important;
                }
            `;
            document.head.appendChild(styles);
        }
    }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.RBACUIHelpers.init();
    });
} else {
    window.RBACUIHelpers.init();
}
