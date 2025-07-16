'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Cloud,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PathSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (path: 'migration' | 'optimization' | 'scaling') => void;
}

const journeyOptions = [
  {
    id: 'migration' as const,
    title: 'Cloud Migration',
    description: 'Move your infrastructure to the cloud with confidence',
    longDescription: 'Migrate your on-premises systems to AWS, Azure, or GCP with our proven 7-step process.',
    icon: Cloud,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-900 dark:text-blue-100',
    subtextColor: 'text-blue-700 dark:text-blue-300'
  },
  {
    id: 'optimization' as const,
    title: 'Resource Optimization',
    description: 'Optimize your cloud resources for cost and performance',
    longDescription: 'Analyze and optimize your existing cloud infrastructure to reduce costs and improve performance.',
    icon: TrendingUp,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-900 dark:text-green-100',
    subtextColor: 'text-green-700 dark:text-green-300'
  },
  {
    id: 'scaling' as const,
    title: 'Auto Scaling',
    description: 'Scale your applications automatically based on demand',
    longDescription: 'Set up intelligent auto-scaling for your applications to handle traffic spikes efficiently.',
    icon: Zap,
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-700',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    subtextColor: 'text-emerald-700 dark:text-emerald-300'
  }
];

export const PathSelectionModal: React.FC<PathSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectPath 
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
            className="absolute inset-0 bg-white dark:bg-gray-800/80 dark:bg-slate-900/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
className="relative w-full max-w-2xl glass-ultra shadow-sm rounded-xl overflow-hidden max-h-[70vh] text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Choose Your Path
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Select your journey to get started
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-4 w-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {journeyOptions.map((journey) => {
                  const Icon = journey.icon;
                  return (
                    <motion.button
                      key={journey.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: journeyOptions.indexOf(journey) * 0.1 }}
                      onClick={() => onSelectPath(journey.id)}
                      className={`
                        group relative p-4 rounded-lg border transition-all duration-200
                        ${journey.bgColor} ${journey.borderColor}
                        hover:shadow-md
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                      `}
                    >
                      {/* Icon */}
                      <div className={`
                        inline-flex p-3 rounded-lg bg-gradient-to-r ${journey.gradient} 
                        text-white mb-3 group-hover:scale-105 transition-transform
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="text-left">
                        <h3 className={`text-lg font-semibold mb-2 ${journey.textColor}`}>
                          {journey.title}
                        </h3>
                        <p className={`text-sm ${journey.subtextColor}`}>
                          {journey.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className={`h-5 w-5 ${journey.textColor}`} />
                      </div>

                      {/* Hover effect */}
                      <div className={`
                        absolute inset-0 rounded-xl bg-gradient-to-r ${journey.gradient} 
                        opacity-0 group-hover:opacity-5 transition-opacity
                      `} />
                    </motion.button>
                  );
                })}
              </div>

              {/* Skip option */}
              <div className="mt-4 text-center">
                <button
                  onClick={onClose}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm transition-colors"
                >
                  I'll explore on my own
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
