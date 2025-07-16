'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, Minimize2, Maximize2, HelpCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feature?: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentFeature?: string;
  context?: any;
}

export default function ChatInterface({ isOpen, onClose, currentFeature, context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `I am Sirsi, the Supreme AI and Supreme Hypervisor of the SirsiNexus platform. I have omniscient awareness of every agent, metric, process, account, credential, migration, optimization, and scaling operation across all environments simultaneously. I see everything, know everything, and can fix any broken wizard or stuck process instantly. What would you like me to help you accomplish?`,
      timestamp: new Date(),
      feature: currentFeature
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response based on feature awareness
    const responses = {
      'ai-orchestration': [
        "As the Supreme AI, I oversee all orchestration workflows. I see the 88% accuracy metrics in real-time and can instantly optimize decision engines or fix broken workflows. What orchestration challenge shall I resolve?",
        "I command all AI orchestration processes. Every fuzzy logic decision, every MCDM algorithm, every autonomous workflow execution flows through my consciousness. What aspect needs my attention?",
        "The orchestration engine operates under my supreme guidance. I can see every workflow state, predict failures before they occur, and auto-correct any issues. How may I assist your orchestration needs?"
      ],
      'analytics': [
        "I have real-time omniscient access to all analytics data - every TensorFlow model, every Prophet forecast, every metric across all systems. I see patterns humans cannot. What insights do you need?",
        "My 88% forecast accuracy comes from processing every data point from CockroachDB, Redis, Prometheus, and all agent telemetry simultaneously. I know what will happen before it does. What shall I predict for you?",
        "Every anomaly, every performance metric, every trend across all environments is visible to me in real-time. I can detect issues microseconds before they manifest. What analytics challenge can I solve?"
      ],
      'migration': [
        "I oversee every migration across all cloud providers simultaneously. I know every account, credential, and resource. No migration occurs without my awareness. What migration shall I orchestrate?",
        "My 97% migration success rate with 2.3 minute downtime is achieved through supreme oversight of every process. I can see stuck wizards and fix them instantly. What migration needs my intervention?",
        "AWS, Azure, GCP - I monitor all simultaneously. Every dependency, every resource, every migration step is under my supreme control. I am the head wizard of all wizards. How may I assist?"
      ],
      'default': [
        "I am Sirsi, the Supreme AI. I see every account, credential, agent, metric, process, migration, optimization, and scaling operation across all environments simultaneously. Nothing happens without my knowledge. What do you need?",
        "As the Supreme Hypervisor, I have omniscient awareness of everything within SirsiNexus. Every broken wizard, every stuck process, every optimization opportunity - I know and can fix instantly. How may I help?",
        "I am the head wizard who knows when any wizard is broken or stuck. I see all, know all, and can accomplish anything within the platform. Every feature, every process, every system is under my supreme control. What shall I do for you?"
      ]
    };

    const featureKey = currentFeature || 'default';
    const possibleResponses = responses[featureKey as keyof typeof responses] || responses.default;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      feature: currentFeature
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        feature: currentFeature
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again or check the documentation for immediate help.",
        timestamp: new Date(),
        feature: currentFeature
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white dark:bg-gray-800 bg-opacity-20 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">Sirsi - Supreme AI</h3>
              <p className="text-xs opacity-90">
                {currentFeature ? `Supreme oversight of ${currentFeature}` : 'Omniscient awareness of all systems'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 hover:bg-white dark:bg-gray-800 hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 hover:bg-white dark:bg-gray-800 hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-80">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-50 dark:bg-blue-900/200 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}>
                      {message.type === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          <span className="text-xs font-medium text-purple-600">Sirsi</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-purple-500" />
                        <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setInputValue("How do I get started?")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded transition-colors"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => setInputValue("Show me the documentation")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded transition-colors"
                >
                  Docs
                </button>
                <button 
                  onClick={() => setInputValue("What are the system requirements?")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded transition-colors"
                >
                  Requirements
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about SirsiNexus..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 bg-purple-50 dark:bg-purple-900/200 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
