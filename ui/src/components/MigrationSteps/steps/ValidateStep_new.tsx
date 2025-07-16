'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  BarChart,
  Shield,
  Database,
  Network,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import MigrationProgress, { ProgressTask } from '@/components/ui/migration-progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface ValidateStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const ValidateStep: React.FC<ValidateStepProps> = ({ onComplete }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);
  const [validationTasks, setValidationTasks] = useState<ProgressTask[]>([
    {
      id: 'performance',
      name: 'Performance Testing',
      description: 'Measuring application response times and throughput',
      icon: BarChart,
      estimatedTime: '3-4 minutes',
      color: 'from-blue-500 to-cyan-600',
      status: 'pending'
    },
    {
      id: 'security',
      name: 'Security Validation',
      description: 'Verifying security configurations and access controls',
      icon: Shield,
      estimatedTime: '2-3 minutes',
      color: 'from-red-500 to-orange-600',
      status: 'pending'
    },
    {
      id: 'data',
      name: 'Data Integrity Check',
      description: 'Validating data consistency and completeness',
      icon: Database,
      estimatedTime: '4-5 minutes',
      color: 'from-green-500 to-emerald-600',
      status: 'pending'
    },
    {
      id: 'network',
      name: 'Network Connectivity',
      description: 'Testing network configurations and routing',
      icon: Network,
      estimatedTime: '2-3 minutes',
      color: 'from-purple-500 to-indigo-600',
      status: 'pending'
    }
  ]);

  const startValidation = async () => {
    setIsValidating(true);
    setCompletedChecks([]);
    trackMigrationStep('validation_started', { taskCount: validationTasks.length });

    for (const task of validationTasks) {
      try {
        // Set task as running
        setValidationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'running' } : t));

        // Simulate validation process with progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setValidationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, progress } : t));
        }

        // Set task as completed
        setValidationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t));
        setCompletedChecks(prev => [...prev, task.id]);

        trackUserInteraction('validation_task_completed', 'ValidateStep', { taskId: task.id });

      } catch (error) {
        trackError(new Error('Validation failed for ' + task.id), {
          component: 'ValidateStep',
          resource: task.id
        });

        // Mark task as failed
        setValidationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'failed', error: 'Validation failed' } : t));
      }
    }

    trackMigrationStep('validation_completed', { completedCount: completedChecks.length });
    setIsValidating(false);
  };

  const canProceed = completedChecks.length === validationTasks.length;

  return (
    <div className="space-y-6">
      <MigrationProgress
        tasks={validationTasks}
        isRunning={isValidating}
        currentTaskId={isValidating ? validationTasks.find(t => t.status === 'running')?.id : undefined}
        onStart={startValidation}
        startButtonText="Start Validation"
      />

      {completedChecks.length > 0 && (
        <Card className="p-6 glass">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">Validation Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completedChecks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Validation Tests</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">
                {Math.round((completedChecks.length / validationTasks.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Validation Report',
              type: 'LOG',
              size: '6.5 MB',
              content: `# Validation Report\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Checks:\n${completedChecks.map(id => `- ${id}: validated`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-green-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
          Continue to Optimization
        </button>
      </div>
    </div>
  );
};
