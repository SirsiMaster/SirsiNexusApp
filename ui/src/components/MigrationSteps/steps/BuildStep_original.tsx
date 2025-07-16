'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, XCircle, Play, RefreshCw, Network, Shield, Server, Database, Cloud, Settings, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BuildTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  icon: React.ElementType;
  dependencies?: string[];
}

interface BuildStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const BuildStep: React.FC<BuildStepProps> = ({ onComplete }) => {
  const [tasks, setTasks] = useState<BuildTask[]>([
    {
      id: 'network',
      name: 'Network Configuration',
      description: 'Setting up VPC, subnets, and security groups',
      status: 'pending',
      progress: 0,
      icon: Cloud,
    },
    {
      id: 'storage',
      name: 'Storage Provisioning',
      description: 'Creating and configuring storage volumes',
      status: 'pending',
      progress: 0,
      icon: Database,
      dependencies: ['network'],
    },
    {
      id: 'compute',
      name: 'Compute Resources',
      description: 'Launching and configuring instances',
      status: 'pending',
      progress: 0,
      icon: Server,
      dependencies: ['network', 'storage'],
    },
    {
      id: 'monitoring',
      name: 'Monitoring Setup',
      description: 'Configuring metrics and alerts',
      status: 'pending',
      progress: 0,
      icon: Settings,
      dependencies: ['compute'],
    },
  ]);

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<{ taskId: string; message: string } | null>(null);
  const [showErrorResolution, setShowErrorResolution] = useState(false);

  const handleBuildError = (taskId: string, error: string) => {
    setBuildError({ taskId, message: error });
    setShowErrorResolution(true);
    setIsBuilding(false);
    
    // Mark the failed task
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'failed' } : t
      )
    );
  };

  const retryTask = (taskId: string) => {
    setBuildError(null);
    setShowErrorResolution(false);
    
    // Reset task status and continue building
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'pending', progress: 0 } : t
      )
    );
    
    // Restart build from this task
    startBuildFromTask(taskId);
  };

  const bypassTask = (taskId: string) => {
    setBuildError(null);
    setShowErrorResolution(false);
    
    // Mark task as completed with warning
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      )
    );
    
    // Continue with remaining tasks
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex < tasks.length - 1) {
      const remainingTasks = tasks.slice(taskIndex + 1);
      continueWithTasks(remainingTasks);
    }
  };

  const startBuildFromTask = async (startTaskId: string) => {
    setIsBuilding(true);
    const startIndex = tasks.findIndex(t => t.id === startTaskId);
    const tasksToRun = tasks.slice(startIndex);
    await continueWithTasks(tasksToRun);
  };

  const continueWithTasks = async (tasksToRun: BuildTask[]) => {
    for (const task of tasksToRun) {
      try {
        // Update task status to running
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: 'running' } : t
          )
        );

        // Simulate progress updates with potential failure
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Simulate potential build failures
          if (progress === 50 && Math.random() < 0.25) { // 25% chance of failure at 50%
            const errorMessages = {
              network: 'Failed to create VPC. Insufficient IP address space or conflicting routes detected.',
              storage: 'Storage provisioning failed. Quota exceeded or invalid volume configuration.',
              compute: 'Instance launch failed. Insufficient capacity in selected availability zone.',
              monitoring: 'Monitoring setup failed. CloudWatch permissions or configuration issues.',
            };
            throw new Error(errorMessages[task.id as keyof typeof errorMessages] || 'Unknown build error occurred.');
          }
          
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, progress } : t
            )
          );
        }

        // Mark task as completed
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: 'completed' } : t
          )
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown build error occurred.';
        handleBuildError(task.id, errorMessage);
        return; // Stop building on error
      }
    }
    
    setIsBuilding(false);
  };

  const startBuild = async () => {
    setBuildError(null);
    setShowErrorResolution(false);
    await continueWithTasks(tasks);
  };

  const getStatusIcon = (status: BuildTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader className="h-5 w-5 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  const canProceed = tasks.every((task) => task.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Infrastructure Build */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium dark:text-gray-100">Infrastructure Build</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deploy and configure infrastructure components
            </p>
          </div>
          <button
            onClick={startBuild}
            disabled={isBuilding}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isBuilding ? 'Building...' : 'Start Build'}
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <task.icon className="mr-3 h-5 w-5 text-sirsi-500" />
                  <div>
                    <h4 className="font-medium dark:text-gray-100">{task.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  </div>
                </div>
                {getStatusIcon(task.status)}
                {task.status === 'failed' && buildError?.taskId === task.id && (
                  <div className="flex space-x-2 ml-4">
                    <Button onClick={() => retryTask(task.id)} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                    <Button onClick={() => bypassTask(task.id)} size="sm" variant="outline" className="text-orange-600">
                      <Info className="h-4 w-4 mr-1" />
                      Bypass
                    </Button>
                  </div>
                )}
              </div>

              {task.status !== 'pending' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium dark:text-gray-100">{task.progress}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-600">
                    <motion.div
                      className={`h-full rounded-full ${
                        task.status === 'failed' ? 'bg-red-50 dark:bg-red-900/200' : 'bg-sirsi-500'
                      }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {task.status === 'failed' && buildError?.taskId === task.id && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-900 dark:text-red-400">Build Error</span>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-300">{buildError.message}</p>
                  <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                    <p>• Retry: Attempts the failed task again with current settings</p>
                    <p>• Bypass: Skips this task and continues with a warning (may affect functionality)</p>
                  </div>
                </div>
              )}

              {task.dependencies && task.dependencies.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Dependencies:{' '}
                  {task.dependencies.map((dep, i) => (
                    <span key={dep}>
                      {i > 0 && ', '}
                      {tasks.find((t) => t.id === dep)?.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Error Summary */}
      {showErrorResolution && buildError && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
            <h3 className="text-lg font-medium text-red-900 dark:text-red-400">Build Failed</h3>
          </div>
          <p className="text-red-800 dark:text-red-300 mb-4">
            The infrastructure build encountered an error during the {buildError.taskId} phase.
            You can retry the failed task or bypass it to continue with the migration.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={() => retryTask(buildError.taskId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed Task
            </Button>
            <Button
              onClick={() => bypassTask(buildError.taskId)}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Info className="h-4 w-4 mr-2" />
              Bypass and Continue
            </Button>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('BuildStep: Continue to Transfer clicked');
            console.log('BuildStep: canProceed:', canProceed);
            console.log('BuildStep: tasks:', tasks.map(t => ({ id: t.id, status: t.status })));
            
            // Force all tasks to complete if needed for demo
            if (!canProceed) {
              console.log('BuildStep: Forcing build completion for demo');
              setTasks(prev => prev.map(task => 
                task.status === 'pending' || task.status === 'running' 
                  ? { ...task, status: 'completed' as const, progress: 100 }
                  : task
              ));
              setIsBuilding(false);
              setBuildError(null);
              setShowErrorResolution(false);
            }
            
            // Always proceed to next step
            console.log('BuildStep: Calling onComplete...');
            try {
              const artifact = {
                name: 'Infrastructure Blueprint',
                type: 'YAML',
                size: '45 KB',
                content: `# Infrastructure Blueprint\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Tasks:\n${tasks.map(t => `- ${t.name}: ${t.status}`).join('\n')}`
              };
              onComplete(artifact);
              console.log('BuildStep: onComplete called successfully');
            } catch (error) {
              console.error('BuildStep: Error calling onComplete:', error);
            }
          }}
          disabled={false} // Always enabled for demo
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 text-lg px-8 py-4 font-bold"
        >
          Continue to Transfer
        </button>
      </div>
    </div>
  );
};
