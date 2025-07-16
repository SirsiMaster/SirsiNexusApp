'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Settings,
  Play,
  Download,
  Shield,
  Zap,
  HelpCircle,
} from 'lucide-react';

const migrationSteps = [
  {
    id: 'plan',
    label: 'PLAN',
    title: 'Migration Planning',
    description: 'Define migration strategy and assess current infrastructure',
    status: 'completed',
    path: '/migration/plan',
    icon: FileText,
    estimatedTime: '1-2 weeks',
    tasks: [
      'Infrastructure assessment',
      'Dependencies mapping',
      'Risk analysis',
      'Timeline creation'
    ]
  },
  {
    id: 'spec',
    label: 'SPEC',
    title: 'Specification Design',
    description: 'Create detailed technical specifications for target infrastructure',
    status: 'completed',
    path: '/migration/spec',
    icon: Settings,
    estimatedTime: '1-2 weeks',
    tasks: [
      'Architecture design',
      'Resource specifications',
      'Security requirements',
      'Compliance mapping'
    ]
  },
  {
    id: 'build',
    label: 'BUILD',
    title: 'Infrastructure Build',
    description: 'Provision and configure target infrastructure',
    status: 'active',
    path: '/migration/build',
    icon: Play,
    estimatedTime: '2-4 weeks',
    tasks: [
      'Resource provisioning',
      'Network configuration',
      'Security setup',
      'Monitoring deployment'
    ]
  },
  {
    id: 'transfer',
    label: 'TRANSFER',
    title: 'Data Transfer',
    description: 'Migrate data and applications to target infrastructure',
    status: 'pending',
    path: '/migration/transfer',
    icon: Download,
    estimatedTime: '1-3 weeks',
    tasks: [
      'Data migration',
      'Application deployment',
      'Configuration transfer',
      'Initial testing'
    ]
  },
  {
    id: 'validate',
    label: 'VALIDATE',
    title: 'Validation & Testing',
    description: 'Comprehensive testing and validation of migrated systems',
    status: 'pending',
    path: '/migration/validate',
    icon: Shield,
    estimatedTime: '1-2 weeks',
    tasks: [
      'Functional testing',
      'Performance validation',
      'Security testing',
      'User acceptance'
    ]
  },
  {
    id: 'optimize',
    label: 'OPTIMIZE',
    title: 'Optimization',
    description: 'Fine-tune performance and optimize costs',
    status: 'pending',
    path: '/migration/optimize',
    icon: Zap,
    estimatedTime: '1 week',
    tasks: [
      'Performance tuning',
      'Cost optimization',
      'Resource scaling',
      'Monitoring setup'
    ]
  },
  {
    id: 'support',
    label: 'SUPPORT',
    title: 'Support & Maintenance',
    description: 'Ongoing support and maintenance of migrated infrastructure',
    status: 'pending',
    path: '/migration/support',
    icon: HelpCircle,
    estimatedTime: 'Ongoing',
    tasks: [
      'Documentation',
      'Training materials',
      'Support procedures',
      'Maintenance schedules'
    ]
  },
];

export default function MigrationStepsPage() {
  const router = useRouter();
  const [selectedStep, setSelectedStep] = useState(migrationSteps.find(step => step.status === 'active') || migrationSteps[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700';
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'pending':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Migration Steps
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Track your migration progress through our structured 7-step process
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Migration Progress
              </h2>
              <div className="space-y-3">
                {migrationSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isSelected = selectedStep.id === step.id;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setSelectedStep(step)}
                      className={`w-full p-3 rounded-lg transition-all duration-200 text-left border ${
                        isSelected
                          ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)}
                            {step.label}
                          </div>
                        </div>
                        <Icon className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {step.estimatedTime}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedStep.status)}`}>
                    {getStatusIcon(selectedStep.status)}
                    {selectedStep.label}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedStep.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Estimated time: {selectedStep.estimatedTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(selectedStep.path)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {selectedStep.description}
                </p>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Key Tasks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedStep.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedStep.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                          : selectedStep.status === 'active'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}>
                        {selectedStep.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Overall Progress
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(migrationSteps.filter(s => s.status === 'completed').length / migrationSteps.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {migrationSteps.filter(s => s.status === 'completed').length} of {migrationSteps.length} completed
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {migrationSteps.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-sm text-emerald-600">Completed</div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {migrationSteps.filter(s => s.status === 'active').length}
                    </div>
                    <div className="text-sm text-blue-600">Active</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {migrationSteps.filter(s => s.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
