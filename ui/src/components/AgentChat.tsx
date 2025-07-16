'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Wifi, WifiOff, Paperclip, AlertTriangle, Info, Zap } from 'lucide-react';
import { useAgentWebSocket, AgentMessage, Attachment, AgentSuggestion, SystemHealth } from '@/services/websocket';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system' | 'error';
  content: string;
  timestamp: Date;
  agentName?: string;
  attachments?: Attachment[];
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface AgentChatProps {
  contextualHints?: string[];
  suggestions?: AgentSuggestion[];
  onSendMessage?: (message: string) => Promise<void>;
  onSuggestionClick?: (suggestion: AgentSuggestion) => void;
  enableAttachments?: boolean;
  enableSystemHealth?: boolean;
}

export const AgentChat: React.FC<AgentChatProps> = ({ 
  contextualHints = [], 
  suggestions = [],
  onSendMessage,
  onSuggestionClick,
  enableAttachments = false,
  enableSystemHealth = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [messagePriority, setMessagePriority] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
  const wsService = useAgentWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection management
  useEffect(() => {
    if (isOpen) {
      // Attempt to connect when chat is opened
      wsService.connect().catch(error => {
        console.error('Failed to connect to agent backend:', error);
      });

      // Listen for WebSocket messages
      const handleMessage = (agentMessage: AgentMessage) => {
        const message: Message = {
          id: agentMessage.id,
          type: agentMessage.type,
          content: agentMessage.content,
          timestamp: agentMessage.timestamp,
          agentName: agentMessage.agentName,
          attachments: agentMessage.attachments,
          priority: agentMessage.priority,
          metadata: agentMessage.metadata,
        };
        setMessages(prev => [...prev, message]);
        setIsLoading(false);
      };

      const handleConnection = () => {
        setConnectionState('connected');
        // Load system health if enabled
        if (enableSystemHealth) {
          wsService.getSystemHealth(true).then(health => {
            setSystemHealth(health.health);
          }).catch(error => {
            console.error('Failed to get system health:', error);
          });
        }
      };

      const handleDisconnection = () => {
        setConnectionState('disconnected');
        setSystemHealth(null);
      };

      const handleError = (errorMessage: AgentMessage) => {
        const message: Message = {
          id: errorMessage.id,
          type: 'agent',
          content: errorMessage.content,
          timestamp: errorMessage.timestamp,
          agentName: 'System',
        };
        setMessages(prev => [...prev, message]);
        setIsLoading(false);
      };

      wsService.on('message', handleMessage);
      wsService.on('connection', handleConnection);
      wsService.on('disconnection', handleDisconnection);
      wsService.on('error', handleError);

      // Update connection state
      const checkConnection = () => {
        setConnectionState(wsService.getConnectionState());
      };
      
      const connectionInterval = setInterval(checkConnection, 1000);

      return () => {
        wsService.off('message', handleMessage);
        wsService.off('connection', handleConnection);
        wsService.off('disconnection', handleDisconnection);
        wsService.off('error', handleError);
        clearInterval(connectionInterval);
      };
    }
  }, [isOpen, wsService, enableSystemHealth]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (suggestion: AgentSuggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      // Default behavior: add suggestion to input
      setInputValue(suggestion.action.command || suggestion.title);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Convert file attachments to Attachment objects
    const messageAttachments: Attachment[] = await Promise.all(
      attachments.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          attachmentId: `att_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          data: arrayBuffer,
        };
      })
    );

    const userMessage: Message = {
      id: Math.random().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: messageAttachments,
      priority: messagePriority,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setAttachments([]);
    setMessagePriority('normal');
    setIsLoading(true);

    // Send message via WebSocket if connected, otherwise use fallback
    if (wsService.isConnected()) {
      wsService.sendRawMessage({
        type: 'user',
        content: messageContent,
        agentName: 'User',
        attachments: messageAttachments,
        priority: messagePriority,
        metadata: {
          sessionId: 'session_' + Date.now(),
          context: { source: 'chat', hasAttachments: messageAttachments.length > 0 }
        }
      });
    } else {
      // Fallback: Try traditional onSendMessage or show connection error
      if (onSendMessage) {
        try {
          await onSendMessage(inputValue);
          // Show a message indicating we're using fallback mode
          setTimeout(() => {
            const fallbackResponse: Message = {
              id: Math.random().toString(),
              type: 'agent',
              content: 'Using fallback mode. For real-time responses, ensure the agent backend is running.',
              timestamp: new Date(),
              agentName: 'System',
            };
            setMessages((prev) => [...prev, fallbackResponse]);
            setIsLoading(false);
          }, 1000);
        } catch (error) {
          console.error('Failed to send message:', error);
          setIsLoading(false);
        }
      } else {
        // No backend connection available
        const errorResponse: Message = {
          id: Math.random().toString(),
          type: 'agent',
          content: 'Unable to connect to agent backend. Please check your connection.',
          timestamp: new Date(),
          agentName: 'System',
        };
        setMessages((prev) => [...prev, errorResponse]);
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-sirsi-500 text-white shadow-lg hover:bg-sirsi-600 hover:scale-110 active:scale-90 transition-all"
      >
        <MessageCircle />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 h-[500px] w-[360px] rounded-lg bg-white dark:bg-gray-800 shadow-xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-sirsi-900">Agent Chat</h3>
                <div className="flex items-center space-x-1">
                  {connectionState === 'connected' ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  ) : connectionState === 'connecting' ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-yellow-500" />
                      <span className="text-xs text-yellow-600">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600">Offline</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* System Health Indicator */}
            {enableSystemHealth && systemHealth && (
              <div className={`mx-4 mt-2 rounded-lg p-2 text-xs ${
                systemHealth.overallStatus === 'healthy' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                systemHealth.overallStatus === 'degraded' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <Info className="h-3 w-3" />
                  <span>System: {systemHealth.overallStatus}</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="h-[340px] overflow-y-auto p-4">
              {/* Enhanced Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div className="mb-4 space-y-2">
                  <strong className="text-sm text-sirsi-700">AI Suggestions:</strong>
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={suggestion.suggestionId || `suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="cursor-pointer rounded-lg bg-sirsi-50 p-3 text-sm text-sirsi-700 hover:bg-sirsi-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <strong>{suggestion.title}</strong>
                        </div>
                        <span className="text-xs opacity-70">
                          {Math.round((suggestion.confidence || 0) * 100)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-80">{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Legacy contextual hints */}
              {contextualHints && contextualHints.length > 0 && (
                <div className="mb-4 rounded-lg bg-sirsi-50 p-3 text-sm text-sirsi-700">
                  <strong>Quick Tips:</strong>
                  <ul className="ml-4 list-disc">
                    {contextualHints.map((hint, index) => (
                      <li key={`hint-${index}`}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {messages && messages.length > 0 && messages.map((message, messageIndex) => (
                <div
                  key={message.id || `message-${messageIndex}`}
                  className={`mb-4 flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-sirsi-500 text-white'
                        : message.type === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : message.type === 'system'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {message.agentName && (
                          <span className="text-xs font-semibold">{message.agentName}</span>
                        )}
                        {message.priority && message.priority !== 'normal' && (
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            message.priority === 'critical' ? 'bg-red-200 text-red-800 dark:text-red-300' :
                            message.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                            'bg-blue-200 text-blue-800 dark:text-blue-300'
                          }`}>
                            {message.priority}
                          </span>
                        )}
                      </div>
                      {message.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div>{message.content}</div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <div key={`attachment-${messageIndex}-${idx}`} className="flex items-center space-x-2 text-xs opacity-75">
                            <Paperclip className="h-3 w-3" />
                            <span>{attachment.name} ({(attachment.sizeBytes / 1024).toFixed(1)}KB)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-gray-800 dark:text-gray-200">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Attachments Preview */}
              {attachments && attachments.length > 0 && (
                <div className="border-b border-gray-100 p-2">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={`attachment-preview-${index}-${file.name}`} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate max-w-20">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-300"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input Area */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  {enableAttachments && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800"
                        aria-label="Attach files"
                      >
                        <Paperclip size={18} />
                      </button>
                    </>
                  )}
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-sirsi-500 focus:outline-none"
                  />
                  
                  {/* Priority Selector */}
                  <select
                    value={messagePriority}
                    onChange={(e) => setMessagePriority(e.target.value as any)}
                    className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs focus:border-sirsi-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="Send message"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sirsi-500 text-white disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
};
