'use client';

import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Bug,
  TestTube,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import MigrationProgress, { ProgressTask } from '@/components/ui/migration-progress';
import { trackMigrationStep, trackUserInteraction, trackError } from '@/lib/analytics';

interface TestStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const TestStep: React.FC<TestStepProps> = ({ onComplete }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [testTasks, setTestTasks] = useState<ProgressTask[]>([
    {
      id: 'unit',
      name: 'Unit Testing',
      description: 'Testing individual components and functions',
      icon: TestTube,
      estimatedTime: '4-5 minutes',
      color: 'from-blue-500 to-cyan-600',
      status: 'pending'
    },
    {
      id: 'integration',
      name: 'Integration Testing',
      description: 'Testing component interactions and data flows',
      icon: Target,
      estimatedTime: '6-8 minutes',
      color: 'from-purple-500 to-indigo-600',
      status: 'pending'
    },
    {
      id: 'performance',
      name: 'Performance Testing',
      description: 'Load testing and performance benchmarking',
      icon: Zap,
      estimatedTime: '5-7 minutes',
      color: 'from-yellow-500 to-orange-600',
      status: 'pending'
    },
    {
      id: 'security',
      name: 'Security Testing',
      description: 'Vulnerability scanning and penetration testing',
      icon: Bug,
      estimatedTime: '3-4 minutes',
      color: 'from-red-500 to-pink-600',
      status: 'pending'
    },
    {
      id: 'e2e',
      name: 'End-to-End Testing',
      description: 'Full system workflow and user acceptance testing',
      icon: PlayCircle,
      estimatedTime: '7-10 minutes',
      color: 'from-green-500 to-emerald-600',
      status: 'pending'
    }
  ]);

  const startTesting = async () => {
    setIsTesting(true);
    setCompletedTests([]);
    trackMigrationStep('testing_started', { taskCount: testTasks.length });

    for (const task of testTasks) {
      try {
        // Set task as running
        setTestTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'running' } : t));

        // Simulate testing process with progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 350));
          setTestTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, progress } : t));
        }

        // Set task as completed
        setTestTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t));
        setCompletedTests(prev => [...prev, task.id]);

        trackUserInteraction('test_task_completed', 'TestStep', { taskId: task.id });

      } catch (error) {
        trackError(new Error('Test failed for ' + task.id), {
          component: 'TestStep',
          resource: task.id
        });

        // Mark task as failed
        setTestTasks(tasks => tasks.map(t => t.id === task.id ? { ...t, status: 'failed', error: 'Test failed' } : t));
      }
    }

    trackMigrationStep('testing_completed', { completedCount: completedTests.length });
    setIsTesting(false);
  };

  const canProceed = completedTests.length === testTasks.length;

  return (
    <div className="space-y-6">
      <MigrationProgress
        tasks={testTasks}
        isRunning={isTesting}
        currentTaskId={isTesting ? testTasks.find(t => t.status === 'running')?.id : undefined}
        onStart={startTesting}
        startButtonText="Start Testing"
      />

      {completedTests.length > 0 && (
        <Card className="p-6 glass">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">Test Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completedTests.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Test Suites</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-blue-500">847</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tests Run</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Test Report',
              type: 'LOG',
              size: '4.7 MB',
              content: `# Test Report\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Tests:\n${completedTests.map(id => `- ${id}: passed`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
          Continue to Transfer
        </button>
      </div>
    </div>
  );
};
