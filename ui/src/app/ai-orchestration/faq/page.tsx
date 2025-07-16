'use client';

import React, { useState } from 'react';
import { Brain, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is the AI Orchestration Engine?",
    answer: "The AI Orchestration Engine is an intelligent system that automates complex workflows and infrastructure management tasks using advanced decision-making algorithms. It coordinates multiple AI agents to optimize performance, reduce costs, and ensure reliable operations."
  },
  {
    category: "Getting Started", 
    question: "How do I enable AI Orchestration for my infrastructure?",
    answer: "Enable AI Orchestration by setting AI_ORCHESTRATION_ENABLED=true in your environment configuration. Ensure you have the minimum system requirements (8 cores, 16GB RAM) and that the core engine and ML platform are running."
  },
  {
    category: "Features",
    question: "What types of decisions can the AI make autonomously?",
    answer: "The AI can make decisions about resource allocation, scaling operations, cost optimization, workflow prioritization, and performance tuning. It uses multi-criteria decision making (MCDM) with fuzzy logic to evaluate complex scenarios."
  },
  {
    category: "Features",
    question: "How accurate is the AI decision-making?",
    answer: "Our AI achieves 88% accuracy in decision-making, with continuous learning improving performance over time. The system learns from each decision outcome to refine future recommendations."
  },
  {
    category: "Configuration",
    question: "Can I customize the decision-making criteria?",
    answer: "Yes, you can configure decision weights, optimization levels, and learning rates through environment variables. The system supports different modes including conservative, balanced, and aggressive optimization."
  },
  {
    category: "Configuration",
    question: "How do I integrate with existing monitoring systems?",
    answer: "The AI Orchestration Engine exposes Prometheus metrics and supports OpenTelemetry tracing. Connect your monitoring stack to the /metrics endpoint and configure alerts based on orchestration performance."
  },
  {
    category: "Troubleshooting",
    question: "Why is my orchestration workflow failing?",
    answer: "Common causes include insufficient resources, missing dependencies, or authentication issues. Check the system status dashboard, verify resource requirements are met, and ensure all required services are running."
  },
  {
    category: "Troubleshooting",
    question: "How do I debug AI decision-making issues?",
    answer: "Enable detailed logging with DEBUG=true and review the decision engine logs. The system provides decision traces showing the criteria evaluated and weights applied for each decision."
  },
  {
    category: "Performance",
    question: "What are the performance requirements?",
    answer: "Minimum: 8 cores, 16GB RAM, 200GB storage. Recommended: 16 cores, 32GB RAM, 1TB storage. Performance scales linearly with available resources, especially for concurrent workflow processing."
  },
  {
    category: "Performance",
    question: "How can I optimize orchestration performance?",
    answer: "Enable caching, tune the learning rate, adjust max concurrent workflows, and ensure adequate network bandwidth. Monitor CPU and memory usage to identify bottlenecks."
  }
];

export default function AIOrchestrationFAQPage() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-gray-900 dark:to-gray-800 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/ai-orchestration" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to AI Orchestration
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/200 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">AI Orchestration FAQ</h1>
              <p className="text-gray-600 dark:text-gray-400">Frequently Asked Questions & Troubleshooting</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/ai-orchestration/docs" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800">
              <span className="font-medium">Documentation</span>
            </a>
            <a href="/ai-orchestration/tutorial" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-800">
              <span className="font-medium">Tutorial</span>
            </a>
            <a href="/ai-orchestration/faq" className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <span className="font-medium text-blue-900">FAQ</span>
            </a>
            <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-50 dark:from-gray-900 dark:to-gray-8000 text-white p-3 rounded-lg">
              <Brain className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </button>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">FAQ Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{category}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {faqData
                  .filter(item => item.category === category)
                  .map((item, index) => {
                    const globalIndex = faqData.indexOf(item);
                    const isExpanded = expandedItems.has(globalIndex);
                    
                    return (
                      <div key={globalIndex} className="p-6">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 pr-4">{item.question}</h4>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 dark:from-gray-900 dark:to-gray-8000 to-indigo-600 rounded-xl shadow-lg text-white p-6">
          <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
          <p className="mb-4">
            Can't find the answer you're looking for? Our AI-powered support is available 24/7.
          </p>
          <div className="flex gap-4">
            <button className="bg-white dark:bg-gray-800 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
              Contact Support
            </button>
            <button className="bg-white dark:bg-gray-800 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
