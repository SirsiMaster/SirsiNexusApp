'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SignInModal } from '@/components/SignInModal';
import { MigrationWelcomeModal } from '@/components/MigrationWelcomeModal';
import { PathSelectionModal } from '@/components/PathSelectionModal';
import { OptimizationWelcomeModal } from '@/components/OptimizationWelcomeModal';
import { ScalingWelcomeModal } from '@/components/ScalingWelcomeModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useAppSelector, useAppDispatch } from '@/store';
import { useAuthSync } from '@/hooks/useAuthSync';
import { setModalState, selectJourney, markAsNotFirstTime } from '@/store/slices/uiSlice';
import { login } from '@/store/slices/authSlice';
import { EmbeddedAssistant } from '@/components/ai-assistant/EmbeddedAssistant';
import {
  BarChart,
  Server,
  ArrowRight,
  Database,
  Cloud,
  Activity,
  Plus,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Sparkles,
  Rocket,
  Monitor,
  Search,
  Command,
  Network,
} from 'lucide-react';

const mockStats = [
  {
    name: 'Active Migrations',
    value: '24',
    change: '+8',
    icon: Cloud,
    description: 'Currently running migration projects across AWS, Azure, and GCP',
    trend: 'up',
    percentage: '+32.5%',
  },
  {
    name: 'Resources Migrated',
    value: '12,847',
    change: '+1,253',
    icon: Server,
    description: 'Successfully migrated servers, databases, and applications',
    trend: 'up',
    percentage: '+10.8%',
  },
  {
    name: 'Success Rate',
    value: '99.2%',
    change: '+0.7%',
    icon: Activity,
    description: 'Migration success rate across all projects this quarter',
    trend: 'up',
    percentage: '+0.7%',
  },
  {
    name: 'Data Transferred',
    value: '47.3 TB',
    change: '+12.8 TB',
    icon: Database,
    description: 'Total data volume transferred across all active migrations',
    trend: 'up',
    percentage: '+37.2%',
  },
  {
    name: 'Cost Savings',
    value: '$2.8M',
    change: '+$450K',
    icon: TrendingUp,
    description: 'Infrastructure cost savings achieved through optimization',
    trend: 'up',
    percentage: '+19.3%',
  },
  {
    name: 'Team Members',
    value: '156',
    change: '+12',
    icon: Users,
    description: 'Active team members across all migration projects',
    trend: 'up',
    percentage: '+8.3%',
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'migration_completed',
    project: 'Production Database Migration',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'optimization_suggested',
    project: 'Web App Servers',
    timestamp: '4 hours ago',
    status: 'info',
  },
  {
    id: '3',
    type: 'validation_warning',
    project: 'Storage Bucket Transfer',
    timestamp: '6 hours ago',
    status: 'warning',
  },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authSync = useAuthSync(); // Sync NextAuth with Redux
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const welcomeModalOpen = useAppSelector((state) => state.ui.modals.welcome);
  const authModalOpen = useAppSelector((state) => state.ui.modals.auth);
  const journeySelectionModalOpen = useAppSelector((state) => state.ui.modals.journeySelection);
  const optimizationWelcomeModalOpen = useAppSelector((state) => state.ui.modals.optimizationWelcome);
  const scalingWelcomeModalOpen = useAppSelector((state) => state.ui.modals.scalingWelcome);
  const userJourney = useAppSelector((state) => state.ui.userJourney);
  
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showWelcomeAssistant, setShowWelcomeAssistant] = useState(false);

  // Show auth modal by default if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authModalOpen && !journeySelectionModalOpen) {
      dispatch(setModalState({ modal: 'auth', visible: true }));
    }
  }, [isAuthenticated, authModalOpen, journeySelectionModalOpen, dispatch]);

  const handleSignIn = (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    console.log('Signing in with:', credentials);
    
    dispatch(login({ 
      id: '1', 
      email: credentials.email, 
      name: credentials.email.split('@')[0], 
      role: credentials.email.includes('admin') ? 'admin' : 'user',
      rememberMe: credentials.rememberMe || true // Default to true for persistent sessions
    }));
    dispatch(setModalState({ modal: 'auth', visible: false }));
    
    // Show journey selection for first-time users
    if (userJourney.isFirstTime) {
      dispatch(setModalState({ modal: 'journeySelection', visible: true }));
    } else {
      // Only show welcome AI assistant if no other modals will be shown
      setTimeout(() => setShowWelcomeAssistant(true), 500);
    }
  };

  const handleRegister = (userData: { name: string; email: string; password: string; confirmPassword: string }) => {
    console.log('Registering user:', userData);
    dispatch(login({ 
      id: '2', 
      email: userData.email, 
      name: userData.name, 
      role: 'user'
    }));
    dispatch(setModalState({ modal: 'auth', visible: false }));
    
    // Show journey selection for new users (no AI assistant during onboarding)
    dispatch(setModalState({ modal: 'journeySelection', visible: true }));
  };

  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    dispatch(login({ 
      id: '3', 
      email: `demo@${provider}.com`, 
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`, 
      role: 'user'
    }));
    dispatch(setModalState({ modal: 'auth', visible: false }));
    
    // Show journey selection for OAuth users
    if (userJourney.isFirstTime) {
      dispatch(setModalState({ modal: 'journeySelection', visible: true }));
    } else {
      // Only show welcome AI assistant if no other modals will be shown
      setTimeout(() => setShowWelcomeAssistant(true), 500);
    }
  };

  const handleCreateProject = (projectData: any) => {
    console.log('Creating project:', projectData);
    // Handle project creation
  };

  const handleStartMigration = () => {
    // Navigate to migration wizard or create new project
    router.push('/migration');
  };

  const handleJourneySelection = (journey: 'migration' | 'optimization' | 'scaling') => {
    dispatch(selectJourney(journey));
  };

  const handleStartOptimization = () => {
    // Navigate to optimization wizard
    console.log('Starting optimization journey');
    router.push('/optimization');
  };

  const handleStartScaling = () => {
    // Navigate to scaling wizard
    console.log('Starting scaling journey');
    router.push('/scaling');
  };

  // Only show dashboard content if user is authenticated and has completed onboarding
  const showBackdrop = journeySelectionModalOpen || authModalOpen || welcomeModalOpen || optimizationWelcomeModalOpen || scalingWelcomeModalOpen;
  const hideMainContent = !isAuthenticated || authModalOpen || journeySelectionModalOpen;

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
      <Breadcrumb />
      
      {!hideMainContent && (
        <>
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Quick Actions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get started with common tasks
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">New Project</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Start your migration journey</p>
              </button>
              
              <button
                onClick={() => dispatch(setModalState({ modal: 'auth', visible: true }))}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Demo Sign In</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Try the platform features</p>
              </button>
              
              <button
                onClick={() => dispatch(setModalState({ modal: 'journeySelection', visible: true }))}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-300 dark:hover:border-amber-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Choose Journey</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Select your migration path</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/analytics'}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">View detailed reports</p>
              </button>
            </div>
            
            {/* Second row of quick actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
              <button
                onClick={() => window.location.href = '/hedera'}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Network className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Hedera DLT</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Distributed intelligence hub</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/agents'}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-300 dark:hover:border-green-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">AI Agents</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage autonomous agents</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/hypervisor'}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                    <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Hypervisor</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">AI orchestration engine</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/console'}
                className="p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-900/50 transition-colors">
                    <Command className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Console</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">System administration</p>
              </button>
            </div>
          </div>

          {/* Dashboard Overview Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Real-time insights into your migration projects and infrastructure
                </p>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          const getNavigationPath = (name: string) => {
            switch (name) {
              case 'Active Migrations':
                return '/analytics?filter=active-migrations';
              case 'Resources Migrated':
                return '/analytics?filter=resources';
              case 'Success Rate':
                return '/analytics?filter=success-metrics';
              case 'Data Transferred':
                return '/analytics?filter=data';
              case 'Cost Savings':
                return '/analytics?filter=cost-savings';
              case 'Team Members':
                return '/team';
              default:
                return '/analytics';
            }
          };
          
          return (
<button
              key={stat.name}
              onClick={() => router.push(getNavigationPath(stat.name))}
              className="p-4 space-y-3 bg-white dark:bg-gray-800 dark:bg-slate-800 glass border-0 rounded-xl hover:shadow-lg transition-all duration-200 group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-slate-800 dark:text-slate-100">
                  {stat.name}
                </h3>
              </div>

              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                    {stat.percentage}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {stat.description}
              </p>
            </button>
          );
        })}
      </div>

          
          {/* Recent Activity */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Latest updates and project milestones
                  </p>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = '/projects'}
                className="px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {mockRecentActivity.map((activity, index) => {
              const getActivityPath = (activityId: string, type: string) => {
                switch (type) {
                  case 'migration_completed':
                    return `/projects/${activityId}`;
                  case 'optimization_suggested':
                    return `/optimization?project=${activityId}`;
                  case 'validation_warning':
                    return `/projects/${activityId}?tab=logs`;
                  default:
                    return `/projects/${activityId}`;
                }
              };
              
              return (
                <button
                  key={activity.id}
                  onClick={() => router.push(getActivityPath(activity.id, activity.type))}
                  className="w-full p-4 bg-white dark:bg-gray-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {activity.project}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {activity.timestamp} • {activity.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          activity.status === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                            : activity.status === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700'
                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                        }`}
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      
      {/* Welcome AI Assistant on Login - Only show after full authentication */}
      {showWelcomeAssistant && isAuthenticated && !authModalOpen && !journeySelectionModalOpen && (
        <React.Suspense fallback={<div className="fixed bottom-4 right-4 w-12 h-12 bg-purple-50 dark:bg-purple-900/200 rounded-full animate-pulse" />}>
          <EmbeddedAssistant 
            position="floating" 
            showOnLogin={true} 
            context="dashboard-welcome" 
          />
        </React.Suspense>
      )}
      
      {/* Modals */}
      <PathSelectionModal
        isOpen={journeySelectionModalOpen}
        onClose={() => {
          console.log('Closing path selection modal - user skipped');
          dispatch(setModalState({ modal: 'journeySelection', visible: false }));
          // Mark as not first time but don't select any journey when skipping
          if (userJourney.isFirstTime) {
            dispatch(markAsNotFirstTime());
          }
        }}
        onSelectPath={handleJourneySelection}
      />
      
      <SignInModal
        isOpen={authModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'auth', visible: false }))}
        onSignIn={handleSignIn}
        onRegister={handleRegister}
        onOAuthLogin={handleOAuthLogin}
      />
      
      <MigrationWelcomeModal
        isOpen={welcomeModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'welcome', visible: false }))}
        onStartMigration={handleStartMigration}
      />

      <OptimizationWelcomeModal
        isOpen={optimizationWelcomeModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'optimizationWelcome', visible: false }))}
        onStartOptimization={handleStartOptimization}
      />

      <ScalingWelcomeModal
        isOpen={scalingWelcomeModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'scalingWelcome', visible: false }))}
        onStartScaling={handleStartScaling}
      />
      
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
