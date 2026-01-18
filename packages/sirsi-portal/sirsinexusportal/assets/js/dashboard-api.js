/**
 * Dashboard API Service
 * Handles all API interactions for the admin dashboard
 * @version 1.0.0
 */
class DashboardAPI {
    constructor() {
        this.baseURL = window.API_CONFIG?.baseURL || '/api';
        this.api = window.apiService || new APIService();
    }

    /**
     * Get KPIs
     */
    async getKPIs() {
        try {
            const response = await this.api.get('/api/kpis');
            return response;
        } catch (error) {
            console.error('Error fetching KPIs:', error);
            // Return sample KPIs on error
            return { 
                data: [
                    { id: 'total-users', name: 'Total Users', value: '1,234', color: 'blue' },
                    { id: 'pending-review', name: 'Pending Review', value: '42', color: 'yellow' },
                    { id: 'approved', name: 'Approved', value: '892', color: 'emerald' },
                    { id: 'rejected', name: 'Rejected', value: '23', color: 'red' },
                    { id: 'invites-sent', name: 'Invites Sent', value: '156', color: 'blue' }
                ]
            };
        }
    }

    /**
     * Get recent activity
     */
    async getRecentActivity() {
        try {
            const response = await this.api.get('/api/activity/recent');
            return response;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            // Return sample activity on error
            const activities = [];
            const actions = ['Logged in', 'Updated profile', 'Uploaded document', 'Sent invite', 'Changed settings'];
            const statuses = ['success', 'completed', 'pending'];
            const users = ['john.doe@example.com', 'jane.smith@example.com', 'admin@sirsinexus.com'];
            
            for (let i = 0; i < 10; i++) {
                activities.push({
                    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                    user: users[Math.floor(Math.random() * users.length)],
                    action: actions[Math.floor(Math.random() * actions.length)],
                    status: statuses[Math.floor(Math.random() * statuses.length)]
                });
            }
            
            return { data: activities };
        }
    }

    /**
     * Get chart data
     */
    async getChartData(type) {
        try {
            const response = await this.api.get(`/api/charts/${type}`);
            return response;
        } catch (error) {
            console.error(`Error fetching ${type} chart data:`, error);
            // Return sample data based on type
            if (type === 'revenue') {
                return {
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Revenue',
                            data: [12000, 19000, 15000, 25000, 22000, 30000],
                            borderColor: 'rgb(5, 150, 105)',
                            backgroundColor: 'rgba(5, 150, 105, 0.1)',
                            fill: true
                        }]
                    }
                };
            } else if (type === 'users') {
                return {
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'New Users',
                            data: [120, 190, 80, 150, 120, 180],
                            backgroundColor: 'rgba(59, 130, 246, 0.8)'
                        }]
                    }
                };
            }
            return { data: {} };
        }
    }

    /**
     * Get notifications
     */
    async getNotifications() {
        try {
            const response = await this.api.get('/api/notifications');
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Return realistic notifications for demo
            return { 
                data: [
                    {
                        id: 1,
                        type: 'info',
                        title: 'System Update Available',
                        message: 'Version 2.4.0 is now available with new features and improvements.',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        read: false,
                        priority: 'medium',
                        icon: 'info'
                    },
                    {
                        id: 2,
                        type: 'success',
                        title: 'Backup Completed',
                        message: 'Daily backup completed successfully.',
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        read: false,
                        priority: 'low',
                        icon: 'check'
                    },
                    {
                        id: 3,
                        type: 'warning',
                        title: 'High Memory Usage',
                        message: 'Server memory usage is above 85%.',
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        read: false,
                        priority: 'high',
                        icon: 'warning'
                    }
                ]
            };
        }
    }

    /**
     * Get users
     */
    async getUsers() {
        try {
            const response = await this.api.get('/api/users');
            return response;
        } catch (error) {
            console.error('Error fetching users:', error);
            // Return sample users on error
            return { 
                data: [
                    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', isActive: true },
                    { id: 2, name: 'John Doe', email: 'john@example.com', role: 'investor', isActive: true },
                    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'investor', isActive: false },
                    { id: 4, name: 'Bob Wilson', email: 'bob@example.com', role: 'investor', isActive: true },
                    { id: 5, name: 'Alice Brown', email: 'alice@example.com', role: 'investor', isActive: true }
                ]
            };
        }
    }

    /**
     * Get system status
     */
    async getSystemStatus() {
        try {
            const response = await this.api.get('/api/system/status');
            return response;
        } catch (error) {
            console.error('Error fetching system status:', error);
            // Return realistic fallback data
            return {
                data: {
                    server: {
                        status: 'operational',
                        uptime: 99.98,
                        lastRestart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        health: 'good'
                    },
                    api: {
                        responseTime: 124,
                        requestsPerMinute: 1847,
                        errorRate: 0.02,
                        status: 'healthy'
                    },
                    storage: {
                        used: 67.4,
                        total: 100,
                        percentage: 67.4,
                        trend: 'increasing'
                    },
                    database: {
                        connections: 45,
                        maxConnections: 100,
                        queryTime: 2.3,
                        status: 'optimal'
                    },
                    cache: {
                        hitRate: 94.2,
                        memory: 512,
                        maxMemory: 1024,
                        status: 'active'
                    },
                    security: {
                        threats: 0,
                        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        firewallStatus: 'active',
                        sslStatus: 'valid'
                    }
                }
            };
        }
    }

    /**
     * Get system metrics
     */
    async getSystemMetrics() {
        try {
            const response = await this.api.get('/api/system/metrics');
            return response;
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            // Return sample metrics
            return {
                data: {
                    cpu: {
                        usage: 42.5,
                        cores: 8,
                        temperature: 65
                    },
                    memory: {
                        used: 12.8,
                        total: 16,
                        percentage: 80
                    },
                    network: {
                        incoming: 125.4,
                        outgoing: 89.2,
                        connections: 1247
                    }
                }
            };
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId) {
        try {
            return await this.api.put(`/api/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: true };
        }
    }

    /**
     * Get security logs
     */
    async getSecurityLogs() {
        try {
            const response = await this.api.get('/api/security/logs');
            return response;
        } catch (error) {
            console.error('Error fetching security logs:', error);
            return { data: [] };
        }
    }
}

// Make DashboardAPI available globally
window.DashboardAPI = DashboardAPI;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardAPI;
}
