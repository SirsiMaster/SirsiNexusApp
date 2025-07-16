'use client';

import React, { useState } from 'react';
import {
  HeartPulse,
  LifeBuoy,
  Settings2,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import MigrationProgress, { ProgressTask } from '@/components/ui/migration-progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface SupportStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const SupportStep: React.FC<SupportStepProps> = ({ onComplete }) => {
  const [isSupporting, setIsSupporting] = useState(false);
  const [completedSupportTasks, setCompletedSupportTasks] = useState<string[]>([]);
  const [supportTasks, setSupportTasks] = useState<ProgressTask[]>([
    {
      id: 'monitoring',
      name: 'Monitoring Setup',
      description: 'Configure performance and error monitoring tools',
      icon: HeartPulse,
      estimatedTime: '6-8 minutes',
      color: 'from-blue-500 to-cyan-600',
      status: 'pending'
    },
    {
      id: 'helpdesk',
      name: 'Helpdesk Integration',
      description: 'Integrate with helpdesk and ticketing systems',
      icon: LifeBuoy,
      estimatedTime: '4-6 minutes',
      color: 'from-purple-500 to-indigo-600',
      status: 'pending'
    },
    {
      id: 'maintenance',
      name: 'Scheduled Maintenance',
      description: 'Plan regular updates and maintenance tasks',
      icon: Settings2,
      estimatedTime: '3-5 minutes',
      color: 'from-yellow-500 to-orange-600',
      status: 'pending'
    },
    {
      id: 'alerting',
      name: 'Alerting System',
      description: 'Set up alerts for anomalies and failures',
      icon: AlertCircle,
      estimatedTime: '5-7 minutes',
      color: 'from-red-500 to-pink-600',
      status: 'pending'
    },
    {
      id: 'documentation',
      name: 'Documentation Update',
      description: 'Ensure all documentation is up-to-date',
      icon: CheckCircle2,
      estimatedTime: '3-4 minutes',
      color: 'from-green-500 to-emerald-600',
      status: 'pending'
    }
  ]);

  const startSupportTasks = async () => {
    setIsSupporting(true);
    setCompletedSupportTasks([]);
    trackMigrationStep('support_started', { taskCount: supportTasks.length });

    for (const task of supportTasks) {
      try {
        // Set task as running
        setSupportTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'running' } : t));

        // Simulate support process with progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setSupportTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, progress } : t));
        }

        // Set task as completed
        setSupportTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t));
        setCompletedSupportTasks(prev => [...prev, task.id]);

        trackUserInteraction('support_task_completed', 'SupportStep', { taskId: task.id });

      } catch (error) {
        trackError(new Error('Support task failed for ' + task.id), {
          component: 'SupportStep',
          resource: task.id
        });

        // Mark task as failed
        setSupportTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'failed', error: 'Support task failed' } : t));
      }
    }

    trackMigrationStep('support_completed', { completedCount: completedSupportTasks.length });
    setIsSupporting(false);
  };

  const canProceed = completedSupportTasks.length === supportTasks.length;

  return (
    <div className="space-y-6">
      <MigrationProgress
        tasks={supportTasks}
        isRunning={isSupporting}
        currentTaskId={isSupporting ? supportTasks.find(t => t.status === 'running')?.id : undefined}
        onStart={startSupportTasks}
        startButtonText="Start Support Tasks"
      />

      {completedSupportTasks.length > 0 && (
        <Card className="p-6 glass">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">Support Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completedSupportTasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Support Tasks</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-blue-500">345</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tickets Linked</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Support Report',
              type: 'LOG',
              size: '3.6 MB',
              content: `# Support Report\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Support Tasks:\n${completedSupportTasks.map(id => `- ${id}: completed`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
          Finish Migration
        </button>
      </div>
    </div>
  );
};
