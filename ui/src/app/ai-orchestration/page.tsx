'use client';

import React from 'react';
import { Brain, Cpu, Settings, Play, FileText, HelpCircle } from 'lucide-react';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';
import RealAgentOrchestration from '@/components/orchestration/RealAgentOrchestration';

export default function AIOrchestrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Orchestration Engine - Phase 6.3</h1>
              <p className="text-slate-600 dark:text-slate-400">Real agent integration with production AWS SDK capabilities</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm border border-blue-200 dark:border-blue-700">
              Beta
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm border border-purple-200 dark:border-purple-700">
              Phase 6.3
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm border border-green-200 dark:border-green-700">
              AI-Aware
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/ai-orchestration/docs" className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Documentation</span>
          </a>
          <a href="/ai-orchestration/tutorial" className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <Play className="h-5 w-5 text-green-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Tutorial</span>
          </a>
          <a href="/ai-orchestration/faq" className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">FAQ</span>
          </a>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI Guide</span>
          </button>
        </div>

        {/* Phase 6.3 Real Agent Orchestration */}
        <RealAgentOrchestration />
      </div>
      
      {/* AI Assistant */}
      <AIAssistantButton currentFeature="AI Orchestration" />
    </div>
  );
}
