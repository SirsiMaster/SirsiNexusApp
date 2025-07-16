'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanStep } from './steps/PlanStep';
import { SpecifyStep } from './steps/SpecifyStep';
import { TestStep } from './steps/TestStep';
import { BuildStep } from './steps/BuildStep';
import { TransferStep } from './steps/TransferStep';
import { ValidateStep } from './steps/ValidateStep';
import { OptimizeStep } from './steps/OptimizeStep';
import { SupportStep } from './steps/SupportStep';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Settings,
  Search,
  Loader,
  Download,
  FileText,
} from 'lucide-react';
import type { MigrationStep, MigrationStatus } from '@/types/migration';

interface StepConfig {
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Record<MigrationStep, StepConfig> = {
  plan: {
    title: 'Plan Migration',
    description: 'Discover resources and create migration strategy',
    icon: Search,
  },
  specify: {
    title: 'Specify Requirements',
    description: 'Define migration parameters and constraints',
    icon: Settings,
  },
  test: {
    title: 'Test Configuration',
    description: 'Validate migration settings and permissions',
    icon: Settings,
  },
  build: {
    title: 'Build Infrastructure',
    description: 'Prepare target environment and dependencies',
    icon: Settings,
  },
  transfer: {
    title: 'Transfer Resources',
    description: 'Execute the migration process',
    icon: Settings,
  },
  validate: {
    title: 'Validate Migration',
    description: 'Verify successful resource transfer',
    icon: Settings,
  },
  optimize: {
    title: 'Optimize Resources',
    description: 'Fine-tune performance and costs',
    icon: Settings,
  },
  support: {
    title: 'Support & Monitor',
    description: 'Ongoing maintenance and improvements',
    icon: Settings,
  },
};

const StatusIcon: React.FC<{ status: MigrationStatus; className?: string }> = ({ status, className = "h-6 w-6" }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className={`${className} text-green-600`} />;
    case 'in_progress':
      return <Loader className={`${className} text-blue-600 animate-spin`} />;
    case 'failed':
      return <XCircle className={`${className} text-red-600`} />;
    case 'warning':
      return <AlertTriangle className={`${className} text-yellow-600`} />;
    default:
      return <Clock className={`${className} text-slate-600`} />;
  }
};

const statusColors: Record<MigrationStatus, string> = {
  not_started: 'text-slate-600',
  in_progress: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
  warning: 'text-yellow-600',
};

interface MigrationStepsProps {
  currentStep: MigrationStep;
  stepStatuses: Record<MigrationStep, MigrationStatus>;
  onStepClick: (step: MigrationStep) => void;
}

interface ExtendedMigrationStepsProps extends MigrationStepsProps {
  onStepComplete?: (step: MigrationStep, artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

interface StepArtifact {
  id: string;
  name: string;
  type: string;
  size: string;
  step: string;
  content?: string;
}

export const MigrationSteps: React.FC<ExtendedMigrationStepsProps> = ({
  currentStep,
  stepStatuses,
  onStepClick,
  onStepComplete,
}) => {
  const [stepArtifacts, setStepArtifacts] = useState<Record<MigrationStep, StepArtifact | null>>({
    plan: null,
    specify: null,
    test: null,
    build: null,
    transfer: null,
    validate: null,
    optimize: null,
    support: null,
  });
  
  const handleStepComplete = (step: MigrationStep, artifact?: {name: string; type: string; size: string; content?: string}) => {
    console.log('MigrationSteps: Step completed:', step);
    
    // Store artifact if provided
    if (artifact) {
      const stepArtifact: StepArtifact = {
        id: `${step}-${Date.now()}`,
        name: artifact.name,
        type: artifact.type,
        size: artifact.size,
        step: step.charAt(0).toUpperCase() + step.slice(1),
        content: artifact.content
      };
      setStepArtifacts(prev => ({ ...prev, [step]: stepArtifact }));
    }
    
    // First call the external completion handler if provided
    if (onStepComplete) {
      console.log('MigrationSteps: Calling external onStepComplete');
      onStepComplete(step, artifact);
    } else {
      // Fallback auto-advance if no external handler
      console.log('MigrationSteps: No external handler, auto-advancing');
      const steps = Object.keys(STEPS) as MigrationStep[];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        onStepClick(nextStep);
      }
    }
  };
  
  const downloadArtifact = (artifact: StepArtifact) => {
    const content = artifact.content || `# ${artifact.name}\n\nGenerated on: ${new Date().toISOString()}\nStep: ${artifact.step}\nType: ${artifact.type}\nSize: ${artifact.size}\n\nThis is a sample artifact generated during the migration process.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.name.replace(/\s+/g, '_')}.${artifact.type.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const steps = Object.keys(STEPS) as MigrationStep[];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const config = STEPS[step];
          const status = stepStatuses[step];
          const isActive = step === currentStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${
                isActive ? 'border-sirsi-500 bg-sirsi-50' : 'border-gray-200 dark:border-gray-700 hover:border-sirsi-200'
              }`}
              onClick={() => onStepClick(step)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <StatusIcon status={status} />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{config.title}</h3>
                    <p className="text-lg text-slate-800 font-medium">{config.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 ${
                    isActive ? 'text-sirsi-500' : 'text-gray-400'
                  }`}
                />
              </div>

              {/* Show artifact for completed steps */}
              {status === 'completed' && stepArtifacts[step] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 border-t pt-4"
                >
                  <div className="flex items-center justify-between rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-900/200 rounded-full">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">{stepArtifacts[step]!.name}</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">{stepArtifacts[step]!.type} • {stepArtifacts[step]!.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadArtifact(stepArtifacts[step]!);
                      }}
                      className="flex items-center space-x-2 rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 border-t pt-4"
                >
                  <AnimatePresence mode="wait">
                    {step === 'plan' && (
                      <PlanStep
                        key="plan"
                        onComplete={(artifact) => {
                          console.log('Plan step completed');
                          handleStepComplete('plan', artifact);
                        }}
                      />
                    )}
                    {step === 'specify' && (
                      <SpecifyStep
                        key="specify"
                        resources={[
                          {
                            id: '1',
                            name: 'prod-db-01',
                            type: 'database',
                            status: 'not_started',
                            metadata: {
                              engine: 'postgresql',
                              version: '13.4',
                              size: '100GB',
                            },
                          },
                        ]}
                        onComplete={(artifact) => {
                          console.log('SpecifyStep completed with artifact:', artifact);
                          handleStepComplete('specify', artifact);
                        }}
                      />
                    )}
                    {step === 'test' && (
                      <TestStep
                        key="test"
                        onComplete={(artifact) => handleStepComplete('test', artifact)}
                      />
                    )}
                    {step === 'build' && (
                      <BuildStep
                        key="build"
                        onComplete={(artifact) => handleStepComplete('build', artifact)}
                      />
                    )}
                    {step === 'transfer' && (
                      <TransferStep
                        key="transfer"
                        onComplete={(artifact) => handleStepComplete('transfer', artifact)}
                      />
                    )}
                    {step === 'validate' && (
                      <ValidateStep
                        key="validate"
                        onComplete={(artifact) => handleStepComplete('validate', artifact)}
                      />
                    )}
                    {step === 'optimize' && (
                      <OptimizeStep
                        key="optimize"
                        onComplete={(artifact) => handleStepComplete('optimize', artifact)}
                      />
                    )}
                    {step === 'support' && (
                      <SupportStep
                        key="support"
                        onComplete={(artifact) => {
                          handleStepComplete('support', artifact);
                          console.log('Migration completed!');
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
