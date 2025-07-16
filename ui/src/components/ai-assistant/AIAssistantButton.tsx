'use client';

import React, { useState } from 'react';
import { Brain, HelpCircle } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface AIAssistantButtonProps {
  currentFeature?: string;
  context?: any;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function AIAssistantButton({ 
  currentFeature, 
  context, 
  position = 'bottom-right' 
}: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4', 
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };

  return (
    <>
      {/* Floating AI Button */}
      <div className={`fixed ${positionClasses[position]} z-40`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <Brain className="h-6 w-6" />
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-60 animate-ping"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant
            {currentFeature && (
              <div className="text-purple-300">Help with {currentFeature}</div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
          
          {/* Feature Indicator */}
          {currentFeature && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-50 dark:bg-green-900/200 rounded-full flex items-center justify-center">
              <HelpCircle className="h-2 w-2 text-white" />
            </div>
          )}
        </button>
        
        {/* Quick Help Hint */}
        {!isOpen && (
          <div className="absolute -top-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none max-w-xs">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Need help?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              I have complete knowledge of all platform features and can provide instant assistance.
            </p>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentFeature={currentFeature}
        context={context}
      />
    </>
  );
}
