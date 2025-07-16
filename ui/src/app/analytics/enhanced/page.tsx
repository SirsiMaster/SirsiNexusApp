'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Server,
  Brain,
  Zap,
  Target,
  Cpu,
  HardDrive,
  Network,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Database,
  Cloud,
  Shield
} from 'lucide-react';

interface PredictiveMetric {
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface OptimizationSuggestion {
  id: string;
  type: 'cost' | 'performance' | 'security' | 'efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  implementationTime?: string;
}

const EnhancedAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);

  // Enhanced metrics with AI predictions
  const [predictiveMetrics, setPredictiveMetrics] = useState<Record<string, PredictiveMetric>>({
    cost: { current: 2847, predicted: 2620, confidence: 87, trend: 'down' },
    performance: { current: 94.2, predicted: 96.8, confidence: 92, trend: 'up' },
    efficiency: { current: 78.5, predicted: 82.1, confidence: 85, trend: 'up' },
    utilization: { current: 68.3, predicted: 75.2, confidence: 89, trend: 'up' }
  });

  // AI-powered optimization suggestions
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: '1',
      type: 'cost',
      title: 'Rightsizing Underutilized Instances',
      description: 'Detected 12 instances with <30% average CPU utilization. Downsizing could save significant costs.',
      impact: 'high',
      effort: 'low',
      potentialSavings: 890,
      implementationTime: '2-4 hours'
    },
    {
      id: '2',
      type: 'performance',
      title: 'Enable Auto-Scaling for Web Tier',
      description: 'Configure horizontal auto-scaling to handle traffic spikes more efficiently.',
      impact: 'high',
      effort: 'medium',
      implementationTime: '1-2 days'
    },
    {
      id: '3',
      type: 'security',
      title: 'Update Security Groups',
      description: 'Found 5 security groups with overly permissive rules. Tighten access controls.',
      impact: 'high',
      effort: 'low',
      implementationTime: '1-2 hours'
    },
    {
      id: '4',
      type: 'efficiency',
      title: 'Implement Reserved Instances',
      description: 'Switch to reserved instances for consistent workloads to reduce costs by 40%.',
      impact: 'medium',
      effort: 'low',
      potentialSavings: 456,
      implementationTime: '30 minutes'
    }
  ]);

  // Real-time system health metrics
  const [systemHealth, setSystemHealth] = useState({
    cpu: { average: 72.4, peak: 89.2, healthy: true },
    memory: { average: 65.8, peak: 78.1, healthy: true },
    disk: { average: 45.2, peak: 67.8, healthy: true },
    network: { average: 23.4, peak: 156.7, healthy: true }
  });

  // Anomaly detection results
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      type: 'performance',
      severity: 'medium',
      title: 'Unusual CPU Spike Pattern',
      description: 'Detected irregular CPU usage pattern on web-server-03',
      timestamp: '2 hours ago',
      confidence: 94,
      resolved: false
    },
    {
      id: 2,
      type: 'cost',
      severity: 'high',
      title: 'Cost Anomaly Detected',
      description: 'Database costs increased 340% compared to baseline',
      timestamp: '4 hours ago',
      confidence: 98,
      resolved: false
    },
    {
      id: 3,
      type: 'security',
      severity: 'low',
      title: 'Access Pattern Change',
      description: 'New geographic access pattern detected for admin accounts',
      timestamp: '6 hours ago',
      confidence: 76,
      resolved: true
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (aiInsightsEnabled) {
        setSystemHealth(prev => ({
          cpu: { ...prev.cpu, average: Math.random() * 30 + 60 },
          memory: { ...prev.memory, average: Math.random() * 20 + 55 },
          disk: { ...prev.disk, average: Math.random() * 15 + 40 },
          network: { ...prev.network, average: Math.random() * 30 + 15 }
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [aiInsightsEnabled]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading AI-enhanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                Enhanced Analytics
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Advanced insights with machine learning predictions and anomaly detection
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setAiInsightsEnabled(!aiInsightsEnabled)}
                variant={aiInsightsEnabled ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                {aiInsightsEnabled ? 'AI Enabled' : 'Enable AI'}
              </Button>
            </div>
          </div>
        </div>

        {/* Predictive Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(predictiveMetrics).map(([key, metric]) => {
            const icons = {
              cost: DollarSign,
              performance: TrendingUp,
              efficiency: Zap,
              utilization: Activity
            };
            const Icon = icons[key as keyof typeof icons];
            
            return (
              <Card key={key} className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold capitalize">{key}</h3>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                      <span className="font-semibold">
                        {key === 'cost' ? `$${metric.current}` : `${metric.current}%`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Predicted</span>
                      <span className="font-semibold text-purple-600">
                        {key === 'cost' ? `$${metric.predicted}` : `${metric.predicted}%`}
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Confidence</span>
                        <span>{metric.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${metric.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Cost Optimization</p>
                        <p className="text-sm text-green-700 dark:text-green-300">12% reduction predicted</p>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Excellent</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Performance Score</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Above industry average</p>
                      </div>
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Good</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">Resource Utilization</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Room for improvement</p>
                      </div>
                      <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Fair</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-purple-200 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <p className="font-medium text-purple-900">Auto-scaling Opportunity</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Configure auto-scaling for your web tier to improve efficiency by 23%
                      </p>
                    </div>
                    
                    <div className="p-3 border border-emerald-200 dark:border-emerald-700 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <p className="font-medium text-emerald-900">Reserved Instance Savings</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Switch to reserved instances to save $456/month on consistent workloads
                      </p>
                    </div>
                    
                    <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                      <p className="font-medium text-amber-900">Security Enhancement</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Update 5 security groups with overly permissive rules
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{suggestion.title}</h3>
                            <Badge className={getImpactColor(suggestion.impact)}>
                              {suggestion.impact} impact
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{suggestion.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`font-medium ${getEffortColor(suggestion.effort)}`}>
                              {suggestion.effort} effort
                            </span>
                            {suggestion.potentialSavings && (
                              <span className="text-green-600 font-medium">
                                Save ${suggestion.potentialSavings}/month
                              </span>
                            )}
                            {suggestion.implementationTime && (
                              <span className="text-gray-500 dark:text-gray-400">
                                ~{suggestion.implementationTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" className="ml-4">Implement</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(systemHealth).map(([key, health]) => {
                const icons = {
                  cpu: Cpu,
                  memory: HardDrive,
                  disk: Database,
                  network: Network
                };
                const Icon = icons[key as keyof typeof icons];
                
                return (
                  <Card key={key}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold capitalize">{key}</h3>
                        </div>
                        {health.healthy ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average</span>
                          <span className="font-semibold">{health.average.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Peak</span>
                          <span className="font-semibold">{health.peak.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div 
                            className={`h-2 rounded-full ${health.average > 80 ? 'bg-red-50 dark:bg-red-900/200' : health.average > 60 ? 'bg-yellow-50 dark:bg-yellow-900/200' : 'bg-green-50 dark:bg-green-900/200'}`}
                            style={{ width: `${health.average}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Anomaly Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{anomaly.title}</h3>
                            <Badge 
                              variant={anomaly.severity === 'high' ? 'destructive' : 
                                     anomaly.severity === 'medium' ? 'default' : 'outline'}
                            >
                              {anomaly.severity}
                            </Badge>
                            {anomaly.resolved && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{anomaly.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{anomaly.timestamp}</span>
                            <span>Confidence: {anomaly.confidence}%</span>
                          </div>
                        </div>
                        {!anomaly.resolved && (
                          <Button size="sm" variant="outline">Investigate</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
