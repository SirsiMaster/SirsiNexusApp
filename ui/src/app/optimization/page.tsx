'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Download,
  FileText,
  Trophy,
  TrendingUp,
  BarChart3,
  Search,
  Settings,
  TestTube,
  DollarSign,
  Sparkles,
  Cpu,
  HardDrive,
  Network,
  Users,
  Lock,
  Building,
  Globe,
  Target,
  Zap
} from 'lucide-react';
import { OptimizeStep } from '@/components/MigrationSteps/steps/OptimizeStep';
import { EnvironmentSetupStep } from '@/components/MigrationSteps/steps/EnvironmentSetupStep';

type OptimizationStep = 'environment' | 'analyze' | 'discover' | 'recommend' | 'configure' | 'validate' | 'optimize';
type OptimizationStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'warning';

const OPTIMIZATION_STEPS: Record<OptimizationStep, { title: string; description: string; icon: React.ElementType }> = {
  environment: {
    title: 'Environment Setup',
    description: 'Configure environment credentials for optimization',
    icon: Lock,
  },
  analyze: {
    title: 'Analyze Resources',
    description: 'Deep dive into resource usage and cost patterns',
    icon: BarChart3,
  },
  discover: {
    title: 'Discover Opportunities',
    description: 'AI-powered identification of optimization potential',
    icon: Search,
  },
  recommend: {
    title: 'Generate Recommendations',
    description: 'Tailored optimization strategies for your infrastructure',
    icon: TrendingUp,
  },
  configure: {
    title: 'Configure Policies',
    description: 'Set up automated optimization and governance rules',
    icon: Settings,
  },
  validate: {
    title: 'Validate Solutions',
    description: 'Test optimizations in safe environment before applying',
    icon: TestTube,
  },
  optimize: {
    title: 'Apply Optimizations',
    description: 'Execute optimizations and monitor improvements',
    icon: DollarSign,
  },
};

interface OptimizationArtifact {
  id: string;
  name: string;
  type: string;
  size: string;
  step: string;
  content?: string;
}

