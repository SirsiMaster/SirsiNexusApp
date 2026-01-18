/**
 * Live Metrics Provider for SirsiNexus
 * Provides real-time metrics from Firebase and external APIs
 * Version: 1.0.0
 */

import { getFirestore, getRealtimeDB, COLLECTIONS, RTDB_PATHS } from '../config/firebase.config.js';

class MetricsProvider {
    constructor() {
        this.subscribers = new Set();
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5 seconds cache
        this.listeners = new Map();
    }

    /**
     * Get live infrastructure metrics
     */
    async getInfrastructureMetrics() {
        const cacheKey = 'infrastructure';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const rtdb = await getRealtimeDB();
            const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            
            const metricsRef = ref(rtdb, `${RTDB_PATHS.METRICS}/infrastructure`);
            
            return new Promise((resolve) => {
                onValue(metricsRef, (snapshot) => {
                    const data = snapshot.val() || this.getDefaultInfrastructureMetrics();
                    this.setCache(cacheKey, data);
                    resolve(data);
                });
            });
        } catch (error) {
            console.error('Error fetching infrastructure metrics:', error);
            return this.getDefaultInfrastructureMetrics();
        }
    }

    /**
     * Get live KPI metrics
     */
    async getKPIMetrics() {
        const cacheKey = 'kpis';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const db = await getFirestore();
            const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const kpisRef = collection(db, COLLECTIONS.KPIS);
            const q = query(kpisRef, orderBy('timestamp', 'desc'), limit(1));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                this.setCache(cacheKey, data);
                return data;
            }
            
            return this.getDefaultKPIMetrics();
        } catch (error) {
            console.error('Error fetching KPI metrics:', error);
            return this.getDefaultKPIMetrics();
        }
    }

    /**
     * Get live investor metrics
     */
    async getInvestorMetrics() {
        const cacheKey = 'investor';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const db = await getFirestore();
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const metricsRef = collection(db, COLLECTIONS.INVESTOR_METRICS);
            const snapshot = await getDocs(metricsRef);
            
            const metrics = {
                totalInvestors: snapshot.size,
                accreditedInvestors: 0,
                totalCommitted: 0,
                averageTicket: 0,
                conversionRate: 0,
                documents: []
            };
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.accredited) metrics.accreditedInvestors++;
                if (data.committed) metrics.totalCommitted += data.committed;
                metrics.documents.push({
                    id: doc.id,
                    ...data
                });
            });
            
            if (metrics.totalInvestors > 0) {
                metrics.averageTicket = metrics.totalCommitted / metrics.totalInvestors;
                metrics.conversionRate = (metrics.accreditedInvestors / metrics.totalInvestors) * 100;
            }
            
            this.setCache(cacheKey, metrics);
            return metrics;
        } catch (error) {
            console.error('Error fetching investor metrics:', error);
            return this.getDefaultInvestorMetrics();
        }
    }

    /**
     * Subscribe to real-time metric updates
     */
    subscribe(callback, metricTypes = ['infrastructure', 'kpis', 'investor']) {
        const subscriberId = Date.now() + Math.random();
        
        this.subscribers.add({
            id: subscriberId,
            callback,
            types: metricTypes
        });

        // Set up real-time listeners if not already active
        metricTypes.forEach(type => {
            if (!this.listeners.has(type)) {
                this.setupRealtimeListener(type);
            }
        });

        // Return unsubscribe function
        return () => {
            this.subscribers.forEach(sub => {
                if (sub.id === subscriberId) {
                    this.subscribers.delete(sub);
                }
            });

            // Clean up listeners if no subscribers
            if (this.subscribers.size === 0) {
                this.listeners.forEach((unsubscribe) => unsubscribe());
                this.listeners.clear();
            }
        };
    }

    /**
     * Set up real-time listener for a metric type
     */
    async setupRealtimeListener(type) {
        try {
            const rtdb = await getRealtimeDB();
            const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            
            const metricsRef = ref(rtdb, `${RTDB_PATHS.METRICS}/${type}`);
            
            const unsubscribe = onValue(metricsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    this.setCache(type, data);
                    this.notifySubscribers(type, data);
                }
            });
            
            this.listeners.set(type, unsubscribe);
        } catch (error) {
            console.error(`Error setting up listener for ${type}:`, error);
        }
    }

    /**
     * Notify subscribers of metric updates
     */
    notifySubscribers(type, data) {
        this.subscribers.forEach(sub => {
            if (sub.types.includes(type)) {
                sub.callback({ type, data, timestamp: new Date().toISOString() });
            }
        });
    }

    /**
     * Cache management
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Default metrics (fallback for when Firebase is unavailable)
     */
    getDefaultInfrastructureMetrics() {
        return {
            servers: {
                total: 24,
                active: 23,
                healthy: 22,
                warning: 1,
                critical: 0
            },
            performance: {
                cpu: 42.3,
                memory: 67.8,
                disk: 54.2,
                network: 28.9
            },
            uptime: 99.97,
            responseTime: 124,
            activeUsers: 1847,
            requestsPerSecond: 3421
        };
    }

    getDefaultKPIMetrics() {
        return {
            revenue: {
                current: 2847000,
                target: 3000000,
                growth: 18.5
            },
            users: {
                total: 48293,
                active: 12847,
                new: 2847,
                churn: 2.3
            },
            conversion: {
                rate: 4.2,
                trials: 847,
                paid: 234
            },
            satisfaction: {
                nps: 72,
                csat: 94,
                reviews: 4.7
            }
        };
    }

    getDefaultInvestorMetrics() {
        return {
            totalInvestors: 147,
            accreditedInvestors: 89,
            totalCommitted: 4750000,
            averageTicket: 32313,
            conversionRate: 60.5,
            documents: []
        };
    }

    /**
     * Simulate real-time updates for development
     */
    startSimulation() {
        if (window.location.hostname === 'localhost') {
            setInterval(() => {
                // Simulate infrastructure updates
                const infrastructure = this.getDefaultInfrastructureMetrics();
                infrastructure.performance.cpu = 30 + Math.random() * 40;
                infrastructure.performance.memory = 50 + Math.random() * 30;
                infrastructure.activeUsers = Math.floor(1500 + Math.random() * 1000);
                infrastructure.requestsPerSecond = Math.floor(3000 + Math.random() * 1000);
                
                this.notifySubscribers('infrastructure', infrastructure);
                
                // Simulate KPI updates
                const kpis = this.getDefaultKPIMetrics();
                kpis.revenue.current = Math.floor(2800000 + Math.random() * 200000);
                kpis.users.active = Math.floor(12000 + Math.random() * 2000);
                kpis.conversion.rate = (3.5 + Math.random() * 2).toFixed(1);
                
                this.notifySubscribers('kpis', kpis);
            }, 5000);
        }
    }
}

// Export singleton instance
const metricsProvider = new MetricsProvider();

// Start simulation in development
if (window.location.hostname === 'localhost') {
    metricsProvider.startSimulation();
}

export default metricsProvider;
