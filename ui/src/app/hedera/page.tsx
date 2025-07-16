'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';
import { 
  Network, 
  Database, 
  Vote, 
  Activity, 
  Users, 
  Brain, 
  Clock, 
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Zap,
  Globe,
  Settings,
  Eye,
  GitBranch,
  Lock,
  Coins
} from 'lucide-react';

interface KnowledgeNode {
  id: string;
  resource_id: string;
  source_agent: string;
  knowledge_type: string;
  confidence: number;
  timestamp: string;
  tags: string[];
}

interface ConsensusDecision {
  decision_id: string;
  decision_topic: string;
  consensus_reached: boolean;
  decision_outcome: string;
  support_percentage: number;
  participating_agents: string[];
  total_votes: number;
  timestamp: string;
}

interface ServiceAction {
  action_id: string;
  action_type: string;
  agent_id: string;
  target_resource: string;
  timestamp: string;
  success: boolean;
}

export default function HederaDashboard() {
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([]);
  const [consensusDecisions, setConsensusDecisions] = useState<ConsensusDecision[]>([]);
  const [serviceActions, setServiceActions] = useState<ServiceAction[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 156,
    activeAgents: 24,
    consensusReached: 89,
    knowledgeShared: 1247,
    uptime: 99.8
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from the backend
    const loadHederaData = async () => {
      setLoading(true);
      
      // Mock data - in production, these would come from your backend API
      setTimeout(() => {
        setKnowledgeNodes([
          {
            id: 'kn_001',
            resource_id: 'aws_ec2_i-123456',
            source_agent: 'aws_agent_alpha',
            knowledge_type: 'cost_optimization',
            confidence: 0.92,
            timestamp: '2025-01-12T01:30:00Z',
            tags: ['production', 'high-cpu']
          },
          {
            id: 'kn_002',
            resource_id: 'azure_vm_vm-789012',
            source_agent: 'azure_agent_beta',
            knowledge_type: 'security_recommendation',
            confidence: 0.88,
            timestamp: '2025-01-12T01:25:00Z',
            tags: ['security', 'compliance']
          },
          {
            id: 'kn_003',
            resource_id: 'gcp_compute_inst-345678',
            source_agent: 'gcp_agent_gamma',
            knowledge_type: 'performance_insight',
            confidence: 0.95,
            timestamp: '2025-01-12T01:20:00Z',
            tags: ['performance', 'scaling']
          }
        ]);

        setConsensusDecisions([
          {
            decision_id: 'dec_001',
            decision_topic: 'Multi-cloud load balancing strategy',
            consensus_reached: true,
            decision_outcome: 'Implement geo-distributed load balancing',
            support_percentage: 87.5,
            participating_agents: ['aws_agent', 'azure_agent', 'gcp_agent', 'security_agent'],
            total_votes: 8,
            timestamp: '2025-01-12T01:15:00Z'
          },
          {
            decision_id: 'dec_002',
            decision_topic: 'Database migration priority',
            consensus_reached: true,
            decision_outcome: 'Prioritize PostgreSQL clusters first',
            support_percentage: 92.3,
            participating_agents: ['migration_agent', 'db_agent', 'security_agent'],
            total_votes: 6,
            timestamp: '2025-01-12T01:10:00Z'
          }
        ]);

        setServiceActions([
          {
            action_id: 'act_001',
            action_type: 'agent_spawn',
            agent_id: 'cost_optimizer_001',
            target_resource: 'aws_region_us_west_2',
            timestamp: '2025-01-12T01:35:00Z',
            success: true
          },
          {
            action_id: 'act_002',
            action_type: 'knowledge_update',
            agent_id: 'azure_agent_beta',
            target_resource: 'azure_resource_group_prod',
            timestamp: '2025-01-12T01:32:00Z',
            success: true
          },
          {
            action_id: 'act_003',
            action_type: 'consensus_decision',
            agent_id: 'consensus_coordinator',
            target_resource: 'infrastructure_decision_001',
            timestamp: '2025-01-12T01:28:00Z',
            success: true
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadHederaData();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'agent_spawn': return <Users className="h-4 w-4" />;
      case 'knowledge_update': return <Brain className="h-4 w-4" />;
      case 'consensus_decision': return <Vote className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading Hedera DLT data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Network className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Hedera DLT Intelligence Hub
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Distributed knowledge management and agent consensus network
              </p>
            </div>
          </div>
          
          {/* Network Status */}
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Network Active</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Uptime: {networkStats.uptime}% | Active Nodes: {networkStats.totalNodes}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Knowledge Nodes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {networkStats.knowledgeShared.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Agents</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {networkStats.activeAgents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Vote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Consensus Reached</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {networkStats.consensusReached}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Network Nodes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {networkStats.totalNodes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Network Health</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {networkStats.uptime}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="knowledge" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Knowledge Graph
            </TabsTrigger>
            <TabsTrigger value="consensus" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Consensus Decisions
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Service Actions
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Status
            </TabsTrigger>
          </TabsList>

          {/* Knowledge Graph Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Distributed Knowledge Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeNodes.map((node) => (
                    <div key={node.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {node.resource_id}
                            </h3>
                            <Badge variant="outline">{node.knowledge_type}</Badge>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(node.confidence)}`}>
                              {Math.round(node.confidence * 100)}% confidence
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>Source: {node.source_agent}</span>
                            <span>•</span>
                            <span>{new Date(node.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {node.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consensus Decisions Tab */}
          <TabsContent value="consensus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Agent Consensus Decisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consensusDecisions.map((decision) => (
                    <div key={decision.decision_id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {decision.decision_topic}
                            </h3>
                            {decision.consensus_reached ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Consensus Reached
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                No Consensus
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {decision.decision_outcome}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>Support: {decision.support_percentage}%</span>
                            <span>•</span>
                            <span>Votes: {decision.total_votes}</span>
                            <span>•</span>
                            <span>{new Date(decision.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Progress value={decision.support_percentage} className="w-24 mb-1" />
                          <p className="text-xs text-slate-500">{decision.support_percentage}%</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {decision.participating_agents.map((agent) => (
                          <Badge key={agent} variant="outline" className="text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Service Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceActions.map((action) => (
                    <div key={action.action_id} className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        {getActionTypeIcon(action.action_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {action.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {action.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Agent: {action.agent_id} → {action.target_resource}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Status Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Network Topology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Hedera Testnet</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Topic ID: 0.0.12345 | Network: testnet.hedera.com
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {networkStats.totalNodes}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Total Nodes</div>
                      </div>
                      <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {networkStats.activeAgents}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Active Agents</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Consensus Threshold</span>
                      <Badge variant="outline">67%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Knowledge Sync Interval</span>
                      <Badge variant="outline">30s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Agent Timeout</span>
                      <Badge variant="outline">300s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Network Encryption</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Lock className="h-3 w-3 mr-1" />
                        TLS 1.3
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-auto p-4 flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">Query Knowledge</span>
                </div>
                <span className="text-xs text-left opacity-75">
                  Search distributed knowledge graph
                </span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="h-4 w-4" />
                  <span className="font-medium">Request Consensus</span>
                </div>
                <span className="text-xs text-left opacity-75">
                  Submit decision for agent voting
                </span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="font-medium">Sync Network</span>
                </div>
                <span className="text-xs text-left opacity-75">
                  Synchronize with Hedera network
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <AIAssistantButton />
      </div>
    </div>
  );
}
