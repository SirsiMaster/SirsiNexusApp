/**
 * User Onboarding Service
 * Interactive onboarding experience with guided tours and setup wizards
 */

class OnboardingService {
    constructor() {
        this.currentStep = 0;
        this.tourActive = false;
        this.completed = false;
        
        this.config = {
            skipEnabled: true,
            persistProgress: true,
            animationDuration: 300,
            overlayOpacity: 0.7,
            highlightPadding: 10
        };
        
        this.tours = {
            newUser: this.getNewUserTour(),
            dashboard: this.getDashboardTour(),
            project: this.getProjectTour(),
            deployment: this.getDeploymentTour()
        };
        
        this.progress = {
            completedTours: [],
            currentTour: null,
            currentStep: 0,
            skipped: false
        };
        
        this.init();
    }
    
    init() {
        // Load saved progress
        this.loadProgress();
        
        // Create overlay elements
        this.createOverlayElements();
        
        // Check if user needs onboarding
        this.checkOnboardingStatus();
        
        console.log('[Onboarding] Service initialized');
    }
    
    /**
     * Get new user tour steps
     */
    getNewUserTour() {
        return {
            id: 'newUser',
            name: 'Welcome to SirsiNexus',
            steps: [
                {
                    title: 'Welcome to SirsiNexus! 🎉',
                    content: 'Let\'s take a quick tour to help you get started with our platform.',
                    position: 'center',
                    buttons: [
                        { text: 'Get Started', action: 'next', primary: true },
                        { text: 'Skip Tour', action: 'skip' }
                    ]
                },
                {
                    element: '.dashboard-nav',
                    title: 'Navigation Menu',
                    content: 'Access all your projects, deployments, and settings from here.',
                    position: 'right',
                    highlight: true
                },
                {
                    element: '#create-project-btn',
                    title: 'Create Your First Project',
                    content: 'Click here to create a new project and start building.',
                    position: 'bottom',
                    highlight: true,
                    action: 'click'
                },
                {
                    element: '.analytics-widget',
                    title: 'Analytics Dashboard',
                    content: 'Monitor your usage, performance metrics, and billing here.',
                    position: 'top',
                    highlight: true
                },
                {
                    element: '.notification-bell',
                    title: 'Notifications',
                    content: 'Stay updated with real-time notifications about your projects.',
                    position: 'left',
                    highlight: true
                },
                {
                    title: 'You\'re All Set! 🚀',
                    content: 'You\'re ready to start using SirsiNexus. Need help? Check our documentation or contact support.',
                    position: 'center',
                    buttons: [
                        { text: 'Start Building', action: 'complete', primary: true }
                    ]
                }
            ]
        };
    }
    
    /**
     * Get dashboard tour steps
     */
    getDashboardTour() {
        return {
            id: 'dashboard',
            name: 'Dashboard Overview',
            steps: [
                {
                    element: '.metrics-overview',
                    title: 'Key Metrics',
                    content: 'View your most important metrics at a glance.',
                    position: 'bottom',
                    highlight: true
                },
                {
                    element: '.recent-activity',
                    title: 'Recent Activity',
                    content: 'Track recent deployments, commits, and team activity.',
                    position: 'left',
                    highlight: true
                },
                {
                    element: '.quick-actions',
                    title: 'Quick Actions',
                    content: 'Access frequently used actions quickly from here.',
                    position: 'top',
                    highlight: true
                }
            ]
        };
    }
    
    /**
     * Get project creation tour
     */
    getProjectTour() {
        return {
            id: 'project',
            name: 'Creating a Project',
            steps: [
                {
                    element: '#project-name',
                    title: 'Project Name',
                    content: 'Give your project a unique name.',
                    position: 'right',
                    highlight: true
                },
                {
                    element: '#framework-select',
                    title: 'Choose Framework',
                    content: 'Select the framework for your project.',
                    position: 'right',
                    highlight: true
                },
                {
                    element: '#env-variables',
                    title: 'Environment Variables',
                    content: 'Add any environment variables your project needs.',
                    position: 'top',
                    highlight: true
                },
                {
                    element: '#create-btn',
                    title: 'Create Project',
                    content: 'Click here to create your project.',
                    position: 'top',
                    highlight: true
                }
            ]
        };
    }
    
