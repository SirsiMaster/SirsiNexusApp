'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, FileText, Trophy, Sparkles, Clock, ChevronRight, Search, Server, Database, Cloud, Settings, TestTube, Wrench, ArrowLeftRight, BarChart, Shield, Play, Loader, RefreshCw, AlertTriangle, Info, Cpu, HardDrive, Network, Users, Lock, Building, Globe } from 'lucide-react';
import { EnvironmentSetupStep } from '@/components/MigrationSteps/steps/EnvironmentSetupStep';
import { PlanStep } from '@/components/MigrationSteps/steps/PlanStep';
import { SpecifyStep } from '@/components/MigrationSteps/steps/SpecifyStep';
import { TestStep } from '@/components/MigrationSteps/steps/TestStep';
import { BuildStep } from '@/components/MigrationSteps/steps/BuildStep';
import { TransferStep } from '@/components/MigrationSteps/steps/TransferStep';
import { ValidateStep } from '@/components/MigrationSteps/steps/ValidateStep';
import { OptimizeStep } from '@/components/MigrationSteps/steps/OptimizeStep';
import { SupportStep } from '@/components/MigrationSteps/steps/SupportStep';
import { UserAgreementComponent } from '@/components/Migration/UserAgreementComponent';
import { ProcessCatalogComponent } from '@/components/Migration/ProcessCatalogComponent';
import { SecurityStatusComponent } from '@/components/Migration/SecurityStatusComponent';
import { MigrationAuditComponent } from '@/components/Migration/MigrationAuditComponent';

type MigrationStep = 'environment' | 'plan' | 'specify' | 'test' | 'build' | 'transfer' | 'validate' | 'optimize' | 'support';
type MigrationStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'warning';

const STEPS: Record<MigrationStep, { title: string; description: string; icon: React.ElementType; features: string[] }> = {
  environment: {
    title: 'Environment Setup',
    description: 'Configure source and destination credentials',
    icon: Lock,
    features: ['Multi-cloud credentials', 'Connection validation', 'Security protocols']
  },
  plan: {
    title: 'Plan Migration',
    description: 'AI-powered discovery and strategic planning',
    icon: Search,
    features: ['User agreements', 'Asset discovery', 'Security validation', 'Audit logging']
  },
  specify: {
    title: 'Specify Requirements',
    description: 'Define migration parameters with AI insights',
    icon: Settings,
    features: ['Resource specifications', 'Cost optimization', 'Risk assessment', 'AI recommendations']
  },
  test: {
    title: 'Test Configuration',
    description: 'Comprehensive validation and infrastructure preview',
    icon: TestTube,
    features: ['Infrastructure as Code', 'Configuration tests', 'Error resolution', 'Flow diagrams']
  },
  build: {
    title: 'Build Infrastructure',
    description: 'Automated infrastructure deployment',
    icon: Wrench,
    features: ['Network configuration', 'Storage provisioning', 'Compute deployment', 'Monitoring setup']
  },
  transfer: {
    title: 'Transfer Resources',
    description: 'Real-time migration with progress monitoring',
    icon: ArrowLeftRight,
    features: ['Live transfer tracking', 'Progress metrics', 'Error handling', 'Performance monitoring']
  },
  validate: {
    title: 'Validate Migration',
    description: 'Comprehensive post-migration verification',
    icon: Shield,
    features: ['Data integrity checks', 'Performance validation', 'Security verification', 'Network testing']
  },
  optimize: {
    title: 'Optimize Resources',
    description: 'AI-driven cost and performance optimization',
    icon: BarChart,
    features: ['Cost analysis', 'Performance tuning', 'Resource rightsizing', 'Efficiency metrics']
  },
  support: {
    title: 'Support & Monitor',
    description: 'Ongoing monitoring and support automation',
    icon: Settings,
    features: ['24/7 monitoring', 'Alert management', 'Support ticketing', 'Knowledge base']
  },
};

