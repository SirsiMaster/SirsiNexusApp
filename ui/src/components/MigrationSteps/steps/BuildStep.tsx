// @refresh reset
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  CheckCircle,
  Loader,
  Cloud,
  Database,
  Server,
  Shield,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface BuildStepProps {
  onComplete: (artifact?: { name: string; type: string; size: string; content?: string }) => void;
}

export const BuildStep: React.FC<BuildStepProps> = ({ onComplete }) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const buildTasks = [
    {
      id: 'network',
      name: 'Network Configuration',
      description: 'Setting up VPCs, subnets, and security groups',
      icon: Cloud,
      estimatedTime: '2-3 minutes',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'storage',
      name: 'Storage Provisioning',
      description: 'Configuring databases, volumes, and backups',
      icon: Database,
      estimatedTime: '3-4 minutes',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'compute',
      name: 'Compute Resources',
      description: 'Deploying servers, containers, and load balancers',
      icon: Server,
      estimatedTime: '4-5 minutes',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'security',
      name: 'Security & Compliance',
      description: 'Implementing security policies and compliance checks',
      icon: Shield,
      estimatedTime: '2-3 minutes',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'monitoring',
      name: 'Monitoring & Observability',
      description: 'Setting up logging, metrics, and alerting',
      icon: Activity,
      estimatedTime: '2-3 minutes',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const startBuilding = async () => {
    setIsBuilding(true);
    setCompletedTasks([]);
    trackMigrationStep('build_started', { tasksCount: buildTasks.length });

    try {
      for (const task of buildTasks) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setCompletedTasks((prev) => [...prev, task.id]);
        trackUserInteraction('build_task_completed', 'BuildStep', { taskId: task.id });
      }
      trackMigrationStep('build_completed', { tasksCompleted: buildTasks.length });
    } catch (error) {
      trackError(error as Error, { component: 'BuildStep', action: 'startBuilding' });
    } finally {
      setIsBuilding(false);
    }
  };

  const canProceed = completedTasks.length === buildTasks.length;

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Infrastructure Build</h3>
            <p className="text-md text-slate-600 dark:text-slate-400">
              Deploy and configure infrastructure components using advanced automation
            </p>
          </div>
          <button
            onClick={startBuilding}
            disabled={isBuilding}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isBuilding ? <Loader className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5" />}
            {isBuilding ? 'Building...' : 'Start Build'}
            {isBuilding && <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buildTasks.map((task) => {
            const Icon = task.icon;
            const isCompleted = completedTasks.includes(task.id);
            const isCurrent = isBuilding && completedTasks[completedTasks.length - 1] === task.id;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl shadow border-0 glass bg-gradient-to-r ${task.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{task.name}</h4>
                      <p className="text-sm text-white/80">{task.description}</p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  ) : isCurrent ? (
                    <Loader className="h-6 w-6 animate-spin text-blue-400" />
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={isCompleted ? 100 : isCurrent ? 50 : 0}
                    className="w-full h-2 bg-white/20 rounded-full"
                  />
                  <span className="text-xs font-medium text-white/80">{task.estimatedTime}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end mt-8">
        <button
          onClick={() => {
            const artifact = {
              name: 'Build Log',
              type: 'LOG',
              size: '1 MB',
              content: `# Build Log\n\nCompleted Tasks:\n${completedTasks.map(
                (id) => `- ${id}: completed`
              ).join('\n')}`,
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
          Continue
        </button>
      </div>
    </div>
  );
};

