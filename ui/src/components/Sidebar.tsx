'use client';

import React, { useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Home,
  Wand2,
  KeyRound,
  Folder,
  GitBranch,
  BarChart,
  Shield,
  Terminal,
  HelpCircle,
  Play,
  ChevronDown,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Rocket,
  Activity,
  Crown,
  Brain,
  Code,
  Send,
  Command,
  Menu,
  X,
  Minimize2,
  Maximize2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Network,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  aiAssistant?: boolean;
  isDarkMode?: boolean;
  onNavigateToInfrastructure?: () => void;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Build & Deploy',
    items: [
      { label: 'Infrastructure Builder', icon: Code, path: '/infrastructure' },
      { label: 'Projects', icon: Folder, path: '/projects' },
      { label: 'Migration Steps', icon: GitBranch, path: '/steps' },
      { label: 'Credentials', icon: KeyRound, path: '/credentials' },
    ]
  },
  {
    title: 'AI & Automation',
    items: [
      { label: 'Agent Management', icon: Sparkles, path: '/agents' },
      { label: 'AI Orchestration', icon: Brain, path: '/ai-orchestration' },
      { label: 'SIRSI HYPERVISOR', icon: Crown, path: '/sirsi-hypervisor' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', icon: BarChart, path: '/analytics' },
      { label: 'Enhanced Analytics', icon: TrendingUp, path: '/analytics/enhanced' },
      { label: 'Observability', icon: Activity, path: '/observability' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { label: 'Port Management', icon: Network, path: '/ports' },
      { label: 'Scripting Console', icon: Terminal, path: '/console' },
      { label: 'Security', icon: Shield, path: '/security' },
      { label: 'Demo Scenarios', icon: Play, path: '/demos' },
      { label: 'Help & Tutorials', icon: HelpCircle, path: '/help' },
      { label: 'Backend Tests', icon: Rocket, path: '/test-backend' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  aiAssistant = false,
  isDarkMode = false,
  onNavigateToInfrastructure
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [migrationStepsExpanded, setMigrationStepsExpanded] = React.useState(false);
  const [wizardsExpanded, setWizardsExpanded] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use actual theme state instead of prop
  const isActuallyDarkMode = theme === 'dark';
  
  const migrationSteps = [
    { label: 'PLAN', path: '/migration/plan' },
    { label: 'SPEC', path: '/migration/spec' },
    { label: 'BUILD', path: '/migration/build' },
    { label: 'TRANSFER', path: '/migration/transfer' },
    { label: 'VALIDATE', path: '/migration/validate' },
    { label: 'OPTIMIZE', path: '/migration/optimize' },
    { label: 'SUPPORT', path: '/migration/support' },
  ];

  const wizards = [
    { 
      label: 'Migration Wizard', 
      icon: ArrowRight, 
      path: '/migration', 
      description: 'Complete infrastructure migration',
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      label: 'Optimization Wizard', 
      icon: TrendingUp, 
      path: '/optimization', 
      description: 'Cost and performance optimization',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      label: 'Auto-Scaling Wizard', 
      icon: Zap, 
      path: '/scaling', 
      description: 'Configure intelligent auto-scaling',
      gradient: 'from-amber-500 to-orange-600'
    },
  ];

  // Simple navigation handler
  const handleInfrastructureNavigation = () => {
    if (pathname !== '/infrastructure') {
      router.push('/infrastructure');
    }
  };

  // Centralized styling for theme consistency
  const getActiveStyles = (isActive: boolean) => isActive
    ? 'bg-emerald-100 dark:bg-purple-900/30 text-emerald-700 dark:text-purple-300 border border-emerald-200 dark:border-purple-700'
    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100';

  const getIconBg = (isActive: boolean) => isActive
    ? 'bg-emerald-200 dark:bg-purple-700'
    : 'bg-slate-200 dark:bg-slate-700';

  const themeClasses = isActuallyDarkMode ? {
    bg: 'bg-slate-900/95',
    border: 'border-slate-700',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    input: 'bg-slate-800 border-slate-600 text-slate-100',
    button: 'bg-purple-600 hover:bg-purple-700'
  } : {
    bg: 'bg-white dark:bg-gray-800/95',
    border: 'border-slate-200',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    input: 'bg-white dark:bg-gray-800 border-slate-200 text-slate-900',
    button: 'bg-emerald-600 hover:bg-emerald-700'
  };

  return (
    <div className={`bg-white dark:bg-gray-800/95 dark:bg-slate-900/95 backdrop-blur-sm fixed left-0 top-16 h-[calc(100vh-4rem)] ${isCollapsed ? 'w-16' : 'w-64'} hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-700 transition-all duration-300`}>
      {/* Collapse Toggle */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Scrollable Navigation Content */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Overview Section */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (pathname !== '/') {
                router.push('/');
              }
            }}
            className={`w-full p-3 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(pathname === '/')}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBg(pathname === '/')}`}>
                <Home className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-medium">Overview</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Dashboard and insights</p>
              </div>
            </div>
          </button>
        </div>

        {/* Smart Wizards Section */}
        <div className="mb-6">
          <button
            onClick={() => setWizardsExpanded(!wizardsExpanded)}
            className="w-full p-3 rounded-lg transition-colors mb-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-purple-100 dark:bg-purple-900/30">
                  <Wand2 className="h-3 w-3 text-indigo-600 dark:text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Smart Wizards</span>
              </div>
              <ChevronDown className={`h-3 w-3 text-slate-600 dark:text-slate-400 transition-transform ${wizardsExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {wizardsExpanded && (
            <div className="space-y-2 fade-in">
              {wizards.map((wizard) => {
                const WizardIcon = wizard.icon;
                const isActive = pathname === wizard.path;
                return (
                  <button
                    key={wizard.path}
                    onClick={() => {
                      if (pathname !== wizard.path) {
                        router.push(wizard.path);
                      }
                    }}
                    className={`w-full p-3 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(isActive)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getIconBg(isActive)}`}>
                        <WizardIcon className="h-3 w-3 text-slate-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{wizard.label}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {wizard.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  const isMigrationSteps = item.path === '/steps';
                  
                  if (isMigrationSteps) {
                    return (
                      <div key={item.path} className="space-y-1">
                        <button
                          onClick={() => setMigrationStepsExpanded(!migrationStepsExpanded)}
                          className={`w-full p-2 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(isActive)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <ChevronDown className={`h-3 w-3 transition-transform ${migrationStepsExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        
                        {migrationStepsExpanded && (
                          <div className="ml-6 space-y-1 fade-in">
                            {migrationSteps.map((step, index) => {
                              const isCompleted = index < 2;
                              const isCurrent = index === 2;
                              return (
                                <button
                                  key={step.path}
                                  onClick={() => {
                                    if (pathname !== step.path) {
                                      router.push(step.path);
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                                    isCurrent
                                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                      : isCompleted
                                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <span>{step.label}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    isCurrent
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                      : isCompleted
                                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {isCurrent ? 'ACTIVE' : isCompleted ? 'DONE' : 'TODO'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        if (pathname !== item.path) {
                          router.push(item.path);
                        }
                      }}
                      className={`w-full p-2 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(isActive)}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Action CTA */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={handleInfrastructureNavigation}
            className="w-full bg-emerald-600 dark:bg-purple-600 hover:bg-emerald-700 dark:hover:bg-purple-700 text-white rounded-lg p-3 transition-colors group mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/200 dark:bg-purple-50 dark:bg-purple-900/200">
                <Code className="h-3 w-3 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Infrastructure Builder</div>
                <div className="text-xs text-emerald-100 dark:text-purple-100">AI-powered infrastructure</div>
              </div>
            </div>
          </button>
          </div>
          </nav>
        </>
      )}
      
      {/* Collapsed Sidebar - Only show icons */}
      {isCollapsed && (
        <nav className="flex-1 p-2 space-y-2">
          <div className="space-y-2">
            <button
              onClick={() => router.push('/')}
              className={`w-full p-3 rounded-lg transition-colors ${pathname === '/' ? 'bg-emerald-100 dark:bg-purple-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Home className="h-5 w-5 mx-auto text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => router.push('/infrastructure')}
              className={`w-full p-3 rounded-lg transition-colors ${pathname === '/infrastructure' ? 'bg-emerald-100 dark:bg-purple-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Code className="h-5 w-5 mx-auto text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className={`w-full p-3 rounded-lg transition-colors ${pathname === '/analytics' ? 'bg-emerald-100 dark:bg-purple-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <BarChart className="h-5 w-5 mx-auto text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => router.push('/agents')}
              className={`w-full p-3 rounded-lg transition-colors ${pathname === '/agents' ? 'bg-emerald-100 dark:bg-purple-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Sparkles className="h-5 w-5 mx-auto text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
