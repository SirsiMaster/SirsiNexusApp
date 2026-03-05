// Admin Sidebar Component — Grouped Navigation (matches portal-app design)
// Fixes: auto-expand active group, sidebar toggle, green bar overlap
class AdminSidebar extends HTMLElement {
    constructor() {
        super();
        // Track which groups are collapsed
        this._collapsed = {};
        // Track sidebar collapsed state (full-width toggle)
        this._sidebarCollapsed = localStorage.getItem('sirsi_sidebar_collapsed') === 'true';
    }

    connectedCallback() {
        this.renderSidebar();
        this.addEventListeners();
        this._applySidebarState();
    }

    /**
     * Resolve relative paths based on the current page location.
     */
    getBasePath() {
        const path = window.location.pathname;
        const adminIdx = path.indexOf('/admin/');
        if (adminIdx === -1) return './';
        const afterAdmin = path.substring(adminIdx + '/admin/'.length);
        const segments = afterAdmin.split('/').filter(s => s.length > 0);
        if (segments.length <= 1) return './';
        return '../'.repeat(segments.length - 1);
    }

    // ── SVG Icons (inline, no dependencies) ──────────────────────
    icons = {
        dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
        users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        dataRoom: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
        tenants: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
        contracts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
        telemetry: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        security: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        systemLogs: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
        docs: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        statusDashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
        apiServer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,
        console: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>`,
        notification: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
        monitoring: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
        email: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
        // Investor group
        portal: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
        kpiMetrics: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
        committee: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        messaging: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        // Intelligence group
        aiAgents: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
        hypervisor: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
        // Utility icons
        addUser: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
        securitySettings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        viewLogs: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        upload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
        configure: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>`,
        help: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
        support: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        analytics: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
        advancedAnalytics: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/><rect x="2" y="2" width="20" height="20" rx="2" stroke-dasharray="4 2"/></svg>`,
        development: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
        chevron: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
        settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
        signout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
        collapse: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>`,
    };

