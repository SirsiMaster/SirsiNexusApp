// Admin Sidebar Component - Stub implementation
class AdminSidebar extends HTMLElement {
    constructor() {
        super();
        console.log('AdminSidebar component initialized');
    }
    
    connectedCallback() {
        // Component is connected to DOM
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
