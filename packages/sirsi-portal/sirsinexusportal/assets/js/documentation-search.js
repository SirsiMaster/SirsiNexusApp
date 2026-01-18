/**
 * Documentation Search System
 * Indexes and searches all documentation, components, features, and markdown files
 * @version 1.0.0
 */

class DocumentationSearch {
    constructor() {
        this.searchIndex = [];
        this.markdownDocs = [];
        this.initialized = false;
        this.init();
    }

    async init() {
        console.log('Initializing documentation search system...');
        await this.buildSearchIndex();
        this.setupSearchHandlers();
        this.initialized = true;
        console.log('Documentation search initialized with', this.searchIndex.length, 'items');
    }

    async buildSearchIndex() {
        // Core documentation sections
        this.addCoreDocumentation();
        
        // Features and components
        this.addFeaturesAndComponents();
        
        // API documentation
        this.addAPIDocumentation();
        
        // Security documentation
        this.addSecurityDocumentation();
        
        // Markdown documentation
        await this.indexMarkdownDocs();
        
        // System components
        this.addSystemComponents();
    }

    addCoreDocumentation() {
        const coreDocs = [
            {
                title: 'Getting Started',
                category: 'documentation',
                subcategory: 'basics',
                content: 'Learn how to get started with SirsiNexus admin panel',
                url: '#getting-started',
                keywords: ['start', 'begin', 'setup', 'introduction', 'basics']
            },
            {
                title: 'User Management',
                category: 'documentation',
                subcategory: 'users',
                content: 'Create, edit, and manage user accounts and permissions',
                url: '#users',
                keywords: ['user', 'account', 'permission', 'role', 'access', 'admin']
            },
            {
                title: 'Data Room',
                category: 'documentation',
                subcategory: 'data',
                content: 'Secure document storage and sharing capabilities',
                url: '#data-room',
                keywords: ['data', 'document', 'file', 'storage', 'share', 'upload']
            },
            {
                title: 'Telemetry Dashboard',
                category: 'documentation',
                subcategory: 'analytics',
                content: 'Real-time analytics and user behavior tracking',
                url: '#telemetry',
                keywords: ['analytics', 'metrics', 'telemetry', 'tracking', 'dashboard', 'statistics']
            },
            {
                title: 'Site Settings',
                category: 'documentation',
                subcategory: 'configuration',
                content: 'Configure site-wide settings and preferences',
                url: '#settings',
                keywords: ['settings', 'configuration', 'preferences', 'customize', 'options']
            },
            {
                title: 'System Logs',
                category: 'documentation', 
                subcategory: 'monitoring',
                content: 'View and analyze system logs and events',
                url: '#logs',
                keywords: ['logs', 'events', 'monitoring', 'errors', 'debugging', 'audit']
            },
            {
                title: 'Workflow Assessment',
                category: 'documentation',
                subcategory: 'analysis',
                content: 'Comprehensive analysis of portal workflows and user journeys',
                url: '#workflow-assessment',
                keywords: ['workflow', 'assessment', 'analysis', 'navigation', 'user journey', 'testing']
            },
            {
                title: 'Workflow Assessment Report',
                category: 'documentation',
                subcategory: 'reports',
                content: 'Detailed workflow assessment with critical pages, links, and user flow verification',
                url: '/docs/workflow-assessment.html',
                keywords: ['workflow', 'report', 'assessment', 'critical paths', 'verification', 'testing', 'quality']
            },
            {
                title: 'API Reference',
                category: 'documentation',
                subcategory: 'api',
                content: 'Complete API documentation and endpoints',
                url: '#api',
                keywords: ['api', 'endpoints', 'rest', 'integration', 'reference']
            },
            {
                title: 'Troubleshooting',
                category: 'documentation',
                subcategory: 'support',
                content: 'Common issues and solutions',
                url: '#troubleshooting',
                keywords: ['troubleshoot', 'problem', 'issue', 'fix', 'help', 'support']
            }
        ];

        this.searchIndex.push(...coreDocs);
    }

