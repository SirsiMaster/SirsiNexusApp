'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Wand2,
  Settings,
  TrendingUp,
  BarChart3,
  Search,
  TestTube,
  DollarSign,
  Zap,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';

// Import optimization step components (we'll create these)
import { EnvironmentSetupStep } from '@/components/MigrationSteps/steps/EnvironmentSetupStep';
import { OptimizeStep } from '@/components/MigrationSteps/steps/OptimizeStep_new';

type OptimizationMode = 'wizard' | 'manual';
type OptimizationStep = 'environment' | 'analyze' | 'discover' | 'recommend' | 'configure' | 'validate' | 'optimize';

const OPTIMIZATION_STEPS = [
  { id: 'environment', title: 'Environment', icon: Lock, component: EnvironmentSetupStep },
  { id: 'analyze', title: 'Analyze', icon: BarChart3, component: OptimizeStep },
  { id: 'discover', title: 'Discover', icon: Search, component: OptimizeStep },
  { id: 'recommend', title: 'Recommend', icon: TrendingUp, component: OptimizeStep },
  { id: 'configure', title: 'Configure', icon: Settings, component: OptimizeStep },
  { id: 'validate', title: 'Validate', icon: TestTube, component: OptimizeStep },
  { id: 'optimize', title: 'Optimize', icon: DollarSign, component: OptimizeStep }
];

interface OptimizationProps {
  onNotificationUpdate?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const Optimization: React.FC<OptimizationProps> = ({ onNotificationUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<OptimizationMode>('wizard');
  const [currentStep, setCurrentStep] = useState<OptimizationStep>('environment');
  const [completedSteps, setCompletedSteps] = useState<Set<OptimizationStep>>(new Set());

  const handleModeSelect = (mode: OptimizationMode) => {
    setSelectedMode(mode);
    setIsExpanded(true);
    onNotificationUpdate?.(`Optimization mode set to ${mode}`, 'info');
  };

  const handleStepComplete = (step: OptimizationStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    
    // Auto-advance to next step in wizard mode
    if (selectedMode === 'wizard') {
      const currentIndex = OPTIMIZATION_STEPS.findIndex(s => s.id === step);
      if (currentIndex < OPTIMIZATION_STEPS.length - 1) {
        setCurrentStep(OPTIMIZATION_STEPS[currentIndex + 1].id as OptimizationStep);
      }
    }
    
    onNotificationUpdate?.(`${step} optimization step completed successfully`, 'success');
  };

  const renderStepContent = () => {
    const stepConfig = OPTIMIZATION_STEPS.find(s => s.id === currentStep);
    if (!stepConfig) return null;

    const StepComponent = stepConfig.component;
    return (
      <div className="mt-6">
        <StepComponent onComplete={() => handleStepComplete(currentStep)} />
      </div>
    );
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer border-b border-gray-200 dark:border-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Optimization</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isExpanded ? `${selectedMode} mode` : 'AI-powered cost and performance optimization'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completedSteps.size > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{completedSteps.size}/7 Complete</span>
              </div>
            )}
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Mode Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleModeSelect('wizard')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    selectedMode === 'wizard'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Wand2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Wizard</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Guided optimization process</div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect('manual')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    selectedMode === 'manual'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Manual</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Custom optimization steps</div>
                  </div>
                </button>
              </div>

              {/* Step Navigation */}
              {(selectedMode === 'wizard' || selectedMode === 'manual') && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                  {OPTIMIZATION_STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = completedSteps.has(step.id as OptimizationStep);
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => selectedMode === 'manual' && setCurrentStep(step.id as OptimizationStep)}
                        disabled={selectedMode === 'wizard' && !isActive && !isCompleted}
                        className={`p-3 rounded-lg border transition-all ${
                          isActive
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                            : isCompleted
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        } ${
                          selectedMode === 'wizard' && !isActive && !isCompleted 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{step.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step Content */}
              {(selectedMode === 'wizard' || selectedMode === 'manual') && renderStepContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
