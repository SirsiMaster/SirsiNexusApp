/**
 * Mock Backend Service for GitHub Pages
 * Provides a complete backend simulation using localStorage
 * @version 1.0.0
 */

class MockBackend {
    constructor() {
        this.initializeData();
        this.setupInterceptors();
    }

    initializeData() {
        // Initialize users if not exists
        if (!localStorage.getItem('sirsinexus_users')) {
            const users = [
                {
                    id: '1',
                    name: 'Super Admin',
                    email: 'super@sirsinexus.com',
                    role: 'super_admin',
                    permissions: ['*'], // All permissions
                    isActive: true,
                    createdAt: new Date('2024-01-01').toISOString(),
                    lastLogin: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Admin User',
                    email: 'admin@sirsinexus.com',
                    role: 'admin',
                    permissions: null, // Uses role-based permissions
                    isActive: true,
                    createdAt: new Date('2024-01-05').toISOString(),
                    lastLogin: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'John Manager',
                    email: 'manager@example.com',
                    role: 'manager',
                    permissions: null,
                    isActive: true,
                    createdAt: new Date('2024-02-01').toISOString(),
                    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '4',
                    name: 'Sarah Investor',
                    email: 'investor@example.com',
                    role: 'investor',
                    permissions: null,
                    isActive: true,
                    createdAt: new Date('2024-02-15').toISOString(),
                    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '5',
                    name: 'Committee Member',
                    email: 'committee@example.com',
                    role: 'committee',
                    committees: ['investment', 'audit'],
                    permissions: null,
                    isActive: true,
                    createdAt: new Date('2024-03-01').toISOString(),
                    lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '6',
                    name: 'Jane Contributor',
                    email: 'contributor@example.com',
                    role: 'contributor',
                    permissions: null,
                    isActive: true,
                    createdAt: new Date('2024-03-10').toISOString(),
                    lastLogin: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '7',
                    name: 'Viewer User',
                    email: 'viewer@example.com',
                    role: 'viewer',
                    permissions: null,
                    isActive: true,
                    createdAt: new Date('2024-03-15').toISOString(),
                    lastLogin: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
                }
            ];
            localStorage.setItem('sirsinexus_users', JSON.stringify(users));
        }

        // Initialize KPIs
        if (!localStorage.getItem('sirsinexus_kpis')) {
            const kpis = [
                { id: 'total-users', name: 'Total Users', value: '1,234', trend: '+12%', color: 'blue' },
                { id: 'pending-review', name: 'Pending Review', value: '42', trend: '-5%', color: 'yellow' },
                { id: 'approved', name: 'Approved', value: '892', trend: '+8%', color: 'emerald' },
                { id: 'rejected', name: 'Rejected', value: '23', trend: '-15%', color: 'red' },
                { id: 'invites-sent', name: 'Invites Sent', value: '156', trend: '+20%', color: 'purple' }
            ];
            localStorage.setItem('sirsinexus_kpis', JSON.stringify(kpis));
        }

        // Initialize activities
        if (!localStorage.getItem('sirsinexus_activities')) {
            const activities = this.generateRecentActivities();
            localStorage.setItem('sirsinexus_activities', JSON.stringify(activities));
        }

        // Initialize notifications
        if (!localStorage.getItem('sirsinexus_notifications')) {
            const notifications = [
                {
                    id: '1',
                    type: 'info',
                    title: 'Welcome to SirsiNexus',
                    message: 'Your admin dashboard is ready to use.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'medium'
                },
                {
                    id: '2',
                    type: 'success',
                    title: 'System Initialized',
                    message: 'All systems are operational.',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    read: false,
                    priority: 'low'
                }
            ];
            localStorage.setItem('sirsinexus_notifications', JSON.stringify(notifications));
        }
    }