interface StepArtifact {
  id: string;
  name: string;
  type: string;
  size: string;
  step: string;
  content?: string;
}

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState<MigrationStep>('environment');
  const [stepStatuses, setStepStatuses] = useState<Record<MigrationStep, MigrationStatus>>({
    environment: 'not_started',
    plan: 'not_started',
    specify: 'not_started',
    test: 'not_started',
    build: 'not_started',
    transfer: 'not_started',
    validate: 'not_started',
    optimize: 'not_started',
    support: 'not_started',
  });
  const [completedSteps, setCompletedSteps] = useState<Set<MigrationStep>>(new Set());
  const [artifacts, setArtifacts] = useState<StepArtifact[]>([]);
  const [discoveredResources, setDiscoveredResources] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [securityValidated, setSecurityValidated] = useState(false);
  const [userAgreementApproved, setUserAgreementApproved] = useState(false);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  
  // Backend audit integration
  const logAuditEvent = async (event: any) => {
    try {
      const response = await fetch('/api/migration/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Audit event logged to backend:', result.data.eventId);
      }
    } catch (error) {
      console.warn('Failed to log audit event to backend:', error);
    }
    
    // Always add to local state for UI
    setAuditEvents(prev => [event, ...prev]);
  };

  const steps = Object.keys(STEPS) as MigrationStep[];

  const handleStepClick = (step: MigrationStep) => {
    setCurrentStep(step);
  };

  const handleStepComplete = (step: MigrationStep, artifact?: {name: string; type: string; size: string; content?: string}, resources?: any[]) => {
    console.log(`Step ${step} completed`);
    
    // Store discovered resources from plan step for use in subsequent steps
    if (step === 'plan' && resources) {
      setDiscoveredResources(resources);
    }
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, step]));
    setStepStatuses(prev => ({ ...prev, [step]: 'completed' }));
    
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

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
Migration Completed Successfully!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-8"
          >
            Your migration has been completed successfully. All resources have been transferred and validated.
          </motion.p>

          {artifacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Generated Artifacts</h3>
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{artifact.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{artifact.type} • {artifact.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadArtifact(artifact)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-4"
          >
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
Start New Migration
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900 dark:via-blue-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Migration Wizard</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Seamlessly migrate your infrastructure to the cloud</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Migration Steps</h2>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const config = STEPS[step];
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
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : isActive 
                            ? 'bg-blue-500' 
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-sm font-medium text-white">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            isActive ? 'text-blue-900 dark:text-blue-100' : isCompleted ? 'text-green-900 dark:text-green-100' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {config.title}
                          </h3>
                          <p className={`text-xs mb-2 ${
                            isActive ? 'text-blue-600 dark:text-blue-300' : isCompleted ? 'text-green-600 dark:text-green-300' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {config.description}
                          </p>
                          {/* Feature List */}
                          <div className="space-y-1">
                            {config.features.slice(0, 2).map((feature, idx) => (
                              <div key={idx} className={`flex items-center text-xs ${
                                isActive ? 'text-blue-700 dark:text-blue-200' : isCompleted ? 'text-green-700 dark:text-green-200' : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                <div className={`w-1 h-1 rounded-full mr-2 ${
                                  isActive ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-slate-400'
                                }`}></div>
                                <span>{feature}</span>
                              </div>
                            ))}
                            {config.features.length > 2 && (
                              <div className={`text-xs ${
                                isActive ? 'text-blue-600 dark:text-blue-300' : isCompleted ? 'text-green-600 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                +{config.features.length - 2} more features
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Artifacts Panel */}
            {artifacts.length > 0 && (
              <div className="mt-6 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Generated Artifacts ({artifacts.length})
                </h3>
                <div className="space-y-2">
                  {artifacts.slice(-3).map((artifact) => (
                    <div
                      key={artifact.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-slate-200 dark:border-slate-600 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium truncate text-slate-900 dark:text-slate-100">{artifact.name}</span>
                      </div>
                      <button
                        onClick={() => downloadArtifact(artifact)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {artifacts.length > 3 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                      +{artifacts.length - 3} more artifacts
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
                    <span className="text-lg font-bold text-white">
                      {steps.indexOf(currentStep) + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {STEPS[currentStep].title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {STEPS[currentStep].description}
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
                  {/* Step-specific content - Using proper step components */}
                {currentStep === 'environment' && (
                  <EnvironmentSetupStep 
                    wizardType="migration"
                    onComplete={(artifact) => {
                      console.log('EnvironmentSetupStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'plan' && (
                  <div className="space-y-6">
                    <UserAgreementComponent 
                      onComplete={(approved) => {
                        console.log('UserAgreement completed:', approved);
                        setUserAgreementApproved(approved);
                        // Log audit event
                        const auditEvent = {
                          id: `evt-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          eventType: 'migration',
                          action: approved ? 'user_agreement_approved' : 'user_agreement_rejected',
                          resourceType: 'migration_plan',
                          userId: 'user-001',
                          userName: 'john.doe@company.com',
                          success: approved,
                          details: { agreementStatus: approved ? 'approved' : 'rejected' }
                        };
                        logAuditEvent(auditEvent);
                      }}
                    />
                    <SecurityStatusComponent 
                      onSecurityValidated={(validated) => {
                        console.log('Security validated:', validated);
                        setSecurityValidated(validated);
                        // Log audit event
                        const auditEvent = {
                          id: `evt-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          eventType: 'security',
                          action: 'security_protocols_validated',
                          resourceType: 'security_protocols',
                          success: validated,
                          details: { securityStatus: validated ? 'all_protocols_active' : 'issues_detected' }
                        };
                        logAuditEvent(auditEvent);
                      }}
                      onRefresh={() => {
                        console.log('Refreshing security protocols...');
                        // Log audit event
                        const auditEvent = {
                          id: `evt-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          eventType: 'system',
                          action: 'security_protocols_refreshed',
                          resourceType: 'security_protocols',
                          success: true,
                          details: { action: 'manual_refresh' }
                        };
                        setAuditEvents(prev => [auditEvent, ...prev]);
                      }}
                    />
                    <ProcessCatalogComponent 
                      onAssetSelect={(asset) => {
                        console.log('Asset selected:', asset);
                        // Log audit event
                        const auditEvent = {
                          id: `evt-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          eventType: 'migration',
                          action: 'asset_selected',
                          resourceType: 'discovered_asset',
                          resourceId: asset.id,
                          success: true,
                          details: { assetType: asset.type, assetName: asset.name }
                        };
                        setAuditEvents(prev => [auditEvent, ...prev]);
                      }}
                      onExport={() => {
                        console.log('Exporting catalog...');
                        // Log audit event
                        const auditEvent = {
                          id: `evt-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          eventType: 'migration',
                          action: 'asset_catalog_exported',
                          resourceType: 'asset_catalog',
                          success: true,
                          details: { exportFormat: 'json', assetCount: discoveredResources.length }
                        };
                        setAuditEvents(prev => [auditEvent, ...prev]);
                      }}
                    />
                    <MigrationAuditComponent 
                      events={auditEvents}
                      onExportLogs={() => {
                        console.log('Exporting audit logs...');
                        // Create downloadable audit log export
                        const exportData = {
                          exportDate: new Date().toISOString(),
                          eventCount: auditEvents.length,
                          events: auditEvents
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `migration-audit-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      onEventSelect={(event) => {
                        console.log('Audit event selected:', event);
                      }}
                    />
                    {userAgreementApproved && securityValidated && (
                      <PlanStep 
                        onComplete={(artifact) => {
                          console.log('PlanStep completed with artifact:', artifact);
                          // Log audit event
                          const auditEvent = {
                            id: `evt-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            eventType: 'migration',
                            action: 'migration_plan_completed',
                            resourceType: 'migration_plan',
                            userId: 'user-001',
                            userName: 'john.doe@company.com',
                            success: true,
                            details: { 
                              artifactGenerated: true,
                              artifactName: artifact?.name,
                              securityValidated: true,
                              userAgreementApproved: true
                            }
                          };
                          setAuditEvents(prev => [auditEvent, ...prev]);
                          handleStepComplete(currentStep, artifact);
                        }}
                      />
                    )}
                    {(!userAgreementApproved || !securityValidated) && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Prerequisites Required</span>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          Please complete user agreements and ensure all security protocols are validated before proceeding with the migration plan.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 'specify' && (
                  <SpecifyStep 
                    resources={discoveredResources.length > 0 ? discoveredResources : [
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
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'test' && (
                  <TestStep 
                    onComplete={(artifact) => {
                      console.log('TestStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'build' && (
                  <BuildStep 
                    onComplete={(artifact) => {
                      console.log('BuildStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'transfer' && (
                  <TransferStep 
                    onComplete={(artifact) => {
                      console.log('TransferStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'validate' && (
                  <ValidateStep 
                    onComplete={(artifact) => {
                      console.log('ValidateStep completed with artifact:', artifact);
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

                {currentStep === 'support' && (
                  <SupportStep 
                    onComplete={(artifact) => {
                      console.log('SupportStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Artifacts Detail Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Migration Artifacts
              </h2>
              
              {artifacts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No artifacts generated yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Complete migration steps to generate artifacts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {artifacts.map((artifact) => (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{artifact.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{artifact.step} Step</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          {artifact.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{artifact.size}</span>
                        <button
                          onClick={() => downloadArtifact(artifact)}
                          className="flex items-center space-x-1 text-xs bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Migration Progress */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Steps Completed</span>
                    <span>{completedSteps.size}/{steps.length}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {completedSteps.size === steps.length ? 'Migration Complete!' : `${steps.length - completedSteps.size} steps remaining`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
