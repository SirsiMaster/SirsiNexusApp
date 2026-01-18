// Admin Sidebar Component - Stub implementation
class AdminSidebar extends HTMLElement {
    constructor() {
        super();
        console.log('AdminSidebar component initialized');
    }
    
    connectedCallback() {
        // Component is connected to DOM
        this.renderSidebar();
    }

    renderSidebar() {
        this.innerHTML = `
            <nav class="sidebar">
                <ul>
                    <li><a href="/admin/">Dashboard</a></li>
                    <li><a href="/admin/dashboard/analytics.html">Analytics</a></li>
                    <li><a href="/admin/dashboard/analytics-advanced.html">Advanced Analytics</a></li>
                    <li><a href="/admin/dashboard/telemetry.html">Telemetry</a></li>
                    <li><a href="/admin/dashboard/system-logs.html">System Logs</a></li>
                    <li><a href="/admin/users/">User Management</a></li>
                    <li><a href="/admin/security/">Security</a></li>
                    <li><a href="/admin/security/monitoring.html">Monitoring</a></li>
                    <li><a href="/admin/data-room.html">Data Room</a></li>
                    <li><a href="/admin/site-settings.html">Site Settings</a></li>
                </ul>
            </nav>
        `;
    }
    openMobileSidebar() {
        console.log('Opening mobile sidebar');
        const nav = document.querySelector('nav');
        if (nav) {
            nav.classList.add('open');
        }
    }
}

// Register the custom element
customElements.define('admin-sidebar', AdminSidebar);
