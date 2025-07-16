'use client';

import React from 'react';
import { Shield, Lock, FileText, HelpCircle, Play, Brain, Key, Users, AlertTriangle } from 'lucide-react';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Security & Compliance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Secure credential management and compliance tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm border border-green-200 dark:border-green-700">
              Stable
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm border border-emerald-200 dark:border-emerald-700">
              Phase 1
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700">
              AI-Aware
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/security/docs" className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <FileText className="h-5 w-5 text-red-500" />
            <span className="font-medium dark:text-gray-100">Documentation</span>
          </a>
          <a href="/security/tutorial" className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <Play className="h-5 w-5 text-green-500" />
            <span className="font-medium dark:text-gray-100">Tutorial</span>
          </a>
          <a href="/security/faq" className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <HelpCircle className="h-5 w-5 text-red-500" />
            <span className="font-medium dark:text-gray-100">FAQ</span>
          </a>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI Guide</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Security Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Security Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
                  <div className="text-gray-600 dark:text-gray-400">Security Score</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
                  <div className="text-gray-600 dark:text-gray-400">Active Policies</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2</div>
                  <div className="text-gray-600 dark:text-gray-400">Alerts</div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Run Security Scan
                </button>
                <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors">
                  View Security Reports
                </button>
              </div>
            </div>

            {/* Credential Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Key className="h-5 w-5 text-red-500" />
                Credential Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Secure credential storage, rotation, and access management with encryption and audit trails.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Stored Credentials</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">24 credentials managed</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Rotation Status</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">All up to date</div>
                </div>
              </div>
            </div>

            {/* Compliance Tracking */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Compliance Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Monitor compliance with industry standards including SOC 2, GDPR, HIPAA, and custom policies.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">SOC 2 Type II</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">Compliant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">GDPR</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">Compliant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">HIPAA</span>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded">Review Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Security Services</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Identity & Access</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded border border-green-200 dark:border-green-700">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Encryption</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded border border-green-200 dark:border-green-700">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Audit Logging</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded border border-green-200 dark:border-green-700">
                    Recording
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Threat Detection</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded border border-green-200 dark:border-green-700">
                    Monitoring
                  </span>
                </div>
              </div>
            </div>

            {/* Security Policies */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Active Policies</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Password Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">MFA Enforcement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Data Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Access Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vulnerability Scanning</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-50 dark:bg-green-900/200 rounded-full mt-1.5"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Security scan completed</div>
                    <div className="text-gray-500 dark:text-gray-400">2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-50 dark:bg-blue-900/200 rounded-full mt-1.5"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">New policy applied</div>
                    <div className="text-gray-500 dark:text-gray-400">1 hour ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-50 dark:bg-yellow-900/200 rounded-full mt-1.5"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Credential rotation</div>
                    <div className="text-gray-500 dark:text-gray-400">4 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistantButton currentFeature="Security & Compliance" />
    </div>
  );
}
