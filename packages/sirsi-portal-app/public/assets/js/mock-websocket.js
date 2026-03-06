/**
 * Mock WebSocket Implementation for GitHub Pages
 * Simulates real-time updates without requiring a real WebSocket server
 * @version 1.0.0
 */

class MockWebSocket {
    constructor() {
        this.listeners = new Map();
        this.isConnected = false;
        this.clientId = 'mock-' + Math.random().toString(36).substr(2, 9);
        this.simulationInterval = null;
        this.mockData = {
            activities: [
                { user: 'john@example.com', action: 'Logged in', status: 'success' },
                { user: 'jane@example.com', action: 'Updated profile', status: 'completed' },
                { user: 'admin@sirsinexus.com', action: 'Approved document', status: 'success' },
                { user: 'investor@example.com', action: 'Viewed report', status: 'completed' },
                { user: 'manager@example.com', action: 'Created project', status: 'success' }
            ],
            notifications: [
                { type: 'info', title: 'New Feature Available', message: 'Check out our new analytics dashboard' },
                { type: 'success', title: 'Backup Complete', message: 'System backup completed successfully' },
                { type: 'warning', title: 'Scheduled Maintenance', message: 'System maintenance scheduled for tonight' }
            ],
            kpis: [
                { id: 'total-users', change: 1 },
                { id: 'pending-review', change: -1 },
                { id: 'approved', change: 1 },
                { id: 'invites-sent', change: 1 }
            ]
        };
    }

    /**
     * Mock connection
     */
    connect() {
        console.log('Mock WebSocket: Connecting...');
        
        setTimeout(() => {
            this.isConnected = true;
            this.emit('connected', { timestamp: new Date().toISOString() });
            
            // Send welcome message
            setTimeout(() => {
                this.emit('welcome', { 
                    clientId: this.clientId,
                    timestamp: new Date().toISOString() 
                });
            }, 100);
            
            // Start simulating real-time updates
            this.startSimulation();
        }, 500);
    }

    /**
     * Start simulating real-time updates
     */
    startSimulation() {
        // Simulate random updates every 5-15 seconds
        const simulateUpdate = () => {
            if (!this.isConnected) return;
            
            const updateTypes = ['activity', 'notification', 'kpi', 'userCount', 'systemStatus'];
            const type = updateTypes[Math.floor(Math.random() * updateTypes.length)];
            
            switch (type) {
                case 'activity':
                    this.simulateNewActivity();
                    break;
                case 'notification':
                    this.simulateNewNotification();
                    break;
                case 'kpi':
                    this.simulateKPIUpdate();
                    break;
                case 'userCount':
                    this.simulateUserCountUpdate();
                    break;
                case 'systemStatus':
                    this.simulateSystemStatusUpdate();
                    break;
            }
            
            // Schedule next update
            const nextDelay = 5000 + Math.random() * 10000; // 5-15 seconds
            this.simulationInterval = setTimeout(simulateUpdate, nextDelay);
        };
        
        // Start simulation after a short delay
        this.simulationInterval = setTimeout(simulateUpdate, 3000);
    }

    /**
     * Simulate new activity
     */
    simulateNewActivity() {
        const activity = this.mockData.activities[Math.floor(Math.random() * this.mockData.activities.length)];
        const newActivity = {
            id: 'activity-' + Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        };
        
        this.emit('newActivity', { 
            activity: newActivity,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Simulate new notification
     */
    simulateNewNotification() {
        const template = this.mockData.notifications[Math.floor(Math.random() * this.mockData.notifications.length)];
        const notification = {
            id: Date.now(),
            ...template,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.emit('newNotification', { 
            notification,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Simulate KPI update
     */
    simulateKPIUpdate() {
        const kpi = this.mockData.kpis[Math.floor(Math.random() * this.mockData.kpis.length)];
        
        this.emit('kpiUpdate', {
            kpiId: kpi.id,
            change: kpi.change * (1 + Math.floor(Math.random() * 3)),
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Simulate user count update
     */
    simulateUserCountUpdate() {
        const count = Math.floor(Math.random() * 10) + 5;
        
        this.emit('userCountUpdate', {
            count,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Simulate system status update
     */
    simulateSystemStatusUpdate() {
        const status = {
            server: {
                status: 'operational',
                uptime: 99.95 + Math.random() * 0.05,
                health: 'good'
            },
            api: {
                responseTime: 80 + Math.floor(Math.random() * 100),
                status: 'healthy'
            },
            storage: {
                used: 65 + Math.floor(Math.random() * 10),
                total: 100,
                percentage: 65 + Math.floor(Math.random() * 10)
            }
        };
        
        this.emit('systemStatusUpdate', {
            status,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Subscribe to event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
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
     * Emit event
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
     * Mock send method
     */
    send(type, payload) {
        console.log('Mock WebSocket: Sending', type, payload);
        
        // Simulate echo response for certain message types
        if (type === 'ping') {
            setTimeout(() => {
                this.emit('pong', { timestamp: new Date().toISOString() });
            }, 100);
        }
        
        return true;
    }

    /**
     * Disconnect
     */
    disconnect() {
        this.isConnected = false;
        
        if (this.simulationInterval) {
            clearTimeout(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        this.emit('disconnected', {
            code: 1000,
            reason: 'Client disconnect',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Check connection status
     */
    isConnected() {
        return this.isConnected;
    }
}

// Override WebSocketClient with mock implementation for GitHub Pages
if (window.location.hostname === 'sirsimaster.github.io' || window.location.hostname === 'localhost') {
    console.log('Using Mock WebSocket for demo');
    
    // Replace the WebSocketClient with mock implementation
    window.WebSocketClient = class MockWebSocketClient extends MockWebSocket {
        constructor() {
            super();
            // Add any WebSocketClient specific properties
            this.reconnectInterval = 5000;
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = 5;
            this.pingInterval = null;
            this.config = {
                heartbeatInterval: 30000,
                useMockConnection: true
            };
        }
        
        // Add compatibility methods
        sendUserAction(action, details) {
            this.send('userAction', { action, details });
        }
        
        sendActivity(activity) {
            this.send('activityLog', { activity });
        }
        
        sendNotification(notification) {
            this.send('notification', { notification });
        }
        
        sendKPIUpdate(kpiId, value) {
            this.send('kpiUpdate', { kpiId, value });
        }
        
        subscribe(channels) {
            this.send('subscribe', { channels });
        }
        
        startHeartbeat() {
            // Mock heartbeat
            this.pingInterval = setInterval(() => {
                this.send('ping');
            }, this.config.heartbeatInterval);
        }
        
        stopHeartbeat() {
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
        }
        
        scheduleReconnect() {
            // Mock reconnect
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        }
    };
    
    // Replace the existing websocketClient instance
    window.websocketClient = new window.WebSocketClient();
}

// Export for use
window.MockWebSocket = MockWebSocket;
window.MockWebSocketClient = window.WebSocketClient;

// Create a lowercase reference for the dashboard
if (window.location.hostname === 'sirsimaster.github.io' || window.location.hostname === 'localhost') {
    window.mockWebSocketClient = window.websocketClient;
}
