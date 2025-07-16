'use client';

import React, { useState } from 'react';
import { BarChart, ArrowLeft, Brain, TrendingUp, AlertTriangle, Zap, ChevronRight, Lightbulb, Target } from 'lucide-react';

interface AITip {
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  implementation: string;
  impact: 'High' | 'Medium' | 'Low';
}

export default function AnalyticsAIGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const aiTips: AITip[] = [
    {
      category: 'forecasting',
      title: 'Smart Model Selection',
      description: 'Let AI automatically choose the best forecasting model based on your data patterns and characteristics.',
      icon: TrendingUp,
      implementation: 'Enable auto-model selection in forecast configuration. The system analyzes seasonality, trend, and noise patterns to recommend Prophet, ARIMA, or Gaussian Process models.',
      impact: 'High'
    },
    {
      category: 'anomaly',
      title: 'Dynamic Threshold Adjustment',
      description: 'AI continuously learns from your data to automatically adjust anomaly detection thresholds, reducing false positives.',
      icon: AlertTriangle,
      implementation: 'Configure adaptive thresholds with machine learning. The system learns normal behavior patterns and adjusts sensitivity based on historical performance.',
      impact: 'High'
    },
    {
      category: 'optimization',
      title: 'Resource Usage Optimization',
      description: 'Get AI-powered recommendations for optimizing resource allocation based on predicted demand patterns.',
      icon: Zap,
      implementation: 'Enable resource optimization recommendations. AI analyzes usage patterns, cost trends, and performance metrics to suggest optimal scaling strategies.',
      impact: 'High'
    },
    {
      category: 'insights',
      title: 'Intelligent Alert Correlation',
      description: 'AI correlates multiple metrics and alerts to identify root causes and prevent alert fatigue.',
      icon: Brain,
      implementation: 'Configure correlation analysis in alert settings. The system groups related alerts and identifies causal relationships between metrics.',
      impact: 'Medium'
    },
    {
      category: 'forecasting',
      title: 'Seasonal Pattern Recognition',
      description: 'AI automatically detects and models complex seasonal patterns including daily, weekly, and yearly cycles.',
      icon: TrendingUp,
      implementation: 'Enable automatic seasonality detection. The system identifies multiple seasonal components and adjusts forecasts accordingly.',
      impact: 'Medium'
    },
    {
      category: 'anomaly',
      title: 'Contextual Anomaly Detection',
      description: 'AI considers business context and external factors when detecting anomalies, improving accuracy.',
      icon: AlertTriangle,
      implementation: 'Integrate business calendars and external data sources. The system adjusts anomaly detection based on known events and external factors.',
      impact: 'Medium'
    },
    {
      category: 'optimization',
      title: 'Cost Optimization Insights',
      description: 'AI identifies cost optimization opportunities by analyzing usage patterns and pricing models.',
      icon: Target,
      implementation: 'Enable cost analysis AI. The system analyzes billing data, usage patterns, and pricing to recommend cost-saving opportunities.',
      impact: 'High'
    },
    {
      category: 'insights',
      title: 'Predictive Maintenance',
      description: 'AI predicts potential system failures and maintenance needs based on performance trends.',
      icon: Lightbulb,
      implementation: 'Configure predictive maintenance monitoring. AI analyzes performance degradation patterns to predict maintenance windows.',
      impact: 'Medium'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tips', count: aiTips.length },
    { id: 'forecasting', name: 'Forecasting', count: aiTips.filter(tip => tip.category === 'forecasting').length },
    { id: 'anomaly', name: 'Anomaly Detection', count: aiTips.filter(tip => tip.category === 'anomaly').length },
    { id: 'optimization', name: 'Optimization', count: aiTips.filter(tip => tip.category === 'optimization').length },
    { id: 'insights', name: 'Insights', count: aiTips.filter(tip => tip.category === 'insights').length }
  ];

  const filteredTips = selectedCategory === 'all' 
    ? aiTips 
    : aiTips.filter(tip => tip.category === selectedCategory);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/analytics" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics Dashboard
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Analytics AI Guide</h1>
              <p className="text-gray-600">Intelligent recommendations for optimal analytics performance</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/analytics/docs" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">Documentation</span>
            </a>
            <a href="/analytics/tutorial" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">Tutorial</span>
            </a>
            <a href="/analytics/faq" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">FAQ</span>
            </a>
            <a href="/analytics/ai-guide" className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg">
              <Brain className="h-4 w-4" />
              <span className="font-medium">AI Guide</span>
            </a>
          </div>
        </div>

        {/* AI Overview */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Brain className="h-8 w-8" />
            <h2 className="text-2xl font-bold">AI-Powered Analytics</h2>
          </div>
          <p className="text-lg mb-4">
            Leverage advanced machine learning to automate analytics workflows, improve accuracy, 
            and discover insights that traditional methods might miss.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">🎯 Smart Automation</h3>
              <p className="text-sm">Automatically configure optimal settings based on your data patterns</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">🔍 Deeper Insights</h3>
              <p className="text-sm">Uncover hidden patterns and correlations in your data</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">⚡ Continuous Learning</h3>
              <p className="text-sm">Improve accuracy over time as the system learns from your environment</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">AI Recommendation Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{category.name}</span>
                <span className="bg-current opacity-20 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Tips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredTips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{tip.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(tip.impact)}`}>
                        {tip.impact} Impact
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    Implementation Guide
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {tip.implementation}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {tip.category}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Learn More
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Start AI Configuration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start: Enable AI Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Essential AI Configuration</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">1</div>
                  <h4 className="font-semibold">Enable Auto-Model Selection</h4>
                </div>
                <p className="text-sm text-gray-600 ml-8">
                  Configure the system to automatically choose optimal forecasting models
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">2</div>
                  <h4 className="font-semibold">Configure Adaptive Thresholds</h4>
                </div>
                <p className="text-sm text-gray-600 ml-8">
                  Set up dynamic anomaly detection that learns from your data patterns
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">3</div>
                  <h4 className="font-semibold">Enable Resource Optimization</h4>
                </div>
                <p className="text-sm text-gray-600 ml-8">
                  Get AI-powered recommendations for cost and performance optimization
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Configuration Example</h3>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-400 mb-2"># Enable AI Features</div>
                <div>AI_ENABLED=true</div>
                <div>AUTO_MODEL_SELECTION=true</div>
                <div>ADAPTIVE_THRESHOLDS=true</div>
                <div>RESOURCE_OPTIMIZATION=true</div>
                <div className="mt-2 text-gray-400"># AI Learning Settings</div>
                <div>LEARNING_RATE=0.01</div>
                <div>CONFIDENCE_THRESHOLD=0.95</div>
                <div>UPDATE_FREQUENCY=hourly</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Pro Tip</span>
                </div>
                <p className="text-sm text-blue-800">
                  Start with conservative AI settings and gradually increase automation 
                  as the system learns your environment and you gain confidence in its recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <a href="/analytics/tutorial" className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Start Tutorial
            </a>
            <a href="/analytics/docs" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
