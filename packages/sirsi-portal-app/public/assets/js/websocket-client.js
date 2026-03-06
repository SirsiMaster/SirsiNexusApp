/**
 * WebSocket Client Service for SirsiNexus
 * Handles real-time communication with the WebSocket server
 * @version 1.0.0
 */

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectInterval = 5000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
        this.isConnected = false;
        this.clientId = null;
        this.pingInterval = null;
        this.config = {
            url: window.location.hostname === 'localhost' 
                ? 'ws://localhost:8080' 
                : window.location.protocol === 'https:' 
                    ? 'wss://echo.websocket.org' // Use echo server for demo
                    : 'ws://echo.websocket.org',
            heartbeatInterval: 30000, // 30 seconds
            useMockConnection: true // Use mock for GitHub Pages
        };
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        // Check if we should use mock connection (for GitHub Pages)
        if (this.config.useMockConnection || window.location.hostname.includes('github.io')) {
            console.log('Using mock WebSocket connection...');
            // Mock connection will be handled by mock-websocket.js
            return;
        }
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        console.log('Connecting to WebSocket server...');
        
        try {
            this.ws = new WebSocket(this.config.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        // Connection opened
        this.ws.onopen = () => {
            console.log('WebSocket connected successfully');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Notify listeners
            this.emit('connected', { timestamp: new Date().toISOString() });
        };

        // Message received
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        // Connection closed
        this.ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            this.isConnected = false;
            this.clientId = null;
            this.stopHeartbeat();
            
            // Notify listeners
            this.emit('disconnected', { 
                code: event.code, 
                reason: event.reason,
                timestamp: new Date().toISOString() 
            });
            
            // Attempt to reconnect
            if (event.code !== 1000) { // 1000 = normal closure
                this.scheduleReconnect();
            }
        };

        // Error occurred
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', { error, timestamp: new Date().toISOString() });
        };
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        console.log('WebSocket message received:', data);

        switch (data.type) {
            case 'welcome':
                this.clientId = data.clientId;
                console.log('Client ID assigned:', this.clientId);
                this.emit('welcome', data);
                break;

            case 'pong':
                // Heartbeat response received
                break;

            case 'kpiUpdate':
                this.emit('kpiUpdate', data);
                break;

            case 'newActivity':
                this.emit('newActivity', data);
                break;

            case 'newNotification':
                this.emit('newNotification', data);
                break;

            case 'userCountUpdate':
                this.emit('userCountUpdate', data);
                break;

            case 'userAction':
                this.emit('userAction', data);
                break;

            case 'systemStatusUpdate':
                this.emit('systemStatusUpdate', data);
                break;

            case 'metricsUpdate':
                this.emit('metricsUpdate', data);
                break;

            case 'error':
                console.error('Server error:', data.message);
                this.emit('serverError', data);
                break;

            default:
                console.log('Unknown message type:', data.type);
                this.emit(data.type, data);
        }
    }

    /**
     * Send message to server
     */
    send(type, payload = {}) {
        if (!this.isConnected || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, cannot send message');
            return false;
        }

        try {
            const message = JSON.stringify({
                type,
                ...payload,
                clientId: this.clientId,
                timestamp: new Date().toISOString()
            });
            
            this.ws.send(message);
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    }

    /**
     * Subscribe to event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from event
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.pingInterval = setInterval(() => {
            this.send('ping');
        }, this.config.heartbeatInterval);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached', {
                attempts: this.reconnectAttempts,
                timestamp: new Date().toISOString()
            });
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectInterval * this.reconnectAttempts;
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.isConnected = false;
        this.clientId = null;
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Send user action
     */
    sendUserAction(action, details = {}) {
        this.send('userAction', {
            action,
            user: sessionStorage.getItem('userEmail') || 'unknown',
            details
        });
    }

    /**
     * Send activity log
     */
    sendActivity(activity) {
        this.send('activityLog', { activity });
    }

    /**
     * Send notification
     */
    sendNotification(notification) {
        this.send('notification', { notification });
    }

    /**
     * Send KPI update
     */
    sendKPIUpdate(kpiId, value) {
        this.send('kpiUpdate', { kpiId, value });
    }

    /**
     * Subscribe to specific channels
     */
    subscribe(channels) {
        this.send('subscribe', { channels });
    }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

// Export for use in other modules
window.websocketClient = websocketClient;