    addFeaturesAndComponents() {
        const features = [
            // Authentication & Security
            {
                title: 'Secure Authentication Service',
                category: 'feature',
                subcategory: 'security',
                content: 'Enterprise-grade authentication with 2FA, SSO, and biometric support',
                url: '/admin/security/',
                keywords: ['authentication', 'login', 'security', '2fa', 'sso', 'biometric']
            },
            {
                title: 'Session Management',
                category: 'feature',
                subcategory: 'security',
                content: 'Automatic session timeout, inactivity warnings, and secure session storage',
                url: '/docs/SECURITY_INTEGRATION_GUIDE.md#session-management',
                keywords: ['session', 'timeout', 'inactivity', 'logout', 'security']
            },
            {
                title: 'CSRF Protection',
                category: 'feature',
                subcategory: 'security',
                content: 'Automatic CSRF token generation and validation for all forms',
                url: '/docs/SECURITY_INTEGRATION_GUIDE.md#csrf-protection',
                keywords: ['csrf', 'token', 'form', 'protection', 'security']
            },
            {
                title: 'XSS Prevention',
                category: 'feature',
                subcategory: 'security',
                content: 'Real-time DOM monitoring and script injection detection',
                url: '/docs/SECURITY_INTEGRATION_GUIDE.md#xss-prevention',
                keywords: ['xss', 'injection', 'script', 'monitoring', 'security']
            },
            
            // User Management
            {
                title: 'User Dashboard',
                category: 'component',
                subcategory: 'users',
                content: 'Comprehensive user management interface',
                url: '/admin/users/',
                keywords: ['user', 'dashboard', 'management', 'interface']
            },
            {
                title: 'Role-Based Access Control',
                category: 'feature',
                subcategory: 'users',
                content: 'Fine-grained permissions and role management',
                url: '/admin/users/roles.html',
                keywords: ['rbac', 'role', 'permission', 'access', 'control']
            },
            
            // Data Management
            {
                title: 'Investor Data Room',
                category: 'component',
                subcategory: 'data',
                content: 'Secure document repository for investor materials',
                url: '/investor-portal/data-room.html',
                keywords: ['investor', 'data room', 'documents', 'repository']
            },
            {
                title: 'File Upload Manager',
                category: 'component',
                subcategory: 'data',
                content: 'Drag-and-drop file upload with progress tracking',
                url: '/admin/data-room.html',
                keywords: ['upload', 'file', 'drag drop', 'manager']
            },
            
            // Analytics & Monitoring
            {
                title: 'Real-time Telemetry',
                category: 'feature',
                subcategory: 'analytics',
                content: 'Live user activity and system performance monitoring',
                url: '/admin/dashboard/telemetry.html',
                keywords: ['telemetry', 'real-time', 'monitoring', 'analytics']
            },
            {
                title: 'System Status Dashboard',
                category: 'component',
                subcategory: 'monitoring',
                content: 'Complete system health and status overview',
                url: '/admin/system-status/',
                keywords: ['status', 'health', 'monitoring', 'dashboard']
            },
            
            // Integration Tools
            {
                title: 'QR Code Generator',
                category: 'tool',
                subcategory: 'utilities',
                content: 'Generate QR codes for quick access and sharing',
                url: '/qr-code-manager.html',
                keywords: ['qr', 'code', 'generator', 'tool', 'utility']
            },
            {
                title: 'Universal Navigation',
                category: 'component',
                subcategory: 'ui',
                content: 'Consistent navigation across all portals',
                url: '/components/universal-navigation.js',
                keywords: ['navigation', 'menu', 'ui', 'component']
            }
        ];

        this.searchIndex.push(...features);
    }

    addAPIDocumentation() {
        const apiDocs = [
            {
                title: 'Authentication API',
                category: 'api',
                subcategory: 'auth',
                content: 'POST /api/auth/login - User authentication endpoint',
                url: '#api',
                keywords: ['api', 'auth', 'login', 'authentication', 'endpoint']
            },
            {
                title: 'User Management API',
                category: 'api',
                subcategory: 'users',
                content: 'CRUD operations for user management',
                url: '#api',
                keywords: ['api', 'user', 'crud', 'management', 'endpoint']
            },
            {
                title: 'Telemetry API',
                category: 'api',
                subcategory: 'analytics',
                content: 'GET /api/metrics - Retrieve platform metrics',
                url: '#api',
                keywords: ['api', 'telemetry', 'metrics', 'analytics', 'endpoint']
            },
            {
                title: 'Security API',
                category: 'api',
                subcategory: 'security',
                content: 'Security configuration and audit log endpoints',
                url: '#api',
                keywords: ['api', 'security', 'audit', 'configuration', 'endpoint']
            }
        ];

        this.searchIndex.push(...apiDocs);
    }

