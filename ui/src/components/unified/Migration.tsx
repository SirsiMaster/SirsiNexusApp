'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Wand2,
  Settings,
  ArrowRight,
  Play,
  FileText,
  Database,
  Shield,
  TestTube,
  Zap,
  LifeBuoy,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

// Import the individual step components
import { PlanStep } from '@/components/MigrationSteps/steps/PlanStep';
import { SpecifyStep } from '@/components/MigrationSteps/steps/SpecifyStep';
import { BuildStep } from '@/components/MigrationSteps/steps/BuildStep';
import { TransferStep } from '@/components/MigrationSteps/steps/TransferStep_new';
import { ValidateStep } from '@/components/MigrationSteps/steps/ValidateStep_new';
import { TestStep } from '@/components/MigrationSteps/steps/TestStep_new';
import { OptimizeStep } from '@/components/MigrationSteps/steps/OptimizeStep_new';
import { SupportStep } from '@/components/MigrationSteps/steps/SupportStep_new';

type MigrationMode = 'wizard' | 'manual';
type MigrationStep = 'plan' | 'specify' | 'build' | 'transfer' | 'validate' | 'test' | 'optimize' | 'support';

const MIGRATION_STEPS = [
  { id: 'plan', title: 'Plan', icon: FileText, component: PlanStep },
  { id: 'specify', title: 'Specify', icon: Settings, component: SpecifyStep },
  { id: 'build', title: 'Build', icon: Play, component: BuildStep },
  { id: 'transfer', title: 'Transfer', icon: Database, component: TransferStep },
  { id: 'validate', title: 'Validate', icon: Shield, component: ValidateStep },
  { id: 'test', title: 'Test', icon: TestTube, component: TestStep },
  { id: 'optimize', title: 'Optimize', icon: Zap, component: OptimizeStep },
  { id: 'support', title: 'Support', icon: LifeBuoy, component: SupportStep }
];

interface MigrationProps {
  onNotificationUpdate?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const Migration: React.FC<MigrationProps> = ({ onNotificationUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<MigrationMode>('wizard');
  const [currentStep, setCurrentStep] = useState<MigrationStep>('plan');
  const [completedSteps, setCompletedSteps] = useState<Set<MigrationStep>>(new Set());

  const handleModeSelect = (mode: MigrationMode) => {
    setSelectedMode(mode);
    setIsExpanded(true);
    onNotificationUpdate?.(`Migration mode set to ${mode}`, 'info');
  };

  const handleStepComplete = (step: MigrationStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    
    // Auto-advance to next step in wizard mode
    if (selectedMode === 'wizard') {
      const currentIndex = MIGRATION_STEPS.findIndex(s => s.id === step);
      if (currentIndex < MIGRATION_STEPS.length - 1) {
        setCurrentStep(MIGRATION_STEPS[currentIndex + 1].id as MigrationStep);
      }
    }
    
    onNotificationUpdate?.(`${step} step completed successfully`, 'success');
  };

  const renderStepContent = () => {
    const stepConfig = MIGRATION_STEPS.find(s => s.id === currentStep);
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Migration</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isExpanded ? `${selectedMode} mode` : 'Step-by-step migration process'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completedSteps.size > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{completedSteps.size}/8 Complete</span>
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
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Wand2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Wizard</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Guided step-by-step process</div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect('manual')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    selectedMode === 'manual'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Manual</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Custom step selection</div>
                  </div>
                </button>
              </div>

              {/* Step Navigation */}
              {(selectedMode === 'wizard' || selectedMode === 'manual') && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
                  {MIGRATION_STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = completedSteps.has(step.id as MigrationStep);
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => selectedMode === 'manual' && setCurrentStep(step.id as MigrationStep)}
                        disabled={selectedMode === 'wizard' && !isActive && !isCompleted}
                        className={`p-3 rounded-lg border transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
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
