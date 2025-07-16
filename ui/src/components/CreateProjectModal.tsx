'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronDown,
  Server,
  Database,
  FolderPlus,
  Cloud
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: ProjectData) => void;
}

interface ProjectData {
  name: string;
  description: string;
  targetProvider: string;
  migrationStrategy: string;
  serverCount: number;
  hasDatabases: boolean;
  hasActiveDirectory: boolean;
}

const cloudProviders = [
  { value: 'azure', label: 'Microsoft Azure', icon: '☁️' },
  { value: 'aws', label: 'Amazon Web Services', icon: '🌐' },
  { value: 'gcp', label: 'Google Cloud Platform', icon: '☁️' },
  { value: 'hybrid', label: 'Hybrid Cloud', icon: '🔗' },
];

const migrationStrategies = [
  { value: 'lift-shift', label: 'Lift & Shift (Rehost)', description: 'Move applications as-is to the cloud' },
  { value: 'replatform', label: 'Replatform', description: 'Minor optimizations during migration' },
  { value: 'refactor', label: 'Refactor', description: 'Redesign applications for cloud-native architecture' },
  { value: 'hybrid', label: 'Hybrid Approach', description: 'Combination of strategies based on workload' },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateProject 
}) => {
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: '',
    targetProvider: 'azure',
    migrationStrategy: 'lift-shift',
    serverCount: 0,
    hasDatabases: false,
    hasActiveDirectory: false,
  });

  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(formData);
    onClose();
  };

  const handleInputChange = (field: keyof ProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedProvider = cloudProviders.find(p => p.value === formData.targetProvider);
  const selectedStrategy = migrationStrategies.find(s => s.value === formData.migrationStrategy);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Create New Migration Project
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Give your migration project a descriptive name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Give your migration project a descriptive name
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe the scope and goals of this migration project..."
                />
              </div>

              {/* Target Cloud Provider and Migration Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Cloud Provider */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Cloud Provider
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedProvider?.icon}</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedProvider?.label}</span>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Where do you want to migrate to?
                  </p>
                  
                  {showProviderDropdown && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      {cloudProviders.map((provider) => (
                        <button
                          key={provider.value}
                          type="button"
                          onClick={() => {
                            handleInputChange('targetProvider', provider.value);
                            setShowProviderDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:bg-gray-900 text-left"
                        >
                          <span className="text-lg">{provider.icon}</span>
                          <span>{provider.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Migration Strategy */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Migration Strategy
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-left"
                  >
                    <span className="text-gray-900 dark:text-gray-100">{selectedStrategy?.label}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    How do you want to migrate?
                  </p>
                  
                  {showStrategyDropdown && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      {migrationStrategies.map((strategy) => (
                        <button
                          key={strategy.value}
                          type="button"
                          onClick={() => {
                            handleInputChange('migrationStrategy', strategy.value);
                            setShowStrategyDropdown(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-gray-50 dark:bg-gray-900 text-left border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">{strategy.label}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{strategy.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Environment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Tell us about your current environment:
                </h3>
                
                <div className="space-y-4">
                  {/* Number of Servers */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={formData.serverCount || ''}
                        onChange={(e) => handleInputChange('serverCount', parseInt(e.target.value) || 0)}
                        placeholder="Number of Servers"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    
                    {/* Has Databases Checkbox */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg">
                      <input
                        id="has-databases"
                        type="checkbox"
                        checked={formData.hasDatabases}
                        onChange={(e) => handleInputChange('hasDatabases', e.target.checked)}
                        className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="has-databases" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                        <Database className="h-5 w-5 text-gray-400" />
                        Has Databases
                      </label>
                    </div>
                  </div>

                  {/* Has Active Directory Checkbox */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg">
                    <input
                      id="has-ad"
                      type="checkbox"
                      checked={formData.hasActiveDirectory}
                      onChange={(e) => handleInputChange('hasActiveDirectory', e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="has-ad" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                      <Server className="h-5 w-5 text-gray-400" />
                      Has Active Directory
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 font-medium transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderPlus className="h-5 w-5" />
                  CREATE PROJECT
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
