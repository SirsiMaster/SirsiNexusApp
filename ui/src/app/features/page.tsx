'use client';

import React, { useState } from 'react';
import { 
  Cloud, 
  Database, 
  Activity, 
  Shield, 
  Users, 
  Settings, 
  BookOpen, 
  Brain, 
  BarChart, 
  Zap,
  Layers,
  Globe,
  Lock,
  Cpu,
  Monitor,
  Target,
  FileText,
  HelpCircle,
  Play,
  GitBranch,
  Workflow,
  Eye,
  TrendingUp,
  Gauge,
  Bot
} from 'lucide-react';

interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: Feature[];
}

interface Feature {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ElementType;
  status: 'stable' | 'beta' | 'experimental';
  phase: 1 | 2 | 3;
  hasDocumentation: boolean;
  hasTutorial: boolean;
  hasFAQ: boolean;
  aiAware: boolean;
}

const featureGroups: FeatureGroup[] = [
  {
    id: 'core-platform',
    name: 'Core Platform',
    description: 'Essential migration and infrastructure management capabilities',
    icon: Cloud,
    color: 'emerald',
    features: [
      {
        id: 'migration',
        name: 'Migration Wizard',
        description: 'Guided cloud migration with AI-powered planning',
        path: '/migration',
        icon: GitBranch,
        status: 'stable',
        phase: 1,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'projects',
        name: 'Project Management',
        description: 'Manage migration projects and team collaboration',
        path: '/projects',
        icon: Workflow,
        status: 'stable',
        phase: 1,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'agents',
        name: 'Agent Management',
        description: 'Deploy and manage autonomous migration agents',
        path: '/agents',
        icon: Bot,
        status: 'stable',
        phase: 2,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      }
    ]
  },
  {
    id: 'ai-orchestration',
    name: 'AI & Orchestration',
    description: 'Advanced AI-powered automation and intelligent workflows',
    icon: Brain,
    color: 'blue',
    features: [
      {
        id: 'ai-orchestration',
        name: 'AI Orchestration Engine',
        description: 'Intelligent workflow automation and decision making',
        path: '/ai-orchestration',
        icon: Brain,
        status: 'beta',
        phase: 3,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'sirsi-hypervisor',
        name: 'Sirsi Hypervisor',
        description: 'Advanced system orchestration and resource management',
        path: '/sirsi-hypervisor',
        icon: Cpu,
        status: 'experimental',
        phase: 3,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      }
    ]
  },
  {
    id: 'analytics-monitoring',
    name: 'Analytics & Monitoring',
    description: 'Real-time insights, performance monitoring, and business intelligence',
    icon: BarChart,
    color: 'purple',
    features: [
      {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Comprehensive migration analytics and insights',
        path: '/analytics',
        icon: BarChart,
        status: 'stable',
        phase: 1,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'enhanced-analytics',
        name: 'Enhanced Analytics',
        description: 'Advanced analytics with AI-powered predictions',
        path: '/analytics/enhanced',
        icon: TrendingUp,
        status: 'beta',
        phase: 2,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'observability',
        name: 'Observability',
        description: 'Real-time system monitoring and alerting',
        path: '/observability',
        icon: Eye,
        status: 'stable',
        phase: 2,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      }
    ]
  },
  {
    id: 'optimization-scaling',
    name: 'Optimization & Scaling',
    description: 'Performance optimization and intelligent scaling solutions',
    icon: Zap,
    color: 'amber',
    features: [
      {
        id: 'optimization',
        name: 'Optimization Engine',
        description: 'AI-powered performance optimization recommendations',
        path: '/optimization',
        icon: Target,
        status: 'stable',
        phase: 2,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'scaling',
        name: 'Auto-Scaling',
        description: 'Intelligent auto-scaling based on demand patterns',
        path: '/scaling',
        icon: Gauge,
        status: 'stable',
        phase: 2,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      }
    ]
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    description: 'Security management, compliance tracking, and credential management',
    icon: Shield,
    color: 'red',
    features: [
      {
        id: 'credentials',
        name: 'Credential Management',
        description: 'Secure credential storage and rotation',
        path: '/credentials',
        icon: Lock,
        status: 'stable',
        phase: 1,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      }
    ]
  },
  {
    id: 'support-docs',
    name: 'Documentation & Support',
    description: 'Help resources, tutorials, and interactive demos',
    icon: BookOpen,
    color: 'slate',
    features: [
      {
        id: 'help',
        name: 'Help Center',
        description: 'Comprehensive help and documentation',
        path: '/help',
        icon: HelpCircle,
        status: 'stable',
        phase: 1,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      },
      {
        id: 'demos',
        name: 'Interactive Demos',
        description: 'Hands-on demos and guided tutorials',
        path: '/demos',
        icon: Play,
        status: 'stable',
        phase: 1,
        hasDocumentation: true,
        hasTutorial: true,
        hasFAQ: true,
        aiAware: true
      }
    ]
  }
];

