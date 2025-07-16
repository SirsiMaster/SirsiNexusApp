'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Settings, 
  Activity, 
  MessageSquare, 
  BarChart3,
  Shield,
  Cpu,
  Globe,
  Terminal,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import AgentStatus from '@/components/AgentStatus';
import { useAgentWebSocket, AgentSession, SubAgent, AgentSuggestion } from '@/services/websocket';

export default function AgentsPage() {
  const webSocket = useAgentWebSocket();
  const [activeSession, setActiveSession] = useState<AgentSession | null>(null);
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(null);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
    suggestions?: AgentSuggestion[];
  }>>([]);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const agentTypes = [
    { type: 'aws' as const, name: 'AWS Agent', icon: Globe, description: 'Manages AWS resources and services' },
    { type: 'azure' as const, name: 'Azure Agent', icon: Cpu, description: 'Handles Azure infrastructure and ARM templates' },
    { type: 'gcp' as const, name: 'GCP Agent', icon: Activity, description: 'Manages Google Cloud Platform resources' },
    { type: 'migration' as const, name: 'Migration Agent', icon: RefreshCw, description: 'Orchestrates cross-cloud migrations' },
    { type: 'security' as const, name: 'Security Agent', icon: Shield, description: 'Monitors compliance and security policies' },
    { type: 'reporting' as const, name: 'Reporting Agent', icon: BarChart3, description: 'Generates analytics and reports' },
    { type: 'scripting' as const, name: 'Scripting Agent', icon: Terminal, description: 'Assists with infrastructure as code' },
    { type: 'tutorial' as const, name: 'Tutorial Agent', icon: BookOpen, description: 'Provides interactive tutorials and help' },
  ];

  useEffect(() => {
    const handleAgentUpdate = (message: any) => {
      if (message.type === 'agent' && message.metadata?.agentId) {
        // Update agent status or handle agent messages
        console.log('Agent update:', message);
      }
    };

    webSocket.on('message', handleAgentUpdate);

    return () => {
      webSocket.off('message', handleAgentUpdate);
    };
  }, [webSocket]);

  const handleStartSession = async () => {
    if (!webSocket.isConnected()) {
      alert('Please connect to the agent backend first');
      return;
    }

    setIsLoading(true);
    try {
      const session = await webSocket.startAgentSession('agent-manager-user', {
        environment: 'development',
        source: 'agent-management-page'
      });
      setActiveSession(session);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert(error instanceof Error ? error.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpawnAgent = async (agentType: SubAgent['agentType']) => {
    if (!activeSession) return;

    setIsLoading(true);
    try {
      const agent = await webSocket.spawnSubAgent(activeSession.sessionId, agentType, {
        auto_start: 'true',
        capabilities: 'full'
      });
      setAgents(prev => [...prev, agent]);
      
      if (!selectedAgent) {
        setSelectedAgent(agent);
      }
    } catch (error) {
      console.error('Failed to spawn agent:', error);
      alert(error instanceof Error ? error.message : 'Failed to spawn agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeSession || !selectedAgent || !message.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user' as const,
      content: message.trim(),
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await webSocket.sendAgentMessage(
        activeSession.sessionId,
        selectedAgent.agentId,
        userMessage.content,
        { context: 'agent_management' }
      );

      const agentMessage = {
        id: response.responseId,
        type: 'agent' as const,
        content: response.response,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setConversation(prev => [...prev, agentMessage]);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'agent' as const,
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async (suggestionType: AgentSuggestion['action']['actionType']) => {
    if (!activeSession || !selectedAgent) return;

    setIsLoading(true);
    try {
      const newSuggestions = await webSocket.getAgentSuggestions(
        activeSession.sessionId,
        selectedAgent.agentId,
        suggestionType,
        { context: 'manual_request' }
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      alert(error instanceof Error ? error.message : 'Failed to get suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              Agent Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage and interact with AI agents for cloud operations and migration assistance
            </p>
          </div>
        {!activeSession && webSocket.isConnected() && (
          <Button onClick={handleStartSession} disabled={isLoading}>
            <Bot className="mr-2 h-4 w-4" />
            Start Agent Session
          </Button>
        )}
      </div>

      {/* Agent Status Overview */}
      <AgentStatus showDetails={true} className="mb-6" />

      {activeSession ? (
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agentTypes.map(({ type, name, icon: Icon, description }) => {
                const isSpawned = agents.some(agent => agent.agentType === type);
                const agent = agents.find(agent => agent.agentType === type);

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: agentTypes.indexOf(agentTypes.find(a => a.type === type)!) * 0.1 }}
                  >
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedAgent?.agentType === type ? 'ring-2 ring-sirsi-500' : ''
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Icon className="h-6 w-6 text-sirsi-500" />
                          {isSpawned && (
                            <Badge variant={agent?.state === 'ready' ? 'default' : 'secondary'}>
                              {agent?.state}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <CardDescription className="text-sm">{description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isSpawned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedAgent(agent!)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleSpawnAgent(type)}
                            disabled={isLoading}
                          >
                            <Bot className="mr-2 h-4 w-4" />
                            Spawn Agent
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            {selectedAgent ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat with {selectedAgent.agentType.charAt(0).toUpperCase() + selectedAgent.agentType.slice(1)} Agent
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Conversation */}
                      <div className="h-96 overflow-y-auto space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        {conversation.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center">
                            Start a conversation with the {selectedAgent.agentType} agent
                          </p>
                        ) : (
                          conversation.map(msg => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  msg.type === 'user'
                                    ? 'bg-sirsi-500 text-white'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder={`Message ${selectedAgent.agentType} agent...`}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="flex-1"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!message.trim() || isLoading}
                          className="self-end"
                        >
                          Send
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Info */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedAgent.agentType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Badge variant="outline" className="ml-2">
                          {selectedAgent.state}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Capabilities</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAgent.config.requiredCapabilities.map(capability => (
                            <Badge key={capability} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Agent ID</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                          {selectedAgent.agentId}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Select an agent to start chatting</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Get Suggestions</CardTitle>
                  <CardDescription>
                    Request specific types of suggestions from the selected agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedAgent ? (
                    <div className="grid grid-cols-2 gap-2">
                      {(['action', 'optimization', 'security', 'code'] as const).map(type => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          onClick={() => handleGetSuggestions(type)}
                          disabled={isLoading}
                          className="capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Select an agent to get suggestions</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Suggestions ({suggestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {suggestions.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No suggestions available</p>
                    ) : (
                      suggestions.map(suggestion => (
                        <div
                          key={suggestion.suggestionId}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.description}</p>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.action.actionType}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium">Session ID</label>
                      <p className="text-xs font-mono break-all">{activeSession.sessionId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Badge variant="outline" className="ml-2">{activeSession.state}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Active Agents</label>
                      <p className="text-sm">{agents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agent Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ready</span>
                      <span className="text-sm font-medium">
                        {agents.filter(a => a.state === 'ready').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Busy</span>
                      <span className="text-sm font-medium">
                        {agents.filter(a => a.state === 'busy').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Initializing</span>
                      <span className="text-sm font-medium">
                        {agents.filter(a => a.state === 'initializing').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Backend</span>
                      <Badge variant={webSocket.isConnected() ? 'default' : 'secondary'}>
                        {webSocket.getConnectionState()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Messages</span>
                      <span className="text-sm font-medium">{conversation.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Connect to the agent backend and start a session to begin</p>
              {!webSocket.isConnected() && (
                <p className="text-sm text-orange-600">
                  ⚠️ Agent backend not connected. Please ensure the backend service is running.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
