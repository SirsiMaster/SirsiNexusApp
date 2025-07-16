'use client';

import React, { useState } from 'react';
import {
  ArrowRight, Database, Server, HardDrive, Network, Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import MigrationProgress, { ProgressTask } from '@/components/ui/migration-progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface TransferStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const TransferStep: React.FC<TransferStepProps> = ({ onComplete }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [transferTasks, setTransferTasks] = useState<ProgressTask[]>([
    { 
      id: 'database',
      name: 'Database Migration',
      description: 'Migrating production database with zero downtime',
      icon: Database,
      estimatedTime: '10-12 minutes',
      color: 'from-teal-500 to-green-600',
      status: 'pending'
    },
    { 
      id: 'appserver',
      name: 'Application Server',
      description: 'Transferring application servers and configurations',
      icon: Server,
      estimatedTime: '5-6 minutes',
      color: 'from-purple-500 to-indigo-600',
      status: 'pending'
    },
    { 
      id: 'storage',
      name: 'Storage Systems',
      description: 'Moving storage volumes and backup systems',
      icon: HardDrive,
      estimatedTime: '8-10 minutes',
      color: 'from-orange-500 to-red-600',
      status: 'pending'
    },
    { 
      id: 'network',
      name: 'Network Infrastructure',
      description: 'Reconfiguring network settings and routing',
      icon: Network,
      estimatedTime: '2-3 minutes',
      color: 'from-cyan-500 to-blue-600',
      status: 'pending'
    },
    { 
      id: 'security',
      name: 'Security Policies',
      description: 'Implementing security measures and compliance',
      icon: Shield,
      estimatedTime: '3-4 minutes',
      color: 'from-emerald-500 to-teal-600',
      status: 'pending'
    }
  ]);

  const startTransfer = async () => {
    setIsTransferring(true);
    setCompletedResources([]);
    trackMigrationStep('transfer_started', { resourceCount: transferTasks.length });

    for (const task of transferTasks) {
      try {
        // Mark task as running
        setTransferTasks(tasks => tasks.map(t => 
          t.id === task.id ? { ...t, status: 'running' } : t
        ));
        
        // Simulate realistic transfer with progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setTransferTasks(tasks => tasks.map(t => 
            t.id === task.id ? { ...t, progress } : t
          ));
        }
        
        // Mark task as completed
        setTransferTasks(tasks => tasks.map(t => 
          t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
        ));
        
        setCompletedResources(prev => [...prev, task.id]);
        
        trackUserInteraction('resource_transfer', 'TransferStep', { 
          resourceId: task.id
        });

      } catch (error) {
        trackError(new Error('Transfer failed for ' + task.id), {
          component: 'TransferStep',
          resource: task.id
        });
        setTransferTasks(tasks => tasks.map(t => 
          t.id === task.id ? { ...t, status: 'failed', error: 'Transfer failed' } : t
        ));
      }
    }

    trackMigrationStep('transfer_completed', { completedCount: completedResources.length });
    setIsTransferring(false);
  };

  const canProceed = completedResources.length === transferTasks.length;

  return (
    <div className="space-y-6">
      <MigrationProgress
        tasks={transferTasks}
        isRunning={isTransferring}
        currentTaskId={isTransferring ? transferTasks.find(t => t.status === 'running')?.id : undefined}
        onStart={startTransfer}
        startButtonText="Start Transfer"
      />
      
      {completedResources.length > 0 && (
        <Card className="p-6 glass">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">Transfer Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completedResources.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resources Transferred</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Transfer Execution Log',
              type: 'LOG',
              size: '12.3 MB',
              content: `# Transfer Execution Log\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Resources:\n${completedResources.map(id => `- ${id}: transferred`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
          Continue to Validation
        </button>
      </div>
    </div>
  );
};
