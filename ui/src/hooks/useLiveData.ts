import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  liveDataService,
  RealTimeMetrics,
  AgentMetrics,
  ProjectMetrics,
  SystemHealth,
  Alert,
  SubscriptionOptions 
} from '../services/liveDataIntegration';

// Generic hook for live data subscriptions
export function useLiveData<T>(
  endpoint: string,
  options?: SubscriptionOptions & {
    enabled?: boolean;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const subscriptionRef = useRef<string | null>(null);
  const enabledRef = useRef(options?.enabled ?? true);
  
  // Update enabled state
  useEffect(() => {
    enabledRef.current = options?.enabled ?? true;
  }, [options?.enabled]);

  const handleData = useCallback((newData: T) => {
    setData(newData);
    setIsLoading(false);
    setError(null);
    setLastUpdate(new Date());
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err);
    setIsLoading(false);
    options?.onError?.(err);
  }, [options]);

  const connect = useCallback(() => {
    if (!enabledRef.current || subscriptionRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const subscriptionId = liveDataService.subscribe(
        endpoint,
        handleData,
        {
          ...options,
          immediate: true,
        }
      );
      
      subscriptionRef.current = subscriptionId;
      setIsConnected(true);
      options?.onConnect?.();
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [endpoint, handleData, handleError, options]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      liveDataService.unsubscribe(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsConnected(false);
      options?.onDisconnect?.();
    }
  }, [options]);

  const refresh = useCallback(async () => {
    if (subscriptionRef.current) {
      disconnect();
      connect();
    }
  }, [connect, disconnect]);

  // Auto-connect/disconnect based on enabled state
  useEffect(() => {
    if (enabledRef.current) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [endpoint]); // Only re-run if endpoint changes

  // Manual control functions
  const pause = useCallback(() => {
    enabledRef.current = false;
    disconnect();
  }, [disconnect]);

  const resume = useCallback(() => {
    enabledRef.current = true;
    connect();
  }, [connect]);

  return {
    data,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    // Status information
    connectionStatus: liveDataService.getConnectionStatus(),
  };
}

// Specialized hooks for different data types
export function useSystemMetrics(options?: SubscriptionOptions & { enabled?: boolean }) {
  return useLiveData<RealTimeMetrics>('/api/metrics/system', {
    interval: 2000,
    immediate: true,
    ...options,
  });
}

export function useAgentMetrics(options?: SubscriptionOptions & { enabled?: boolean }) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const {
    data: allAgents,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    connectionStatus
  } = useLiveData<AgentMetrics[]>('/api/agents/metrics', {
    interval: 3000,
    immediate: true,
    ...options,
  });

  const selectedAgentData = allAgents?.find(agent => agent.id === selectedAgent) || null;

  return {
    agents: allAgents || [],
    selectedAgent: selectedAgentData,
    selectAgent: setSelectedAgent,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    connectionStatus,
  };
}

export function useProjectMetrics(projectId?: string, options?: SubscriptionOptions & { enabled?: boolean }) {
  const endpoint = projectId ? `/api/projects/${projectId}/metrics` : '/api/projects/metrics';
  
  return useLiveData<ProjectMetrics[]>(endpoint, {
    interval: 5000,
    immediate: true,
    filter: projectId ? (data: ProjectMetrics[]) => data.some(p => p.id === projectId) : undefined,
    transform: projectId ? (data: ProjectMetrics[]) => data.filter(p => p.id === projectId) : undefined,
    ...options,
  });
}

export function useSystemHealth(options?: SubscriptionOptions & { enabled?: boolean }) {
  const [criticalAlertsOnly, setCriticalAlertsOnly] = useState(false);
  
  const {
    data: systemHealth,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    connectionStatus
  } = useLiveData<SystemHealth>('/api/health/detailed', {
    interval: 10000,
    immediate: true,
    transform: criticalAlertsOnly 
      ? (data: SystemHealth) => ({
          ...data,
          alerts: data.alerts.filter(alert => alert.severity === 'critical')
        })
      : undefined,
    ...options,
  });

  return {
    systemHealth,
    criticalAlertsOnly,
    setCriticalAlertsOnly,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    connectionStatus,
  };
}

export function useAlerts(options?: SubscriptionOptions & { enabled?: boolean }) {
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'critical'>('all');
  
  const {
    data: alerts,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    connectionStatus
  } = useLiveData<Alert[]>('/api/alerts', {
    interval: 1000,
    immediate: true,
    transform: (data: Alert[]) => {
      switch (filter) {
        case 'unacknowledged':
          return data.filter(alert => !alert.acknowledged);
        case 'critical':
          return data.filter(alert => alert.severity === 'critical');
        default:
          return data;
      }
    },
    ...options,
  });

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await liveDataService.acknowledgeAlert(alertId);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, []);

  const unacknowledgedCount = (alerts || []).filter(alert => !alert.acknowledged).length;
  const criticalCount = (alerts || []).filter(alert => alert.severity === 'critical').length;

  return {
    alerts: alerts || [],
    filter,
    setFilter,
    acknowledgeAlert,
    unacknowledgedCount,
    criticalCount,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
    pause,
    resume,
    connectionStatus,
  };
}