    renderSidebar() {
        const currentPath = window.location.pathname;
        const base = this.getBasePath();

        // ── Navigation groups — unified with portal-app React sidebar ──
        const groups = [
            {
                title: 'MAIN',
                defaultOpen: false,
                items: [
                    { href: `${base}admin-portal.html`, label: 'Dashboard', icon: 'dashboard', match: '/admin/admin-portal' },
                    { href: `${base}users/index.html`, label: 'User Management', icon: 'users', match: '/users/' },
                    { href: `${base}data-room/index.html`, label: 'Data Room', icon: 'dataRoom', match: '/data-room/' },
                    { href: `${base}tenants/index.html`, label: 'Operations', icon: 'tenants', match: '/tenants/' },
                    { href: `${base}contracts/index.html`, label: 'Contracts', icon: 'contracts', match: '/contracts/' },
                    { href: `${base}security/index.html`, label: 'Security & Settings', icon: 'security', match: '/security/index' },
                    { href: `${base}committee-docs/pitch-deck.html`, label: 'Documentation', icon: 'docs', match: '/committee-docs/' },
                    { href: `${base}intelligence/ai-agents.html`, label: 'AI Agents', icon: 'aiAgents', match: '/ai-agents' },
                    { href: `${base}intelligence/hypervisor.html`, label: 'Sirsi Hypervisor', icon: 'hypervisor', match: '/hypervisor' },
                ],
            },
            {
                title: 'SYSTEM STATUS',
                defaultOpen: false,
                items: [
                    { href: `${base}system-status/index.html`, label: 'Status Dashboard', icon: 'statusDashboard', match: '/system-status/' },
                    { href: `${base}system-status/api-server.html`, label: 'API Server', icon: 'apiServer', match: '/api-server.html' },
                    { href: `${base}dashboard/telemetry.html`, label: 'Telemetry', icon: 'telemetry', match: '/telemetry.html' },
                    { href: `${base}dashboard/system-logs.html`, label: 'System Logs', icon: 'systemLogs', match: '/system-logs.html' },
                    { href: `${base}console/index.html`, label: 'Console', icon: 'console', match: '/console/' },
                    { href: `${base}security/monitoring.html`, label: 'Notification', icon: 'notification', match: '/monitoring.html' },
                    { href: `${base}system-status/cache-status.html`, label: 'CDN Status', icon: 'monitoring', match: '/cache-status.html' },
                    { href: `${base}system-status/backup-status.html`, label: 'Email Service', icon: 'email', match: '/backup-status.html' },
                    { href: `${base}dashboard/analytics.html`, label: 'Analytics', icon: 'analytics', match: '/analytics.html' },
                    { href: `${base}dashboard/analytics-advanced.html`, label: 'Advanced Analytics', icon: 'advancedAnalytics', match: '/analytics-advanced.html' },
                    { href: `${base}dashboard/development.html`, label: 'Development', icon: 'development', match: '/development.html' },
                ],
            },
            {
                title: 'INVESTOR',
                defaultOpen: false,
                items: [
                    { href: `${base}investor/portal.html`, label: 'Portal', icon: 'portal', match: '/investor/portal' },
                    { href: `${base}investor/kpi-metrics.html`, label: 'KPI Metrics', icon: 'kpiMetrics', match: '/kpi-metrics' },
                    { href: `${base}investor/committee.html`, label: 'Committee', icon: 'committee', match: '/investor/committee' },
                    { href: `${base}investor/messaging.html`, label: 'Messaging', icon: 'messaging', match: '/investor/messaging' },
                ],
            },
            {
                title: 'QUICK ACTIONS',
                defaultOpen: false,
                items: [
                    { href: `${base}users/index.html`, label: 'Add User', icon: 'addUser', match: '__none__' },
                    { href: `${base}security/index.html`, label: 'Security Settings', icon: 'securitySettings', match: '__none2__' },
                    { href: `${base}dashboard/system-logs.html`, label: 'View Logs', icon: 'viewLogs', match: '__none3__' },
                    { href: `${base}data-room/index.html`, label: 'Upload Documents', icon: 'upload', match: '__none4__' },
                    { href: `${base}security/index.html`, label: 'Configure Site', icon: 'configure', match: '__none5__' },
                ],
            },
            {
                title: 'HELP & RESOURCES',
                defaultOpen: false,
                items: [
                    { href: '#', label: 'Quick Help', icon: 'help', match: '__help__' },
                    { href: '#', label: 'Contact Support', icon: 'support', match: '__support__' },
                ],
            },
        ];

        // ── Determine which single item is active (first-match-wins, most specific) ──
        let activeMatch = null;
        let activeGroupIndex = -1;
        groups.forEach((group, gi) => {
            group.items.forEach(item => {
                if (!activeMatch && currentPath.includes(item.match)) {
                    activeMatch = item.match;
                    activeGroupIndex = gi;
                }
            });
        });

        // Build HTML
        const groupsHTML = groups.map((group, gi) => {
            // Auto-expand the group that contains the active page
            const hasActivePage = (gi === activeGroupIndex);
            const shouldBeOpen = group.defaultOpen || hasActivePage;
            const isCollapsed = this._collapsed[gi] !== undefined
                ? this._collapsed[gi]
                : !shouldBeOpen;

            const itemsHTML = group.items.map(item => {
                // Only one item can be active — the one that matched first
                const isActive = (item.match === activeMatch);
                return `<a href="${item.href}" class="admin-sidebar-link ${isActive ? 'active' : ''}">
                    <span class="admin-sidebar-icon">${this.icons[item.icon] || ''}</span>
                    <span class="admin-sidebar-link-label">${item.label}</span>
                </a>`;
            }).join('');

            return `
                <div class="sidebar-group ${isCollapsed ? 'collapsed' : ''}">
                    <button class="sidebar-group-header" data-group="${gi}">
                        <span class="sidebar-group-header-label">${group.title}</span>
                        <span class="sidebar-group-chevron">${this.icons.chevron}</span>
                    </button>
                    <div class="sidebar-group-items">
                        ${itemsHTML}
                    </div>
                </div>`;
        }).join('');

        this.innerHTML = `
            <nav class="admin-sidebar ${this._sidebarCollapsed ? 'sidebar-mini' : ''}">
                <div class="sidebar-top-toggle">
                    <button class="sidebar-toggle-btn" title="${this._sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
                        <span class="admin-sidebar-icon" style="${this._sidebarCollapsed ? 'transform: scaleX(-1);' : ''}">${this.icons.collapse}</span>
                        <span class="admin-sidebar-link-label">${this._sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
                    </button>
                </div>
                <div class="admin-sidebar-scroll">
                    ${groupsHTML}
                </div>
                <div class="admin-sidebar-footer">
                    <a href="${base}security/index.html" class="admin-sidebar-link">
                        <span class="admin-sidebar-icon">${this.icons.settings}</span>
                        <span class="admin-sidebar-link-label">Settings</span>
                    </a>
                    <button class="admin-sidebar-link sidebar-signout">
                        <span class="admin-sidebar-icon">${this.icons.signout}</span>
                        <span class="admin-sidebar-link-label">Sign Out</span>
                    </button>
                </div>
            </nav>
        `;

        // Store collapsed state
        groups.forEach((group, gi) => {
            const hasActivePage = (gi === activeGroupIndex);
            const shouldBeOpen = group.defaultOpen || hasActivePage;
            if (this._collapsed[gi] === undefined) {
                this._collapsed[gi] = !shouldBeOpen;
            }
        });
    }

    addEventListeners() {
        // Group toggle
        this.querySelectorAll('.sidebar-group-header').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const gi = parseInt(btn.dataset.group);
                this._collapsed[gi] = !this._collapsed[gi];
                const group = btn.closest('.sidebar-group');
                group.classList.toggle('collapsed');
            });
        });

        // Sidebar collapse/expand toggle
        const toggleBtn = this.querySelector('.sidebar-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Preserve scroll position before re-render
                const scrollEl = this.querySelector('.admin-sidebar-scroll');
                const savedScroll = scrollEl ? scrollEl.scrollTop : 0;

                this._sidebarCollapsed = !this._sidebarCollapsed;
                localStorage.setItem('sirsi_sidebar_collapsed', this._sidebarCollapsed);
                this.renderSidebar();
                this.addEventListeners();
                this._applySidebarState();

                // Restore scroll position after re-render
                const newScrollEl = this.querySelector('.admin-sidebar-scroll');
                if (newScrollEl) newScrollEl.scrollTop = savedScroll;
            });
        }
    }

    _applySidebarState() {
        const nav = this.querySelector('.admin-sidebar');
        const mainContent = document.querySelector('.sidebar-content');

        if (this._sidebarCollapsed) {
            nav?.classList.add('sidebar-mini');
            mainContent?.classList.add('sidebar-collapsed');
        } else {
            nav?.classList.remove('sidebar-mini');
            mainContent?.classList.remove('sidebar-collapsed');
        }
    }

    openMobileSidebar() {
        const nav = this.querySelector('.admin-sidebar');
        if (nav) nav.classList.toggle('open');
    }
}

customElements.define('admin-sidebar', AdminSidebar);
