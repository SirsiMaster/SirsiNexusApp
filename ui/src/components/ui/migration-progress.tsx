'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface ProgressTask {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
  color: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

interface MigrationProgressProps {
  tasks: ProgressTask[];
  isRunning: boolean;
  currentTaskId?: string;
  onStart?: () => void;
  onRetry?: (taskId: string) => void;
  startButtonText?: string;
  className?: string;
}

export const MigrationProgress: React.FC<MigrationProgressProps> = ({
  tasks,
  isRunning,
  currentTaskId,
  onStart,
  onRetry,
  startButtonText = 'Start Process',
  className = ''
}) => {
  const getStatusIcon = (task: ProgressTask) => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'running':
        return <Loader className="h-6 w-6 animate-spin text-blue-400" />;
      case 'failed':
        return <AlertTriangle className="h-6 w-6 text-red-400" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getProgressValue = (task: ProgressTask) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'running') return task.progress || 50;
    if (task.status === 'failed') return 0;
    return 0;
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Process Progress
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        
        {onStart && (
          <button
            onClick={onStart}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isRunning ? <Loader className="animate-spin h-5 w-5" /> : null}
            {isRunning ? 'Processing...' : startButtonText}
            {isRunning && <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />}
          </button>
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => {
          const Icon = task.icon;
          const isCurrent = currentTaskId === task.id;
          const progressValue = getProgressValue(task);

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl shadow border-0 glass bg-gradient-to-r ${task.color} ${
                isCurrent ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}
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
                <div className="flex flex-col items-end">
                  {getStatusIcon(task)}
                  {task.status === 'failed' && onRetry && (
                    <button
                      onClick={() => onRetry(task.id)}
                      className="mt-2 text-xs text-white/80 hover:text-white underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <Progress
                  value={progressValue}
                  className="w-full h-2 bg-white/20 rounded-full"
                />
                <span className="text-xs font-medium text-white/80 whitespace-nowrap">
                  {task.estimatedTime}
                </span>
              </div>

              {task.status === 'running' && (
                <div className="text-xs text-white/80">
                  {Math.round(progressValue)}% complete
                </div>
              )}

              {task.error && (
                <div className="text-xs text-red-200 mt-1">
                  Error: {task.error}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MigrationProgress;
