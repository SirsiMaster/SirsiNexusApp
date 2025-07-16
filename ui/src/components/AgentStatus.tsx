'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  RotateCw,
  Cpu,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAgentWebSocket, AgentSession, SubAgent } from '@/services/websocket';

interface AgentStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const AgentStatus: React.FC<AgentStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const webSocket = useAgentWebSocket();
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [activeSession, setActiveSession] = useState<AgentSession | null>(null);
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Monitor connection state
    const updateConnectionState = () => {
      setConnectionState(webSocket.getConnectionState());
    };

    // Set up connection monitoring
    const interval = setInterval(updateConnectionState, 1000);
    updateConnectionState();

    // Set up WebSocket event listeners
    const handleConnection = () => {
      setConnectionState('connected');
      setError(null);
    };

    const handleDisconnection = () => {
      setConnectionState('disconnected');
      setActiveSession(null);
      setAgents([]);
    };

    const handleError = (message: any) => {
      setError(message.content);
    };

    webSocket.on('connection', handleConnection);
    webSocket.on('disconnection', handleDisconnection);
    webSocket.on('error', handleError);

    return () => {
      clearInterval(interval);
      webSocket.off('connection', handleConnection);
      webSocket.off('disconnection', handleDisconnection);
      webSocket.off('error', handleError);
    };
  }, [webSocket]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await webSocket.connect();
      setConnectionState('connected');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!webSocket.isConnected()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const session = await webSocket.startAgentSession('demo-user', {
        environment: 'development',
        source: 'ui-component'
      });
      setActiveSession(session);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpawnAgent = async (agentType: SubAgent['agentType']) => {
    if (!activeSession) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const agent = await webSocket.spawnSubAgent(activeSession.sessionId, agentType);
      setAgents(prev => [...prev, agent]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to spawn agent');
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <RotateCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-50 dark:bg-green-900/200';
      case 'connecting': return 'bg-yellow-50 dark:bg-yellow-900/200';
      case 'error': return 'bg-red-50 dark:bg-red-900/200';
      default: return 'bg-gray-400';
    }
  };

  const getAgentStatusIcon = (status: SubAgent['state']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'busy':
        return <Activity className="h-3 w-3 text-blue-500 animate-pulse" />;
      case 'initializing':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'terminated':
        return <X className="h-3 w-3 text-gray-400" />;
      default:
        return <Bot className="h-3 w-3 text-gray-400" />;
    }
  };

  const getAgentTypeIcon = (agentType: SubAgent['agentType']) => {
    switch (agentType) {
      case 'aws':
      case 'azure':
      case 'gcp':
        return <Cpu className="h-3 w-3 text-blue-500" />;
      case 'security':
        return <CheckCircle className="h-3 w-3 text-red-500" />;
      case 'migration':
        return <RotateCw className="h-3 w-3 text-purple-500" />;
      default:
        return <Bot className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getConnectionIcon()}
        <span className="text-sm font-medium capitalize">{connectionState}</span>
        {agents.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {agents.length} agent{agents.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Agent System Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${getConnectionColor()}`}></div>
          <span className="text-sm font-medium capitalize">{connectionState}</span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3"
        >
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Connection Controls */}
      <div className="mb-4 space-y-2">
        {connectionState === 'disconnected' && (
          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Connect to Agent Backend
              </>
            )}
          </Button>
        )}

        {connectionState === 'connected' && !activeSession && (
          <Button 
            onClick={handleStartSession}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Starting Session...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Start Agent Session
              </>
            )}
          </Button>
        )}
      </div>

      {/* Session Info */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800 dark:text-green-300">Active Session</div>
              <div className="text-xs text-green-600">ID: {activeSession.sessionId.slice(0, 8)}...</div>
            </div>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
              {activeSession.state}
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Agent Spawning */}
      {activeSession && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">Spawn Agents</h4>
          <div className="grid grid-cols-2 gap-2">
            {(['aws', 'azure', 'migration', 'security'] as const).map(agentType => (
              <Button
                key={agentType}
                variant="outline"
                size="sm"
                onClick={() => handleSpawnAgent(agentType)}
                disabled={isLoading || agents.some(a => a.agentType === agentType)}
                className="text-xs"
              >
                {getAgentTypeIcon(agentType)}
                <span className="ml-1 capitalize">{agentType}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Active Agents */}
      {agents.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">Active Agents ({agents.length})</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {agents.map(agent => (
                <motion.div
                  key={agent.agentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-gray-900 p-2"
                >
                  <div className="flex items-center space-x-2">
                    {getAgentTypeIcon(agent.agentType)}
                    <span className="text-sm font-medium capitalize">{agent.agentType}</span>
                    <Badge variant="outline" className="text-xs">
                      {agent.state}
                    </Badge>
                  </div>
                  {getAgentStatusIcon(agent.state)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStatus;
