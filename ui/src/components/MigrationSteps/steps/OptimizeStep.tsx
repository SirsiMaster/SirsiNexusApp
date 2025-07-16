'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Zap,
  Leaf,
  Check,
  BarChart,
  Settings,
  Brain,
  Target,
  Clock
} from 'lucide-react';
import { aiService, type AIRecommendation } from '@/lib/ai-services';
import { trackMigrationStep, trackOptimizationRecommendation, trackUserInteraction, trackError } from '@/lib/analytics';
import ResourceDependencyGraph from '@/components/ui/resource-dependency-graph';

interface Optimization {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'cost' | 'sustainability';
  impact: 'high' | 'medium' | 'low';
  metrics: {
    before: string;
    after: string;
    improvement: string;
  };
  status: 'pending' | 'applied' | 'skipped';
  recommendation: string;
}

interface OptimizeStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const OptimizeStep: React.FC<OptimizeStepProps> = ({ onComplete }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const [optimizations, setOptimizations] = useState<Optimization[]>([
    {
      id: 'perf-1',
      name: 'Instance Right-sizing',
      description: 'Adjust compute resources based on actual usage patterns',
      category: 'performance',
      impact: 'high',
      metrics: {
        before: '4 vCPU, 16GB RAM',
        after: '2 vCPU, 8GB RAM',
        improvement: '50% resource optimization',
      },
      status: 'pending',
      recommendation: 'Current usage patterns show over-provisioning. Reducing resources will maintain performance while reducing costs.',
    },
    {
      id: 'cost-1',
      name: 'Storage Tier Optimization',
      description: 'Move infrequently accessed data to lower-cost storage',
      category: 'cost',
      impact: 'medium',
      metrics: {
        before: '$120/month',
        after: '$75/month',
        improvement: '37.5% cost reduction',
      },
      status: 'pending',
      recommendation: 'Implement lifecycle policies to automatically move older data to cheaper storage tiers.',
    },
    {
      id: 'sust-1',
      name: 'Carbon Footprint Reduction',
      description: 'Optimize workload scheduling for renewable energy usage',
      category: 'sustainability',
      impact: 'high',
      metrics: {
        before: '2.5 tons CO2/year',
        after: '1.8 tons CO2/year',
        improvement: '28% emissions reduction',
      },
      status: 'pending',
      recommendation: 'Schedule non-time-critical workloads during periods of high renewable energy availability.',
    },
    {
      id: 'perf-2',
      name: 'Network Optimization',
      description: 'Implement CDN and optimize data transfer patterns',
      category: 'performance',
      impact: 'medium',
      metrics: {
        before: '150ms latency',
        after: '50ms latency',
        improvement: '66% latency reduction',
      },
      status: 'pending',
      recommendation: 'Deploy CDN endpoints and optimize data transfer patterns for improved performance.',
    },
  ]);

  const categoryIcons = {
    performance: TrendingUp,
    cost: DollarSign,
    sustainability: Leaf,
  };

  const impactColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  };

  const applyOptimizations = async () => {
    setIsOptimizing(true);

    for (const id of selectedOptimizations) {
      // Simulate optimization process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setOptimizations((prev) =>
        prev.map((opt) =>
          opt.id === id ? { ...opt, status: 'applied' } : opt
        )
      );
    }

    // Mark unselected optimizations as skipped
    setOptimizations((prev) =>
      prev.map((opt) =>
        !selectedOptimizations.includes(opt.id)
          ? { ...opt, status: 'skipped' }
          : opt
      )
    );

    setIsOptimizing(false);
  };

  const toggleOptimization = (id: string) => {
    setSelectedOptimizations((prev) =>
      prev.includes(id)
        ? prev.filter((optId) => optId !== id)
        : [...prev, id]
    );
    trackUserInteraction('optimization_toggle', 'OptimizeStep', { optimizationId: id });
  };

  const generateAIRecommendations = async () => {
    setIsLoadingAI(true);
    trackMigrationStep('ai_recommendations_requested');
    
    try {
      const analysis = await aiService.analyzeResources({
        resources: [],
        context: {
          environment: 'optimization'
        }
      });
      
      setAiRecommendations(analysis.recommendations || []);
      trackMigrationStep('ai_recommendations_received', { count: analysis.recommendations?.length || 0 });
    } catch (error) {
      trackError(error as Error, { component: 'OptimizeStep', action: 'generateAIRecommendations' });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium dark:text-gray-100">Resource Optimization</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select optimizations to apply to your migrated resources
            </p>
          </div>
          <button
            onClick={applyOptimizations}
            disabled={isOptimizing || selectedOptimizations.length === 0}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isOptimizing ? 'Optimizing...' : 'Apply Selected'}
          </button>
        </div>

        <div className="space-y-4">
          {optimizations.map((optimization, index) => {
            const CategoryIcon = categoryIcons[optimization.category];
            return (
              <motion.div
                key={optimization.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border p-4 ${
                  selectedOptimizations.includes(optimization.id)
                    ? 'border-sirsi-500 bg-sirsi-50 dark:bg-sirsi-900/20'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4">
                      <input
                        type="checkbox"
                        checked={selectedOptimizations.includes(optimization.id)}
                        onChange={() => toggleOptimization(optimization.id)}
                        disabled={optimization.status !== 'pending'}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-sirsi-500 focus:ring-sirsi-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <CategoryIcon className="mr-2 h-5 w-5 text-sirsi-500" />
                        <h4 className="font-medium dark:text-gray-100">{optimization.name}</h4>
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs ${
                            impactColors[optimization.impact]
                          }`}
                        >
                          {optimization.impact} impact
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {optimization.description}
                      </p>
                    </div>
                  </div>
                  {optimization.status !== 'pending' && (
                    <span
                      className={`flex items-center rounded-full px-2 py-1 text-xs ${
                        optimization.status === 'applied'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {optimization.status === 'applied' && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {optimization.status}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="rounded border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Before</div>
                    <div className="mt-1 font-medium dark:text-gray-100">
                      {optimization.metrics.before}
                    </div>
                  </div>
                  <div className="rounded border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">After</div>
                    <div className="mt-1 font-medium dark:text-gray-100">
                      {optimization.metrics.after}
                    </div>
                  </div>
                  <div className="rounded border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Improvement</div>
                    <div className="mt-1 font-medium text-green-500">
                      {optimization.metrics.improvement}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
                  <Settings className="mr-2 mt-0.5 h-4 w-4 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {optimization.recommendation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Optimization Summary */}
      {optimizations.some((opt) => opt.status !== 'pending') && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium dark:text-gray-100">Optimization Impact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-sirsi-500" />
                <h4 className="font-medium dark:text-gray-100">Performance</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-sirsi-500">58%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average improvement</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-sirsi-500" />
                <h4 className="font-medium dark:text-gray-100">Cost Savings</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-sirsi-500">
                $45/mo
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projected savings</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4">
              <div className="flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-sirsi-500" />
                <h4 className="font-medium dark:text-gray-100">Sustainability</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-sirsi-500">
                0.7 tons
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ reduction/year</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('OptimizeStep: Continue to Support clicked');
            console.log('OptimizeStep: optimizations:', optimizations.map(o => ({ id: o.id, status: o.status })));
            
            // Force all optimizations to complete if needed for demo
            if (optimizations.some((opt) => opt.status === 'pending')) {
              console.log('OptimizeStep: Forcing optimization completion for demo');
              setOptimizations(prev => prev.map(opt => 
                opt.status === 'pending' 
                  ? { ...opt, status: 'applied' as const }
                  : opt
              ));
              setIsOptimizing(false);
            }
            
            // Always proceed to next step
            console.log('OptimizeStep: Calling onComplete...');
            try {
              const artifact = {
                name: 'Optimization Recommendations',
                type: 'JSON',
                size: '234 KB',
                content: `# Optimization Recommendations\n\nGenerated on: ${new Date().toISOString()}\n\nOptimizations Applied:\n${optimizations.map(o => `- ${o.name}: ${o.status}`).join('\n')}`
              };
              onComplete(artifact);
              console.log('OptimizeStep: onComplete called successfully');
            } catch (error) {
              console.error('OptimizeStep: Error calling onComplete:', error);
            }
          }}
          disabled={false} // Always enabled for demo
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 text-lg px-8 py-4 font-bold"
        >
          Continue to Support
        </button>
      </div>
    </div>
  );
};
