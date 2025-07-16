'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Users,
  Cpu,
  Database,
  Network,
  DollarSign,
  Shield,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAgentWebSocket, SystemHealth, SystemMetrics } from '@/services/websocket';

interface AnalyticsData {
  sessions: {
    total: number;
    active: number;
    completed: number;
    success_rate: number;
    avg_duration: number;
  };
  agents: {
    total_spawned: number;
    currently_active: number;
    success_rate: number;
    avg_response_time: number;
    by_type: Record<string, number>;
  };
  performance: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_io: number;
    response_times: number[];
    throughput: number;
  };
  costs: {
    current_month: number;
    projected: number;
    savings_identified: number;
    optimization_score: number;
  };
  security: {
    compliance_score: number;
    vulnerabilities: number;
    security_events: number;
    last_audit: string;
  };
  errors: {
    total: number;
    by_severity: Record<string, number>;
    recent: Array<{
      timestamp: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}

export const EnhancedAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const wsService = useAgentWebSocket();

  // Simulate analytics data - in production, this would come from the backend
  const generateAnalyticsData = (): AnalyticsData => {
    return {
      sessions: {
        total: 1247,
        active: 23,
        completed: 1224,
        success_rate: 98.3,
        avg_duration: 847
      },
      agents: {
        total_spawned: 3421,
        currently_active: 67,
        success_rate: 99.1,
        avg_response_time: 234,
        by_type: {
          aws: 28,
          azure: 15,
          gcp: 12,
          migration: 8,
          security: 4
        }
      },
      performance: {
        cpu_usage: 67.3,
        memory_usage: 78.9,
        disk_usage: 45.2,
        network_io: 234.5,
        response_times: [120, 145, 167, 134, 198, 156, 142, 178, 123, 189],
        throughput: 1247
      },
      costs: {
        current_month: 12847.50,
        projected: 15420.00,
        savings_identified: 2847.30,
        optimization_score: 78.5
      },
      security: {
        compliance_score: 94.2,
        vulnerabilities: 3,
        security_events: 12,
        last_audit: '2024-07-01T10:30:00Z'
      },
      errors: {
        total: 47,
        by_severity: {
          low: 32,
          medium: 12,
          high: 3,
          critical: 0
        },
        recent: [
          {
            timestamp: '2024-07-04T18:45:00Z',
            message: 'Agent response timeout in AWS connector',
            severity: 'medium'
          },
          {
            timestamp: '2024-07-04T18:32:00Z',
            message: 'High memory usage detected',
            severity: 'low'
          },
          {
            timestamp: '2024-07-04T18:15:00Z',
            message: 'Failed to authenticate with Azure API',
            severity: 'high'
          }
        ]
      }
    };
  };

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = generateAnalyticsData();
        setAnalyticsData(data);

        // Get system health if WebSocket is connected
        if (wsService.isConnected()) {
          try {
            const health = await wsService.getSystemHealth(true);
            setSystemHealth(health.health);
          } catch (error) {
            console.log('System health not available:', error);
          }
        }
        
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange, wsService]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        const data = generateAnalyticsData();
        setAnalyticsData(data);
        setLastUpdated(new Date());
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isLoading]);

  // Calculate metric cards
  const metricCards: MetricCard[] = useMemo(() => {
    if (!analyticsData) return [];

    return [
      {
        title: 'Active Sessions',
        value: analyticsData.sessions.active,
        change: 12.5,
        trend: 'up',
        icon: Users,
        color: 'text-blue-600',
        description: `${analyticsData.sessions.success_rate}% success rate`
      },
      {
        title: 'Agent Response Time',
        value: `${analyticsData.agents.avg_response_time}ms`,
        change: -8.3,
        trend: 'down',
        icon: Zap,
        color: 'text-green-600',
        description: 'Average response time'
      },
      {
        title: 'Cost Optimization',
        value: `$${analyticsData.costs.savings_identified.toLocaleString()}`,
        change: 23.7,
        trend: 'up',
        icon: DollarSign,
        color: 'text-emerald-600',
        description: 'Savings identified'
      },
      {
        title: 'System Health',
        value: `${systemHealth?.overallStatus === 'healthy' ? '100' : '85'}%`,
        change: 2.1,
        trend: 'up',
        icon: Shield,
        color: 'text-indigo-600',
        description: 'Overall system status'
      },
      {
        title: 'Throughput',
        value: `${analyticsData.performance.throughput}/min`,
        change: 15.2,
        trend: 'up',
        icon: Activity,
        color: 'text-purple-600',
        description: 'Requests per minute'
      },
      {
        title: 'Error Rate',
        value: `${((analyticsData.errors.total / analyticsData.sessions.total) * 100).toFixed(2)}%`,
        change: -5.4,
        trend: 'down',
        icon: AlertTriangle,
        color: 'text-red-600',
        description: 'Error rate trending down'
      }
    ];
  }, [analyticsData, systemHealth]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean) => {
    if (trend === 'stable') return 'text-gray-500 dark:text-gray-400';
    const isGood = (trend === 'up' && isPositive) || (trend === 'down' && !isPositive);
    return isGood ? 'text-green-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sirsi-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights into system performance and optimization opportunities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <AnimatePresence>
          {metricCards.map((metric, index) => {
            const TrendIcon = getTrendIcon(metric.trend);
            const isPositiveMetric = !metric.title.toLowerCase().includes('error') && 
                                   !metric.title.toLowerCase().includes('time');
            
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <div className={`flex items-center text-sm ${getTrendColor(metric.trend, isPositiveMetric)}`}>
                        <TrendIcon className="h-4 w-4 mr-1" />
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {metric.value}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {metric.title}
                      </div>
                      {metric.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metric.description}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemHealth && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Status</span>
                      <Badge className={systemHealth.overallStatus === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}>
                        {systemHealth.overallStatus}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(systemHealth.components).map(([name, component]) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              component.status === 'healthy' ? 'bg-green-50 dark:bg-green-900/200' : 
                              component.status === 'degraded' ? 'bg-yellow-50 dark:bg-yellow-900/200' : 'bg-red-50 dark:bg-red-900/200'
                            }`} />
                            <span className="text-sm capitalize">{name.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{component.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                  Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analyticsData.agents.currently_active}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analyticsData.agents.success_rate}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">By Type</div>
                      {Object.entries(analyticsData.agents.by_type).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <div className="flex items-center">
                            <Progress 
                              value={(count / analyticsData.agents.currently_active) * 100} 
                              className="w-16 h-2 mr-2"
                            />
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.errors.recent.map((error, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        error.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/200' :
                        error.severity === 'high' ? 'bg-orange-500' :
                        error.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/200' : 'bg-blue-50 dark:bg-blue-900/200'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">{error.message}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      error.severity === 'critical' ? 'border-red-300 text-red-700 dark:text-red-300' :
                      error.severity === 'high' ? 'border-orange-300 text-orange-700' :
                      error.severity === 'medium' ? 'border-yellow-300 text-yellow-700 dark:text-yellow-300' : 
                      'border-blue-300 text-blue-700 dark:text-blue-300'
                    }>
                      {error.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="space-y-6">
                    {[
                      { label: 'CPU Usage', value: analyticsData.performance.cpu_usage, icon: Cpu, color: 'bg-blue-50 dark:bg-blue-900/200' },
                      { label: 'Memory Usage', value: analyticsData.performance.memory_usage, icon: Database, color: 'bg-green-50 dark:bg-green-900/200' },
                      { label: 'Disk Usage', value: analyticsData.performance.disk_usage, icon: Layers, color: 'bg-purple-50 dark:bg-purple-900/200' },
                      { label: 'Network I/O', value: analyticsData.performance.network_io, icon: Network, color: 'bg-orange-500' }
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <metric.icon className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{metric.label}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {metric.label === 'Network I/O' ? `${metric.value} MB/s` : `${metric.value}%`}
                          </span>
                        </div>
                        <Progress value={metric.label === 'Network I/O' ? (metric.value / 1000) * 100 : metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {analyticsData.agents.avg_response_time}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Response Time</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Measurements</div>
                      <div className="grid grid-cols-5 gap-1">
                        {analyticsData.performance.response_times.map((time, index) => (
                          <div key={index} className="text-center">
                            <div className={`h-8 ${time > 180 ? 'bg-red-200' : time > 150 ? 'bg-yellow-200' : 'bg-green-200'} rounded mb-1`} />
                            <div className="text-xs text-gray-600 dark:text-gray-400">{time}ms</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cost Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Cost Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${analyticsData.costs.current_month.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current Month</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Projected</span>
                        <span className="text-sm font-medium">${analyticsData.costs.projected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Savings Identified</span>
                        <span className="text-sm font-medium text-green-600">
                          ${analyticsData.costs.savings_identified.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Optimization Score</span>
                        <span className="text-sm font-medium">{analyticsData.costs.optimization_score}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimization Opportunities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Right-size EC2 Instances',
                      description: 'Identify over-provisioned instances',
                      savings: '$1,247',
                      difficulty: 'Easy',
                      impact: 'High'
                    },
                    {
                      title: 'Implement S3 Lifecycle Policies',
                      description: 'Automatically move objects to cheaper tiers',
                      savings: '$894',
                      difficulty: 'Medium',
                      impact: 'Medium'
                    },
                    {
                      title: 'Reserved Instance Coverage',
                      description: 'Purchase RIs for predictable workloads',
                      savings: '$706',
                      difficulty: 'Easy',
                      impact: 'High'
                    }
                  ].map((opportunity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{opportunity.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <Badge variant="outline" className="text-xs">
                            {opportunity.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {opportunity.impact} Impact
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{opportunity.savings}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">potential savings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Details Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Detailed agent analytics and management will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Security compliance and monitoring details will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Detailed error analysis and troubleshooting will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
