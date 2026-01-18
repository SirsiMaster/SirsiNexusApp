// Admin Header Component - Stub implementation
class AdminHeader extends HTMLElement {
    constructor() {
        super();
        console.log('AdminHeader component initialized');
    }
    
    connectedCallback() {
        // Component is connected to DOM
    }
    
    updateBreadcrumbs(breadcrumbs) {
        console.log('Updating breadcrumbs:', breadcrumbs);
    }
}

// Register the custom element
customElements.define('admin-header', AdminHeader);
