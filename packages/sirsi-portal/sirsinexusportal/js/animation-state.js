// Animation State Machine
class AnimationStateMachine {
  constructor() {
    this.currentState = 'idle';
    this.states = {
      idle: {
        next: 'analyzing',
        timeout: 0
      },
      analyzing: {
        next: 'planning',
        timeout: 3000
      },
      planning: {
        next: 'deploying',
        timeout: 4000
      },
      deploying: {
        next: 'monitoring',
        timeout: 5000
      },
      monitoring: {
        next: 'optimizing',
        timeout: 4000
      },
      optimizing: {
        next: 'idle',
        timeout: 3000
      }
    };
    
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(state, data) {
    this.subscribers.forEach(callback => callback(state, data));
  }

  async transition(targetState) {
    if (!this.states[targetState]) {
      console.error(`Invalid state: ${targetState}`);
      return;
    }

    this.currentState = targetState;
    this.notify(targetState, {
      timestamp: new Date().toISOString()
    });

    if (this.states[targetState].timeout > 0) {
      await new Promise(resolve => setTimeout(resolve, this.states[targetState].timeout));
      await this.transition(this.states[targetState].next);
    }
  }

  start() {
    if (this.currentState === 'idle') {
      this.transition('analyzing');
    }
  }

  stop() {
    this.currentState = 'idle';
    this.notify('idle', {
      timestamp: new Date().toISOString()
    });
  }
}

// Infrastructure Animation Controller
class InfrastructureAnimationController {
  constructor(stateMachine) {
    this.stateMachine = stateMachine;
    this.elements = {};
    this.progress = 0;
  }

  initialize() {
    // Find and store references to animation elements
    this.elements = {
      progressBar: document.getElementById('infrastructure-progress'),
      stateLabel: document.getElementById('current-state'),
      detailsPanel: document.getElementById('details-panel')
    };

    // Subscribe to state changes
    this.stateMachine.subscribe((state, data) => this.handleStateChange(state, data));
  }

  handleStateChange(state, data) {
    // Update UI elements based on state
    if (this.elements.stateLabel) {
      this.elements.stateLabel.innerHTML = `Infrastructure State: <span class="text-emerald-500 font-semibold">${state.charAt(0).toUpperCase() + state.slice(1)}</span>`;
    }

    // Update progress bar with smooth animation
    if (this.elements.progressBar) {
      const progressMap = {
        'analyzing': { progress: 20, color: 'bg-blue-500' },
        'planning': { progress: 40, color: 'bg-indigo-500' },
        'deploying': { progress: 60, color: 'bg-purple-500' },
        'monitoring': { progress: 80, color: 'bg-emerald-500' },
        'optimizing': { progress: 100, color: 'bg-green-500' },
        'idle': { progress: 0, color: 'bg-slate-500' }
      };

      const stateConfig = progressMap[state] || { progress: 0, color: 'bg-slate-500' };
      
      // Remove all possible color classes
      this.elements.progressBar.classList.remove(
        'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
        'bg-emerald-500', 'bg-green-500', 'bg-slate-500'
      );
      
      // Add new color class
      this.elements.progressBar.classList.add(stateConfig.color);
      
      // Update progress with animation
      this.updateProgress(stateConfig.progress);
    }

    // Update details panel with dynamic content
    if (this.elements.detailsPanel) {
      this.updateDetailsPanel(state, data);
      
      // Add visual feedback
      this.elements.detailsPanel.classList.add('scale-105', 'border-emerald-400');
      setTimeout(() => {
        this.elements.detailsPanel.classList.remove('scale-105', 'border-emerald-400');
      }, 200);
    }
  }

  updateProgress(value) {
    this.progress = value;
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${value}%`;
    }
  }

  updateDetailsPanel(state, data) {
    const details = {
      analyzing: {
        message: 'Analyzing current infrastructure and requirements...',
        steps: [
          'Scanning network topology',
          'Evaluating resource utilization',
          'Identifying optimization opportunities'
        ],
        metrics: { label: 'Systems Analyzed', value: '127' }
      },
      planning: {
        message: 'Planning optimal deployment strategy...',
        steps: [
          'Calculating resource requirements',
          'Generating migration timeline',
          'Validating dependencies'
        ],
        metrics: { label: 'Potential Savings', value: '$12.5K/mo' }
      },
      deploying: {
        message: 'Deploying infrastructure components...',
        steps: [
          'Provisioning cloud resources',
          'Configuring network settings',
          'Setting up monitoring agents'
        ],
        metrics: { label: 'Components Deployed', value: '45/73' }
      },
      monitoring: {
        message: 'Monitoring system health and performance...',
        steps: [
          'Collecting performance metrics',
          'Analyzing response times',
          'Checking system stability'
        ],
        metrics: { label: 'Uptime', value: '99.99%' }
      },
      optimizing: {
        message: 'Optimizing resource allocation...',
        steps: [
          'Adjusting compute resources',
          'Optimizing data flows',
          'Fine-tuning configurations'
        ],
        metrics: { label: 'Performance Gain', value: '+27%' }
      },
      idle: {
        message: 'Ready to start infrastructure deployment',
        steps: [
          'System initialized',
          'AI agents standing by',
          'Awaiting deployment command'
        ],
        metrics: { label: 'System Status', value: 'Ready' }
      }
    };

    const stateInfo = details[state];
    const stepProgress = Math.floor(Math.random() * 3) + 1; // Random progress 1-3 steps

    this.elements.detailsPanel.innerHTML = `
      <div class="space-y-4 transition-all duration-300">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">${state.charAt(0).toUpperCase() + state.slice(1)}</h3>
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div class="w-2 h-2 rounded-full animate-pulse ${state === 'idle' ? 'bg-slate-400' : 'bg-emerald-500'}"></div>
            <span class="text-sm font-medium">${state === 'idle' ? 'Standby' : 'Active'}</span>
          </div>
        </div>

        <p class="text-slate-600 dark:text-slate-400">${stateInfo.message}</p>

        <div class="space-y-2">
          ${stateInfo.steps.map((step, index) => `
            <div class="flex items-center gap-2 ${index < stepProgress ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${index < stepProgress ? '
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                ' : '
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                '}
              </svg>
              <span class="text-sm">${step}</span>
            </div>
          `).join('')}
        </div>

        <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">
            ${stateInfo.metrics.label}: <span class="font-semibold text-emerald-600 dark:text-emerald-400">${stateInfo.metrics.value}</span>
          </div>
          <div class="text-xs text-slate-400 dark:text-slate-500">
            Updated: ${new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize state machine and controller
function initializeAnimation() {
  console.log('Initializing animation...');
  const stateMachine = new AnimationStateMachine();
  const animationController = new InfrastructureAnimationController(stateMachine);

  // Make stateMachine globally available
  window.stateMachine = stateMachine;
  window.animationController = animationController;

  // Initialize immediately
  animationController.initialize();

  // Add click handler for hero demo button
  const heroButton = document.getElementById('hero-demo-button');
  if (heroButton) {
    console.log('Found hero demo button, adding click handler');
    heroButton.onclick = () => {
      console.log('Demo button clicked');
      if (window.stateMachine) {
        console.log('Starting state machine...');
        window.stateMachine.start();
        // Scroll to the infrastructure section
        document.getElementById('SirsiNexusPortal-platform').scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('State machine not found');
      }
    };
  } else {
    console.error('Hero demo button not found');
  }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimation);
