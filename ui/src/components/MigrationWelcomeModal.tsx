'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clipboard,
  Settings,
  TestTube,
  Wrench,
  Cloud,
  ArrowLeftRight,
  CheckCircle,
  Sparkles,
  Rocket
} from 'lucide-react';

interface MigrationWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMigration?: () => void;
}

const migrationSteps = [
  {
    number: 1,
    title: 'Plan',
    description: "We'll help you understand what you have and create a migration plan.",
    icon: Clipboard,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  },
  {
    number: 2,
    title: 'Specify',
    description: 'Design your new cloud setup based on your current systems.',
    icon: Settings,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
  },
  {
    number: 3,
    title: 'Test',
    description: 'Test everything works before we move your real data.',
    icon: TestTube,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  },
  {
    number: 4,
    title: 'Build',
    description: 'Build your new cloud environment ready for migration.',
    icon: Wrench,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    number: 5,
    title: 'Sample Test',
    description: 'Simulate a real data migration to catch any hidden issues.',
    icon: Cloud,
    color: 'text-cyan-600 bg-cyan-100'
  },
  {
    number: 6,
    title: 'Transfer',
    description: 'Move your real data to the cloud safely.',
    icon: ArrowLeftRight,
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30'
  },
  {
    number: 7,
    title: 'Validate',
    description: 'Make sure everything works perfectly in the cloud.',
    icon: CheckCircle,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
  }
];

export const MigrationWelcomeModal: React.FC<MigrationWelcomeModalProps> = ({ isOpen, onClose, onStartMigration }) => {
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
            className="relative w-full max-w-4xl max-h-[90vh] glass-ultra shadow-intense rounded-xl overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Welcome to Cloud Migration!
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white dark:bg-gray-800/20 dark:hover:bg-slate-700/50 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6">
                <p className="text-lg text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                  <span className="text-xl">👋</span>
                  Welcome! This is an overview of our proven 7-step migration process. When you&apos;re ready, I&apos;ll guide you through each step interactively in the Migration Wizard.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  Overview of our 7-step migration process:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {migrationSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: step.number * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors bg-white dark:bg-gray-800/60 dark:bg-slate-800/60"
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
              <div className="flex items-center justify-between pt-6 border-t border-slate-300 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  SKIP TUTORIAL
                </button>
                <button
                  onClick={() => {
                    onStartMigration?.();
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all"
                >
                  <Rocket className="h-5 w-5" />
                  OPEN MIGRATION WIZARD
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
