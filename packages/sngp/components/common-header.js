/**
 * Common Header Component for SirsiNexus
 * Provides consistent header layout across all pages
 */

class CommonHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('page-title') || 'SirsiNexus';
        
        this.shadowRoot.innerHTML = `
            <style>
                @import url('/assets/css/common-styles.css');
                
                :host {
                    display: block;
                    width: 100%;
                }
            </style>
            
            <header class="page-header">
                <div class="flex items-center space-x-4">
                    <h1>${title}</h1>
                    <div class="flex items-center space-x-2">
                        <span class="status-dot"></span>
                        <span class="status-indicator version-loading">Loading...</span>
                        <span class="version-badge version-loading">Loading...</span>
                    </div>
                </div>
                
                <div class="flex items-center">
                    <button class="theme-toggle" aria-label="Toggle theme">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path class="sun" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                            <path class="moon" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="logout-button">Logout</button>
                </div>
            </header>
        `;

        // Handle theme toggle
        const themeToggle = this.shadowRoot.querySelector('.theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', 
                document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            );
        });

        // Handle logout
        const logoutButton = this.shadowRoot.querySelector('.logout-button');
        logoutButton.addEventListener('click', () => {
            // Dispatch logout event for parent to handle
            this.dispatchEvent(new CustomEvent('logout', {
                bubbles: true,
                composed: true
            }));
        });
    }
}

// Define the custom element
customElements.define('common-header', CommonHeader);
