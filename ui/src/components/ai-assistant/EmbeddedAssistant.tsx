'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EmbeddedAssistantProps {
  context?: string;
  position?: 'sidebar' | 'form' | 'floating';
  showOnLogin?: boolean;
  compact?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const EmbeddedAssistant: React.FC<EmbeddedAssistantProps> = ({
  context = '',
  position = 'sidebar',
  showOnLogin = false,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const idCounterRef = useRef(0);
  
  // Generate stable IDs
  const generateId = (prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  };
  
  // Only show component after mount to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show assistant briefly on login
  useEffect(() => {
    if (showOnLogin && isMounted) {
      setIsExpanded(true);
      // Add welcome message with stable ID
      const welcomeId = generateId('welcome');
      setMessages([{
        id: welcomeId,
        text: 'Hi! I\'m your AI assistant. I can help you navigate SirsiNexus, understand migration processes, or answer questions about your infrastructure. What would you like to know?',
        sender: 'assistant',
        timestamp: new Date()
      }]);
      
      // Auto-collapse after 10 seconds if no interaction
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showOnLogin, isMounted]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageId = generateId('user');
    const userMessage: Message = {
      id: messageId,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantId = generateId('assistant');
      const assistantMessage: Message = {
        id: assistantId,
        text: getContextualResponse(userInput, context),
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getContextualResponse = (query: string, context: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('migration')) {
      return 'For migrations, I recommend starting with our 7-step process: PLAN → SPEC → BUILD → TRANSFER → VALIDATE → OPTIMIZE → SUPPORT. Would you like me to guide you through any specific step?';
    }
    
    if (lowerQuery.includes('project')) {
      return 'You can create a new project from the Quick Actions section. I can help you set up the project configuration, choose the right migration path, or configure resources. What type of project are you planning?';
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('how')) {
      return 'I\'m here to help! You can ask me about migration strategies, platform features, troubleshooting, or best practices. Try asking something like "How do I optimize my cloud costs?" or "What\'s the best migration approach for my database?"';
    }
    
    return 'I understand you\'re asking about that. Based on your current context, I\'d suggest checking the relevant documentation section or exploring the wizard tools. Can you provide more specific details about what you\'re trying to accomplish?';
  };

  if (!isMounted) {
    return null;
  }
  
  if (position === 'sidebar' && compact) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:border-indigo-200 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-indigo-700">AI Assistant</span>
            </div>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-indigo-500" /> : <ChevronDown className="h-4 w-4 text-indigo-500" />}
          </div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="p-3 bg-white dark:bg-gray-800 border border-slate-200 rounded-lg shadow-sm">
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={`compact-message-${message.id}-${index}`}
                      className={`text-xs p-2 rounded ${
                        message.sender === 'user'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 ml-4'
                          : 'bg-slate-100 text-slate-700 mr-4'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="text-xs p-2 rounded bg-slate-100 text-slate-500 mr-4">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-indigo-300"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`${position === 'floating' ? 'fixed bottom-4 right-4 z-50' : ''}`}>
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white dark:bg-gray-800/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">AI Assistant</h3>
                    <p className="text-white/80 text-xs">Here to help with SirsiNexus</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
                <div
                  key={`floating-message-${message.id}-${index}`}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about SirsiNexus..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
