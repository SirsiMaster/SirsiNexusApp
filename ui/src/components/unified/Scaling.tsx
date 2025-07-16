'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Wand2,
  Settings,
  Expand,
  Activity,
  Target,
  Shield,
  TestTube,
  Monitor,
  Zap,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';

// Import scaling step components (we'll create these)
import { EnvironmentSetupStep } from '@/components/MigrationSteps/steps/EnvironmentSetupStep';
import { OptimizeStep } from '@/components/MigrationSteps/steps/OptimizeStep_new';

type ScalingMode = 'wizard' | 'manual';
type ScalingStep = 'environment' | 'baseline' | 'strategy' | 'configure' | 'validate' | 'monitor' | 'scale';

const SCALING_STEPS = [
  { id: 'environment', title: 'Environment', icon: Lock, component: EnvironmentSetupStep },
  { id: 'baseline', title: 'Baseline', icon: Activity, component: OptimizeStep },
  { id: 'strategy', title: 'Strategy', icon: Target, component: OptimizeStep },
  { id: 'configure', title: 'Configure', icon: Settings, component: OptimizeStep },
  { id: 'validate', title: 'Validate', icon: TestTube, component: OptimizeStep },
  { id: 'monitor', title: 'Monitor', icon: Monitor, component: OptimizeStep },
  { id: 'scale', title: 'Scale', icon: Zap, component: OptimizeStep }
];

interface ScalingProps {
  onNotificationUpdate?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const Scaling: React.FC<ScalingProps> = ({ onNotificationUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ScalingMode>('wizard');
  const [currentStep, setCurrentStep] = useState<ScalingStep>('environment');
  const [completedSteps, setCompletedSteps] = useState<Set<ScalingStep>>(new Set());

  const handleModeSelect = (mode: ScalingMode) => {
    setSelectedMode(mode);
    setIsExpanded(true);
    onNotificationUpdate?.(`Scaling mode set to ${mode}`, 'info');
  };

  const handleStepComplete = (step: ScalingStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    
    // Auto-advance to next step in wizard mode
    if (selectedMode === 'wizard') {
      const currentIndex = SCALING_STEPS.findIndex(s => s.id === step);
      if (currentIndex < SCALING_STEPS.length - 1) {
        setCurrentStep(SCALING_STEPS[currentIndex + 1].id as ScalingStep);
      }
    }
    
    onNotificationUpdate?.(`${step} scaling step completed successfully`, 'success');
  };

  const renderStepContent = () => {
    const stepConfig = SCALING_STEPS.find(s => s.id === currentStep);
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Expand className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Scaling</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isExpanded ? `${selectedMode} mode` : 'Intelligent auto-scaling and capacity management'}
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
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Wand2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Wizard</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Guided scaling setup</div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect('manual')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    selectedMode === 'manual'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Manual</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Custom scaling configuration</div>
                  </div>
                </button>
              </div>

              {/* Step Navigation */}
              {(selectedMode === 'wizard' || selectedMode === 'manual') && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                  {SCALING_STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = completedSteps.has(step.id as ScalingStep);
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => selectedMode === 'manual' && setCurrentStep(step.id as ScalingStep)}
                        disabled={selectedMode === 'wizard' && !isActive && !isCompleted}
                        className={`p-3 rounded-lg border transition-all ${
                          isActive
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                            : isCompleted
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
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
