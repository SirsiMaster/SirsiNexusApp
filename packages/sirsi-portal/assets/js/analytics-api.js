/**
 * Analytics API Service for SirsiNexus
 * Provides advanced analytics data endpoints
 * @version 1.0.0
 */

class AnalyticsAPI {
    constructor() {
        this.baseURL = window.API_CONFIG?.baseURL || '/api';
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
    }

    /**
     * Get user behavior heatmap data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Heatmap data
     */
    async getUserBehaviorHeatmap(params = {}) {
        const cacheKey = 'heatmap_' + JSON.stringify(params);
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.baseURL}/analytics/heatmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Error fetching heatmap data:', error);
            return this.generateMockHeatmapData(params);
        }
    }

    /**
     * Get revenue breakdown data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Revenue data
     */
    async getRevenueBreakdown(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/revenue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            return this.generateMockRevenueData(params);
        }
    }

    /**
     * Get user journey flow data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Journey flow data
     */
    async getUserJourneyFlow(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/user-journey`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching user journey data:', error);
            return this.generateMockJourneyData(params);
        }
    }

    /**
     * Get engagement metrics
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Engagement data
     */
    async getEngagementMetrics(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/engagement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching engagement data:', error);
            return this.generateMockEngagementData(params);
        }
    }

    /**
     * Get real-time activity stream
     * @returns {Promise<EventSource>} Server-sent events stream
     */
    async getRealTimeStream() {
        try {
            return new EventSource(`${this.baseURL}/analytics/stream`);
        } catch (error) {
            console.error('Error connecting to real-time stream:', error);
            // Return mock stream generator
            return this.createMockEventStream();
        }
    }

    /**
     * Get geographic distribution data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Geographic data
     */
    async getGeographicDistribution(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/geographic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching geographic data:', error);
            return this.generateMockGeographicData(params);
        }
    }

    /**
     * Get predictive analytics data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Predictive data
     */
    async getPredictiveAnalytics(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/predictive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching predictive data:', error);
            return this.generateMockPredictiveData(params);
        }
    }

    /**
     * Get cohort analysis data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Cohort data
     */
    async getCohortAnalysis(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/cohort`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching cohort data:', error);
            return this.generateMockCohortData(params);
        }
    }

    /**
     * Get conversion funnel data
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Funnel data
     */
    async getConversionFunnel(params = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/funnel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching funnel data:', error);
            return this.generateMockFunnelData(params);
        }
    }

    /**
     * Export analytics data
     * @param {string} type - Export type (csv, json, pdf)
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} Exported data
     */
    async exportAnalytics(type, params) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...params })
            });
            return await response.blob();
        } catch (error) {
            console.error('Error exporting analytics:', error);
            throw error;
        }
    }

    // Mock data generators for development/fallback
    generateMockHeatmapData(params) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const data = [];
        
        days.forEach((day, dayIndex) => {
            for (let hour = 0; hour < 24; hour++) {
                const baseValue = 50;
                const dayMultiplier = dayIndex === 0 || dayIndex === 6 ? 0.7 : 1.2;
                const hourMultiplier = (hour >= 9 && hour <= 17) ? 1.5 : 0.8;
                
                data.push({
                    day,
                    hour,
                    value: Math.round(baseValue * dayMultiplier * hourMultiplier * (0.5 + Math.random())),
                    sessions: Math.round(100 * dayMultiplier * hourMultiplier * Math.random()),
                    conversions: Math.round(10 * dayMultiplier * hourMultiplier * Math.random())
                });
            }
        });
        
        return { data, metadata: { timezone: 'UTC', period: 'last_7_days' } };
    }

    generateMockRevenueData(params) {
        const categories = {
            'Subscriptions': {
                'Basic Plan': 125000,
                'Pro Plan': 280000,
                'Enterprise': 450000
            },
            'Services': {
                'Consulting': 180000,
                'Training': 95000,
                'Support': 145000
            },
            'Products': {
                'Add-ons': 85000,
                'Integrations': 110000,
                'Custom Development': 220000
            }
        };

        return {
            data: categories,
            total: 1690000,
            growth: {
                monthly: 12.5,
                quarterly: 34.2,
                yearly: 156.8
            }
        };
    }

    generateMockJourneyData(params) {
        const nodes = [
            { id: 0, name: 'Homepage', value: 10000 },
            { id: 1, name: 'Product Page', value: 7000 },
            { id: 2, name: 'Documentation', value: 3000 },
            { id: 3, name: 'Sign Up', value: 5000 },
            { id: 4, name: 'Trial', value: 4000 },
            { id: 5, name: 'Purchase', value: 2000 },
            { id: 6, name: 'Support', value: 1500 },
            { id: 7, name: 'Churn', value: 500 }
        ];

        const links = [
            { source: 0, target: 1, value: 4000 },
            { source: 0, target: 2, value: 2000 },
            { source: 0, target: 3, value: 3000 },
            { source: 1, target: 3, value: 2500 },
            { source: 1, target: 4, value: 1500 },
            { source: 2, target: 6, value: 1000 },
            { source: 3, target: 4, value: 3500 },
            { source: 4, target: 5, value: 2800 },
            { source: 4, target: 7, value: 700 },
            { source: 5, target: 6, value: 500 }
        ];

        return { nodes, links };
    }

    generateMockEngagementData(params) {
        return {
            metrics: [
                { name: 'User Retention', value: 0.85, trend: 0.03 },
                { name: 'Page Views', value: 0.72, trend: -0.02 },
                { name: 'Session Duration', value: 0.68, trend: 0.05 },
                { name: 'Feature Adoption', value: 0.90, trend: 0.08 },
                { name: 'Support Tickets', value: 0.45, trend: -0.12 },
                { name: 'User Satisfaction', value: 0.88, trend: 0.04 }
            ],
            averageScore: 0.75,
            overallTrend: 0.04
        };
    }

    createMockEventStream() {
        const events = [
            { type: 'user_login', weight: 30 },
            { type: 'document_view', weight: 25 },
            { type: 'data_export', weight: 15 },
            { type: 'profile_update', weight: 10 },
            { type: 'transaction', weight: 20 }
        ];

        return {
            addEventListener: (event, callback) => {
                if (event === 'message') {
                    setInterval(() => {
                        const randomEvent = this.weightedRandom(events);
                        const data = {
                            type: randomEvent.type,
                            timestamp: new Date().toISOString(),
                            userId: `user_${Math.floor(Math.random() * 10000)}`,
                            value: Math.random() * 100
                        };
                        callback({ data: JSON.stringify(data) });
                    }, 2000);
                }
            },
            close: () => {}
        };
    }

    generateMockGeographicData(params) {
        return {
            regions: [
                { 
                    name: 'North America',
                    code: 'NA',
                    value: 450000,
                    users: 12500,
                    growth: 15.2,
                    countries: [
                        { name: 'United States', value: 350000, users: 9500 },
                        { name: 'Canada', value: 80000, users: 2500 },
                        { name: 'Mexico', value: 20000, users: 500 }
                    ]
                },
                {
                    name: 'Europe',
                    code: 'EU',
                    value: 380000,
                    users: 10200,
                    growth: 12.8,
                    countries: [
                        { name: 'Germany', value: 120000, users: 3200 },
                        { name: 'United Kingdom', value: 100000, users: 2800 },
                        { name: 'France', value: 80000, users: 2100 },
                        { name: 'Spain', value: 50000, users: 1300 },
                        { name: 'Italy', value: 30000, users: 800 }
                    ]
                },
                {
                    name: 'Asia Pacific',
                    code: 'APAC',
                    value: 320000,
                    users: 15000,
                    growth: 28.5,
                    countries: [
                        { name: 'Japan', value: 100000, users: 4000 },
                        { name: 'China', value: 80000, users: 5000 },
                        { name: 'India', value: 60000, users: 3500 },
                        { name: 'Australia', value: 50000, users: 1500 },
                        { name: 'Singapore', value: 30000, users: 1000 }
                    ]
                }
            ]
        };
    }

    generateMockPredictiveData(params) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        const historical = [];
        const predicted = [];
        
        let baseValue = 100000;
        for (let i = 0; i <= currentMonth; i++) {
            baseValue += Math.random() * 20000;
            historical.push({
                month: months[i],
                revenue: baseValue,
                users: Math.round(baseValue / 100),
                confidence: 1.0
            });
        }
        
        for (let i = currentMonth + 1; i < 12; i++) {
            baseValue += Math.random() * 25000;
            predicted.push({
                month: months[i],
                revenue: baseValue,
                users: Math.round(baseValue / 100),
                confidence: 0.95 - (i - currentMonth) * 0.05,
                upperBound: baseValue * 1.2,
                lowerBound: baseValue * 0.8
            });
        }
        
        return {
            historical,
            predicted,
            accuracy: 0.89,
            models: ['ARIMA', 'Prophet', 'LSTM'],
            confidence_interval: 0.95
        };
    }

    generateMockCohortData(params) {
        const cohorts = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        months.forEach((month, index) => {
            const cohortSize = Math.floor(Math.random() * 500) + 1000;
            const retention = [];
            
            for (let period = 0; period <= index; period++) {
                retention.push({
                    period,
                    retained: Math.round(cohortSize * Math.pow(0.9, period)),
                    percentage: Math.pow(0.9, period)
                });
            }
            
            cohorts.push({
                name: `${month} 2024`,
                size: cohortSize,
                retention,
                ltv: Math.round(cohortSize * 150 * Math.random())
            });
        });
        
        return { cohorts };
    }

    generateMockFunnelData(params) {
        const steps = [
            { name: 'Landing Page', users: 10000, conversionRate: 1.0 },
            { name: 'Sign Up Form', users: 6000, conversionRate: 0.6 },
            { name: 'Email Verification', users: 5400, conversionRate: 0.9 },
            { name: 'Profile Setup', users: 4860, conversionRate: 0.9 },
            { name: 'First Action', users: 3888, conversionRate: 0.8 },
            { name: 'Subscription', users: 1944, conversionRate: 0.5 }
        ];
        
        return {
            funnel: steps,
            overallConversion: 0.1944,
            averageTime: '3.5 days',
            dropoffReasons: {
                'Sign Up Form': ['Too many fields', 'Email already exists'],
                'Profile Setup': ['Complex process', 'Optional fields confusion'],
                'Subscription': ['Price concerns', 'Feature questions']
            }
        };
    }

    weightedRandom(items) {
        const weights = items.map(item => item.weight);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    clearCache() {
        this.cache.clear();
    }
}

// Make AnalyticsAPI available globally
window.AnalyticsAPI = AnalyticsAPI;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsAPI;
}