export default function FeaturesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('core-platform');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = featureGroups.map(group => ({
    ...group,
    features: group.features.filter(feature =>
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.features.length > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'beta': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'experimental': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800';
      case 2: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 3: return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 dark:to-gray-800 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            SirsiNexus Feature Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Explore all platform capabilities with integrated documentation, tutorials, and AI guidance
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Monitor className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>

        {/* Feature Groups Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {featureGroups.map((group) => {
            const Icon = group.icon;
            const isSelected = selectedGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  isSelected
                    ? `bg-${group.color}-100 text-${group.color}-800 border-${group.color}-300 dark:bg-${group.color}-900 dark:text-${group.color}-200 dark:border-${group.color}-800`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Feature Groups Display */}
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon;
            const isSelected = selectedGroup === group.id;
            
            if (!isSelected && selectedGroup !== 'all') return null;

            return (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Group Header */}
                <div className={`bg-${group.color}-50 dark:bg-${group.color}-900 border-b border-${group.color}-200 dark:border-${group.color}-800 p-6`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${group.color}-500 dark:bg-${group.color}-600 rounded-xl flex items-center justify-center`}>
                      <GroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.features.map((feature) => {
                      const FeatureIcon = feature.icon;
                      
                      return (
                        <div
                          key={feature.id}
                          className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                        >
                          {/* Feature Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 bg-${group.color}-500 dark:bg-${group.color}-600 rounded-lg flex items-center justify-center`}>
                                <FeatureIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(feature.status)}`}>
                                    {feature.status}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded border ${getPhaseColor(feature.phase)}`}>
                                    Phase {feature.phase}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{feature.description}</p>

                          {/* Feature Resources */}
                          <div className="space-y-3">
                            <a
                              href={feature.path}
                              className={`block w-full bg-${group.color}-500 hover:bg-${group.color}-600 text-white px-4 py-2 rounded-lg text-center transition-colors`}
                            >
                              Open Feature
                            </a>

                            <div className="grid grid-cols-2 gap-2">
                              {feature.hasDocumentation && (
                                <a
                                  href={`${feature.path}/docs`}
                                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                                >
                                  <FileText className="h-4 w-4" />
                                  Docs
                                </a>
                              )}
                              
                              {feature.hasTutorial && (
                                <a
                                  href={`${feature.path}/tutorial`}
                                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                                >
                                  <Play className="h-4 w-4" />
                                  Tutorial
                                </a>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {feature.hasFAQ && (
                                <a
                                  href={`${feature.path}/faq`}
                                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                  FAQ
                                </a>
                              )}
                              
                              {feature.aiAware && (
                                <button
                                  onClick={() => window.open(`${feature.path}/ai-guide`, '_blank')}
                                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-50 dark:from-gray-900 dark:to-gray-8000 dark:from-purple-600 dark:to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-sm"
                                >
                                  <Brain className="h-4 w-4" />
                                  AI Guide
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {featureGroups.reduce((acc, group) => acc + group.features.length, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {featureGroups.reduce((acc, group) => 
                  acc + group.features.filter(f => f.status === 'stable').length, 0
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Stable Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {featureGroups.reduce((acc, group) => 
                  acc + group.features.filter(f => f.aiAware).length, 0
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-400">AI-Aware Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Documentation Coverage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