// Advanced composite hook for dashboard data
export function useDashboardData(options?: { enabled?: boolean }) {
  const systemMetrics = useSystemMetrics({ 
    enabled: options?.enabled,
    interval: 2000 
  });
  
  const agentMetrics = useAgentMetrics({ 
    enabled: options?.enabled,
    interval: 3000 
  });
  
  const systemHealth = useSystemHealth({ 
    enabled: options?.enabled,
    interval: 10000 
  });
  
  const alerts = useAlerts({ 
    enabled: options?.enabled,
    interval: 1000 
  });

  const isLoading = systemMetrics.isLoading || 
                   agentMetrics.isLoading || 
                   systemHealth.isLoading || 
                   alerts.isLoading;

  const hasError = systemMetrics.error || 
                  agentMetrics.error || 
                  systemHealth.error || 
                  alerts.error;

  const isConnected = systemMetrics.isConnected && 
                     agentMetrics.isConnected && 
                     systemHealth.isConnected && 
                     alerts.isConnected;

  const refreshAll = useCallback(() => {
    systemMetrics.refresh();
    agentMetrics.refresh();
    systemHealth.refresh();
    alerts.refresh();
  }, [systemMetrics, agentMetrics, systemHealth, alerts]);

  const pauseAll = useCallback(() => {
    systemMetrics.pause();
    agentMetrics.pause();
    systemHealth.pause();
    alerts.pause();
  }, [systemMetrics, agentMetrics, systemHealth, alerts]);

  const resumeAll = useCallback(() => {
    systemMetrics.resume();
    agentMetrics.resume();
    systemHealth.resume();
    alerts.resume();
  }, [systemMetrics, agentMetrics, systemHealth, alerts]);

  return {
    systemMetrics: systemMetrics.data,
    agents: agentMetrics.agents,
    systemHealth: systemHealth.systemHealth,
    alerts: alerts.alerts,
    unacknowledgedAlerts: alerts.unacknowledgedCount,
    criticalAlerts: alerts.criticalCount,
    isLoading,
    hasError,
    isConnected,
    refreshAll,
    pauseAll,
    resumeAll,
    connectionStatus: liveDataService.getConnectionStatus(),
  };
}

// Hook for real-time actions with optimistic updates
export function useRealTimeActions() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const executeAction = useCallback(async (
    actionName: string,
    actionFn: () => Promise<void>,
    optimisticUpdate?: () => void
  ) => {
    setIsExecuting(true);
    setLastAction(actionName);

    try {
      // Apply optimistic update first
      optimisticUpdate?.();
      
      // Execute the actual action
      await actionFn();
      
      console.log(`✅ Action '${actionName}' completed successfully`);
    } catch (error) {
      console.error(`❌ Action '${actionName}' failed:`, error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const restartAgent = useCallback(async (agentId: string) => {
    await executeAction(
      `restart-agent-${agentId}`,
      () => liveDataService.restartAgent(agentId)
    );
  }, [executeAction]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    await executeAction(
      `acknowledge-alert-${alertId}`,
      () => liveDataService.acknowledgeAlert(alertId)
    );
  }, [executeAction]);

  const updateProjectConfig = useCallback(async (projectId: string, config: any) => {
    await executeAction(
      `update-project-${projectId}`,
      () => liveDataService.updateProjectConfiguration(projectId, config)
    );
  }, [executeAction]);

  return {
    isExecuting,
    lastAction,
    restartAgent,
    acknowledgeAlert,
    updateProjectConfig,
    executeAction,
  };
}
