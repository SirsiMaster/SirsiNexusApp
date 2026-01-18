/**
 * Security Management System
 * Comprehensive security and access control management
 */

class SecurityManagement {
    constructor() {
        this.currentTab = 'rbac';
        this.roles = [];
        this.sessions = [];
        this.auditLogs = [];
        this.ipWhitelist = [];
        this.permissions = [];
        this.currentEditingRole = null;
        this.currentEditingIP = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupTabNavigation();
        this.initializeModals();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Header buttons
        document.getElementById('export-audit-btn')?.addEventListener('click', () => this.exportAuditLog());
        document.getElementById('security-scan-btn')?.addEventListener('click', () => this.runSecurityScan());

        // RBAC tab
        document.getElementById('add-role-btn')?.addEventListener('click', () => this.showRoleModal());
        document.getElementById('save-role-btn')?.addEventListener('click', () => this.saveRole());
        document.getElementById('cancel-role-btn')?.addEventListener('click', () => this.hideRoleModal());
        document.getElementById('close-role-modal')?.addEventListener('click', () => this.hideRoleModal());

        // Sessions tab
        document.getElementById('refresh-sessions-btn')?.addEventListener('click', () => this.refreshSessions());

        // Audit logs tab
        document.getElementById('audit-filter')?.addEventListener('change', () => this.filterAuditLogs());
        document.getElementById('audit-date')?.addEventListener('change', () => this.filterAuditLogs());

        // 2FA tab
        document.getElementById('save-2fa-policy')?.addEventListener('click', () => this.save2FAPolicy());

        // IP Whitelist tab
        document.getElementById('add-ip-btn')?.addEventListener('click', () => this.showIPModal());
        document.getElementById('save-ip-btn')?.addEventListener('click', () => this.saveIPRange());
        document.getElementById('cancel-ip-btn')?.addEventListener('click', () => this.hideIPModal());
        document.getElementById('close-ip-modal')?.addEventListener('click', () => this.hideIPModal());

        // Password Policy tab
        document.getElementById('save-password-policy')?.addEventListener('click', () => this.savePasswordPolicy());

        // Modal overlay clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideAllModals();
            }
        });
    }

    setupTabNavigation() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab) {
            this.switchTab(tab);
        }
    }

    switchTab(tabName) {
        // Update active states
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(`${tabName}-tab`)?.classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);

        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState({}, '', url);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'rbac':
                this.loadRoles();
                break;
            case 'permissions':
                this.loadPermissionMatrix();
                break;
            case 'sessions':
                this.loadSessions();
                break;
            case 'audit':
                this.loadAuditLogs();
                break;
            case '2fa':
                this.load2FAStats();
                break;
            case 'ip-whitelist':
                this.loadIPWhitelist();
                break;
            case 'password-policy':
                this.loadPasswordPolicy();
                break;
        }
    }

    loadInitialData() {
        // Initialize sample data
        this.initializeSampleData();
        this.updateSecurityOverview();
    }

    initializeSampleData() {
        // Sample roles
        this.roles = [
            {
                id: 1,
                name: 'Super Admin',
                description: 'Full system access with all administrative privileges',
                level: 5,
                userCount: 2,
                permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'system.admin', 'security.admin'],
                createdAt: new Date('2024-01-15'),
                active: true
            },
            {
                id: 2,
                name: 'Admin',
                description: 'Administrative access with limited system controls',
                level: 4,
                userCount: 8,
                permissions: ['users.create', 'users.read', 'users.update', 'content.admin', 'reports.view'],
                createdAt: new Date('2024-01-20'),
                active: true
            },
            {
                id: 3,
                name: 'Investor',
                description: 'Access to investor portal and data room',
                level: 2,
                userCount: 45,
                permissions: ['dataroom.read', 'reports.view', 'profile.update'],
                createdAt: new Date('2024-02-01'),
                active: true
            },
            {
                id: 4,
                name: 'User',
                description: 'Basic user access with limited permissions',
                level: 1,
                userCount: 89,
                permissions: ['profile.read', 'profile.update'],
                createdAt: new Date('2024-02-10'),
                active: true
            }
        ];

        // Sample permissions
        this.permissions = [
            'users.create', 'users.read', 'users.update', 'users.delete',
            'dataroom.read', 'dataroom.write', 'dataroom.admin',
            'reports.view', 'reports.create', 'reports.admin',
            'system.admin', 'security.admin', 'content.admin',
            'profile.read', 'profile.update'
        ];

        // Sample sessions
        this.sessions = this.generateSampleSessions();

        // Sample audit logs
        this.auditLogs = this.generateSampleAuditLogs();

        // Sample IP whitelist
        this.ipWhitelist = [
            {
                id: 1,
                address: '192.168.1.0/24',
                description: 'Office Network',
                active: true,
                createdAt: new Date('2024-01-15'),
                lastUsed: new Date('2024-03-15')
            },
            {
                id: 2,
                address: '10.0.0.1',
                description: 'VPN Gateway',
                active: true,
                createdAt: new Date('2024-02-01'),
                lastUsed: new Date('2024-03-14')
            },
            {
                id: 3,
                address: '203.0.113.5',
                description: 'External API Server',
                active: false,
                createdAt: new Date('2024-01-10'),
                lastUsed: new Date('2024-02-28')
            }
        ];
    }

    generateSampleSessions() {
        const sessions = [];
        const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown'];
        const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 'Toronto, CA'];
        const browsers = ['Chrome 122', 'Safari 17', 'Firefox 124', 'Edge 122'];

        for (let i = 1; i <= 15; i++) {
            sessions.push({
                id: i,
                userId: i,
                userName: users[Math.floor(Math.random() * users.length)],
                email: `user${i}@example.com`,
                ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                location: locations[Math.floor(Math.random() * locations.length)],
                browser: browsers[Math.floor(Math.random() * browsers.length)],
                startTime: new Date(Date.now() - Math.random() * 86400000 * 7),
                lastActivity: new Date(Date.now() - Math.random() * 3600000),
                status: Math.random() > 0.2 ? 'active' : 'expired'
            });
        }

        return sessions;
    }

    generateSampleAuditLogs() {
        const logs = [];
        const events = [
            { type: 'login', title: 'User Login', description: 'User logged in successfully' },
            { type: 'login', title: 'Failed Login', description: 'Login attempt failed - incorrect password' },
            { type: 'permission', title: 'Role Updated', description: 'User role permissions modified' },
            { type: 'security', title: 'Security Violation', description: 'Multiple failed login attempts detected' },
            { type: 'admin', title: 'Admin Action', description: 'System configuration updated' }
        ];

        const users = ['admin@sirsinexus.com', 'john.doe@example.com', 'jane.smith@example.com'];

        for (let i = 1; i <= 50; i++) {
            const event = events[Math.floor(Math.random() * events.length)];
            logs.push({
                id: i,
                type: event.type,
                title: event.title,
                description: event.description,
                user: users[Math.floor(Math.random() * users.length)],
                timestamp: new Date(Date.now() - Math.random() * 86400000 * 30),
                ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
            });
        }

        return logs.sort((a, b) => b.timestamp - a.timestamp);
    }

    updateSecurityOverview() {
        document.getElementById('security-score').textContent = '94';
        document.getElementById('active-sessions').textContent = this.sessions.filter(s => s.status === 'active').length;
        document.getElementById('failed-attempts').textContent = '23';
        document.getElementById('2fa-enabled').textContent = '89%';
    }

    // RBAC Management
    loadRoles() {
        const container = document.getElementById('roles-container');
        if (!container) return;

        container.innerHTML = this.roles.map(role => `
            <div class="role-card" data-role-id="${role.id}">
                <div class="role-header">
                    <div>
                        <h4 class="role-title">${role.name}</h4>
                        <span class="role-level">Level ${role.level}</span>
                    </div>
                </div>
                <p class="role-description">${role.description}</p>
                <div class="role-stats">
                    <div class="role-stat">
                        <span class="role-stat-value">${role.userCount}</span>
                        <span class="role-stat-label">Users</span>
                    </div>
                    <div class="role-stat">
                        <span class="role-stat-value">${role.permissions.length}</span>
                        <span class="role-stat-label">Permissions</span>
                    </div>
                </div>
                <div class="role-actions">
                    <button class="role-action-btn" onclick="securityManagement.editRole(${role.id})">Edit</button>
                    <button class="role-action-btn danger" onclick="securityManagement.deleteRole(${role.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    showRoleModal(roleId = null) {
        const modal = document.getElementById('role-modal');
        const title = document.getElementById('role-modal-title');
        const form = document.getElementById('role-form');

        if (roleId) {
            this.currentEditingRole = this.roles.find(r => r.id === roleId);
            title.textContent = 'Edit Role';
            this.populateRoleForm(this.currentEditingRole);
        } else {
            this.currentEditingRole = null;
            title.textContent = 'Add New Role';
            form.reset();
        }

        this.loadPermissionsCheckboxes();
        modal.classList.remove('hidden');
    }

    populateRoleForm(role) {
        document.getElementById('role-name').value = role.name;
        document.getElementById('role-description').value = role.description;
        document.getElementById('role-level').value = role.level;
    }

    loadPermissionsCheckboxes() {
        const container = document.getElementById('permissions-checkboxes');
        if (!container) return;

        container.innerHTML = this.permissions.map(permission => `
            <div class="permission-checkbox-item">
                <input type="checkbox" id="perm-${permission}" value="${permission}">
                <label for="perm-${permission}">${this.formatPermissionName(permission)}</label>
            </div>
        `).join('');

        // Check existing permissions if editing
        if (this.currentEditingRole) {
            this.currentEditingRole.permissions.forEach(permission => {
                const checkbox = document.getElementById(`perm-${permission}`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    formatPermissionName(permission) {
        return permission.split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
    }

    saveRole() {
        const form = document.getElementById('role-form');
        const formData = new FormData(form);
        
        const roleData = {
            name: formData.get('name'),
            description: formData.get('description'),
            level: parseInt(formData.get('level')),
            permissions: Array.from(document.querySelectorAll('#permissions-checkboxes input:checked'))
                .map(cb => cb.value),
            active: true,
            userCount: 0
        };

        if (this.currentEditingRole) {
            // Update existing role
            Object.assign(this.currentEditingRole, roleData);
            this.showNotification('Role updated successfully', 'success');
        } else {
            // Create new role
            roleData.id = Math.max(...this.roles.map(r => r.id)) + 1;
            roleData.createdAt = new Date();
            this.roles.push(roleData);
            this.showNotification('Role created successfully', 'success');
        }

        this.hideRoleModal();
        this.loadRoles();
        this.loadPermissionMatrix();
    }

    editRole(roleId) {
        this.showRoleModal(roleId);
    }

    deleteRole(roleId) {
        if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            this.roles = this.roles.filter(r => r.id !== roleId);
            this.loadRoles();
            this.showNotification('Role deleted successfully', 'success');
        }
    }

    hideRoleModal() {
        document.getElementById('role-modal').classList.add('hidden');
        this.currentEditingRole = null;
    }

    // Permission Matrix
    loadPermissionMatrix() {
        const table = document.getElementById('permission-matrix');
        if (!table) return;

        const modules = [...new Set(this.permissions.map(p => p.split('.')[0]))];
        const actions = [...new Set(this.permissions.map(p => p.split('.')[1]))];

        let html = `
            <thead>
                <tr>
                    <th>Module / Role</th>
                    ${this.roles.map(role => `<th>${role.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
        `;

        modules.forEach(module => {
            html += `<tr><td>${this.formatPermissionName(module)}</td>`;
            this.roles.forEach(role => {
                const modulePermissions = role.permissions.filter(p => p.startsWith(module));
                let level = 'none';
                if (modulePermissions.some(p => p.includes('delete') || p.includes('admin'))) {
                    level = 'admin';
                } else if (modulePermissions.some(p => p.includes('create') || p.includes('update') || p.includes('write'))) {
                    level = 'write';
                } else if (modulePermissions.some(p => p.includes('read') || p.includes('view'))) {
                    level = 'read';
                }
                html += `<td><span class="permission-level ${level}">${level}</span></td>`;
            });
            html += '</tr>';
        });

        html += '</tbody>';
        table.innerHTML = html;
    }

    // Session Management
    loadSessions() {
        const table = document.getElementById('sessions-table');
        if (!table) return;

        const html = `
            <thead>
                <tr>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Browser</th>
                    <th>Start Time</th>
                    <th>Last Activity</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.sessions.map(session => `
                    <tr>
                        <td>
                            <div>
                                <div class="font-medium">${session.userName}</div>
                                <div class="text-sm text-gray-500">${session.email}</div>
                            </div>
                        </td>
                        <td>${session.ipAddress}</td>
                        <td>${session.location}</td>
                        <td>${session.browser}</td>
                        <td>${this.formatDateTime(session.startTime)}</td>
                        <td>${this.formatDateTime(session.lastActivity)}</td>
                        <td>
                            <span class="session-status ${session.status}">
                                <span class="session-indicator"></span>
                                ${session.status}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="securityManagement.terminateSession(${session.id})">
                                Terminate
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        table.innerHTML = html;
    }

    refreshSessions() {
        this.sessions = this.generateSampleSessions();
        this.loadSessions();
        this.updateSecurityOverview();
        this.showNotification('Sessions refreshed', 'info');
    }

    terminateSession(sessionId) {
        if (confirm('Are you sure you want to terminate this session?')) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.loadSessions();
            this.showNotification('Session terminated', 'success');
        }
    }

    // Audit Logs
    loadAuditLogs() {
        const container = document.getElementById('audit-logs');
        if (!container) return;

        const filteredLogs = this.filterAuditLogsByType();

        container.innerHTML = filteredLogs.map(log => `
            <div class="audit-log-item">
                <div class="audit-log-icon ${log.type}">
                    ${this.getAuditLogIcon(log.type)}
                </div>
                <div class="audit-log-content">
                    <div class="audit-log-title">${log.title}</div>
                    <div class="audit-log-description">${log.description}</div>
                    <div class="audit-log-meta">
                        <span>User: ${log.user}</span>
                        <span>IP: ${log.ipAddress}</span>
                        <span>Time: ${this.formatDateTime(log.timestamp)}</span>
                        <span>Severity: ${log.severity}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterAuditLogsByType() {
        const filter = document.getElementById('audit-filter')?.value || '';
        const date = document.getElementById('audit-date')?.value || '';

        let filtered = this.auditLogs;

        if (filter) {
            filtered = filtered.filter(log => log.type === filter);
        }

        if (date) {
            const selectedDate = new Date(date);
            filtered = filtered.filter(log => 
                log.timestamp.toDateString() === selectedDate.toDateString()
            );
        }

        return filtered;
    }

    filterAuditLogs() {
        this.loadAuditLogs();
    }

    getAuditLogIcon(type) {
        const icons = {
            login: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>',
            security: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>',
            permission: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>',
            admin: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>'
        };
        return icons[type] || icons.admin;
    }

    // 2FA Management
    load2FAStats() {
        const container = document.getElementById('2fa-stats');
        if (!container) return;

        const stats = [
            { label: 'Total Users', value: '144' },
            { label: 'Users with 2FA Enabled', value: '128' },
            { label: 'Admin Users with 2FA', value: '10/10' },
            { label: 'Users in Grace Period', value: '3' },
            { label: '2FA Setup Rate (Last 30 days)', value: '92%' },
            { label: 'Failed 2FA Attempts (24h)', value: '5' }
        ];

        container.innerHTML = stats.map(stat => `
            <div class="2fa-stat-item">
                <span class="2fa-stat-label">${stat.label}</span>
                <span class="2fa-stat-value">${stat.value}</span>
            </div>
        `).join('');
    }

    save2FAPolicy() {
        const required = document.getElementById('2fa-required').checked;
        const adminRequired = document.getElementById('2fa-admin-required').checked;
        const gracePeriod = document.getElementById('2fa-grace-period').value;

        // Simulate API call
        console.log('Saving 2FA policy:', { required, adminRequired, gracePeriod });
        
        this.showNotification('2FA policy saved successfully', 'success');
    }

    // IP Whitelist Management
    loadIPWhitelist() {
        const table = document.getElementById('ip-whitelist-table');
        if (!table) return;

        const html = `
            <thead>
                <tr>
                    <th>IP Address/Range</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${this.ipWhitelist.map(ip => `
                    <tr>
                        <td><code>${ip.address}</code></td>
                        <td>${ip.description}</td>
                        <td>
                            <span class="ip-status ${ip.active ? 'active' : 'inactive'}">
                                ${ip.active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>${this.formatDate(ip.createdAt)}</td>
                        <td>${this.formatDate(ip.lastUsed)}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary mr-2" onclick="securityManagement.editIP(${ip.id})">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="securityManagement.deleteIP(${ip.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        table.innerHTML = html;
    }

    showIPModal(ipId = null) {
        const modal = document.getElementById('ip-modal');
        const title = document.getElementById('ip-modal-title');
        const form = document.getElementById('ip-form');

        if (ipId) {
            this.currentEditingIP = this.ipWhitelist.find(ip => ip.id === ipId);
            title.textContent = 'Edit IP Range';
            this.populateIPForm(this.currentEditingIP);
        } else {
            this.currentEditingIP = null;
            title.textContent = 'Add IP Range';
            form.reset();
        }

        modal.classList.remove('hidden');
    }

    populateIPForm(ip) {
        document.getElementById('ip-address').value = ip.address;
        document.getElementById('ip-description').value = ip.description;
        document.getElementById('ip-active').checked = ip.active;
    }

    saveIPRange() {
        const form = document.getElementById('ip-form');
        const formData = new FormData(form);
        
        const ipData = {
            address: formData.get('address'),
            description: formData.get('description'),
            active: formData.get('active') === 'on'
        };

        if (this.currentEditingIP) {
            // Update existing IP
            Object.assign(this.currentEditingIP, ipData);
            this.showNotification('IP range updated successfully', 'success');
        } else {
            // Create new IP
            ipData.id = Math.max(...this.ipWhitelist.map(ip => ip.id)) + 1;
            ipData.createdAt = new Date();
            ipData.lastUsed = null;
            this.ipWhitelist.push(ipData);
            this.showNotification('IP range added successfully', 'success');
        }

        this.hideIPModal();
        this.loadIPWhitelist();
    }

    editIP(ipId) {
        this.showIPModal(ipId);
    }

    deleteIP(ipId) {
        if (confirm('Are you sure you want to delete this IP range?')) {
            this.ipWhitelist = this.ipWhitelist.filter(ip => ip.id !== ipId);
            this.loadIPWhitelist();
            this.showNotification('IP range deleted successfully', 'success');
        }
    }

    hideIPModal() {
        document.getElementById('ip-modal').classList.add('hidden');
        this.currentEditingIP = null;
    }

    // Password Policy Management
    loadPasswordPolicy() {
        // Policy is loaded from form defaults
        // In a real implementation, this would fetch from the API
    }

    savePasswordPolicy() {
        const policy = {
            minLength: document.getElementById('min-length').value,
            requireUppercase: document.getElementById('require-uppercase').checked,
            requireLowercase: document.getElementById('require-lowercase').checked,
            requireNumbers: document.getElementById('require-numbers').checked,
            requireSymbols: document.getElementById('require-symbols').checked,
            passwordHistory: document.getElementById('password-history').value,
            passwordExpiry: document.getElementById('password-expiry').value,
            maxLoginAttempts: document.getElementById('max-login-attempts').value,
            lockoutDuration: document.getElementById('lockout-duration').value,
            sessionTimeout: document.getElementById('session-timeout').value
        };

        // Simulate API call
        console.log('Saving password policy:', policy);
        
        this.showNotification('Password policy saved successfully', 'success');
    }

    // Utility Methods
    initializeModals() {
        // Set up modal event handlers
        ['role-modal', 'ip-modal'].forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });
    }

    hideAllModals() {
        ['role-modal', 'ip-modal'].forEach(modalId => {
            document.getElementById(modalId)?.classList.add('hidden');
        });
    }

    exportAuditLog() {
        const csvContent = this.convertAuditLogToCSV();
        this.downloadCSV(csvContent, 'security-audit-log.csv');
        this.showNotification('Audit log exported successfully', 'success');
    }

    convertAuditLogToCSV() {
        const headers = ['Timestamp', 'Type', 'Title', 'Description', 'User', 'IP Address', 'Severity'];
        const rows = this.auditLogs.map(log => [
            this.formatDateTime(log.timestamp),
            log.type,
            log.title,
            log.description,
            log.user,
            log.ipAddress,
            log.severity
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    runSecurityScan() {
        this.showNotification('Security scan started...', 'info');
        
        // Simulate security scan
        setTimeout(() => {
            const score = Math.floor(Math.random() * 10) + 85;
            document.getElementById('security-score').textContent = score;
            this.showNotification(`Security scan completed. Score: ${score}/100`, 'success');
        }, 3000);
    }

    formatDate(date) {
        return date.toLocaleDateString();
    }

    formatDateTime(date) {
        return date.toLocaleString();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // Add notification styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { background: #10b981; }
                .notification-error { background: #ef4444; }
                .notification-warning { background: #f59e0b; }
                .notification-info { background: #3b82f6; }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Initialize security management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.securityManagement = new SecurityManagement();
});
