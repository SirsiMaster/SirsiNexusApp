'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Activity,
  Target,
  Zap,
  BarChart,
  Shield,
  CheckCircle,
  Sparkles,
  Rocket
} from 'lucide-react';

interface ScalingWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScaling?: () => void;
}

const scalingSteps = [
  {
    number: 1,
    title: 'Monitor',
    description: 'Set up comprehensive monitoring for your application metrics.',
    icon: Activity,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  },
  {
    number: 2,
    title: 'Define',
    description: 'Establish scaling policies and performance thresholds.',
    icon: Target,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
  },
  {
    number: 3,
    title: 'Configure',
    description: 'Set up auto-scaling groups and load balancing rules.',
    icon: Zap,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    number: 4,
    title: 'Test',
    description: 'Simulate traffic spikes to verify scaling behavior.',
    icon: BarChart,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  },
  {
    number: 5,
    title: 'Protect',
    description: 'Implement safeguards to prevent over-scaling costs.',
    icon: Shield,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    number: 6,
    title: 'Activate',
    description: 'Deploy auto-scaling and monitor performance improvements.',
    icon: CheckCircle,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
  }
];

export const ScalingWelcomeModal: React.FC<ScalingWelcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartScaling 
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
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Welcome to Auto Scaling!
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
                  <span className="text-xl">⚡</span>
                  Excellent! I&apos;ll help you set up intelligent auto-scaling to handle traffic spikes efficiently and cost-effectively.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  Here&apos;s how our 6-step auto-scaling process works:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scalingSteps.map((step) => {
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
                    onStartScaling?.();
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium transition-all"
                >
                  <Rocket className="h-5 w-5" />
                  START AUTO SCALING
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
