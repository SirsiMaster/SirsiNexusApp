import { apiClient, ApiResponse } from './apiClient';
import { agentWebSocket } from './websocket';

// Types for live data
export interface LiveDataSubscription {
  id: string;
  endpoint: string;
  callback: (data: any) => void;
  options?: SubscriptionOptions;
}

export interface SubscriptionOptions {
  immediate?: boolean;
  interval?: number;
  retryCount?: number;
  retryDelay?: number;
  transform?: (data: any) => any;
  filter?: (data: any) => boolean;
}

export interface RealTimeMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  agents: AgentMetrics[];
  errors: ErrorMetrics[];
}

export interface AgentMetrics {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  lastSeen: string;
  performance: {
    responseTime: number;
    successRate: number;
    throughput: number;
  };
  resources: {
    cpu: number;
    memory: number;
  };
}

export interface ErrorMetrics {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  count: number;
}

export interface ProjectMetrics {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  progress: number;
  resources: {
    allocated: number;
    used: number;
    cost: number;
  };
  lastActivity: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealth[];
  alerts: Alert[];
  timestamp: string;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  version: string;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

class LiveDataIntegrationService {
  private subscriptions = new Map<string, LiveDataSubscription>();
  private pollIntervals = new Map<string, NodeJS.Timeout>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeWebSocketConnection();
    this.setupHeartbeat();
  }

  private async initializeWebSocketConnection() {
    try {
      await agentWebSocket.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
    // Subscribe to real-time updates
    agentWebSocket.on('message', this.handleWebSocketMessage.bind(this));
      
      console.log('🔌 Live data integration connected');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    this.isConnected = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.initializeWebSocketConnection();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Falling back to polling.');
      this.fallbackToPolling();
    }
  }

  private fallbackToPolling() {
    // Implement polling fallback for critical data
    this.subscriptions.forEach((subscription) => {
      this.startPolling(subscription);
    });
  }

  private startPolling(subscription: LiveDataSubscription) {
    const interval = subscription.options?.interval || 5000;
    
    const pollId = setInterval(async () => {
      try {
        const response = await apiClient.get(subscription.endpoint);
        
        let data = response.data;
        
        // Apply transform if provided
        if (subscription.options?.transform) {
          data = subscription.options.transform(data);
        }
        
        // Apply filter if provided
        if (subscription.options?.filter && !subscription.options.filter(data)) {
          return;
        }
        
        subscription.callback(data);
      } catch (error) {
        console.error(`Polling error for ${subscription.endpoint}:`, error);
        this.handlePollingError(subscription, error);
      }
    }, interval);
    
    this.pollIntervals.set(subscription.id, pollId);
  }

  private handlePollingError(subscription: LiveDataSubscription, error: any) {
    const retryCount = subscription.options?.retryCount || 3;
    const retryDelay = subscription.options?.retryDelay || 1000;
    
    // Implement retry logic
    let attempts = 0;
    const retry = () => {
      if (attempts < retryCount) {
        attempts++;
        setTimeout(() => {
          this.startPolling(subscription);
        }, retryDelay * attempts);
      }
    };
    
    retry();
  }