    generateRecentActivities() {
        const actions = ['Logged in', 'Updated profile', 'Uploaded document', 'Sent invite', 'Changed settings'];
        const users = ['john@example.com', 'jane@example.com', 'admin@sirsinexus.com'];
        const statuses = ['success', 'completed', 'pending'];
        
        const activities = [];
        for (let i = 0; i < 10; i++) {
            activities.push({
                id: `activity-${i}`,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                user: users[Math.floor(Math.random() * users.length)],
                action: actions[Math.floor(Math.random() * actions.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    setupInterceptors() {
        // Override fetch to intercept API calls
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            // Check if this is an API call we should intercept
            if (url.includes('/api/')) {
                return this.handleAPICall(url, options);
            }
            // Otherwise, use original fetch
            return originalFetch(url, options);
        };

        // Also intercept XMLHttpRequest if needed
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, ...args) {
                if (url.includes('/api/')) {
                    // Store the request info
                    xhr._mockUrl = url;
                    xhr._mockMethod = method;
                }
                return originalOpen.call(this, method, url, ...args);
            };
            
            const originalSend = xhr.send;
            xhr.send = function(body) {
                if (xhr._mockUrl) {
                    // Handle mock response
                    setTimeout(() => {
                        const mockResponse = this.handleAPICall(xhr._mockUrl, {
                            method: xhr._mockMethod,
                            body: body
                        });
                        
                        Object.defineProperty(xhr, 'status', { value: 200 });
                        Object.defineProperty(xhr, 'responseText', { value: JSON.stringify(mockResponse) });
                        xhr.dispatchEvent(new Event('load'));
                    }, 100);
                    return;
                }
                return originalSend.call(this, body);
            };
            
            return xhr;
        };
    }

    async handleAPICall(url, options) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        const method = options.method || 'GET';
        const path = url.replace(/.*\/api\//, '');

        // Route to appropriate handler
        if (path === 'kpis') {
            return this.createResponse(this.getKPIs());
        } else if (path === 'activity/recent') {
            return this.createResponse(this.getRecentActivity());
        } else if (path.startsWith('charts/')) {
            const chartType = path.split('/')[1];
            return this.createResponse(this.getChartData(chartType));
        } else if (path === 'notifications') {
            return this.createResponse(this.getNotifications());
        } else if (path === 'users') {
            if (method === 'GET') {
                return this.createResponse(this.getUsers());
            } else if (method === 'POST') {
                return this.createResponse(this.createUser(JSON.parse(options.body)));
            }
        } else if (path.startsWith('users/')) {
            const userId = path.split('/')[1];
            if (method === 'PUT') {
                return this.createResponse(this.updateUser(userId, JSON.parse(options.body)));
            } else if (method === 'DELETE') {
                return this.createResponse(this.deleteUser(userId));
            }
        } else if (path === 'system/status') {
            return this.createResponse(this.getSystemStatus());
        }

        // Default 404 response
        return this.createResponse({ error: 'Not found' }, 404);
    }

    createResponse(data, status = 200) {
        // Create a proper Response object that supports clone()
        const responseBody = JSON.stringify({ data });
        const response = new Response(responseBody, {
            status,
            statusText: status === 200 ? 'OK' : 'Error',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    }

    // API Methods
    getKPIs() {
        return JSON.parse(localStorage.getItem('sirsinexus_kpis') || '[]');
    }

    getRecentActivity() {
        return JSON.parse(localStorage.getItem('sirsinexus_activities') || '[]');
    }

    getChartData(type) {
        if (type === 'revenue') {
            return {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: 'rgb(5, 150, 105)',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    fill: true
                }]
            };
        } else if (type === 'users') {
            return {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 190, 80, 150, 120, 180],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)'
                }]
            };
        }
        return {};
    }

    getNotifications() {
        return JSON.parse(localStorage.getItem('sirsinexus_notifications') || '[]');
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('sirsinexus_users') || '[]');
    }

    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('sirsinexus_users', JSON.stringify(users));
        
        // Update KPIs
        this.updateKPIValue('total-users', users.length.toLocaleString());
        
        // Add activity
        this.addActivity({
            user: 'admin@sirsinexus.com',
            action: `Added new user: ${newUser.email}`,
            status: 'success'
        });
        
        return newUser;
    }

    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('sirsinexus_users', JSON.stringify(users));
            
            // Add activity
            this.addActivity({
                user: 'admin@sirsinexus.com',
                action: `Updated user: ${users[index].email}`,
                status: 'success'
            });
            
            return users[index];
        }
        throw new Error('User not found');
    }

    deleteUser(userId) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const deletedUser = users[index];
            users.splice(index, 1);
            localStorage.setItem('sirsinexus_users', JSON.stringify(users));
            
            // Update KPIs
            this.updateKPIValue('total-users', users.length.toLocaleString());
            
            // Add activity
            this.addActivity({
                user: 'admin@sirsinexus.com',
                action: `Deleted user: ${deletedUser.email}`,
                status: 'completed'
            });
            
            return { success: true };
        }
        throw new Error('User not found');
    }

    getSystemStatus() {
        return {
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
                trend: 'stable'
            },
            database: {
                connections: 45,
                maxConnections: 100,
                queryTime: 2.3,
                status: 'optimal'
            }
        };
    }

    updateKPIValue(kpiId, newValue) {
        const kpis = this.getKPIs();
        const kpi = kpis.find(k => k.id === kpiId);
        if (kpi) {
            kpi.value = newValue;
            localStorage.setItem('sirsinexus_kpis', JSON.stringify(kpis));
        }
    }

    addActivity(activity) {
        const activities = this.getRecentActivity();
        activities.unshift({
            id: `activity-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...activity
        });
        // Keep only last 50 activities
        localStorage.setItem('sirsinexus_activities', JSON.stringify(activities.slice(0, 50)));
    }

    addNotification(notification) {
        const notifications = this.getNotifications();
        notifications.unshift({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        });
        localStorage.setItem('sirsinexus_notifications', JSON.stringify(notifications));
    }
}

// Initialize mock backend when script loads
window.mockBackend = new MockBackend();

// Also make it available globally for debugging
window.MockBackend = MockBackend;
