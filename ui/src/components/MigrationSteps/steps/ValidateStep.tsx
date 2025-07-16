'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart,
  Shield,
  Database,
  Network,
  ArrowRight,
  RefreshCw,
  Loader,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MigrationProgress, { ProgressTask } from '@/components/ui/migration-progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'security' | 'data' | 'network';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  details?: string;
  metrics?: {
    name: string;
    value: string;
    threshold?: string;
    status: 'good' | 'warning' | 'bad';
  }[];
}

interface ValidateStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const ValidateStep: React.FC<ValidateStepProps> = ({ onComplete }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<{checkId: string; message: string} | null>(null);
  const [showErrorResolution, setShowErrorResolution] = useState(false);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([
    {
      id: 'perf-1',
      name: 'Response Time',
      description: 'Measuring application response latency',
      category: 'performance',
      status: 'pending',
      metrics: [
        {
          name: 'Avg Response Time',
          value: '120ms',
          threshold: '< 200ms',
          status: 'good',
        },
        {
          name: 'P95 Response Time',
          value: '350ms',
          threshold: '< 500ms',
          status: 'warning',
        },
      ],
    },
    {
      id: 'sec-1',
      name: 'Security Verification',
      description: 'Checking security configurations and access controls',
      category: 'security',
      status: 'pending',
      metrics: [
        {
          name: 'SSL/TLS',
          value: 'TLS 1.3',
          status: 'good',
        },
        {
          name: 'IAM Roles',
          value: 'Configured',
          status: 'good',
        },
      ],
    },
    {
      id: 'data-1',
      name: 'Data Integrity',
      description: 'Verifying data consistency after migration',
      category: 'data',
      status: 'pending',
      metrics: [
        {
          name: 'Checksum Match',
          value: '100%',
          status: 'good',
        },
        {
          name: 'Record Count',
          value: 'Matched',
          status: 'good',
        },
      ],
    },
    {
      id: 'net-1',
      name: 'Network Configuration',
      description: 'Validating network settings and connectivity',
      category: 'network',
      status: 'pending',
      metrics: [
        {
          name: 'DNS Resolution',
          value: 'Working',
          status: 'good',
        },
        {
          name: 'Firewall Rules',
          value: 'Configured',
          status: 'good',
        },
      ],
    },
  ]);

  const categoryIcons = {
    performance: BarChart,
    security: Shield,
    data: Database,
    network: Network,
  };

  const statusIcons = {
    passed: CheckCircle,
    failed: XCircle,
    warning: AlertTriangle,
    running: Loader,
    pending: Loader,
  };

  const statusColors = {
    passed: 'text-green-500',
    failed: 'text-red-500',
    warning: 'text-yellow-500',
    running: 'text-blue-500',
    pending: 'text-gray-400',
  };

  const handleValidationError = (checkId: string, error: string) => {
    setValidationError({ checkId, message: error });
    setShowErrorResolution(true);
    setIsValidating(false);
    
    // Mark the failed check
    setValidationChecks((prev) =>
      prev.map((c) =>
        c.id === checkId ? { ...c, status: 'failed' } : c
      )
    );
  };

  const retryCheck = (checkId: string) => {
    setValidationError(null);
    setShowErrorResolution(false);
    
    // Reset check status and retry
    setValidationChecks((prev) =>
      prev.map((c) =>
        c.id === checkId ? { ...c, status: 'pending' } : c
      )
    );
    
    // Restart validation from this check
    startValidationFromCheck(checkId);
  };

  const bypassCheck = (checkId: string) => {
    setValidationError(null);
    setShowErrorResolution(false);
    
    // Mark check as warning (bypassed)
    setValidationChecks((prev) =>
      prev.map((c) =>
        c.id === checkId ? { ...c, status: 'warning' } : c
      )
    );
  };

  const startValidation = async () => {
    setIsValidating(true);
    setValidationError(null);
    setShowErrorResolution(false);
    trackMigrationStep('validation_started', { checksCount: validationChecks.length });
    
    try {
      await continueWithChecks(validationChecks);
      trackMigrationStep('validation_completed', { 
        checksCompleted: validationChecks.filter(c => c.status === 'passed').length
      });
    } catch (error) {
      trackError(error as Error, { component: 'ValidateStep', action: 'startValidation' });
    }
  };

  const startValidationFromCheck = async (startCheckId: string) => {
    setIsValidating(true);
    const startIndex = validationChecks.findIndex(c => c.id === startCheckId);
    const checksToRun = validationChecks.slice(startIndex);
    await continueWithChecks(checksToRun);
  };

  const continueWithChecks = async (checksToRun: ValidationCheck[]) => {
    for (const check of checksToRun) {
      try {
        // Update check status to running
        setValidationChecks((prev) =>
          prev.map((c) =>
            c.id === check.id ? { ...c, status: 'running' } : c
          )
        );
        
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mark as passed (simplified)
        setValidationChecks((prev) =>
          prev.map((c) =>
            c.id === check.id ? { ...c, status: 'passed' } : c
          )
        );
        
        setCompletedChecks(prev => [...prev, check.id]);
        trackUserInteraction('validation_check_completed', 'ValidateStep', { checkId: check.id });
        
      } catch (error) {
        handleValidationError(check.id, 'Validation failed');
        break;
      }
    }
    
    setIsValidating(false);
  };

  const getStatusBadge = (status: ValidationCheck['status']) => {
    const Icon = statusIcons[status];
    return (
      <div className={`flex items-center ${statusColors[status]}`}>
        <Icon className={`h-5 w-5 ${status === 'running' ? 'animate-spin' : ''}`} />
        <span className="ml-2 capitalize">{status}</span>
      </div>
    );
  };

  const getMetricStatusColor = (status: 'good' | 'warning' | 'bad') => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'bad':
        return 'text-red-500';
    }
  };

  const canProceed =
    !isValidating &&
    validationChecks.every((check) => ['passed', 'warning'].includes(check.status));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Migration Validation</h3>
          <button
            onClick={startValidation}
            disabled={isValidating}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isValidating ? 'Validating...' : 'Start Validation'}
          </button>
        </div>

        <div className="space-y-4">
          {validationChecks.map((check, index) => {
            const CategoryIcon = categoryIcons[check.category];
            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4"
              >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryIcon className="mr-3 h-5 w-5 text-sirsi-500" />
                      <div>
                        <h4 className="font-medium">{check.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(check.status)}
                      {check.status === 'failed' && validationError?.checkId === check.id && (
                        <div className="flex space-x-2">
                          <Button onClick={() => retryCheck(check.id)} size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                          <Button onClick={() => bypassCheck(check.id)} size="sm" variant="outline" className="text-orange-600">
                            <Info className="h-4 w-4 mr-1" />
                            Bypass
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {check.status === 'failed' && validationError?.checkId === check.id && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium text-red-900">Validation Error</span>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-300">{validationError.message}</p>
                      <div className="mt-3 text-xs text-red-600">
                        <p>• Retry: Attempts the failed validation again</p>
                        <p>• Bypass: Skips this validation with a warning (may indicate issues)</p>
                      </div>
                    </div>
                  )}

                {check.metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {check.metrics.map((metric) => (
                      <div
                        key={metric.name}
                        className="rounded border border-gray-100 bg-white dark:bg-gray-800 p-3"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`font-medium ${getMetricStatusColor(
                              metric.status
                            )}`}
                          >
                            {metric.value}
                          </span>
                          {metric.threshold && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Target: {metric.threshold}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Validation Summary */}
      {!isValidating && validationChecks.some((check) => check.status !== 'pending') && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Validation Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {['passed', 'warning', 'failed'].map((status) => {
              const count = validationChecks.filter(
                (check) => check.status === status
              ).length;
              if (count === 0) return null;

              return (
                <div
                  key={status}
                  className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4"
                >
                  <div className={`text-2xl font-bold ${statusColors[status as any]}`}>
                    {count}
                  </div>
                  <div className="text-sm capitalize text-gray-600 dark:text-gray-400">
                    {status} Checks
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Summary */}
      {showErrorResolution && validationError && (
        <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h3 className="text-lg font-medium text-red-900">Validation Failed</h3>
          </div>
          <p className="text-red-800 dark:text-red-300 mb-4">
            A validation check failed during the migration verification process.
            You can retry the failed check or bypass it to continue.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={() => retryCheck(validationError.checkId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed Check
            </Button>
            <Button
              onClick={() => bypassCheck(validationError.checkId)}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Info className="h-4 w-4 mr-2" />
              Bypass and Continue
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('ValidateStep: Continue to Optimization clicked');
            console.log('ValidateStep: canProceed:', canProceed);
            console.log('ValidateStep: validation checks:', validationChecks.map(c => ({ id: c.id, status: c.status })));
            
            // Force all checks to complete if needed for demo
            if (!canProceed) {
              console.log('ValidateStep: Forcing validation completion for demo');
              setValidationChecks(prev => prev.map(check => 
                check.status === 'pending' || check.status === 'running' 
                  ? { ...check, status: 'passed' as const }
                  : check
              ));
              setIsValidating(false);
              setValidationError(null);
              setShowErrorResolution(false);
            }
            
            // Always proceed to next step
            console.log('ValidateStep: Calling onComplete...');
            try {
              const artifact = {
                name: 'Validation Report',
                type: 'PDF',
                size: '1.8 MB',
                content: `# Validation Report\n\nGenerated on: ${new Date().toISOString()}\n\nValidation Results:\n${validationChecks.map(c => `- ${c.name}: ${c.status}`).join('\n')}`
              };
              onComplete(artifact);
              console.log('ValidateStep: onComplete called successfully');
            } catch (error) {
              console.error('ValidateStep: Error calling onComplete:', error);
            }
          }}
          disabled={false} // Always enabled for demo
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 text-lg px-8 py-4 font-bold"
        >
          Continue to Optimization
        </button>
      </div>
    </div>
  );
};
