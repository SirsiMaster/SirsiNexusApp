'use client';

import React from 'react';
import { BarChart, Server, ArrowRight, Database, Cloud, Activity, Users, TrendingUp } from 'lucide-react';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                🚀 SirsiNexus
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to SirsiNexus
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            AI-Powered Infrastructure Management Platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Migrations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">24</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Resources Migrated</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12,847</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">99.2%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Migration Tools
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">Cloud Migration Wizard</span>
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">Database Migration</span>
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">Infrastructure Optimization</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Platform Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-green-500 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">Real-time Monitoring</span>
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-green-500 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">Cost Optimization</span>
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-green-500 mr-3" />
                <span className="text-slate-600 dark:text-slate-400">Security Compliance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Test Navigation */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
              Test Navigation
            </h3>
            <div className="flex justify-center space-x-4">
              <a href="/test" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Test Page
              </a>
              <a href="/" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Full App
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