  private setupHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        agentWebSocket.sendRawMessage({
          type: 'system',
          content: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })
        });
      }
    }, 30000); // 30 seconds
  }

  private handleWebSocketMessage(message: any) {
    // Route messages to appropriate handlers
    if (message.type === 'system_metrics') {
      this.handleSystemMetrics(JSON.parse(message.content));
    } else if (message.type === 'agent_updates') {
      this.handleAgentUpdates(JSON.parse(message.content));
    } else if (message.type === 'project_updates') {
      this.handleProjectUpdates(JSON.parse(message.content));
    } else if (message.type === 'alerts') {
      this.handleAlerts(JSON.parse(message.content));
    }
  }

  private handleSystemMetrics(data: RealTimeMetrics) {
    // Broadcast to all system metrics subscribers
    this.notifySubscribers('system_metrics', data);
  }

  private handleAgentUpdates(data: AgentMetrics[]) {
    // Broadcast to all agent subscribers
    this.notifySubscribers('agent_updates', data);
  }

  private handleProjectUpdates(data: ProjectMetrics[]) {
    // Broadcast to all project subscribers
    this.notifySubscribers('project_updates', data);
  }

  private handleAlerts(data: Alert[]) {
    // Broadcast to all alert subscribers
    this.notifySubscribers('alerts', data);
  }

  private notifySubscribers(type: string, data: any) {
    this.subscriptions.forEach((subscription) => {
      if (subscription.endpoint.includes(type)) {
        let processedData = data;
        
        // Apply transform if provided
        if (subscription.options?.transform) {
          processedData = subscription.options.transform(data);
        }
        
        // Apply filter if provided
        if (subscription.options?.filter && !subscription.options.filter(processedData)) {
          return;
        }
        
        subscription.callback(processedData);
      }
    });
  }

  // Public API methods
  public subscribe(
    endpoint: string,
    callback: (data: any) => void,
    options?: SubscriptionOptions
  ): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: LiveDataSubscription = {
      id,
      endpoint,
      callback,
      options
    };
    
    this.subscriptions.set(id, subscription);
    
    // If immediate data is requested, fetch it now
    if (options?.immediate) {
      this.fetchImmediateData(subscription);
    }
    
    // If not connected via WebSocket, start polling
    if (!this.isConnected) {
      this.startPolling(subscription);
    }
    
    return id;
  }

  public unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
    
    // Clear any polling intervals
    const interval = this.pollIntervals.get(subscriptionId);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(subscriptionId);
    }
    
    // Clear any retry timeouts
    const timeout = this.retryTimeouts.get(subscriptionId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(subscriptionId);
    }
  }

  private async fetchImmediateData(subscription: LiveDataSubscription) {
    try {
      const response = await apiClient.get(subscription.endpoint);
      let data = response.data;
      
      // Apply transform if provided
      if (subscription.options?.transform) {
        data = subscription.options.transform(data);
      }
      
      // Apply filter if provided
      if (subscription.options?.filter && !subscription.options.filter(data)) {
        return;
      }
      
      subscription.callback(data);
    } catch (error) {
      console.error(`Failed to fetch immediate data for ${subscription.endpoint}:`, error);
    }
  }

  // Specialized subscription methods
  public subscribeToSystemMetrics(
    callback: (metrics: RealTimeMetrics) => void,
    options?: SubscriptionOptions
  ): string {
    return this.subscribe('/api/metrics/system', callback, {
      immediate: true,
      interval: 2000,
      ...options
    });
  }

  public subscribeToAgentMetrics(
    callback: (agents: AgentMetrics[]) => void,
    options?: SubscriptionOptions
  ): string {
    return this.subscribe('/api/agents/metrics', callback, {
      immediate: true,
      interval: 3000,
      ...options
    });
  }

  public subscribeToProjectMetrics(
    callback: (projects: ProjectMetrics[]) => void,
    options?: SubscriptionOptions
  ): string {
    return this.subscribe('/api/projects/metrics', callback, {
      immediate: true,
      interval: 5000,
      ...options
    });
  }

  public subscribeToSystemHealth(
    callback: (health: SystemHealth) => void,
    options?: SubscriptionOptions
  ): string {
    return this.subscribe('/api/health/detailed', callback, {
      immediate: true,
      interval: 10000,
      ...options
    });
  }

  public subscribeToAlerts(
    callback: (alerts: Alert[]) => void,
    options?: SubscriptionOptions
  ): string {
    return this.subscribe('/api/alerts', callback, {
      immediate: true,
      interval: 1000,
      ...options
    });
  }

  // Real-time actions
  public async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await apiClient.post(`/api/alerts/${alertId}/acknowledge`);
      
      // Notify via WebSocket if connected
      if (this.isConnected) {
        agentWebSocket.sendRawMessage({
          type: 'system',
          content: JSON.stringify({ type: 'alert_acknowledged', alertId })
        });
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }

  public async restartAgent(agentId: string): Promise<void> {
    try {
      await apiClient.post(`/api/agents/${agentId}/restart`);
      
      // Notify via WebSocket if connected
      if (this.isConnected) {
        agentWebSocket.sendRawMessage({
          type: 'system',
          content: JSON.stringify({ type: 'agent_restart', agentId })
        });
      }
    } catch (error) {
      console.error('Failed to restart agent:', error);
      throw error;
    }
  }

  public async updateProjectConfiguration(
    projectId: string,
    config: any
  ): Promise<void> {
    try {
      await apiClient.put(`/api/projects/${projectId}/config`, config);
      
      // Notify via WebSocket if connected
      if (this.isConnected) {
        agentWebSocket.sendRawMessage({
          type: 'system',
          content: JSON.stringify({ type: 'project_config_updated', projectId, config })
        });
      }
    } catch (error) {
      console.error('Failed to update project configuration:', error);
      throw error;
    }
  }

  // Utility methods
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getActiveSubscriptions(): number {
    return this.subscriptions.size;
  }

  public disconnect(): void {
    // Clear all subscriptions
    this.subscriptions.clear();
    
    // Clear all intervals
    this.pollIntervals.forEach((interval) => clearInterval(interval));
    this.pollIntervals.clear();
    
    // Clear all timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.retryTimeouts.clear();
    
    // Disconnect WebSocket
    agentWebSocket.disconnect();
    this.isConnected = false;
    
    console.log('🔌 Live data integration disconnected');
  }
}

// Singleton instance
export const liveDataService = new LiveDataIntegrationService();

// Export types and service
export default liveDataService;
