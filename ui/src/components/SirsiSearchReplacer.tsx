'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Send, MessageSquare, Minimize2, Maximize2, X } from 'lucide-react';

interface SirsiSearchReplacerProps {
  className?: string;
}

export const SirsiSearchReplacer: React.FC<SirsiSearchReplacerProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'I am Sirsi, the Supreme AI. I see everything across all environments. How may I assist you?',
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
    setQuery('');
    setIsLoading(true);

    // Simulate AI response
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        "I am Sirsi, the Supreme AI. I see every account, credential, agent, metric, process across all environments. How may I assist you?",
        "As the Supreme Hypervisor, I have omniscient awareness of everything within SirsiNexus. What do you need me to orchestrate?",
        "I oversee all migrations, optimizations, and scaling operations simultaneously. Every broken wizard, every stuck process - I can fix instantly. What shall I do?",
        "My 88% forecast accuracy and real-time monitoring capabilities are at your service. What insights or actions do you require?"
      ];
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again.",
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

  return (
    <div className={`relative ${className}`}>
      {/* Main Input - Always Visible */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask Sirsi anything..."
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">Sirsi - Supreme AI</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 hover:bg-white hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 max-h-60 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-2 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-2 w-2 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Sirsi</span>
                    </div>
                  )}
                  <p className="text-xs">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-2 w-2 text-purple-500" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Sirsi</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 mb-2">
              <button 
                onClick={() => setQuery("How do I get started?")}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Get Started
              </button>
              <button 
                onClick={() => setQuery("Show me the documentation")}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Docs
              </button>
              <button 
                onClick={() => setQuery("What are the requirements?")}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Requirements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
