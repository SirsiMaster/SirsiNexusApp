/**
 * SirsiNexus Monitoring System
 * Comprehensive monitoring with real-time logs, telemetry, and performance tracking
 */

class MonitoringSystem {
    constructor() {
        this.currentTab = 'logs';
        this.logLevel = 'all';
        this.searchTerm = '';
        this.charts = {};
        this.logs = [];
        this.performanceMetrics = [];
        this.errors = [];
        this.isLive = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.generateMockData();
        this.startRealTimeUpdates();
        this.updateTimestamp();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('log-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndDisplayLogs();
            });
        }

        // Auto-scroll toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.isLive = !this.isLive;
                this.updateLiveIndicator();
            }
        });
    }

    switchTab(tabName, element) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.monitoring-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        element.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'telemetry':
                this.updateTelemetryData();
                break;
            case 'performance':
                this.updatePerformanceData();
                break;
            case 'errors':
                this.updateErrorData();
                break;
        }
    }

    filterLogs(level, element) {
        // Remove active class from all filter pills
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.classList.remove('active');
        });

        // Add active class to selected pill
        element.classList.add('active');

        this.logLevel = level;
        this.filterAndDisplayLogs();
    }

    filterAndDisplayLogs() {
        let filteredLogs = this.logs;

        // Filter by level
        if (this.logLevel !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.level === this.logLevel);
        }

        // Filter by search term
        if (this.searchTerm) {
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(this.searchTerm) ||
                log.source.toLowerCase().includes(this.searchTerm)
            );
        }

        this.displayLogs(filteredLogs);
    }

    displayLogs(logs) {
        const container = document.getElementById('log-container');
        if (!container) return;

        container.innerHTML = logs.map(log => `
            <div class="log-entry ${log.level}" data-timestamp="${log.timestamp}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-mono text-gray-500 dark:text-gray-400">${this.formatTimestamp(log.timestamp)}</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${this.getLevelBadgeClass(log.level)}">
                                ${log.level.toUpperCase()}
                            </span>
                            <span class="text-xs text-gray-600 dark:text-gray-400">[${log.source}]</span>
                        </div>
                        <div class="text-sm text-gray-900 dark:text-gray-100">${log.message}</div>
                        ${log.details ? `<div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${log.details}</div>` : ''}
                    </div>
                    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2" onclick="this.parentElement.parentElement.style.display='none'">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Auto-scroll to bottom if live mode is enabled
        if (this.isLive) {
            container.scrollTop = container.scrollHeight;
        }
    }

    getLevelBadgeClass(level) {
        const classes = {
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        return classes[level] || classes.info;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    generateMockData() {
        this.generateMockLogs();
        this.generateMockPerformanceMetrics();
        this.generateMockErrors();
    }

    generateMockLogs() {
        const sources = ['Auth', 'API', 'Database', 'Cache', 'Queue', 'Scheduler'];
        const messages = {
            info: [
                'User successfully authenticated',
                'Database connection established',
                'Cache hit for user preferences',
                'Background job completed',
                'API request processed successfully',
                'System health check passed'
            ],
            warning: [
                'High memory usage detected',
                'Slow database query detected',
                'Cache miss rate increasing',
                'API response time threshold exceeded',
                'Queue backlog growing',
                'Disk space running low'
            ],
            error: [
                'Database connection failed',
                'Authentication service unavailable',
                'API request timeout',
                'Failed to process background job',
                'Critical system component down',
                'Data corruption detected'
            ]
        };

        // Generate initial logs
        for (let i = 0; i < 50; i++) {
            const level = this.getRandomLevel();
            const source = sources[Math.floor(Math.random() * sources.length)];
            const message = messages[level][Math.floor(Math.random() * messages[level].length)];
            
            this.logs.push({
                id: Date.now() + i,
                timestamp: Date.now() - (Math.random() * 3600000), // Last hour
                level,
                source,
                message,
                details: Math.random() > 0.7 ? 'Additional context and debugging information' : null
            });
        }

        this.logs.sort((a, b) => b.timestamp - a.timestamp);
        this.filterAndDisplayLogs();
    }

    generateMockPerformanceMetrics() {
        const endpoints = [
            '/api/users', '/api/auth/login', '/api/data/export',
            '/api/reports', '/api/dashboard', '/api/settings'
        ];

        this.performanceMetrics = endpoints.map(endpoint => ({
            endpoint,
            avgResponseTime: Math.floor(Math.random() * 500) + 50,
            p95: Math.floor(Math.random() * 800) + 200,
            p99: Math.floor(Math.random() * 1200) + 500,
            requestsPerMin: Math.floor(Math.random() * 1000) + 100,
            status: Math.random() > 0.2 ? 'healthy' : 'warning'
        }));

        this.updatePerformanceTable();
    }

    generateMockErrors() {
        const errorTypes = [
            'Database Connection Error',
            'API Timeout',
            'Authentication Failure',
            'Validation Error',
            'System Resource Exhausted'
        ];

        for (let i = 0; i < 10; i++) {
            this.errors.push({
                id: Date.now() + i,
                timestamp: Date.now() - (Math.random() * 86400000), // Last 24 hours
                type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
                message: 'Error processing request',
                stack: 'at Function.handler (/app/src/handler.js:123:45)',
                resolved: Math.random() > 0.3
            });
        }

        this.updateRecentErrors();
    }

    getRandomLevel() {
        const levels = ['info', 'info', 'info', 'warning', 'error']; // Weighted distribution
        return levels[Math.floor(Math.random() * levels.length)];
    }

    initializeCharts() {
        this.initResourcesChart();
        this.initNetworkChart();
        this.initResponseTimeChart();
        this.initThroughputChart();
        this.initErrorTrendsChart();
    }

    initResourcesChart() {
        const ctx = document.getElementById('resourcesChart');
        if (!ctx) return;

        this.charts.resources = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(20),
                datasets: [{
                    label: 'CPU Usage (%)',
                    data: this.generateRandomData(20, 30, 80),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Memory Usage (%)',
                    data: this.generateRandomData(20, 40, 70),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    initNetworkChart() {
        const ctx = document.getElementById('networkChart');
        if (!ctx) return;

        this.charts.network = new Chart(ctx, {
            type: 'area',
            data: {
                labels: this.generateTimeLabels(20),
                datasets: [{
                    label: 'Inbound (MB/s)',
                    data: this.generateRandomData(20, 10, 50),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: true
                }, {
                    label: 'Outbound (MB/s)',
                    data: this.generateRandomData(20, 5, 30),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initResponseTimeChart() {
        const ctx = document.getElementById('responseTimeChart');
        if (!ctx) return;

        this.charts.responseTime = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['/api/users', '/api/auth', '/api/data', '/api/reports'],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [120, 85, 200, 150],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(34, 197, 94)',
                        'rgb(245, 158, 11)',
                        'rgb(34, 197, 94)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initThroughputChart() {
        const ctx = document.getElementById('throughputChart');
        if (!ctx) return;

        this.charts.throughput = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(12),
                datasets: [{
                    label: 'Requests/min',
                    data: this.generateRandomData(12, 800, 1200),
                    borderColor: 'rgb(168, 85, 247)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initErrorTrendsChart() {
        const ctx = document.getElementById('errorTrendsChart');
        if (!ctx) return;

        this.charts.errorTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(24, 'hour'),
                datasets: [{
                    label: 'Errors',
                    data: this.generateRandomData(24, 0, 10, true),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    generateTimeLabels(count, unit = 'minute') {
        const labels = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now);
            if (unit === 'minute') {
                time.setMinutes(time.getMinutes() - i);
                labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else if (unit === 'hour') {
                time.setHours(time.getHours() - i);
                labels.push(time.toLocaleTimeString([], { hour: '2-digit' }) + ':00');
            }
        }
        
        return labels;
    }

    generateRandomData(count, min, max, integer = false) {
        const data = [];
        for (let i = 0; i < count; i++) {
            const value = Math.random() * (max - min) + min;
            data.push(integer ? Math.floor(value) : Math.round(value * 10) / 10);
        }
        return data;
    }

    updatePerformanceTable() {
        const tableBody = document.getElementById('performance-metrics-table');
        if (!tableBody) return;

        tableBody.innerHTML = this.performanceMetrics.map(metric => `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="py-3 px-4 font-medium">${metric.endpoint}</td>
                <td class="py-3 px-4">${metric.avgResponseTime}ms</td>
                <td class="py-3 px-4">${metric.p95}ms</td>
                <td class="py-3 px-4">${metric.p99}ms</td>
                <td class="py-3 px-4">${metric.requestsPerMin}</td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.status === 'healthy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }">
                        ${metric.status === 'healthy' ? 'Healthy' : 'Warning'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateRecentErrors() {
        const container = document.getElementById('recent-errors');
        if (!container) return;

        const recentErrors = this.errors.slice(0, 5);
        container.innerHTML = recentErrors.map(error => `
            <div class="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-red-900 dark:text-red-400">${error.type}</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${this.formatTimestamp(error.timestamp)}</span>
                        ${error.resolved 
                            ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Resolved</span>'
                            : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Active</span>'
                        }
                    </div>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${error.message}</p>
                <details class="text-xs text-gray-600 dark:text-gray-400">
                    <summary class="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">Stack trace</summary>
                    <pre class="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">${error.stack}</pre>
                </details>
            </div>
        `).join('');
    }

    updateTelemetryData() {
        // Update metric cards
        this.updateElement('system-status', Math.random() > 0.1 ? 'Online' : 'Degraded');
        this.updateElement('active-sessions', Math.floor(Math.random() * 2000) + 1000);
        this.updateElement('cpu-usage', Math.floor(Math.random() * 40) + 50 + '%');
        this.updateElement('memory-usage', (Math.random() * 2 + 3).toFixed(1) + ' GB');

        // Update charts with new data
        if (this.charts.resources) {
            this.updateChartData(this.charts.resources, [
                this.generateRandomData(20, 30, 80),
                this.generateRandomData(20, 40, 70)
            ]);
        }

        if (this.charts.network) {
            this.updateChartData(this.charts.network, [
                this.generateRandomData(20, 10, 50),
                this.generateRandomData(20, 5, 30)
            ]);
        }
    }

    updatePerformanceData() {
        // Update performance metrics
        this.performanceMetrics.forEach(metric => {
            metric.avgResponseTime = Math.floor(Math.random() * 500) + 50;
            metric.requestsPerMin = Math.floor(Math.random() * 1000) + 100;
        });

        this.updatePerformanceTable();

        // Update charts
        if (this.charts.responseTime) {
            const newData = this.performanceMetrics.slice(0, 4).map(m => m.avgResponseTime);
            this.charts.responseTime.data.datasets[0].data = newData;
            this.charts.responseTime.update();
        }

        if (this.charts.throughput) {
            this.updateChartData(this.charts.throughput, [
                this.generateRandomData(12, 800, 1200)
            ]);
        }
    }

    updateErrorData() {
        // Update error statistics
        const totalErrors = Math.floor(Math.random() * 50) + 10;
        const errorRate = (Math.random() * 0.5).toFixed(2);
        const mttr = Math.floor(Math.random() * 60) + 30;

        this.updateElement('total-errors', totalErrors);
        this.updateElement('error-rate', errorRate + '%');
        this.updateElement('mttr', mttr + 'm');

        // Update error trends chart
        if (this.charts.errorTrends) {
            this.updateChartData(this.charts.errorTrends, [
                this.generateRandomData(24, 0, 10, true)
            ]);
        }
    }

    updateChartData(chart, newDataSets) {
        newDataSets.forEach((data, index) => {
            if (chart.data.datasets[index]) {
                chart.data.datasets[index].data = data;
            }
        });
        chart.update();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    startRealTimeUpdates() {
        // Add new log entries periodically
        setInterval(() => {
            if (Math.random() > 0.3) { // 70% chance of new log
                this.addNewLog();
            }
        }, 3000);

        // Update metrics every 30 seconds
        setInterval(() => {
            if (this.currentTab === 'telemetry') {
                this.updateTelemetryData();
            } else if (this.currentTab === 'performance') {
                this.updatePerformanceData();
            } else if (this.currentTab === 'errors') {
                this.updateErrorData();
            }
        }, 30000);

        // Update timestamp every second
        setInterval(() => {
            this.updateTimestamp();
        }, 1000);
    }

    addNewLog() {
        const sources = ['Auth', 'API', 'Database', 'Cache'];
        const messages = {
            info: ['Request processed', 'Cache updated', 'User action logged'],
            warning: ['High load detected', 'Cache miss', 'Slow query'],
            error: ['Connection failed', 'Timeout occurred', 'Validation failed']
        };

        const level = this.getRandomLevel();
        const source = sources[Math.floor(Math.random() * sources.length)];
        const messageList = messages[level];
        const message = messageList[Math.floor(Math.random() * messageList.length)];

        const newLog = {
            id: Date.now(),
            timestamp: Date.now(),
            level,
            source,
            message,
            details: Math.random() > 0.8 ? 'Real-time generated log entry' : null
        };

        this.logs.unshift(newLog);
        
        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs = this.logs.slice(0, 100);
        }

        // Update display if on logs tab
        if (this.currentTab === 'logs') {
            this.filterAndDisplayLogs();
        }
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('logs-timestamp');
        if (timestampElement) {
            timestampElement.textContent = new Date().toLocaleTimeString();
        }
    }

    updateLiveIndicator() {
        const indicator = document.querySelector('.real-time-indicator');
        if (indicator) {
            if (this.isLive) {
                indicator.classList.add('live');
                indicator.innerHTML = '<span class="inline-block w-2 h-2 bg-green-500 rounded-full pulse-dot mr-2"></span>Live Monitoring';
            } else {
                indicator.classList.remove('live');
                indicator.innerHTML = '<span class="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>Paused';
            }
        }
    }

    exportLogs() {
        let filteredLogs = this.logs;

        // Apply current filters
        if (this.logLevel !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.level === this.logLevel);
        }

        if (this.searchTerm) {
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(this.searchTerm) ||
                log.source.toLowerCase().includes(this.searchTerm)
            );
        }

        // Convert to CSV format
        const csvContent = [
            'Timestamp,Level,Source,Message,Details',
            ...filteredLogs.map(log => 
                `"${this.formatTimestamp(log.timestamp)}","${log.level}","${log.source}","${log.message}","${log.details || ''}"`
            )
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sirsi-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Show confirmation
        this.showNotification('Logs exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'warning' ? 'bg-yellow-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function switchTab(tabName, element) {
    window.monitoringSystem.switchTab(tabName, element);
}

function filterLogs(level, element) {
    window.monitoringSystem.filterLogs(level, element);
}

function exportLogs() {
    window.monitoringSystem.exportLogs();
}

// Initialize monitoring system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.monitoringSystem = new MonitoringSystem();
    
    // Handle admin header events
    document.addEventListener('admin-action', function(e) {
        console.log('Admin action:', e.detail.action);
    });
    
    document.addEventListener('logout', function(e) {
        console.log('Logout requested');
        window.location.href = '../index.html';
    });
});
