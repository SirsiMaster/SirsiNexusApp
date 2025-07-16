'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Zap,
  Leaf,
  Settings,
  Target,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import MigrationProgress, { ProgressTask } from '@/components/ui/migration-progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface OptimizeStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const OptimizeStep: React.FC<OptimizeStepProps> = ({ onComplete }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [completedOptimizations, setCompletedOptimizations] = useState<string[]>([]);
  const [optimizationTasks, setOptimizationTasks] = useState<ProgressTask[]>([
    {
      id: 'performance',
      name: 'Performance Optimization',
      description: 'Optimizing CPU, memory, and resource utilization',
      icon: TrendingUp,
      estimatedTime: '5-7 minutes',
      color: 'from-blue-500 to-cyan-600',
      status: 'pending'
    },
    {
      id: 'cost',
      name: 'Cost Optimization',
      description: 'Right-sizing resources and implementing cost controls',
      icon: DollarSign,
      estimatedTime: '3-4 minutes',
      color: 'from-green-500 to-emerald-600',
      status: 'pending'
    },
    {
      id: 'automation',
      name: 'Automation Setup',
      description: 'Implementing automated scaling and monitoring',
      icon: Zap,
      estimatedTime: '4-5 minutes',
      color: 'from-yellow-500 to-orange-600',
      status: 'pending'
    },
    {
      id: 'sustainability',
      name: 'Sustainability Optimization',
      description: 'Reducing carbon footprint and energy consumption',
      icon: Leaf,
      estimatedTime: '3-4 minutes',
      color: 'from-emerald-500 to-teal-600',
      status: 'pending'
    },
    {
      id: 'configuration',
      name: 'Configuration Tuning',
      description: 'Fine-tuning application and infrastructure settings',
      icon: Settings,
      estimatedTime: '4-6 minutes',
      color: 'from-purple-500 to-indigo-600',
      status: 'pending'
    }
  ]);

  const startOptimization = async () => {
    setIsOptimizing(true);
    setCompletedOptimizations([]);
    trackMigrationStep('optimization_started', { taskCount: optimizationTasks.length });

    for (const task of optimizationTasks) {
      try {
        // Set task as running
        setOptimizationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'running' } : t));

        // Simulate optimization process with progress
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setOptimizationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, progress } : t));
        }

        // Set task as completed
        setOptimizationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t));
        setCompletedOptimizations(prev => [...prev, task.id]);

        trackUserInteraction('optimization_task_completed', 'OptimizeStep', { taskId: task.id });

      } catch (error) {
        trackError(new Error('Optimization failed for ' + task.id), {
          component: 'OptimizeStep',
          resource: task.id
        });

        // Mark task as failed
        setOptimizationTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'failed', error: 'Optimization failed' } : t));
      }
    }

    trackMigrationStep('optimization_completed', { completedCount: completedOptimizations.length });
    setIsOptimizing(false);
  };

  const canProceed = completedOptimizations.length === optimizationTasks.length;

  return (
    <div className="space-y-6">
      <MigrationProgress
        tasks={optimizationTasks}
        isRunning={isOptimizing}
        currentTaskId={isOptimizing ? optimizationTasks.find(t => t.status === 'running')?.id : undefined}
        onStart={startOptimization}
        startButtonText="Start Optimization"
      />

      {completedOptimizations.length > 0 && (
        <Card className="p-6 glass">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">Optimization Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completedOptimizations.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Optimizations Applied</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">25%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost Reduction</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-blue-500">30%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Performance Gain</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Optimization Report',
              type: 'LOG',
              size: '8.2 MB',
              content: `# Optimization Report\n\nGenerated on: ${new Date().toISOString()}\n\nApplied Optimizations:\n${completedOptimizations.map(id => `- ${id}: optimized`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
          Continue to Support
        </button>
      </div>
    </div>
  );
};