export default function OptimizationWizardPage() {
  const [currentStep, setCurrentStep] = useState<OptimizationStep>('environment');
  const [stepStatuses, setStepStatuses] = useState<Record<OptimizationStep, OptimizationStatus>>({
    environment: 'not_started',
    analyze: 'not_started',
    discover: 'not_started',
    recommend: 'not_started',
    configure: 'not_started',
    validate: 'not_started',
    optimize: 'not_started',
  });
  const [completedSteps, setCompletedSteps] = useState<Set<OptimizationStep>>(new Set());
  const [artifacts, setArtifacts] = useState<OptimizationArtifact[]>([]);
  const [discoveredResources, setDiscoveredResources] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [optimizationData, setOptimizationData] = useState<any>(null);

  const steps = Object.keys(OPTIMIZATION_STEPS) as OptimizationStep[];

  // Get business entity context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const entity = urlParams.get('entity') || localStorage.getItem('selectedEntity') || 'tvfone';
    const journey = urlParams.get('demo') || localStorage.getItem('selectedJourney') || 'optimization';
    
    // Load entity-specific optimization data
    loadOptimizationContext(entity, journey);
  }, []);

  const loadOptimizationContext = (entity: string, journey: string) => {
    // Generate optimization context based on business entity
    const optimizationContexts: Record<string, any> = {
      tvfone: {
        totalCost: 47650,
        potentialSavings: 14295, // 30% savings potential
        resources: [
          { type: 'cdn', count: 15, monthlyCost: 8500, optimizationPotential: 40 },
          { type: 'streaming', count: 12, monthlyCost: 18200, optimizationPotential: 25 },
          { type: 'ai-ml', count: 8, monthlyCost: 12400, optimizationPotential: 35 },
          { type: 'storage', count: 45, monthlyCost: 8550, optimizationPotential: 50 },
        ],
        focusAreas: ['CDN optimization', 'Auto-scaling efficiency', 'ML model rightsizing'],
      },
      kulturio: {
        totalCost: 32450,
        potentialSavings: 9735, // 30% savings potential  
        resources: [
          { type: 'database', count: 8, monthlyCost: 12300, optimizationPotential: 25 },
          { type: 'imaging', count: 6, monthlyCost: 9800, optimizationPotential: 45 },
          { type: 'telemedicine', count: 4, monthlyCost: 6200, optimizationPotential: 30 },
          { type: 'backup', count: 12, monthlyCost: 4150, optimizationPotential: 60 },
        ],
        focusAreas: ['Medical imaging optimization', 'Database rightsizing', 'Backup lifecycle'],
      },
      uniedu: {
        totalCost: 24650,
        potentialSavings: 7395, // 30% savings potential
        resources: [
          { type: 'analytics', count: 18, monthlyCost: 9800, optimizationPotential: 35 },
          { type: 'lms', count: 6, monthlyCost: 7200, optimizationPotential: 20 },
          { type: 'research', count: 64, monthlyCost: 5400, optimizationPotential: 40 },
          { type: 'storage', count: 28, monthlyCost: 2250, optimizationPotential: 55 },
        ],
        focusAreas: ['Research compute optimization', 'Student analytics efficiency', 'Storage tiering'],
      },
    };

    setOptimizationData(optimizationContexts[entity] || optimizationContexts.tvfone);
  };

  const handleStepClick = (step: OptimizationStep) => {
    setCurrentStep(step);
  };

  const handleStepComplete = (step: OptimizationStep, artifact?: {name: string; type: string; size: string; content?: string}) => {
    console.log(`Optimization step ${step} completed`);
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, step]));
    setStepStatuses(prev => ({ ...prev, [step]: 'completed' }));
    
    // Store artifact if provided
    if (artifact) {
      const stepArtifact: OptimizationArtifact = {
        id: `${step}-${Date.now()}`,
        name: artifact.name,
        type: artifact.type,
        size: artifact.size,
        step: step.charAt(0).toUpperCase() + step.slice(1),
        content: artifact.content
      };
      setArtifacts(prev => [...prev, stepArtifact]);
    }
    
    // Advance to next step
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      setStepStatuses(prev => ({ ...prev, [nextStep]: 'in_progress' }));
    } else {
      // All steps completed
      setIsCompleted(true);
    }
  };

  const downloadArtifact = (artifact: OptimizationArtifact) => {
    const content = artifact.content || `# ${artifact.name}\n\nGenerated on: ${new Date().toISOString()}\nStep: ${artifact.step}\nType: ${artifact.type}\nSize: ${artifact.size}\n\nThis is an optimization artifact generated during the optimization process.`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Optimization Wizard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Enhance your infrastructure efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Steps
              </h2>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const config = OPTIMIZATION_STEPS[step];
                  const status = stepStatuses[step];
                  const isActive = step === currentStep;
                  const isCompleted = completedSteps.has(step);
                  
                  return (
                    <div
                      key={step}
                      onClick={() => handleStepClick(step)}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : isCompleted
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          isCompleted 
                            ? 'bg-green-50 dark:bg-green-900/200' 
                            : isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/200' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-sm font-medium text-white">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            isActive ? 'text-blue-900 dark:text-blue-200' : isCompleted ? 'text-green-900 dark:text-green-200' : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {config.title}
                          </h3>
                          <p className={`text-xs ${
                            isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6 rounded-lg h-full flex flex-col justify-between">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-50 dark:bg-green-900/200 dark:bg-green-600 rounded-full">
                    <span className="text-lg font-bold text-white">
                      {steps.indexOf(currentStep) + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {OPTIMIZATION_STEPS[currentStep].title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {OPTIMIZATION_STEPS[currentStep].description}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step-specific content - Using existing step components or custom optimization steps */}
                  {currentStep === 'environment' && (
                    <EnvironmentSetupStep 
                      wizardType="optimization"
                      onComplete={(artifact) => {
                        console.log('EnvironmentSetupStep completed with artifact:', artifact);
                        handleStepComplete(currentStep, artifact);
                      }}
                    />
                  )}

                  {currentStep === 'optimize' && (
                    <OptimizeStep 
                      onComplete={(artifact) => {
                        console.log('OptimizeStep completed with artifact:', artifact);
                        handleStepComplete(currentStep, artifact);
                      }}
                    />
                  )}
                  
                  {/* Custom optimization step content for other steps */}
                  {currentStep !== 'optimize' && currentStep !== 'environment' && (
                    <div className="space-y-6">
                      {/* Business Entity Context */}
                      {optimizationData && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Optimization Overview</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${optimizationData.totalCost.toLocaleString()}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Current Monthly Cost</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">${optimizationData.potentialSavings.toLocaleString()}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Potential Monthly Savings</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round((optimizationData.potentialSavings / optimizationData.totalCost) * 100)}%</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Optimization Potential</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Step-specific mock content */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {OPTIMIZATION_STEPS[currentStep].title} in Progress
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Click continue to proceed with {OPTIMIZATION_STEPS[currentStep].title.toLowerCase()}
                          </p>
                          <button
                            onClick={() => {
                              const artifact = {
                                name: `${OPTIMIZATION_STEPS[currentStep].title} Report`,
                                type: 'PDF',
                                size: '2.1 MB',
                                content: `# ${OPTIMIZATION_STEPS[currentStep].title} Report\n\nGenerated: ${new Date().toISOString()}\n\nThis report contains detailed analysis and recommendations for ${OPTIMIZATION_STEPS[currentStep].title.toLowerCase()}.`
                              };
                              handleStepComplete(currentStep, artifact);
                            }}
                            className="bg-green-600 dark:bg-green-50 dark:bg-green-900/200 hover:bg-green-700 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                          >
                            Continue to {steps.indexOf(currentStep) < steps.length - 1 ? OPTIMIZATION_STEPS[steps[steps.indexOf(currentStep) + 1]].title : 'Complete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Artifacts Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Artifacts
              </h2>
              {artifacts.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    No artifacts generated.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    Complete steps to create artifacts.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {artifacts.map((artifact) => (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-600 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {artifact.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {artifact.step}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadArtifact(artifact)}
                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


