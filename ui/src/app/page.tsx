'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const authSync = useAuthSync();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const welcomeModalOpen = useAppSelector((state) => state.ui.modals.welcome);
  const authModalOpen = useAppSelector((state) => state.ui.modals.auth);
  const journeySelectionModalOpen = useAppSelector((state) => state.ui.modals.journeySelection);
  const optimizationWelcomeModalOpen = useAppSelector((state) => state.ui.modals.optimizationWelcome);
  const scalingWelcomeModalOpen = useAppSelector((state) => state.ui.modals.scalingWelcome);
  const userJourney = useAppSelector((state) => state.ui.userJourney);
  
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Show auth modal when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authModalOpen) {
      dispatch(setModalState({ modal: 'auth', visible: true }));
    }
  }, [isAuthenticated, authModalOpen, dispatch]);

  const hideMainContent = !isAuthenticated || authModalOpen || journeySelectionModalOpen;

  return (
    <div className="min-h-screen relative">
      {/* Dark blurred background overlay */}
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-[80px] z-0" />
      
      {/* Main content with glow effect */}
      <div className="relative z-10">
        <Breadcrumb />
        
        {!hideMainContent && (
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-slate-200">Welcome to your migration dashboard</p>
          </div>
        )}
      </div>
      
      {/* Modal Components */}
      {authModalOpen && (
        <SignInModal
          isOpen={authModalOpen}
          onClose={() => dispatch(setModalState({ modal: 'auth', visible: false }))}
          onSignIn={async (credentials) => {
            try {
              dispatch(login({ 
                id: 'user-' + Date.now(),
                email: credentials.email, 
                name: credentials.email.split('@')[0], 
                role: 'user' as const,
                rememberMe: credentials.rememberMe
              }));
              dispatch(setModalState({ modal: 'auth', visible: false }));
              if (userJourney.selectedJourney === null) {
                dispatch(setModalState({ modal: 'welcome', visible: true }));
              }
            } catch (error) {
              console.error('Login error:', error);
            }
          }}
          onRegister={async (userData) => {
            try {
              dispatch(login({ 
                id: 'user-' + Date.now(),
                email: userData.email, 
                name: userData.name, 
                role: 'user' as const
              }));
              dispatch(setModalState({ modal: 'auth', visible: false }));
              dispatch(setModalState({ modal: 'welcome', visible: true }));
            } catch (error) {
              console.error('Registration error:', error);
            }
          }}
        />
      )}
      
      {welcomeModalOpen && (
        <MigrationWelcomeModal
          isOpen={welcomeModalOpen}
          onClose={() => dispatch(setModalState({ modal: 'welcome', visible: false }))}
          onStartMigration={() => {
            dispatch(setModalState({ modal: 'welcome', visible: false }));
            dispatch(setModalState({ modal: 'journeySelection', visible: true }));
          }}
        />
      )}
      
      {journeySelectionModalOpen && (
        <PathSelectionModal
          isOpen={journeySelectionModalOpen}
          onClose={() => dispatch(setModalState({ modal: 'journeySelection', visible: false }))}
          onSelectPath={(path) => {
            dispatch(selectJourney(path));
            dispatch(setModalState({ modal: 'journeySelection', visible: false }));
            dispatch(markAsNotFirstTime());
            
            // Show appropriate welcome modal based on journey
            if (path === 'optimization') {
              dispatch(setModalState({ modal: 'optimizationWelcome', visible: true }));
            } else if (path === 'scaling') {
              dispatch(setModalState({ modal: 'scalingWelcome', visible: true }));
            }
          }}
        />
      )}
      
      {optimizationWelcomeModalOpen && (
        <OptimizationWelcomeModal
          isOpen={optimizationWelcomeModalOpen}
          onClose={() => dispatch(setModalState({ modal: 'optimizationWelcome', visible: false }))}
          onStartOptimization={() => {
            dispatch(setModalState({ modal: 'optimizationWelcome', visible: false }));
            setShowCreateProjectModal(true);
          }}
        />
      )}
      
      {scalingWelcomeModalOpen && (
        <ScalingWelcomeModal
          isOpen={scalingWelcomeModalOpen}
          onClose={() => dispatch(setModalState({ modal: 'scalingWelcome', visible: false }))}
          onStartScaling={() => {
            dispatch(setModalState({ modal: 'scalingWelcome', visible: false }));
            setShowCreateProjectModal(true);
          }}
        />
      )}
      
      {showCreateProjectModal && (
        <CreateProjectModal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          onCreateProject={(projectData) => {
            console.log('Creating project:', projectData);
            setShowCreateProjectModal(false);
          }}
        />
      )}
    </div>
  );
}
