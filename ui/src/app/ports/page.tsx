'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Server, 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  Play,
  Pause,
  Square,
  Trash2,
  Heart,
  Globe,
  Database,
  Shield,
  Zap,
  Terminal,
  Eye,
  Cpu,
  Monitor,
  HardDrive,
  Gauge
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface PortAllocation {
  port: number;
  service_name: string;
  service_type: string;
  allocation_id: string;
  allocated_at: string;
  last_heartbeat: string;
  status: 'Active' | 'Inactive' | 'Reserved' | 'Expired';
  process_id?: number;
  host: string;
}

interface PortOverview {
  total_ports: number;
  active_services: number;
  port_allocations: { [key: string]: PortAllocation };
  port_usage: { [key: number]: string };
  service_types: { [key: string]: string[] };
  registry_stats: {
    total_allocations: number;
    active_allocations: number;
    reserved_allocations: number;
    expired_allocations: number;
    service_types: { [key: string]: number };
  };
}

const PortManagementDashboard: React.FC = () => {
  const [overview, setOverview] = useState<PortOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data generation (replace with real API calls)
  const generateMockData = (): PortOverview => {
    const allocations: { [key: string]: PortAllocation } = {
      'rest-api': {
        port: 8080,
        service_name: 'rest-api',
        service_type: 'rest-api',
        allocation_id: 'alloc-001',
        allocated_at: '2025-01-07T12:00:00Z',
        last_heartbeat: new Date(Date.now() - 2000).toISOString(),
        status: 'Active',
        process_id: 1234,
        host: 'localhost'
      },
      'grpc-service': {
        port: 50051,
        service_name: 'grpc-service',
        service_type: 'grpc',
        allocation_id: 'alloc-002',
        allocated_at: '2025-01-07T12:01:00Z',
        last_heartbeat: new Date(Date.now() - 1500).toISOString(),
        status: 'Active',
        process_id: 1235,
        host: 'localhost'
      },
      'websocket-service': {
        port: 8081,
        service_name: 'websocket-service',
        service_type: 'websocket',
        allocation_id: 'alloc-003',
        allocated_at: '2025-01-07T12:02:00Z',
        last_heartbeat: new Date(Date.now() - 3000).toISOString(),
        status: 'Active',
        process_id: 1236,
        host: 'localhost'
      },
      'analytics-engine': {
        port: 8200,
        service_name: 'analytics-engine',
        service_type: 'analytics',
        allocation_id: 'alloc-004',
        allocated_at: '2025-01-07T12:03:00Z',
        last_heartbeat: new Date(Date.now() - 1000).toISOString(),
        status: 'Active',
        process_id: 1237,
        host: 'localhost'
      },
      'security-service': {
        port: 8300,
        service_name: 'security-service',
        service_type: 'security',
        allocation_id: 'alloc-005',
        allocated_at: '2025-01-07T12:04:00Z',
        last_heartbeat: new Date(Date.now() - 45000).toISOString(),
        status: 'Inactive',
        process_id: 1238,
        host: 'localhost'
      }
    };

    const port_usage: { [key: number]: string } = {};
    Object.values(allocations).forEach(alloc => {
      port_usage[alloc.port] = alloc.service_name;
    });

    const service_types: { [key: string]: string[] } = {};
    Object.values(allocations).forEach(alloc => {
      if (!service_types[alloc.service_type]) {
        service_types[alloc.service_type] = [];
      }
      service_types[alloc.service_type].push(alloc.service_name);
    });

    return {
      total_ports: Object.keys(allocations).length,
      active_services: Object.values(allocations).filter(a => a.status === 'Active').length,
      port_allocations: allocations,
      port_usage,
      service_types,
      registry_stats: {
        total_allocations: Object.keys(allocations).length,
        active_allocations: Object.values(allocations).filter(a => a.status === 'Active').length,
        reserved_allocations: Object.values(allocations).filter(a => a.status === 'Reserved').length,
        expired_allocations: Object.values(allocations).filter(a => a.status === 'Expired').length,
        service_types: Object.keys(service_types).reduce((acc, type) => {
          acc[type] = service_types[type].length;
          return acc;
        }, {} as { [key: string]: number })
      }
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/ports/overview');
      // const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 500));
      setOverview(generateMockData());
    } catch (error) {
      console.error('Failed to fetch port data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'rest-api': return Globe;
      case 'grpc': return Server;
      case 'websocket': return Network;
      case 'database': return Database;
      case 'cache': return Monitor;
      case 'analytics': return Activity;
      case 'security': return Shield;
      case 'frontend': return Eye;
      default: return Terminal;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Reserved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const filteredAllocations = overview ? Object.entries(overview.port_allocations)
    .filter(([name, allocation]) => {
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           allocation.port.toString().includes(searchTerm) ||
                           allocation.service_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || allocation.service_type === filterType;
      return matchesSearch && matchesFilter;
    }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-emerald-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-emerald-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-purple-200/20 dark:bg-purple-800/20 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-purple-200/20 dark:bg-purple-800/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-emerald-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-emerald-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Network className="h-10 w-10 text-purple-600" />
              Port Management Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time port allocation and service discovery
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Auto Refresh</span>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-8"
              >
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={fetchData} disabled={loading} className="h-8">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Total Ports</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{overview.total_ports}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Active Services</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{overview.active_services}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Service Types</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Object.keys(overview.service_types).length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Health Score</h3>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">95%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Controls */}
        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services, ports, or types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="rest-api">REST API</option>
                <option value="grpc">gRPC</option>
                <option value="websocket">WebSocket</option>
                <option value="database">Database</option>
                <option value="analytics">Analytics</option>
                <option value="security">Security</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* Port Allocations Table */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <Tabs defaultValue="allocations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="allocations">Port Allocations</TabsTrigger>
              <TabsTrigger value="usage">Resource Usage</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="allocations" className="space-y-4">
              <div className="p-6">
                <div className="grid gap-4">
                  {filteredAllocations.map(([name, allocation]) => {
                    const ServiceIcon = getServiceIcon(allocation.service_type);
                    const heartbeatAge = Math.floor((Date.now() - new Date(allocation.last_heartbeat).getTime()) / 1000);
                    
                    return (
                      <Card key={allocation.allocation_id} className="p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                              <ServiceIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{allocation.service_name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <span>Port {allocation.port}</span>
                                <span>•</span>
                                <span>{allocation.service_type}</span>
                                <span>•</span>
                                <span>{allocation.host}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge className={getStatusColor(allocation.status)}>
                                {allocation.status}
                              </Badge>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Heartbeat: {heartbeatAge}s ago
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Heart className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Square className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Resource Usage</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">CPU Usage</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Current</span>
                        <span className="text-gray-900 dark:text-white">34%</span>
                      </div>
                      <Progress value={34} className="h-2" />
                    </div>
                  </Card>
                  
                  <Card className="p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <Monitor className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Memory</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Used</span>
                        <span className="text-gray-900 dark:text-white">55%</span>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </Card>
                  
                  <Card className="p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <Network className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Network</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Throughput</span>
                        <span className="text-gray-900 dark:text-white">23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Port Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {overview && Object.entries(overview.registry_stats.service_types).map(([type, count]) => {
                    const ServiceIcon = getServiceIcon(type);
                    return (
                      <Card key={type} className="p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <ServiceIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{type}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{count} services</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default PortManagementDashboard;
