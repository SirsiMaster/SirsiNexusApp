/**
 * SirsiNexus Accessibility System
 * Comprehensive ARIA labels, keyboard navigation, and screen reader support
 * @version 1.0.0
 */

class AccessibilityManager {
    constructor() {
        this.focusableElements = [
            'a[href]',
            'area[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex^="-"])'
        ].join(', ');
        
        this.keyboardMap = {
            'Escape': 'escape',
            'Enter': 'enter',
            'Space': 'space',
            'Tab': 'tab',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Home': 'home',
            'End': 'end',
            'PageUp': 'pageup',
            'PageDown': 'pagedown'
        };
        
        this.announcements = [];
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.createScreenReaderUtils();
        this.enhanceFocusManagement();
        this.setupKeyboardNavigation();
        this.addARIALabels();
        this.setupSkipLinks();
        this.monitorFocusChanges();
        this.enhanceFormAccessibility();
        this.setupModalAccessibility();
        
        console.log('✓ Accessibility features initialized');
    }

    /**
     * Create screen reader utilities
     */
    createScreenReaderUtils() {
        // Create live region for announcements
        if (!document.getElementById('sr-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = `
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            `;
            document.body.appendChild(liveRegion);
        }

        // Create assertive live region for urgent announcements
        if (!document.getElementById('sr-assertive-region')) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.id = 'sr-assertive-region';
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            assertiveRegion.className = 'sr-only';
            assertiveRegion.style.cssText = `
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            `;
            document.body.appendChild(assertiveRegion);
        }
    }

    /**
     * Announce text to screen readers
     */
    announce(message, priority = 'polite') {
        if (!message) return;
        
        const regionId = priority === 'assertive' ? 'sr-assertive-region' : 'sr-live-region';
        const region = document.getElementById(regionId);
        
        if (region) {
            // Clear previous announcement
            region.textContent = '';
            
            // Add new announcement after a brief delay
            setTimeout(() => {
                region.textContent = message;
                this.announcements.push({
                    message,
                    priority,
                    timestamp: new Date().toISOString()
                });
            }, 100);
            
            // Clear announcement after it's been read
            setTimeout(() => {
                if (region.textContent === message) {
                    region.textContent = '';
                }
            }, 5000);
        }
    }

    /**
     * Setup skip links for keyboard navigation
     */
    setupSkipLinks() {
        if (document.getElementById('skip-links')) return;

        const skipLinks = document.createElement('div');
        skipLinks.id = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#search" class="skip-link">Skip to search</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add skip link styles
        if (!document.getElementById('skip-link-styles')) {
            const styles = document.createElement('style');
            styles.id = 'skip-link-styles';
            styles.textContent = `
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: #000;
                    color: #fff;
                    padding: 8px;
                    text-decoration: none;
                    border-radius: 0 0 4px 4px;
                    z-index: 10000;
                    font-weight: 600;
                    transition: top 0.3s;
                }
                
                .skip-link:focus {
                    top: 0;
                }
                
                .dark .skip-link {
                    background: #fff;
                    color: #000;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    /**
     * Enhance focus management
     */
    enhanceFocusManagement() {
        // Add focus indicators
        if (!document.getElementById('focus-styles')) {
            const focusStyles = document.createElement('style');
            focusStyles.id = 'focus-styles';
            focusStyles.textContent = `
                /* Focus indicators */
                *:focus {
                    outline: 2px solid #059669 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.2) !important;
                }
                
                .dark *:focus {
                    outline-color: #34d399 !important;
                    box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2) !important;
                }
                
                /* Hide focus for mouse users */
                .mouse-user *:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                /* Enhanced focus for specific elements */
                button:focus,
                .btn:focus,
                a:focus,
                input:focus,
                select:focus,
                textarea:focus {
                    transform: translateY(-1px);
                    transition: all 0.2s ease;
                }
                
                /* Card focus states */
                .card:focus-within {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 2px #059669 !important;
                }
                
                .dark .card:focus-within {
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 2px #34d399 !important;
                }
            `;
            document.head.appendChild(focusStyles);
        }

        // Track input method
        let isMouseUser = false;
        
        document.addEventListener('mousedown', () => {
            isMouseUser = true;
            document.body.classList.add('mouse-user');
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isMouseUser = false;
                document.body.classList.remove('mouse-user');
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Handle navigation menus
        this.setupMenuNavigation();
        
        // Handle table navigation
        this.setupTableNavigation();
        
        // Handle modal navigation
        this.setupModalKeyboardHandling();
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyboard(e) {
        const key = this.keyboardMap[e.key] || e.key.toLowerCase();
        
        // Global shortcuts (Alt + key)
        if (e.altKey) {
            switch (key) {
                case '1':
                    e.preventDefault();
                    this.focusElement('#main-content');
                    this.announce('Jumped to main content');
                    break;
                case '2':
                    e.preventDefault();
                    this.focusElement('#navigation, nav, .admin-sidebar');
                    this.announce('Jumped to navigation');
                    break;
                case '3':
                    e.preventDefault();
                    this.focusElement('#search, [type="search"], .search-input');
                    this.announce('Jumped to search');
                    break;
                case 's':
                    e.preventDefault();
                    this.focusElement('#search, [type="search"], .search-input');
                    this.announce('Search focused');
                    break;
                case 'm':
                    e.preventDefault();
                    const sidebar = document.querySelector('.admin-sidebar');
                    if (sidebar && sidebar.toggleSidebar) {
                        sidebar.toggleSidebar();
                        this.announce('Menu toggled');
                    }
                    break;
                case 't':
                    e.preventDefault();
                    if (window.toggleTheme) {
                        window.toggleTheme();
                        const isDark = document.documentElement.classList.contains('dark');
                        this.announce(`Switched to ${isDark ? 'dark' : 'light'} theme`);
                    }
                    break;
            }
        }

        // Escape key handling
        if (key === 'escape') {
            this.handleEscapeKey(e);
        }
    }

    /**
     * Setup menu navigation
     */
    setupMenuNavigation() {
        const menus = document.querySelectorAll('.nav-list, .dropdown-menu');
        
        menus.forEach(menu => {
            const items = menu.querySelectorAll('a, button, [role="menuitem"]');
            
            items.forEach((item, index) => {
                item.addEventListener('keydown', (e) => {
                    const key = this.keyboardMap[e.key] || e.key.toLowerCase();
                    
                    switch (key) {
                        case 'down':
                            e.preventDefault();
                            const nextItem = items[index + 1] || items[0];
                            nextItem.focus();
                            break;
                        case 'up':
                            e.preventDefault();
                            const prevItem = items[index - 1] || items[items.length - 1];
                            prevItem.focus();
                            break;
                        case 'home':
                            e.preventDefault();
                            items[0].focus();
                            break;
                        case 'end':
                            e.preventDefault();
                            items[items.length - 1].focus();
                            break;
                        case 'escape':
                            e.preventDefault();
                            if (menu.classList.contains('dropdown-menu')) {
                                const button = menu.previousElementSibling;
                                if (button) button.focus();
                            }
                            break;
                    }
                });
            });
        });
    }

    /**
     * Setup table navigation
     */
    setupTableNavigation() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            const cells = table.querySelectorAll('td, th');
            const rows = table.querySelectorAll('tr');
            
            cells.forEach(cell => {
                if (!cell.hasAttribute('tabindex')) {
                    cell.setAttribute('tabindex', '-1');
                }
                
                cell.addEventListener('keydown', (e) => {
                    const key = this.keyboardMap[e.key] || e.key.toLowerCase();
                    const currentRow = cell.closest('tr');
                    const currentRowIndex = Array.from(rows).indexOf(currentRow);
                    const currentCellIndex = Array.from(currentRow.cells).indexOf(cell);
                    
                    switch (key) {
                        case 'right':
                            e.preventDefault();
                            const nextCell = currentRow.cells[currentCellIndex + 1];
                            if (nextCell) nextCell.focus();
                            break;
                        case 'left':
                            e.preventDefault();
                            const prevCell = currentRow.cells[currentCellIndex - 1];
                            if (prevCell) prevCell.focus();
                            break;
                        case 'down':
                            e.preventDefault();
                            const nextRow = rows[currentRowIndex + 1];
                            if (nextRow && nextRow.cells[currentCellIndex]) {
                                nextRow.cells[currentCellIndex].focus();
                            }
                            break;
                        case 'up':
                            e.preventDefault();
                            const prevRow = rows[currentRowIndex - 1];
                            if (prevRow && prevRow.cells[currentCellIndex]) {
                                prevRow.cells[currentCellIndex].focus();
                            }
                            break;
                    }
                });
            });
        });
    }

    /**
     * Setup modal keyboard handling
     */
    setupModalKeyboardHandling() {
        document.addEventListener('keydown', (e) => {
            const activeModal = document.querySelector('.modal.active, .idle-warning-modal');
            
            if (activeModal && e.key === 'Tab') {
                this.trapFocus(e, activeModal);
            }
        });
    }

    /**
     * Trap focus within an element
     */
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle escape key
     */
    handleEscapeKey(e) {
        // Close modals
        const modal = document.querySelector('.modal.active, .idle-warning-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.btn-close, .btn-logout');
            if (closeBtn) {
                closeBtn.click();
            }
            return;
        }

        // Close dropdowns
        const openDropdown = document.querySelector('.user-dropdown.open');
        if (openDropdown) {
            openDropdown.classList.remove('open');
            const button = openDropdown.querySelector('button');
            if (button) button.focus();
            return;
        }

        // Clear search
        const activeSearch = document.activeElement;
        if (activeSearch && activeSearch.type === 'search') {
            activeSearch.value = '';
            this.announce('Search cleared');
        }
    }

    /**
     * Add ARIA labels to elements
     */
    addARIALabels() {
        // Add labels to common elements
        this.addLabelToElement('main', 'Main content');
        this.addLabelToElement('.admin-sidebar', 'Navigation sidebar');
        this.addLabelToElement('.admin-header', 'Page header');
        this.addLabelToElement('.dashboard-widgets', 'Dashboard widgets');
        
        // Label charts
        document.querySelectorAll('canvas').forEach((canvas, index) => {
            if (!canvas.getAttribute('aria-label')) {
                const parent = canvas.closest('.card');
                const title = parent ? parent.querySelector('h3')?.textContent : null;
                canvas.setAttribute('aria-label', title || `Chart ${index + 1}`);
                canvas.setAttribute('role', 'img');
            }
        });

        // Label tables
        document.querySelectorAll('table').forEach(table => {
            if (!table.getAttribute('aria-label')) {
                const caption = table.querySelector('caption');
                const title = table.previousElementSibling?.textContent;
                table.setAttribute('aria-label', caption?.textContent || title || 'Data table');
            }
        });

        // Label form controls
        document.querySelectorAll('input, select, textarea').forEach(control => {
            if (!control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${control.id}"]`);
                const placeholder = control.getAttribute('placeholder');
                
                if (!label && placeholder) {
                    control.setAttribute('aria-label', placeholder);
                }
            }
        });

        // Label buttons without text
        document.querySelectorAll('button').forEach(button => {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                const icon = button.querySelector('svg, i');
                if (icon) {
                    const title = button.getAttribute('title') || 'Button';
                    button.setAttribute('aria-label', title);
                }
            }
        });

        // Label metric cards
        document.querySelectorAll('.metric-card').forEach(card => {
            const value = card.querySelector('.metric-value')?.textContent;
            const label = card.querySelector('.metric-label')?.textContent;
            
            if (value && label) {
                card.setAttribute('aria-label', `${label}: ${value}`);
                card.setAttribute('role', 'region');
            }
        });
    }

    /**
     * Add label to element
     */
    addLabelToElement(selector, label) {
        const element = document.querySelector(selector);
        if (element && !element.getAttribute('aria-label')) {
            element.setAttribute('aria-label', label);
        }
    }

    /**
     * Enhance form accessibility
     */
    enhanceFormAccessibility() {
        // Add required indicators
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            field.setAttribute('aria-required', 'true');
            
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (label && !label.textContent.includes('*')) {
                label.innerHTML += ' <span aria-label="required">*</span>';
            }
        });

