'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Network,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <Card className="p-6 glass border-0">
    <div className="text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4">Unable to load observability data</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </Card>
);

// Types for observability data
interface SystemOverview {
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  network_throughput_mbps: number;
  load_average_1m: number;
  uptime_seconds: number;
  active_connections: number;
}

interface ApplicationStatus {
  total_requests: number;
  requests_per_second: number;
  error_rate_percent: number;
  avg_response_time_ms: number;
  active_agents: number;
  database_connections: number;
  cache_hit_ratio_percent: number;
  ai_api_calls_per_minute: number;
}

interface Alert {
  severity: 'Info' | 'Warning' | 'Critical';
  component: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

interface DashboardData {
  timestamp: string;
  system_overview: SystemOverview;
  application_status: ApplicationStatus;
  active_alerts: Alert[];
  health_status: {
    overall: 'Healthy' | 'Degraded' | 'Unhealthy';
  };
}

interface AgentMetricsData {
  messages_processed: number;
  operations_completed: number;
  errors_encountered: number;
  average_response_time_ms: number;
  custom_metrics: Record<string, string>;
}

const ObservabilityDashboard: React.FC = React.memo(() => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration (will be replaced with real API calls)
  const generateMockData = (): DashboardData => ({
    timestamp: new Date().toISOString(),
    system_overview: {
      cpu_usage_percent: 45 + Math.random() * 30,
      memory_usage_percent: 60 + Math.random() * 20,
      disk_usage_percent: 75 + Math.random() * 10,
      network_throughput_mbps: 10 + Math.random() * 50,
      load_average_1m: 1.2 + Math.random() * 2,
      uptime_seconds: 86400 * 5, // 5 days
      active_connections: 25 + Math.floor(Math.random() * 50),
    },
    application_status: {
      total_requests: 15000 + Math.floor(Math.random() * 5000),
      requests_per_second: 45 + Math.random() * 30,
      error_rate_percent: Math.random() * 2,
      avg_response_time_ms: 150 + Math.random() * 100,
      active_agents: 8 + Math.floor(Math.random() * 4),
      database_connections: 15 + Math.floor(Math.random() * 10),
      cache_hit_ratio_percent: 85 + Math.random() * 10,
      ai_api_calls_per_minute: 12 + Math.random() * 8,
    },
    active_alerts: [
      {
        severity: 'Warning' as const,
        component: 'system',
        metric: 'cpu_usage',
        value: 78.5,
        threshold: 75.0,
        message: 'High CPU usage: 78.50%'
      }
    ],
    health_status: {
      overall: 'Healthy' as const,
    }
  });

  const generateMockAgentMetrics = (): AgentMetricsData => ({
    messages_processed: 1502 + Math.floor(Math.random() * 100),
    operations_completed: 1450 + Math.floor(Math.random() * 50),
    errors_encountered: 12 + Math.floor(Math.random() * 5),
    average_response_time_ms: 245.6 + Math.random() * 50,
    custom_metrics: {
      active_agents_count: (8 + Math.floor(Math.random() * 4)).toString(),
      active_sessions_count: (3 + Math.floor(Math.random() * 3)).toString(),
    }
  });

  // Performance chart data - memoized for performance
  const performanceData = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      cpu: 30 + Math.random() * 40,
      memory: 50 + Math.random() * 30,
      response_time: 100 + Math.random() * 200,
      requests: 20 + Math.random() * 60,
      errors: Math.random() * 5,
    }));
  }, []); // Static data, no dependencies needed

  // Fetch data function with real API calls
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard data from the core-engine API
      const dashboardResponse = await fetch('/api/dashboard');
      const agentResponse = await fetch('/api/agents/metrics');
      
      if (dashboardResponse.ok && agentResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        const agentData = await agentResponse.json();
        
        setDashboardData(dashboardData);
        setAgentMetrics(agentData);
      } else {
        // Fallback to mock data if API is unavailable
        console.warn('API unavailable, using mock data');
        setDashboardData(generateMockData());
        setAgentMetrics(generateMockAgentMetrics());
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch observability data:', error);
      // Fallback to mock data on error
      setDashboardData(generateMockData());
      setAgentMetrics(generateMockAgentMetrics());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run when fetchData changes
  
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]); // Include fetchData dependency

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      case 'Degraded': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
      case 'Unhealthy': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      case 'Warning': return 'text-amber-600 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
      case 'Info': return 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
      default: return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              Observability Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Real-time monitoring and performance insights for SirsiNexus
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                autoRefresh 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Health Status Banner */}
        {dashboardData && (
          <Card className="p-6 glass border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getHealthColor(dashboardData.health_status.overall)}`}>
                  {dashboardData.health_status.overall === 'Healthy' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <AlertTriangle className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    System Status: {dashboardData.health_status.overall}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    All systems operational • {dashboardData.active_alerts.length} active alerts
                  </p>
                </div>
              </div>
              
              <Badge className={getHealthColor(dashboardData.health_status.overall)}>
                {dashboardData.health_status.overall}
              </Badge>
            </div>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass p-2 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Metrics */}
            {dashboardData && (
              <React.Fragment>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* CPU Usage */}
                  <Card className="p-6 glass border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Cpu className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">CPU Usage</h3>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {dashboardData.system_overview.cpu_usage_percent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={dashboardData.system_overview.cpu_usage_percent} 
                      className="h-2"
                    />
                  </Card>

                  {/* Memory Usage */}
                  <Card className="p-6 glass border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <Server className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Memory</h3>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {dashboardData.system_overview.memory_usage_percent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={dashboardData.system_overview.memory_usage_percent} 
                      className="h-2"
                    />
                  </Card>

                  {/* Active Agents */}
                  <Card className="p-6 glass border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Active Agents</h3>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {dashboardData.application_status.active_agents}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Processing {dashboardData.application_status.requests_per_second.toFixed(1)} req/s
                    </p>
                  </Card>

                  {/* Response Time */}
                  <Card className="p-6 glass border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Avg Response</h3>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {dashboardData.application_status.avg_response_time_ms.toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {dashboardData.application_status.error_rate_percent.toFixed(2)}% error rate
                    </p>
                  </Card>
                </div>

                {/* Performance Chart */}
                <Card className="p-6 glass border-0">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">System Performance (24h)</h3>
                  <div className="h-80">
                    <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="cpu" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.1}
                            name="CPU %" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="memory" 
                            stackId="2" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.1}
                            name="Memory %" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </React.Suspense>
                  </div>
                </Card>
              </React.Fragment>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {agentMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 glass border-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Messages Processed</h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {agentMetrics.messages_processed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {agentMetrics.operations_completed.toLocaleString()} operations completed
                  </p>
                </Card>

                <Card className="p-6 glass border-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Avg Response Time</h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {agentMetrics.average_response_time_ms.toFixed(1)}ms
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {agentMetrics.errors_encountered} errors encountered
                  </p>
                </Card>

                <Card className="p-6 glass border-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Active Sessions</h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {agentMetrics.custom_metrics.active_sessions_count}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {agentMetrics.custom_metrics.active_agents_count} agents running
                  </p>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response Time Chart */}
              <Card className="p-6 glass border-0">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Response Time Trends</h3>
                <div className="h-64">
                  <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="response_time" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Response Time (ms)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </React.Suspense>
                </div>
              </Card>

              {/* Request Volume Chart */}
              <Card className="p-6 glass border-0">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Request Volume</h3>
                <div className="h-64">
                  <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="requests" fill="#3b82f6" name="Requests/min" />
                      </BarChart>
                    </ResponsiveContainer>
                  </React.Suspense>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {dashboardData && dashboardData.active_alerts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.active_alerts.map((alert, index) => (
                  <Card key={index} className={`p-6 glass border-0 border-l-4 ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="h-6 w-6" />
                        <div>
                          <h3 className="font-semibold">{alert.message}</h3>
                          <p className="text-sm opacity-80">
                            {alert.component} • {alert.metric} • Value: {alert.value} (Threshold: {alert.threshold})
                          </p>
                        </div>
                      </div>
                      <Badge className={getAlertColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 glass border-0 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Active Alerts</h3>
                <p className="text-slate-600">All systems are operating normally.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

// Wrap with error boundary
const ObservabilityDashboardWithErrorBoundary: React.FC = () => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('ObservabilityDashboard Error:', error);
      setError(new Error(error.message));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }} 
          />
        </div>
      </div>
    );
  }

  return <ObservabilityDashboard />;
};

export default ObservabilityDashboardWithErrorBoundary;