    /**
     * Get deployment tour
     */
    getDeploymentTour() {
        return {
            id: 'deployment',
            name: 'Deploying Your Project',
            steps: [
                {
                    element: '.deployment-branch',
                    title: 'Select Branch',
                    content: 'Choose which branch to deploy.',
                    position: 'right',
                    highlight: true
                },
                {
                    element: '.deployment-env',
                    title: 'Environment',
                    content: 'Select the target environment (production, staging, etc).',
                    position: 'right',
                    highlight: true
                },
                {
                    element: '.deploy-btn',
                    title: 'Deploy',
                    content: 'Click to start the deployment process.',
                    position: 'top',
                    highlight: true
                }
            ]
        };
    }
    
    /**
     * Create overlay elements
     */
    createOverlayElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'onboarding-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, ${this.config.overlayOpacity});
            z-index: 9998;
            display: none;
            transition: opacity ${this.config.animationDuration}ms;
        `;
        
        // Create highlight box
        this.highlight = document.createElement('div');
        this.highlight.id = 'onboarding-highlight';
        this.highlight.style.cssText = `
            position: fixed;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, ${this.config.overlayOpacity});
            z-index: 9999;
            display: none;
            transition: all ${this.config.animationDuration}ms;
            pointer-events: none;
        `;
        
        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'onboarding-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 12px;
            padding: 20px;
            max-width: 400px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: none;
        `;
        
        // Append to body
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.highlight);
        document.body.appendChild(this.tooltip);
    }
    
    /**
     * Check if user needs onboarding
     */
    checkOnboardingStatus() {
        // Check if user is new
        if (this.isNewUser() && !this.progress.skipped) {
            // Auto-start onboarding after a delay
            setTimeout(() => {
                this.startTour('newUser');
            }, 1000);
        }
    }
    
    /**
     * Check if user is new
     */
    isNewUser() {
        // Check localStorage or user data
        const userData = this.getUserData();
        return !userData || !userData.onboardingCompleted;
    }
    
    /**
     * Start a tour
     */
    startTour(tourId) {
        const tour = this.tours[tourId];
        if (!tour) {
            console.error('[Onboarding] Tour not found:', tourId);
            return;
        }
        
        this.currentTour = tour;
        this.currentStep = 0;
        this.tourActive = true;
        
        // Save progress
        this.progress.currentTour = tourId;
        this.progress.currentStep = 0;
        this.saveProgress();
        
        // Show first step
        this.showStep(0);
        
        // Track event
        this.trackEvent('tour_started', { tourId });
    }
    
    /**
     * Show a step
     */
    showStep(stepIndex) {
        if (!this.currentTour || stepIndex >= this.currentTour.steps.length) {
            this.completeTour();
            return;
        }
        
        const step = this.currentTour.steps[stepIndex];
        this.currentStep = stepIndex;
        
        // Update progress
        this.progress.currentStep = stepIndex;
        this.saveProgress();
        
        // Show overlay
        this.showOverlay();
        
        // Highlight element if specified
        if (step.element && step.highlight) {
            this.highlightElement(step.element);
        } else {
            this.hideHighlight();
        }
        
        // Show tooltip
        this.showTooltip(step);
        
        // Track event
        this.trackEvent('step_viewed', { 
            tourId: this.currentTour.id, 
            stepIndex,
            stepTitle: step.title 
        });
    }
    
    /**
     * Show overlay
     */
    showOverlay() {
        this.overlay.style.display = 'block';
        setTimeout(() => {
            this.overlay.style.opacity = '1';
        }, 10);
    }
    
    /**
     * Hide overlay
     */
    hideOverlay() {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, this.config.animationDuration);
    }
    
    /**
     * Highlight an element
     */
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn('[Onboarding] Element not found:', selector);
            return;
        }
        
        const rect = element.getBoundingClientRect();
        const padding = this.config.highlightPadding;
        
        this.highlight.style.display = 'block';
        this.highlight.style.left = `${rect.left - padding}px`;
        this.highlight.style.top = `${rect.top - padding}px`;
        this.highlight.style.width = `${rect.width + padding * 2}px`;
        this.highlight.style.height = `${rect.height + padding * 2}px`;
        
        // Allow clicks on highlighted element
        element.style.position = 'relative';
        element.style.zIndex = '10001';
    }
    
    /**
     * Hide highlight
     */
    hideHighlight() {
        this.highlight.style.display = 'none';
    }
    
    /**
     * Show tooltip
     */
    showTooltip(step) {
        // Build tooltip content
        const content = `
            <div style="position: relative;">
                ${this.config.skipEnabled ? `
                    <button onclick="window.onboardingService.skipTour()" 
                            style="position: absolute; top: -10px; right: -10px; 
                                   background: none; border: none; cursor: pointer; 
                                   color: #9ca3af; font-size: 20px;">
                        ×
                    </button>
                ` : ''}
                
                <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                    ${step.title}
                </h3>
                
                <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.5;">
                    ${step.content}
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #9ca3af; font-size: 14px;">
                        ${this.currentStep + 1} / ${this.currentTour.steps.length}
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        ${step.buttons ? step.buttons.map(btn => `
                            <button onclick="window.onboardingService.handleAction('${btn.action}')"
                                    style="padding: 8px 16px; border-radius: 6px; border: none; 
                                           cursor: pointer; font-size: 14px; font-weight: 500;
                                           background: ${btn.primary ? '#3b82f6' : '#e5e7eb'};
                                           color: ${btn.primary ? 'white' : '#374151'};">
                                ${btn.text}
                            </button>
                        `).join('') : `
                            ${this.currentStep > 0 ? `
                                <button onclick="window.onboardingService.previousStep()"
                                        style="padding: 8px 16px; border-radius: 6px; border: none; 
                                               cursor: pointer; font-size: 14px; font-weight: 500;
                                               background: #e5e7eb; color: #374151;">
                                    Previous
                                </button>
                            ` : ''}
                            <button onclick="window.onboardingService.nextStep()"
                                    style="padding: 8px 16px; border-radius: 6px; border: none; 
                                           cursor: pointer; font-size: 14px; font-weight: 500;
                                           background: #3b82f6; color: white;">
                                ${this.currentStep === this.currentTour.steps.length - 1 ? 'Complete' : 'Next'}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        
        // Position tooltip
        this.positionTooltip(step);
    }
    
    /**
     * Position tooltip
     */
    positionTooltip(step) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        if (step.element) {
            const element = document.querySelector(step.element);
            if (element) {
                const elementRect = element.getBoundingClientRect();
                
                switch (step.position) {
                    case 'top':
                        this.tooltip.style.left = `${elementRect.left + elementRect.width / 2 - tooltipRect.width / 2}px`;
                        this.tooltip.style.top = `${elementRect.top - tooltipRect.height - 20}px`;
                        break;
                    case 'bottom':
                        this.tooltip.style.left = `${elementRect.left + elementRect.width / 2 - tooltipRect.width / 2}px`;
                        this.tooltip.style.top = `${elementRect.bottom + 20}px`;
                        break;
                    case 'left':
                        this.tooltip.style.left = `${elementRect.left - tooltipRect.width - 20}px`;
                        this.tooltip.style.top = `${elementRect.top + elementRect.height / 2 - tooltipRect.height / 2}px`;
                        break;
                    case 'right':
                        this.tooltip.style.left = `${elementRect.right + 20}px`;
                        this.tooltip.style.top = `${elementRect.top + elementRect.height / 2 - tooltipRect.height / 2}px`;
                        break;
                }
            }
        } else {
            // Center position
            this.tooltip.style.left = `${window.innerWidth / 2 - tooltipRect.width / 2}px`;
            this.tooltip.style.top = `${window.innerHeight / 2 - tooltipRect.height / 2}px`;
        }
    }
    
    /**
     * Handle action
     */
    handleAction(action) {
        switch (action) {
            case 'next':
                this.nextStep();
                break;
            case 'skip':
                this.skipTour();
                break;
            case 'complete':
                this.completeTour();
                break;
        }
    }
    
    /**
     * Go to next step
     */
    nextStep() {
        if (this.currentStep < this.currentTour.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.completeTour();
        }
    }
    
    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    /**
     * Skip tour
     */
    skipTour() {
        this.tourActive = false;
        this.hideOverlay();
        this.hideHighlight();
        this.tooltip.style.display = 'none';
        
        // Save skip status
        this.progress.skipped = true;
        this.saveProgress();
        
        // Track event
        this.trackEvent('tour_skipped', { 
            tourId: this.currentTour.id,
            stepIndex: this.currentStep
        });
    }
    
    /**
     * Complete tour
     */
    completeTour() {
        this.tourActive = false;
        this.hideOverlay();
        this.hideHighlight();
        this.tooltip.style.display = 'none';
        
        // Mark as completed
        if (!this.progress.completedTours.includes(this.currentTour.id)) {
            this.progress.completedTours.push(this.currentTour.id);
        }
        this.progress.currentTour = null;
        this.saveProgress();
        
        // Track event
        this.trackEvent('tour_completed', { tourId: this.currentTour.id });
        
        // Show completion message
        this.showCompletionMessage();
    }
    
    /**
     * Show completion message
     */
    showCompletionMessage() {
        if (window.notificationService) {
            window.notificationService.showNotification({
                title: 'Tour Completed! 🎉',
                body: 'Great job! You\'ve completed the tour.',
                type: 'success',
                duration: 5000
            });
        }
    }
    
    /**
     * Load progress
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('onboardingProgress');
            if (saved) {
                this.progress = JSON.parse(saved);
            }
        } catch (error) {
            console.error('[Onboarding] Failed to load progress:', error);
        }
    }
    
    /**
     * Save progress
     */
    saveProgress() {
        if (!this.config.persistProgress) return;
        
        try {
            localStorage.setItem('onboardingProgress', JSON.stringify(this.progress));
        } catch (error) {
            console.error('[Onboarding] Failed to save progress:', error);
        }
    }
    
    /**
     * Get user data
     */
    getUserData() {
        // Get from Firebase or localStorage
        if (firebase?.auth?.currentUser) {
            return firebase.auth.currentUser;
        }
        
        return JSON.parse(localStorage.getItem('userData') || 'null');
    }
    
    /**
     * Track event
     */
    trackEvent(eventName, data) {
        console.log('[Onboarding] Event:', eventName, data);
        
        // Send to analytics
        if (window.analytics) {
            window.analytics.track(eventName, data);
        }
        
        // Firebase Analytics
        if (firebase?.analytics) {
            firebase.analytics().logEvent(eventName, data);
        }
    }
    
    /**
     * Reset progress
     */
    resetProgress() {
        this.progress = {
            completedTours: [],
            currentTour: null,
            currentStep: 0,
            skipped: false
        };
        this.saveProgress();
    }
    
    /**
     * Get completion status
     */
    getCompletionStatus() {
        const totalTours = Object.keys(this.tours).length;
        const completedTours = this.progress.completedTours.length;
        
        return {
            completed: completedTours,
            total: totalTours,
            percentage: Math.round((completedTours / totalTours) * 100),
            tours: Object.keys(this.tours).map(id => ({
                id,
                name: this.tours[id].name,
                completed: this.progress.completedTours.includes(id)
            }))
        };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.onboardingService = new OnboardingService();
    });
} else {
    window.onboardingService = new OnboardingService();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingService;
}