    addSecurityDocumentation() {
        const securityDocs = [
            {
                title: 'Security Integration Guide',
                category: 'documentation',
                subcategory: 'security',
                content: 'Comprehensive guide for implementing security features',
                url: '/docs/SECURITY_INTEGRATION_GUIDE.md',
                keywords: ['security', 'integration', 'guide', 'implementation', 'comprehensive']
            },
            {
                title: 'Security Quick Reference',
                category: 'documentation',
                subcategory: 'security',
                content: 'Quick reference for security implementation and testing',
                url: '/docs/SECURITY_QUICK_REFERENCE.md',
                keywords: ['security', 'quick', 'reference', 'testing', 'console']
            },
            {
                title: 'Security Dashboard',
                category: 'component',
                subcategory: 'security',
                content: 'Real-time security monitoring and configuration',
                url: '/admin/security/index.html',
                keywords: ['security', 'dashboard', 'monitoring', 'configuration', 'admin']
            },
            {
                title: 'Audit Logging',
                category: 'feature',
                subcategory: 'security',
                content: 'Comprehensive security event tracking and analysis',
                url: '/admin/security/index.html#audit-logs',
                keywords: ['audit', 'log', 'security', 'tracking', 'events']
            },
            {
                title: 'Firewall Configuration',
                category: 'feature',
                subcategory: 'security',
                content: 'IP whitelisting, blacklisting, and traffic filtering',
                url: '/admin/security/index.html#firewall',
                keywords: ['firewall', 'ip', 'whitelist', 'blacklist', 'security']
            },
            {
                title: 'Two-Factor Authentication',
                category: 'feature',
                subcategory: 'security',
                content: '2FA setup and management for enhanced security',
                url: '/admin/security/index.html#2fa',
                keywords: ['2fa', 'two-factor', 'authentication', 'security', 'totp']
            }
        ];

        this.searchIndex.push(...securityDocs);
    }

    async indexMarkdownDocs() {
        // List of markdown documentation files
        const markdownFiles = [
            {
                path: '/docs/SECURITY_INTEGRATION_GUIDE.md',
                title: 'Security Integration Implementation Guide',
                category: 'guide'
            },
            {
                path: '/docs/SECURITY_QUICK_REFERENCE.md',
                title: 'Security Quick Reference',
                category: 'reference'
            },
            {
                path: '/docs/README.md',
                title: 'Project Documentation',
                category: 'general'
            },
            {
                path: '/admin/docs/SECURITY-MANAGEMENT-README.md',
                title: 'Security Management Documentation',
                category: 'admin'
            },
            {
                path: '/investor-portal/DATA_ROOM_README.md',
                title: 'Investor Data Room Guide',
                category: 'investor'
            }
        ];

        // Add markdown docs to search index
        markdownFiles.forEach(doc => {
            this.searchIndex.push({
                title: doc.title,
                category: 'markdown',
                subcategory: doc.category,
                content: `Markdown documentation: ${doc.title}`,
                url: doc.path,
                keywords: doc.title.toLowerCase().split(' ')
            });
        });
    }

    addSystemComponents() {
        const systemComponents = [
            // JavaScript Components
            {
                title: 'Authentication Integration Module',
                category: 'component',
                subcategory: 'javascript',
                content: 'auth-integration.js - Seamless authentication integration layer',
                url: '/assets/js/auth-integration.js',
                keywords: ['auth', 'integration', 'javascript', 'module', 'authentication']
            },
            {
                title: 'Security Initializer',
                category: 'component',
                subcategory: 'javascript',
                content: 'security-init.js - Global security initialization script',
                url: '/assets/js/security-init.js',
                keywords: ['security', 'init', 'javascript', 'global', 'initialization']
            },
            {
                title: 'Dashboard API Module',
                category: 'component',
                subcategory: 'javascript',
                content: 'dashboard-api.js - Dashboard data and API integration',
                url: '/assets/js/dashboard-api.js',
                keywords: ['dashboard', 'api', 'javascript', 'integration', 'data']
            },
            
            // Pages and Portals
            {
                title: 'Admin Portal',
                category: 'portal',
                subcategory: 'admin',
                content: 'Main administrative dashboard and control center',
                url: '/admin/',
                keywords: ['admin', 'portal', 'dashboard', 'control', 'management']
            },
            {
                title: 'Investor Portal',
                category: 'portal',
                subcategory: 'investor',
                content: 'Secure investor access portal with data room',
                url: '/investor-portal/',
                keywords: ['investor', 'portal', 'data room', 'secure', 'access']
            },
            {
                title: 'Developer Portal',
                category: 'portal',
                subcategory: 'developer',
                content: 'Developer resources and API documentation',
                url: '/dev/',
                keywords: ['developer', 'portal', 'api', 'resources', 'documentation']
            }
        ];

        this.searchIndex.push(...systemComponents);
    }

    setupSearchHandlers() {
        // Setup search input handlers
        const searchInputs = document.querySelectorAll('[data-doc-search], #docSearch, #searchDocs');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleSearch(e.target.value));
            input.addEventListener('focus', (e) => this.showSearchResults(e.target));
            
