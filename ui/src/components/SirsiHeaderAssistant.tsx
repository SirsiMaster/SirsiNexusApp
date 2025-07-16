'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, MessageSquare, X, Settings } from 'lucide-react';

interface SirsiHeaderAssistantProps {
  className?: string;
}

export const SirsiHeaderAssistant: React.FC<SirsiHeaderAssistantProps> = ({ className = '' }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pulseEnabled, setPulseEnabled] = useState(true);
  const [messages, setMessages] = useState<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'I am Sirsi, the Supreme AI and Supreme Hypervisor of SirsiNexus. I have omniscient awareness of every agent, metric, process, account, credential, migration, optimization, and scaling operation across all environments simultaneously. What can I help you accomplish?',
      timestamp: new Date()
    }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    try {
      // Call the real Sirsi API
      const response = await fetch('/api/sirsi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentQuery,
          session_id: `header_${Date.now()}`,
          user_id: 'web_user',
          context: {
            source: 'header_assistant',
            timestamp: new Date().toISOString(),
            url: window.location.pathname
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle special navigation commands
      if (currentQuery.toLowerCase().includes('port') && currentQuery.toLowerCase().includes('dashboard')) {
        setTimeout(() => router.push('/ports'), 1500);
      }
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: data.content || "I am here to assist you with SirsiNexus operations.",
        timestamp: new Date(),
        suggestions: data.suggestions || []
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Sirsi API error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: "I am Sirsi, the Supreme AI. While experiencing a temporary connection issue, I remain operational. Please try your request again, and I will assist you with all SirsiNexus operations.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  // Handle click outside to close expanded view
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && inputRef.current && !inputRef.current.closest('.sirsi-container')?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  return (
    <div className={`sirsi-container relative ${className}`}>
      {/* Main Input - Elegant with subtle pulse */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Sparkles className={`h-4 w-4 text-purple-500 ${pulseEnabled ? 'animate-pulse' : ''}`} style={{
            animationDuration: '3s',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
          }} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsExpanded(true)}
          placeholder="Ask Sirsi anything..."
          className={`block w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
            pulseEnabled ? 'shadow-sm hover:shadow-md focus:shadow-lg' : ''
          } ${
            pulseEnabled ? 'ring-1 ring-purple-100 dark:ring-purple-900' : ''
          }`}
          style={{
            boxShadow: pulseEnabled ? '0 0 0 1px rgba(147, 51, 234, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)' : undefined
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={() => setPulseEnabled(!pulseEnabled)}
            className="px-2 py-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-md mr-1 transition-colors"
            title={pulseEnabled ? 'Disable visual effects' : 'Enable visual effects'}
          >
            <Settings className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mr-1 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-1"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${pulseEnabled ? 'animate-pulse' : ''}`} style={{
                animationDuration: '2s'
              }} />
              <span className="font-semibold text-sm">Sirsi - Supreme AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPulseEnabled(!pulseEnabled)}
                className="w-6 h-6 hover:bg-white hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
                title={pulseEnabled ? 'Disable visual effects' : 'Enable visual effects'}
              >
                <Settings className="h-3 w-3" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 hover:bg-white hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 max-h-60 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-3 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className={`h-2 w-2 text-purple-500 ${pulseEnabled ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Sirsi</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className={`h-2 w-2 text-purple-500 ${pulseEnabled ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Sirsi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setQuery("Show me all active ports and services")}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Port Overview
              </button>
              <button 
                onClick={() => setQuery("What service is using port 8080?")}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Find Service
              </button>
              <button 
                onClick={() => setQuery("Show system health and resources")}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                System Health
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setQuery("How do I get started?")}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Get Started
              </button>
              <button 
                onClick={() => setQuery("Show me the documentation")}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Documentation
              </button>
              <button 
                onClick={() => {
                  setQuery("Open port management dashboard");
                  setTimeout(() => router.push('/ports'), 500);
                }}
                className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 rounded transition-colors"
              >
                Port Dashboard
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>Cmd+Enter to send</span>
              <span>•</span>
              <span>Click outside to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
