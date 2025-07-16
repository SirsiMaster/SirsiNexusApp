'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Brain,
  Settings,
  Activity,
  Server,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';

interface OrchestrationTask {
  task_id: string;
  status: string;
  agent_responses: AgentResponse[];
  session_id?: string;
}

interface AgentResponse {
  agent_id: string;
  agent_type: string;
  response: string;
  confidence: number;
  metadata: Record<string, string>;
}

interface OrchestrationHealth {
  status: string;
  version: string;
  agent_integration: string;
  aws_agent: string;
  azure_agent: string;
  gcp_agent: string;
}

export default function RealAgentOrchestration() {
  const [healthStatus, setHealthStatus] = useState<OrchestrationHealth | null>(null);
  const [currentTask, setCurrentTask] = useState<OrchestrationTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRequest, setUserRequest] = useState('');
  const [taskHistory, setTaskHistory] = useState<OrchestrationTask[]>([]);

  // Fetch orchestration health status
  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/orchestration/health');
      if (response.ok) {
        const health = await response.json();
        setHealthStatus(health);
      }
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    }
  };

  const createOrchestrationTask = async (request: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/orchestration/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: 'infrastructure_analysis',
          user_request: request,
          required_capabilities: ['aws_analysis', 'cost_optimization', 'resource_discovery'],
          priority: 75,
          context: {
            aws_region: 'us-east-1',
            analysis_type: 'comprehensive',
            user_context: 'Phase 6.3 real agent integration'
          }
        }),
      });

      if (response.ok) {
        const task = await response.json();
        toast({
          title: "✅ Orchestration Task Created",
          description: `Task ${task.task_id} submitted for processing`,
        });
        
        // Start polling for task status
        pollTaskStatus(task.task_id);
      } else {
        throw new Error('Failed to create orchestration task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: "❌ Task Creation Failed",
        description: "Unable to create orchestration task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const maxPolls = 30; // 30 seconds max
    let pollCount = 0;

    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8080/orchestration/tasks/${taskId}`);
        if (response.ok) {
          const task = await response.json();
          setCurrentTask(task);
          
          if (task.status === 'completed' || task.status === 'failed' || pollCount >= maxPolls) {
            setTaskHistory(prev => [task, ...prev.slice(0, 4)]); // Keep last 5 tasks
            if (task.status === 'completed') {
              toast({
                title: "🎉 Orchestration Complete",
                description: `Task completed with ${task.agent_responses?.length || 0} agent responses`,
              });
            }
            return;
          }
          
          // Continue polling
          pollCount++;
          setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error('Failed to poll task status:', error);
      }
    };

    poll();
  };

  const testAwsOrchestration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/orchestration/test/aws', {
        method: 'POST',
      });

      if (response.ok) {
        const task = await response.json();
        toast({
          title: "🧪 Test Orchestration Started",
          description: `AWS test task ${task.task_id} submitted`,
        });
        
        pollTaskStatus(task.task_id);
      } else {
        throw new Error('Failed to start test orchestration');
      }
    } catch (error) {
      console.error('Failed to test orchestration:', error);
      toast({
        title: "❌ Test Failed",
        description: "Unable to start test orchestration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'executing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentStatusIcon = (status: string) => {
    return status === 'connected' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Phase 6.3 Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Phase 6.3: Real Agent Integration</h2>
            <p className="text-purple-100">Production-ready agent orchestration with AWS SDK integration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Production Ready
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Real AWS APIs
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Orchestration Engine Health
          </CardTitle>
          <CardDescription>Real-time status of agent integration components</CardDescription>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Engine Status:</span>
                <Badge className={healthStatus.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {healthStatus.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getAgentStatusIcon(healthStatus.aws_agent)}
                <span className="text-sm">AWS Agent:</span>
                <Badge variant="outline">{healthStatus.aws_agent}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {getAgentStatusIcon(healthStatus.azure_agent)}
                <span className="text-sm">Azure Agent:</span>
                <Badge variant="outline">{healthStatus.azure_agent}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {getAgentStatusIcon(healthStatus.gcp_agent)}
                <span className="text-sm">GCP Agent:</span>
                <Badge variant="outline">{healthStatus.gcp_agent}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Version:</span>
                <Badge variant="outline">{healthStatus.version}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-500" />
                <span className="text-sm">Integration:</span>
                <Badge variant="outline">{healthStatus.agent_integration}</Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading health status...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orchestration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Create Orchestration Task
            </CardTitle>
            <CardDescription>Submit a custom infrastructure analysis request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your infrastructure analysis needs... (e.g., 'Analyze my AWS environment for cost optimization opportunities and security improvements')"
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => createOrchestrationTask(userRequest)}
                disabled={isLoading || !userRequest.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Orchestration
              </Button>
              <Button 
                variant="outline" 
                onClick={testAwsOrchestration}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Test AWS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Task Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Task Status
            </CardTitle>
            <CardDescription>Real-time orchestration progress</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTask ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Task ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{currentTask.task_id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(currentTask.status)}>
                    {currentTask.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Agent Responses:</span>
                  <span className="text-sm">{currentTask.agent_responses?.length || 0}</span>
                </div>
                {currentTask.status === 'executing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>In Progress</span>
                    </div>
                    <Progress value={60} className="w-full" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active orchestration task</p>
                <p className="text-sm">Start a new task to see real-time progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Responses */}
      {currentTask?.agent_responses && currentTask.agent_responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Responses</CardTitle>
            <CardDescription>Real responses from integrated cloud agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentTask.agent_responses.map((response, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {response.agent_type}
                      </Badge>
                      <span className="text-sm text-gray-500">ID: {response.agent_id}</span>
                    </div>
                    <Badge variant={response.confidence > 0.8 ? 'default' : 'secondary'}>
                      {Math.round(response.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm">{response.response}</p>
                  {Object.keys(response.metadata).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500">Metadata</summary>
                      <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(response.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      {taskHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orchestrations</CardTitle>
            <CardDescription>History of completed orchestration tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taskHistory.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{task.task_id}</code>
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {task.agent_responses?.length || 0} responses
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
