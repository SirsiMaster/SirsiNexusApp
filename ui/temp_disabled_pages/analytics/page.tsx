'use client';

import React from 'react';
import { BarChart, FileText, HelpCircle, Play, Brain, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive migration analytics and insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200">
              Stable
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm border border-emerald-200">
              Phase 1
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
              AI-Aware
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/analytics/docs" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <FileText className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Documentation</span>
          </a>
          <a href="/analytics/tutorial" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Play className="h-5 w-5 text-green-500" />
            <span className="font-medium">Tutorial</span>
          </a>
          <a href="/analytics/faq" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            <span className="font-medium">FAQ</span>
          </a>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI Guide</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Migration Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <div className="text-gray-600">Total Migrations</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">97%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">2.3min</div>
                  <div className="text-gray-600">Avg Downtime</div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Generate Analytics Report
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors">
                  View Historical Data
                </button>
              </div>
            </div>

            {/* Enhanced Analytics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
              <p className="text-gray-600 mb-4">
                Advanced analytics with AI-powered predictions using TensorFlow, pandas, and Prophet for forecasting and anomaly detection.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">Prediction Models</div>
                  <div className="text-sm text-gray-600 mt-1">7+ ML algorithms active</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">Forecast Accuracy</div>
                  <div className="text-sm text-gray-600 mt-1">88% confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analytics Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data Streams</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ML Models</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Sources</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">CockroachDB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Redis Cache</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Prometheus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Agent Telemetry</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Query Response:</span>
                  <span className="font-medium">&lt; 100ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Freshness:</span>
                  <span className="font-medium">Real-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Used:</span>
                  <span className="font-medium">2.4 TB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
