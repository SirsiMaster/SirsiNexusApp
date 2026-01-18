// Page Functionality Fix
// This file makes all buttons and features operational on the main page

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page functionality script loaded');
    
    // Fix Hero Demo Button
    const heroDemoButton = document.getElementById('hero-demo-button');
    if (heroDemoButton) {
        heroDemoButton.addEventListener('click', function() {
            // Show demo modal or redirect to demo page
            const demoModal = createDemoModal();
            document.body.appendChild(demoModal);
            setTimeout(() => {
                demoModal.classList.add('show');
            }, 10);
        });
    }
    
    // Initialize the state machine for infrastructure animation
    if (typeof AnimationStateMachine !== 'undefined') {
        window.stateMachine = new AnimationStateMachine();
        const animationController = new InfrastructureAnimationController(window.stateMachine);
        animationController.initialize();
    } else {
        // Fallback if animation-state.js doesn't load
        window.stateMachine = {
            start: function() {
                console.log('Starting infrastructure demo...');
                updateInfrastructureProgress();
            }
        };
    }
    
    // Fix anchor links to scroll smoothly
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // Show coming soon message for non-existent sections
                showComingSoonMessage(targetId);
            }
        });
    });
    
    // Add functionality to "Get Started" buttons in investor section
    document.querySelectorAll('button:not(#hero-demo-button):not([onclick])').forEach(button => {
        if (button.textContent.includes('Get Started') || 
            button.textContent.includes('Sign In') || 
            button.textContent.includes('Try Demo')) {
            button.addEventListener('click', function() {
                handleActionButton(this.textContent.trim());
            });
        }
    });
});

// Create demo modal
function createDemoModal() {
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeDemoModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">SirsiNexus Live Demo</h2>
                <button onclick="closeDemoModal()" class="close-btn">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="demo-options">
                    <div class="demo-card" onclick="startInteractiveDemo()">
                        <div class="demo-icon bg-gradient-to-br from-blue-500 to-blue-600">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Interactive Demo</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Experience our platform with a guided walkthrough</p>
                    </div>
                    
                    <div class="demo-card" onclick="watchVideoDemo()">
                        <div class="demo-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Video Demo</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Watch a 5-minute overview of key features</p>
                    </div>
                    
                    <div class="demo-card" onclick="scheduleLiveDemo()">
                        <div class="demo-icon bg-gradient-to-br from-purple-500 to-purple-600">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Schedule Live Demo</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Book a personalized demo with our team</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .demo-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .demo-modal.show {
            opacity: 1;
        }
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }
        .modal-content {
            position: relative;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow: auto;
        }
        .dark .modal-content {
            background: #1e293b;
        }
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dark .modal-header {
            border-bottom-color: #475569;
        }
        .close-btn {
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: background 0.2s;
            cursor: pointer;
            background: transparent;
            border: none;
        }
        .close-btn:hover {
            background: #f1f5f9;
        }
        .dark .close-btn:hover {
            background: #334155;
        }
        .modal-body {
            padding: 1.5rem;
        }
        .demo-options {
            display: grid;
            gap: 1rem;
        }
        .demo-card {
            padding: 1.5rem;
            border: 2px solid #e2e8f0;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .dark .demo-card {
            border-color: #475569;
        }
        .demo-card:hover {
            border-color: #10b981;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .demo-icon {
            width: 60px;
            height: 60px;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
    
    return modal;
}

// Close demo modal
window.closeDemoModal = function() {
    const modal = document.querySelector('.demo-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};

// Demo actions
window.startInteractiveDemo = function() {
    closeDemoModal();
    // Start the infrastructure animation
    if (window.stateMachine && window.stateMachine.start) {
        window.stateMachine.start();
    }
    // Scroll to the infrastructure animation section
    const platformSection = document.getElementById('platform');
    if (platformSection) {
        platformSection.scrollIntoView({ behavior: 'smooth' });
    }
    showNotification('Interactive demo started! Watch the infrastructure deployment simulation below.', 'success');
};

window.watchVideoDemo = function() {
    closeDemoModal();
    showNotification('Video demo coming soon! Check back in a few days.', 'info');
};

window.scheduleLiveDemo = function() {
    closeDemoModal();
    window.location.href = '/contact.html';
};

// Handle action buttons
function handleActionButton(buttonText) {
    const actions = {
        'Get Started': () => {
            window.location.href = '/signup.html';
        },
        'Sign In': () => {
            window.location.href = '/investor-login.html';
        },
        'Try Demo': () => {
            document.getElementById('hero-demo-button').click();
        },
        'Start Demo': () => {
            if (window.stateMachine && window.stateMachine.start) {
                window.stateMachine.start();
            }
        }
    };
    
    const action = actions[buttonText];
    if (action) {
        action();
    } else {
        showNotification(`${buttonText} functionality coming soon!`, 'info');
    }
}

// Show coming soon message
function showComingSoonMessage(sectionId) {
    const sectionNames = {
        'docs': 'Documentation',
        'pricing': 'Pricing',
        'about': 'About Us',
        'careers': 'Careers',
        'blog': 'Blog',
        'contact': 'Contact'
    };
    
    const sectionName = sectionNames[sectionId] || sectionId;
    showNotification(`${sectionName} section coming soon!`, 'info');
}

// Update infrastructure progress (fallback)
function updateInfrastructureProgress() {
    const progressBar = document.getElementById('infrastructure-progress');
    const stateLabel = document.getElementById('current-state');
    const detailsPanel = document.getElementById('details-panel');
    
    if (!progressBar || !stateLabel || !detailsPanel) return;
    
    const states = [
        { name: 'Analyzing', progress: 20, color: 'bg-blue-500' },
        { name: 'Planning', progress: 40, color: 'bg-indigo-500' },
        { name: 'Deploying', progress: 60, color: 'bg-purple-500' },
        { name: 'Monitoring', progress: 80, color: 'bg-emerald-500' },
        { name: 'Optimizing', progress: 100, color: 'bg-green-500' }
    ];
    
    let currentIndex = 0;
    
    function updateState() {
        if (currentIndex >= states.length) {
            currentIndex = 0;
            progressBar.style.width = '0%';
            stateLabel.textContent = 'Complete';
            detailsPanel.innerHTML = '<div class="text-center text-emerald-600 font-semibold">Infrastructure deployment complete!</div>';
            return;
        }
        
        const state = states[currentIndex];
        progressBar.style.width = state.progress + '%';
        progressBar.className = 'h-full transition-all duration-500 ease-in-out ' + state.color;
        stateLabel.innerHTML = `<span class="text-emerald-600">${state.name}...</span>`;
        detailsPanel.innerHTML = `
            <div class="text-sm">
                <div class="font-semibold mb-2">${state.name} Infrastructure</div>
                <div class="text-slate-600 dark:text-slate-400">Processing step ${currentIndex + 1} of ${states.length}</div>
            </div>
        `;
        
        currentIndex++;
        setTimeout(updateState, 2000);
    }
    
    updateState();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${getNotificationIcon(type)}
            <span>${message}</span>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10000;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                background: white;
                border-left: 4px solid;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            .dark .notification {
                background: #1e293b;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-success {
                border-left-color: #10b981;
            }
            .notification-info {
                border-left-color: #3b82f6;
            }
            .notification-warning {
                border-left-color: #f59e0b;
            }
            .notification-error {
                border-left-color: #ef4444;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: '<svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
        info: '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
        warning: '<svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
        error: '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
    };
    return icons[type] || icons.info;
}

console.log('Page functionality script ready');
