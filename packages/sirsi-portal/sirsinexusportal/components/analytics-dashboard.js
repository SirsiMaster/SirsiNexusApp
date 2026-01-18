/**
 * Analytics Dashboard Component for SirsiNexus
 * Handles real-time data simulation and Chart.js visualizations
 */

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.realTimeData = {};
        this.updateInterval = null;
        this.activityTypes = [
            { icon: '👤', name: 'User Registration', probability: 0.3 },
            { icon: '💼', name: 'Investor Login', probability: 0.2 },
            { icon: '📄', name: 'Document Upload', probability: 0.25 },
            { icon: '💰', name: 'Transaction', probability: 0.15 },
            { icon: '🔍', name: 'Data Access', probability: 0.1 }
        ];
        
        this.initializeData();
        this.initializeCharts();
        this.startRealTimeUpdates();
    }

    initializeData() {
        this.realTimeData = {
            totalUsers: 24567,
            activeInvestors: 1429,
            totalDocuments: 8932,
            totalRevenue: 2.4,
            userGrowthData: this.generateUserGrowthData(),
            activityDistribution: this.generateActivityDistribution(),
            monthlyEngagement: this.generateMonthlyEngagement(),
            recentActivities: []
        };
        
        // Generate initial activity feed
        for (let i = 0; i < 10; i++) {
            this.addRandomActivity();
        }
    }

    generateUserGrowthData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const data = [];
        
        let baseValue = 15000;
        for (let i = 0; i <= currentMonth; i++) {
            baseValue += Math.random() * 2000 + 1000;
            data.push({
                month: months[i],
                users: Math.round(baseValue),
                growth: Math.round((Math.random() * 15 + 5) * 100) / 100
            });
        }
        
        return data;
    }

    generateActivityDistribution() {
        return [
            { label: 'Document Views', value: 35, color: '#059669' },
            { label: 'User Logins', value: 25, color: '#10b981' },
            { label: 'Data Downloads', value: 20, color: '#34d399' },
            { label: 'Profile Updates', value: 12, color: '#6ee7b7' },
            { label: 'Other', value: 8, color: '#a7f3d0' }
        ];
    }

    generateMonthlyEngagement() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const data = [];
        
        for (let i = 0; i <= currentMonth; i++) {
            data.push({
                month: months[i],
                sessions: Math.round(Math.random() * 5000 + 8000),
                pageViews: Math.round(Math.random() * 15000 + 25000),
                avgDuration: Math.round((Math.random() * 300 + 200) * 100) / 100
            });
        }
        
        return data;
    }

    initializeCharts() {
        this.initUserGrowthChart();
        this.initActivityChart();
        this.initEngagementChart();
    }

    initUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        const data = this.realTimeData.userGrowthData;
        
        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Total Users',
                    data: data.map(d => d.users),
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#059669',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#059669',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const growth = data[index].growth;
                                return `Growth: +${growth}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    }

    initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        const data = this.realTimeData.activityDistribution;
        
        this.charts.activity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: data.map(d => d.color),
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#64748b',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#059669',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    initEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        const data = this.realTimeData.monthlyEngagement;
        
        this.charts.engagement = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [
                    {
                        label: 'Sessions',
                        data: data.map(d => d.sessions),
                        backgroundColor: 'rgba(5, 150, 105, 0.8)',
                        borderColor: '#059669',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Page Views',
                        data: data.map(d => d.pageViews),
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#64748b',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#059669',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    }

    startRealTimeUpdates() {
        // Update metrics every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.updateCharts();
            this.addRandomActivity();
            this.updateLastUpdatedTime();
        }, 5000);

        // Initial last updated time
        this.updateLastUpdatedTime();
    }

    updateMetrics() {
        // Simulate small random changes
        const changes = {
            totalUsers: Math.floor(Math.random() * 10) + 1,
            activeInvestors: Math.floor(Math.random() * 5) + 1,
            totalDocuments: Math.floor(Math.random() * 15) + 1,
            totalRevenue: (Math.random() * 0.05) + 0.01
        };

        // Update the data
        this.realTimeData.totalUsers += changes.totalUsers;
        this.realTimeData.activeInvestors += changes.activeInvestors;
        this.realTimeData.totalDocuments += changes.totalDocuments;
        this.realTimeData.totalRevenue += changes.totalRevenue;

        // Update the DOM elements
        this.updateMetricElement('totalUsers', this.formatNumber(this.realTimeData.totalUsers));
        this.updateMetricElement('activeInvestors', this.formatNumber(this.realTimeData.activeInvestors));
        this.updateMetricElement('totalDocuments', this.formatNumber(this.realTimeData.totalDocuments));
        this.updateMetricElement('totalRevenue', '$' + this.realTimeData.totalRevenue.toFixed(1) + 'M');

        // Update growth percentages
        this.updateGrowthPercentages();
    }

    updateMetricElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Add a subtle animation
            element.style.transform = 'scale(1.05)';
            element.textContent = value;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    updateGrowthPercentages() {
        const growthElements = [
            { id: 'usersGrowth', min: 8, max: 15 },
            { id: 'investorsGrowth', min: 5, max: 12 },
            { id: 'documentsGrowth', min: 10, max: 20 },
            { id: 'revenueGrowth', min: 15, max: 30 }
        ];

        growthElements.forEach(({ id, min, max }) => {
            const element = document.getElementById(id);
            if (element) {
                const growth = (Math.random() * (max - min) + min).toFixed(1);
                element.textContent = `+${growth}%`;
            }
        });
    }

    updateCharts() {
        // Add new data point to user growth chart
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
        const userGrowthData = this.realTimeData.userGrowthData;
        
        if (userGrowthData.length > 0) {
            const lastEntry = userGrowthData[userGrowthData.length - 1];
            lastEntry.users = this.realTimeData.totalUsers;
            
            if (this.charts.userGrowth) {
                this.charts.userGrowth.data.datasets[0].data = userGrowthData.map(d => d.users);
                this.charts.userGrowth.update('none');
            }
        }

        // Update activity distribution with small random changes
        if (this.charts.activity) {
            const data = this.realTimeData.activityDistribution;
            data.forEach(item => {
                const change = (Math.random() - 0.5) * 2; // -1 to +1
                item.value = Math.max(1, Math.min(50, item.value + change));
            });
            
            this.charts.activity.data.datasets[0].data = data.map(d => Math.round(d.value));
            this.charts.activity.update('none');
        }
    }

    addRandomActivity() {
        const activityType = this.getRandomActivityType();
        const users = ['john.doe@example.com', 'jane.smith@company.com', 'investor@fund.com', 'admin@sirsinexus.com', 'user@domain.com'];
        const user = users[Math.floor(Math.random() * users.length)];
        
        const activity = {
            icon: activityType.icon,
            title: `${activityType.name} - ${user}`,
            time: new Date().toLocaleTimeString(),
            id: Date.now() + Math.random()
        };

        this.realTimeData.recentActivities.unshift(activity);
        
        // Keep only last 10 activities
        if (this.realTimeData.recentActivities.length > 10) {
            this.realTimeData.recentActivities.pop();
        }

        this.updateActivityFeed();
    }

    getRandomActivityType() {
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const activityType of this.activityTypes) {
            cumulativeProbability += activityType.probability;
            if (random <= cumulativeProbability) {
                return activityType;
            }
        }
        
        return this.activityTypes[0]; // fallback
    }

    updateActivityFeed() {
        const feedElement = document.getElementById('activityFeed');
        if (!feedElement) return;

        feedElement.innerHTML = this.realTimeData.recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    updateLastUpdatedTime() {
        const element = document.getElementById('lastUpdated');
        if (element) {
            element.textContent = new Date().toLocaleTimeString();
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const dashboard = new AnalyticsDashboard();
    
    // Handle theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                // Re-render charts with updated colors if theme changed
                setTimeout(() => {
                    Object.values(dashboard.charts).forEach(chart => {
                        if (chart) chart.update('none');
                    });
                }, 100);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        dashboard.destroy();
        observer.disconnect();
    });
});
