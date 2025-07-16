'use client';

import React, { useState, useEffect } from 'react';
import { AgentChat } from '../AgentChat';
import { useAgentWebSocket, AgentSuggestion, SystemHealth } from '@/services/websocket';

export const EnhancedAgentChatExample: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const wsService = useAgentWebSocket();

  // Initialize session and agent when component mounts
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Connect to WebSocket
        await wsService.connect();

        // Create a new session
        const session = await wsService.createSession('demo-user@example.com', {
          environment: 'demo',
          platform: 'web'
        });
        setSessionId(session.sessionId);

        // Create an AWS agent
        const agentResult = await wsService.createAgent(
          session.sessionId,
          'aws',
          {
            parameters: { region: 'us-east-1' },
            timeoutSeconds: 60,
            enableCaching: true,
            requiredCapabilities: ['discovery', 'cost-analysis', 'security-review']
          }
        );
        setAgentId(agentResult.agent.agentId);

        // Get initial suggestions
        const suggestionsResult = await wsService.getSuggestions(
          session.sessionId,
          agentResult.agent.agentId,
          {
            contextType: 'initial',
            contextData: { userType: 'demo', platform: 'web' }
          }
        );
        setSuggestions(suggestionsResult.suggestions);

      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initializeSession();

    // Cleanup on unmount
    return () => {
      if (sessionId) {
        wsService.deleteSession(sessionId).catch(console.error);
      }
    };
  }, [sessionId, wsService]);

  const handleSuggestionClick = async (suggestion: AgentSuggestion) => {
    if (!sessionId || !agentId) return;

    try {
      // Execute the suggestion's action
      console.log('Executing suggestion:', suggestion);
      
      // Send the suggestion's command as a message
      const result = await wsService.sendMessage(
        sessionId,
        agentId,
        {
          content: suggestion.action.command,
          type: 'command',
          metadata: {
            suggestionId: suggestion.suggestionId,
            actionType: suggestion.action.actionType
          }
        },
        {
          priority: 'high',
          context: {
            source: 'suggestion',
            confidence: suggestion.confidence.toString()
          }
        }
      );

      // Update suggestions based on the response
      if (result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      }

    } catch (error) {
      console.error('Failed to execute suggestion:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId || !agentId) {
      throw new Error('Session not initialized');
    }

    try {
      const result = await wsService.sendMessage(
        sessionId,
        agentId,
        { content: message, type: 'text' },
        { priority: 'normal' }
      );

      // Update suggestions based on the response
      if (result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Sample contextual hints for fallback
  const contextualHints = [
    'Try "discover my AWS resources"',
    'Ask "what can I optimize for cost savings?"',
    'Request "perform a security review"',
    'Say "show me migration options"',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Enhanced Agent Chat Demo
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Feature Cards */}
            <div className="bg-sirsi-50 rounded-lg p-4">
              <h3 className="font-semibold text-sirsi-900 mb-2">🤖 AI Suggestions</h3>
              <p className="text-sm text-sirsi-700">
                Smart recommendations with confidence scores and executable actions
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📎 File Attachments</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Upload files to enhance your agent conversations
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">⚡ System Health</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Real-time monitoring of backend system status
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold mb-2">Current Session Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Session ID:</span>{' '}
                <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                  {sessionId || 'Initializing...'}
                </code>
              </div>
              <div>
                <span className="font-medium">Agent ID:</span>{' '}
                <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                  {agentId || 'Creating agent...'}
                </code>
              </div>
              <div>
                <span className="font-medium">Available Suggestions:</span>{' '}
                <span className="bg-sirsi-100 text-sirsi-800 px-2 py-1 rounded-full text-xs">
                  {suggestions.length}
                </span>
              </div>
              <div>
                <span className="font-medium">Connection:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  wsService.isConnected() 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {wsService.getConnectionState()}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test Enhanced Features:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• <strong>Suggestions:</strong> Click on any AI suggestion to auto-execute</li>
              <li>• <strong>Attachments:</strong> Use the paperclip icon to upload files</li>
              <li>• <strong>Priority:</strong> Select message priority (Low/Normal/High/Critical)</li>
              <li>• <strong>System Health:</strong> Monitor real-time backend status</li>
              <li>• <strong>Enhanced Messages:</strong> View message metadata and attachments</li>
            </ul>
          </div>
        </div>

        {/* Enhanced Agent Chat with all features enabled */}
        <AgentChat
          suggestions={suggestions}
          contextualHints={contextualHints}
          onSendMessage={handleSendMessage}
          onSuggestionClick={handleSuggestionClick}
          enableAttachments={true}
          enableSystemHealth={true}
        />
      </div>
    </div>
  );
};

export default EnhancedAgentChatExample;