        // Add error handling
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('invalid', (e) => {
                const field = e.target;
                const errorMessage = field.validationMessage;
                
                this.showFieldError(field, errorMessage);
                this.announce(`Error: ${errorMessage}`, 'assertive');
            }, true);

            form.addEventListener('input', (e) => {
                const field = e.target;
                if (field.hasAttribute('aria-invalid')) {
                    if (field.validity.valid) {
                        this.clearFieldError(field);
                    }
                }
            });
        });
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        field.setAttribute('aria-invalid', 'true');
        
        let errorElement = document.getElementById(`${field.id}-error`);
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = `${field.id}-error`;
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id);
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.removeAttribute('aria-invalid');
        
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.remove();
            field.removeAttribute('aria-describedby');
        }
    }

    /**
     * Setup modal accessibility
     */
    setupModalAccessibility() {
        // Observe for new modals
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('modal') || node.classList?.contains('idle-warning-modal')) {
                            this.enhanceModal(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        
        // Enhance existing modals
        document.querySelectorAll('.modal, .idle-warning-modal').forEach(modal => {
            this.enhanceModal(modal);
        });
    }

    /**
     * Enhance modal accessibility
     */
    enhanceModal(modal) {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        const content = modal.querySelector('.modal-content, .idle-warning-content');
        if (content) {
            const title = content.querySelector('h1, h2, h3, h4, h5, h6');
            if (title) {
                if (!title.id) {
                    title.id = `modal-title-${Date.now()}`;
                }
                modal.setAttribute('aria-labelledby', title.id);
            }
        }

        // Focus first focusable element when modal opens
        const focusableElements = modal.querySelectorAll(this.focusableElements);
        if (focusableElements.length > 0) {
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100);
        }
    }

    /**
     * Monitor focus changes
     */
    monitorFocusChanges() {
        let lastFocusedElement = null;
        
        document.addEventListener('focusin', (e) => {
            const currentElement = e.target;
            
            // Announce page sections
            if (currentElement !== lastFocusedElement) {
                const section = currentElement.closest('[role="main"], main, [role="navigation"], nav, [role="banner"], header');
                if (section && section !== lastFocusedElement?.closest('[role="main"], main, [role="navigation"], nav, [role="banner"], header')) {
                    const sectionName = this.getSectionName(section);
                    if (sectionName) {
                        this.announce(`Entered ${sectionName}`);
                    }
                }
            }
            
            lastFocusedElement = currentElement;
        });
    }

    /**
     * Get section name for announcements
     */
    getSectionName(section) {
        const label = section.getAttribute('aria-label');
        if (label) return label;
        
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) return heading.textContent.trim();
        
        if (section.tagName === 'MAIN') return 'main content';
        if (section.tagName === 'NAV') return 'navigation';
        if (section.tagName === 'HEADER') return 'header';
        
        return null;
    }

    /**
     * Focus element by selector
     */
    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            return true;
        }
        return false;
    }

    /**
     * Get accessibility stats
     */
    getAccessibilityStats() {
        const stats = {
            elementsWithAria: document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]').length,
            focusableElements: document.querySelectorAll(this.focusableElements).length,
            headingStructure: this.getHeadingStructure(),
            announcements: this.announcements.length,
            formsWithLabels: this.getFormsWithLabels()
        };
        
        return stats;
    }

    /**
     * Get heading structure
     */
    getHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const structure = {};
        
        headings.forEach(heading => {
            const level = heading.tagName.toLowerCase();
            structure[level] = (structure[level] || 0) + 1;
        });
        
        return structure;
    }

    /**
     * Get forms with labels
     */
    getFormsWithLabels() {
        const forms = document.querySelectorAll('form');
        let formsWithLabels = 0;
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            let hasAllLabels = true;
            
            inputs.forEach(input => {
                const hasLabel = input.getAttribute('aria-label') ||
                               input.getAttribute('aria-labelledby') ||
                               document.querySelector(`label[for="${input.id}"]`);
                
                if (!hasLabel) {
                    hasAllLabels = false;
                }
            });
            
            if (hasAllLabels) {
                formsWithLabels++;
            }
        });
        
        return formsWithLabels;
    }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
