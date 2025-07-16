'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
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
    </div>
  );
}