            // Handle keyboard navigation
            input.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchDocumentation(query);
        this.displaySearchResults(results, query);
    }

    searchDocumentation(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return this.searchIndex
            .map(item => {
                let score = 0;
                const titleLower = item.title.toLowerCase();
                const contentLower = item.content.toLowerCase();
                const keywordsStr = item.keywords.join(' ');
                
                searchTerms.forEach(term => {
                    // Title match (highest priority)
                    if (titleLower.includes(term)) score += 10;
                    
                    // Exact keyword match
                    if (item.keywords.includes(term)) score += 8;
                    
                    // Content match
                    if (contentLower.includes(term)) score += 5;
                    
                    // Partial keyword match
                    if (keywordsStr.includes(term)) score += 3;
                    
                    // Category/subcategory match
                    if (item.category.includes(term) || item.subcategory.includes(term)) score += 4;
                });
                
                return { ...item, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20); // Limit to top 20 results
    }

    displaySearchResults(results, query) {
        const container = this.getOrCreateSearchResultsContainer();
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                    <p>No results found for "${query}"</p>
                    <p class="text-sm mt-2">Try different keywords or browse the documentation sections</p>
                </div>
            `;
            container.classList.remove('hidden');
            return;
        }

        // Group results by category
        const grouped = this.groupResultsByCategory(results);
        
        let html = '<div class="max-h-96 overflow-y-auto">';
        
        Object.entries(grouped).forEach(([category, items]) => {
            html += `
                <div class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div class="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        ${this.formatCategoryName(category)}
                    </div>
                    <div class="divide-y divide-gray-100 dark:divide-gray-800">
            `;
            
            items.forEach((item, index) => {
                const icon = this.getCategoryIcon(item.category);
                const isExternal = item.url.startsWith('/') || item.url.startsWith('http');
                
                html += `
                    <a href="${item.url}" 
                       class="search-result-item block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                       data-index="${index}"
                       ${isExternal ? 'target="_blank"' : ''}>
                        <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 mt-0.5">
                                ${icon}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    ${this.highlightSearchTerms(item.title, query)}
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    ${this.highlightSearchTerms(item.content, query)}
                                </div>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-xs text-gray-500 dark:text-gray-500">
                                        ${item.subcategory}
                                    </span>
                                    ${isExternal ? '<span class="text-xs text-blue-600 dark:text-blue-400">→</span>' : ''}
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            });
            
            html += '</div></div>';
        });
        
        html += '</div>';
        
        container.innerHTML = html;
        container.classList.remove('hidden');
    }

    groupResultsByCategory(results) {
        return results.reduce((grouped, item) => {
            const category = item.category;
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(item);
            return grouped;
        }, {});
    }

    formatCategoryName(category) {
        const names = {
            'documentation': 'Documentation',
            'feature': 'Features',
            'component': 'Components',
            'api': 'API Reference',
            'tool': 'Tools',
            'portal': 'Portals',
            'markdown': 'Guides',
            'guide': 'Implementation Guides',
            'reference': 'Quick References'
        };
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    getCategoryIcon(category) {
        const icons = {
            'documentation': '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
            'feature': '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            'component': '<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>',
            'api': '<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>',
            'tool': '<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
            'portal': '<svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>',
            'markdown': '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
        };
        return icons[category] || '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
    }

    highlightSearchTerms(text, query) {
        const terms = query.split(' ').filter(term => term.length > 0);
        let highlighted = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
        });
        
        return highlighted;
    }

    getOrCreateSearchResultsContainer() {
        let container = document.getElementById('searchResults');
        if (!container) {
            const searchInput = document.querySelector('[data-doc-search], #docSearch, #searchDocs');
            if (searchInput) {
                container = document.createElement('div');
                container.id = 'searchResults';
                container.className = 'absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 hidden z-50';
                searchInput.parentElement.appendChild(container);
            }
        }
        return container;
    }

    hideSearchResults() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.classList.add('hidden');
        }
    }

    showSearchResults(input) {
        if (input.value.length >= 2) {
            this.handleSearch(input.value);
        }
    }

    handleKeyboardNavigation(e) {
        const container = document.getElementById('searchResults');
        if (!container || container.classList.contains('hidden')) return;
        
        const results = container.querySelectorAll('.search-result-item');
        const currentIndex = Array.from(results).findIndex(el => el.classList.contains('bg-gray-100'));
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateResults(results, currentIndex, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateResults(results, currentIndex, -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0 && results[currentIndex]) {
                    results[currentIndex].click();
                }
                break;
            case 'Escape':
                this.hideSearchResults();
                e.target.blur();
                break;
        }
    }

    navigateResults(results, currentIndex, direction) {
        // Remove current highlight
        results.forEach(el => el.classList.remove('bg-gray-100', 'dark:bg-gray-700'));
        
        // Calculate new index
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = results.length - 1;
        if (newIndex >= results.length) newIndex = 0;
        
        // Add highlight to new item
        if (results[newIndex]) {
            results[newIndex].classList.add('bg-gray-100', 'dark:bg-gray-700');
            results[newIndex].scrollIntoView({ block: 'nearest' });
        }
    }
}

// Initialize documentation search when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.docSearch = new DocumentationSearch();
    });
} else {
    window.docSearch = new DocumentationSearch();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentationSearch;
}
