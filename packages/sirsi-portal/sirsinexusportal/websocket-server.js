/**
 * WebSocket Server for SirsiNexus Real-Time Updates
 * Handles real-time communication between server and clients
 * @version 1.0.0
 */

const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Store current state for synchronization
const state = {
    kpis: {},
    activities: [],
    notifications: [],
    systemStatus: {},
    onlineUsers: 0
};

/**
 * Broadcast message to all connected clients
 */
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

/**
 * Broadcast to all clients except sender
 */
function broadcastExcept(data, senderId) {
    const message = JSON.stringify(data);
    clients.forEach((client, id) => {
        if (id !== senderId && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

/**
 * Generate unique client ID
 */
function generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle new WebSocket connections
 */
wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const clientIp = req.socket.remoteAddress;
    
    console.log(`[${new Date().toISOString()}] New client connected: ${clientId} from ${clientIp}`);
    
    // Store client
    clients.set(clientId, ws);
    state.onlineUsers = clients.size;
    
    // Send welcome message with client ID
    ws.send(JSON.stringify({
        type: 'welcome',
        clientId: clientId,
        timestamp: new Date().toISOString(),
        state: state
    }));
    
    // Broadcast user count update
    broadcast({
        type: 'userCountUpdate',
        count: state.onlineUsers,
        timestamp: new Date().toISOString()
    });
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[${new Date().toISOString()}] Message from ${clientId}:`, data);
            
            // Route message based on type
            switch (data.type) {
                case 'ping':
                    // Respond to ping
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: new Date().toISOString()
                    }));
                    break;
                    
                case 'kpiUpdate':
                    // Update KPI and broadcast to all clients
                    state.kpis[data.kpiId] = data.value;
                    broadcastExcept({
                        type: 'kpiUpdate',
                        kpiId: data.kpiId,
                        value: data.value,
                        timestamp: new Date().toISOString()
                    }, clientId);
                    break;
                    
                case 'activityLog':
                    // Add new activity and broadcast
                    const activity = {
                        id: `activity_${Date.now()}`,
                        ...data.activity,
                        timestamp: new Date().toISOString()
                    };
                    state.activities.unshift(activity);
                    state.activities = state.activities.slice(0, 50); // Keep last 50
                    
                    broadcast({
                        type: 'newActivity',
                        activity: activity
                    });
                    break;
                    
                case 'notification':
                    // Add notification and broadcast
                    const notification = {
                        id: `notif_${Date.now()}`,
                        ...data.notification,
                        timestamp: new Date().toISOString()
                    };
                    state.notifications.unshift(notification);
                    
                    broadcast({
                        type: 'newNotification',
                        notification: notification
                    });
                    break;
                    
                case 'userAction':
                    // Broadcast user action to all other clients
                    broadcastExcept({
                        type: 'userAction',
                        action: data.action,
                        user: data.user,
                        details: data.details,
                        timestamp: new Date().toISOString()
                    }, clientId);
                    break;
                    
                case 'systemStatus':
                    // Update system status
                    state.systemStatus = data.status;
                    broadcast({
                        type: 'systemStatusUpdate',
                        status: state.systemStatus,
                        timestamp: new Date().toISOString()
                    });
                    break;
                    
                case 'subscribe':
                    // Handle subscription to specific data types
                    console.log(`Client ${clientId} subscribed to:`, data.channels);
                    // Store subscription preferences if needed
                    break;
                    
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error(`Error processing message from ${clientId}:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
                timestamp: new Date().toISOString()
            }));
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log(`[${new Date().toISOString()}] Client disconnected: ${clientId}`);
        clients.delete(clientId);
        state.onlineUsers = clients.size;
        
        // Broadcast updated user count
        broadcast({
            type: 'userCountUpdate',
            count: state.onlineUsers,
            timestamp: new Date().toISOString()
        });
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

// Simulate periodic updates for demo purposes
setInterval(() => {
    // Simulate KPI updates
    const kpiUpdates = [
        { id: 'total-users', change: Math.floor(Math.random() * 10) - 5 },
        { id: 'pending-review', change: Math.floor(Math.random() * 5) - 2 },
        { id: 'approved', change: Math.floor(Math.random() * 8) - 2 }
    ];
    
    const randomKpi = kpiUpdates[Math.floor(Math.random() * kpiUpdates.length)];
    
    broadcast({
        type: 'kpiUpdate',
        kpiId: randomKpi.id,
        change: randomKpi.change,
        timestamp: new Date().toISOString()
    });
}, 10000); // Every 10 seconds

// Simulate system metrics updates
setInterval(() => {
    const metrics = {
        cpu: Math.floor(Math.random() * 40) + 30,
        memory: Math.floor(Math.random() * 30) + 50,
        requests: Math.floor(Math.random() * 2000) + 1000,
        responseTime: Math.floor(Math.random() * 100) + 50
    };
    
    broadcast({
        type: 'metricsUpdate',
        metrics: metrics,
        timestamp: new Date().toISOString()
    });
}, 5000); // Every 5 seconds

// Start server
const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
    console.log(`Server started at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing WebSocket server');
    wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});

module.exports = { wss, broadcast };
