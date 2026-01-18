/**
 * Sirsi SDK for JavaScript
 * Build powerful applications on the Sirsi platform
 * Version: 1.0.0
 * 
 * @example
 * import Sirsi from '@sirsi/sdk';
 * 
 * const sirsi = new Sirsi({
 *   apiKey: 'your-api-key',
 *   environment: 'production'
 * });
 */

class SirsiSDK {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.SIRSI_API_KEY;
        this.environment = config.environment || 'production';
        this.baseURL = config.baseURL || 'https://api.sirsi.ai/v1';
        this.githubToken = config.githubToken;
        this.websocket = null;
        this.listeners = new Map();
        
        // Initialize modules
        this.infrastructure = new InfrastructureModule(this);
        this.ai = new AIModule(this);
        this.deployment = new DeploymentModule(this);
        this.monitoring = new MonitoringModule(this);
        this.collaboration = new CollaborationModule(this);
    }

    /**
     * Make authenticated API request
     */
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-Sirsi-SDK-Version': '1.0.0',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Connect to real-time updates
     */
    connect() {
        const wsURL = this.baseURL.replace('https', 'wss').replace('/v1', '/ws');
        this.websocket = new WebSocket(`${wsURL}?apiKey=${this.apiKey}`);

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.emit(data.event, data.payload);
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.reconnect();
        };

        return new Promise((resolve, reject) => {
            this.websocket.onopen = () => resolve(this);
            this.websocket.onerror = reject;
        });
    }

    /**
     * Reconnect WebSocket with exponential backoff
     */
    reconnect(attempt = 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        setTimeout(() => {
            this.connect().catch(() => this.reconnect(attempt + 1));
        }, delay);
    }

    /**
     * Subscribe to events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    /**
     * Emit events to listeners
     */
    emit(event, data) {
        this.listeners.get(event)?.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    /**
     * GitHub integration
     */
    async linkGitHub(token) {
        this.githubToken = token;
        return this.request('/github/link', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    }

    /**
     * Create a new project
     */
    async createProject(config) {
        const project = await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(config)
        });

        // Auto-create GitHub repo if token available
        if (this.githubToken && config.createRepo) {
            await this.deployment.createGitHubRepo(project.id, config.name);
        }

        return project;
    }
}

/**
 * Infrastructure Module
 * Manage cloud resources and scaling
 */
class InfrastructureModule {
    constructor(sdk) {
        this.sdk = sdk;
    }

    async provision(config) {
        return this.sdk.request('/infrastructure/provision', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    async scale(resourceId, config) {
        return this.sdk.request(`/infrastructure/${resourceId}/scale`, {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    async getMetrics(resourceId) {
        return this.sdk.request(`/infrastructure/${resourceId}/metrics`);
    }

    async predictFailures(resourceId) {
        return this.sdk.request(`/infrastructure/${resourceId}/predict`);
    }
}

/**
 * AI Module
 * Access Sirsi's AI capabilities
 */
class AIModule {
    constructor(sdk) {
        this.sdk = sdk;
    }

    async analyze(data, options = {}) {
        return this.sdk.request('/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ data, ...options })
        });
    }

    async generateCode(prompt, language = 'javascript') {
        return this.sdk.request('/ai/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt, language })
        });
    }

    async optimizePerformance(code) {
        return this.sdk.request('/ai/optimize', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }

    async detectAnomalies(metrics) {
        return this.sdk.request('/ai/anomalies', {
            method: 'POST',
            body: JSON.stringify({ metrics })
        });
    }
}

/**
 * Deployment Module
 * CI/CD and deployment management
 */
class DeploymentModule {
    constructor(sdk) {
        this.sdk = sdk;
    }

    async deploy(projectId, config = {}) {
        return this.sdk.request(`/projects/${projectId}/deploy`, {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    async rollback(deploymentId) {
        return this.sdk.request(`/deployments/${deploymentId}/rollback`, {
            method: 'POST'
        });
    }

    async getStatus(deploymentId) {
        return this.sdk.request(`/deployments/${deploymentId}/status`);
    }

    async createGitHubRepo(projectId, name) {
        return this.sdk.request(`/projects/${projectId}/github`, {
            method: 'POST',
            body: JSON.stringify({ 
                name,
                token: this.sdk.githubToken 
            })
        });
    }

    async setupCI(projectId, config) {
        return this.sdk.request(`/projects/${projectId}/ci`, {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }
}

/**
 * Monitoring Module
 * Real-time monitoring and alerting
 */
class MonitoringModule {
    constructor(sdk) {
        this.sdk = sdk;
    }

    async getLogs(resourceId, options = {}) {
        const params = new URLSearchParams(options);
        return this.sdk.request(`/monitoring/${resourceId}/logs?${params}`);
    }

    async setAlert(config) {
        return this.sdk.request('/monitoring/alerts', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    async getHealth(resourceId) {
        return this.sdk.request(`/monitoring/${resourceId}/health`);
    }

    async getTraces(resourceId, traceId) {
        return this.sdk.request(`/monitoring/${resourceId}/traces/${traceId}`);
    }
}

/**
 * Collaboration Module
 * Team collaboration features
 */
class CollaborationModule {
    constructor(sdk) {
        this.sdk = sdk;
        this.presence = new Map();
    }

    async joinSession(projectId) {
        await this.sdk.request(`/collaboration/${projectId}/join`, {
            method: 'POST'
        });

        // Subscribe to real-time updates
        this.sdk.on(`project:${projectId}:update`, (data) => {
            this.handleCollaborationUpdate(projectId, data);
        });
    }

    async shareCode(projectId, code, metadata = {}) {
        return this.sdk.request(`/collaboration/${projectId}/share`, {
            method: 'POST',
            body: JSON.stringify({ code, metadata })
        });
    }

    async getPresence(projectId) {
        return this.sdk.request(`/collaboration/${projectId}/presence`);
    }

    handleCollaborationUpdate(projectId, data) {
        if (data.type === 'presence') {
            this.presence.set(data.userId, data);
        }
        
        // Emit for local listeners
        this.sdk.emit(`collaboration:${data.type}`, data);
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SirsiSDK;
} else if (typeof define === 'function' && define.amd) {
    define([], () => SirsiSDK);
} else {
    window.SirsiSDK = SirsiSDK;
}

// TypeScript definitions
/**
 * @typedef {Object} SirsiConfig
 * @property {string} apiKey - Your Sirsi API key
 * @property {string} [environment='production'] - Environment to use
 * @property {string} [baseURL] - Custom API base URL
 * @property {string} [githubToken] - GitHub personal access token
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Project ID
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} githubRepo - GitHub repository
 * @property {string} status - Project status
 * @property {Date} createdAt - Creation date
 */
