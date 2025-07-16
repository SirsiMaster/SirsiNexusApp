'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BarChart3,
  Search,
  TrendingUp,
  Settings,
  CheckCircle,
  DollarSign,
  Sparkles,
  Rocket
} from 'lucide-react';

interface OptimizationWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOptimization?: () => void;
}

const optimizationSteps = [
  {
    number: 1,
    title: 'Analyze',
    description: 'Deep dive into your current resource usage and spending patterns.',
    icon: BarChart3,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  },
  {
    number: 2,
    title: 'Discover',
    description: 'Identify optimization opportunities and cost-saving potential.',
    icon: Search,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
  },
  {
    number: 3,
    title: 'Recommend',
    description: 'Generate tailored recommendations for your infrastructure.',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  },
  {
    number: 4,
    title: 'Configure',
    description: 'Set up automated policies and optimization rules.',
    icon: Settings,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    number: 5,
    title: 'Validate',
    description: 'Test optimizations in a safe environment before applying.',
    icon: CheckCircle,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
  },
  {
    number: 6,
    title: 'Optimize',
    description: 'Apply optimizations and monitor the improvements.',
    icon: DollarSign,
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30'
  }
];

export const OptimizationWelcomeModal: React.FC<OptimizationWelcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartOptimization 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white dark:bg-gray-800/80 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] glass-ultra shadow-intense rounded-xl overflow-hidden text-slate-800 dark:text-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-300 dark:border-slate-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Welcome to Resource Optimization!
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white dark:bg-gray-800/20 dark:hover:bg-black/20 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6">
                <p className="text-lg text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Great choice! I&apos;ll help you optimize your cloud resources to reduce costs and improve performance. Let&apos;s make your infrastructure more efficient.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  Here&apos;s how our 6-step optimization process works:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizationSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: step.number * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors bg-white dark:bg-gray-800/60 dark:bg-black/20"
                      >
                        <div className={`p-3 rounded-lg ${step.color} flex-shrink-0`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {step.number}. {step.title}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-300 dark:border-slate-600">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                >
                  SKIP TUTORIAL
                </button>
                <button
                  onClick={() => {
                    onStartOptimization?.();
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-all"
                >
                  <Rocket className="h-5 w-5" />
                  START OPTIMIZATION
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
