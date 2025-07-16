'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  MessageSquare,
  FileText,
  PieChart,
  RefreshCw,
  PlayCircle,
  Settings,
  Check,
} from 'lucide-react';

interface MonitoringConfig {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'configured' | 'error';
  options: {
    name: string;
    value: string;
    enabled: boolean;
  }[];
}

interface SupportStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const SupportStep: React.FC<SupportStepProps> = ({ onComplete }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configs, setConfigs] = useState<MonitoringConfig[]>([
    {
      id: 'alerts',
      name: 'Alert Configuration',
      description: 'Set up monitoring alerts and notifications',
      status: 'pending',
      options: [
        {
          name: 'Performance Alerts',
          value: 'High CPU/Memory usage, Latency spikes',
          enabled: true,
        },
        {
          name: 'Cost Alerts',
          value: 'Budget thresholds, Unusual spending',
          enabled: true,
        },
        {
          name: 'Security Alerts',
          value: 'Access attempts, Configuration changes',
          enabled: true,
        },
      ],
    },
    {
      id: 'reports',
      name: 'Automated Reports',
      description: 'Schedule periodic performance and cost reports',
      status: 'pending',
      options: [
        {
          name: 'Daily Summary',
          value: 'Basic health and performance metrics',
          enabled: true,
        },
        {
          name: 'Weekly Analysis',
          value: 'Detailed usage patterns and trends',
          enabled: true,
        },
        {
          name: 'Monthly Review',
          value: 'Comprehensive cost and optimization report',
          enabled: true,
        },
      ],
    },
    {
      id: 'backup',
      name: 'Backup & Recovery',
      description: 'Configure automated backup schedules',
      status: 'pending',
      options: [
        {
          name: 'Daily Backups',
          value: 'Incremental backups with 7-day retention',
          enabled: true,
        },
        {
          name: 'Weekly Backups',
          value: 'Full backups with 30-day retention',
          enabled: true,
        },
        {
          name: 'Disaster Recovery',
          value: 'Cross-region backup replication',
          enabled: true,
        },
      ],
    },
    {
      id: 'optimization',
      name: 'Ongoing Optimization',
      description: 'Continuous resource sizing, scaling, and cost management',
      status: 'pending',
      options: [
        {
          name: 'Predictive Scaling',
          value: 'ML-based autoscaling recommendations and automated adjustments',
          enabled: true,
        },
        {
          name: 'Cost Optimization',
          value: 'Real-time cost analysis with optimization suggestions',
          enabled: true,
        },
        {
          name: 'Resource Right-sizing',
          value: 'Automated instance type and configuration recommendations',
          enabled: true,
        },
        {
          name: 'Discoverable Pricing',
          value: 'Live pricing feeds from cloud providers with predictable cost estimates',
          enabled: true,
        },
      ],
    },
  ]);

  const configureSupport = async () => {
    setIsConfiguring(true);

    for (const config of configs) {
      // Simulate configuration process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setConfigs((prev) =>
        prev.map((c) =>
          c.id === config.id ? { ...c, status: 'configured' } : c
        )
      );
    }

    setIsConfiguring(false);
  };

  const toggleOption = (configId: string, optionName: string) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              options: config.options.map((opt) =>
                opt.name === optionName
                  ? { ...opt, enabled: !opt.enabled }
                  : opt
              ),
            }
          : config
      )
    );
  };

  const getConfigIcon = (id: string) => {
    switch (id) {
      case 'alerts':
        return Bell;
      case 'reports':
        return FileText;
      case 'backup':
        return RefreshCw;
      default:
        return Settings;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Support & Monitoring</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure ongoing support and monitoring for your migrated resources
            </p>
          </div>
          <button
            onClick={configureSupport}
            disabled={isConfiguring}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isConfiguring ? 'Configuring...' : 'Configure Support'}
          </button>
        </div>

        <div className="space-y-4">
          {configs.map((config, index) => {
            const Icon = getConfigIcon(config.id);
            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 text-sirsi-500" />
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
                    </div>
                  </div>
                  {config.status === 'configured' && (
                    <span className="flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs text-green-800 dark:text-green-300">
                      <Check className="mr-1 h-3 w-3" />
                      Configured
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {config.options.map((option) => (
                    <div
                      key={option.name}
                      className="flex items-start rounded border border-gray-100 bg-white dark:bg-gray-800 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={option.enabled}
                        onChange={() => toggleOption(config.id, option.name)}
                        disabled={config.status === 'configured'}
                        className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-sirsi-500 focus:ring-sirsi-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-gray-600 dark:text-gray-400 hover:border-sirsi-500 hover:text-sirsi-500">
          <MessageSquare className="mr-2 h-5 w-5" />
          <span>Contact Support</span>
        </button>
        <button className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-gray-600 dark:text-gray-400 hover:border-sirsi-500 hover:text-sirsi-500">
          <PieChart className="mr-2 h-5 w-5" />
          <span>View Dashboard</span>
        </button>
        <button className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-gray-600 dark:text-gray-400 hover:border-sirsi-500 hover:text-sirsi-500">
          <PlayCircle className="mr-2 h-5 w-5" />
          <span>Watch Tutorial</span>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('SupportStep: Complete Migration clicked');
            console.log('SupportStep: configs:', configs.map(c => ({ id: c.id, status: c.status })));
            
            // Force all configs to complete if needed for demo
            if (configs.some((c) => c.status !== 'configured')) {
              console.log('SupportStep: Forcing configuration completion for demo');
              setConfigs(prev => prev.map(config => 
                config.status !== 'configured' 
                  ? { ...config, status: 'configured' as const }
                  : config
              ));
              setIsConfiguring(false);
            }
            
            // Always proceed to complete migration
            console.log('SupportStep: Calling onComplete...');
            try {
              const artifact = {
                name: 'Support Playbook',
                type: 'PDF',
                size: '3.2 MB',
                content: `# Support Playbook\n\nGenerated on: ${new Date().toISOString()}\n\nConfigured Support:\n${configs.map(c => `- ${c.name}: ${c.status}`).join('\n')}`
              };
              onComplete(artifact);
              console.log('SupportStep: Migration completed successfully!');
            } catch (error) {
              console.error('SupportStep: Error calling onComplete:', error);
            }
          }}
          disabled={false} // Always enabled for demo
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 text-lg px-8 py-4 font-bold"
        >
          Complete Migration
        </button>
      </div>
    </div>
  );
};
