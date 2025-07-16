'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Brain, 
  Code, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { aiInfrastructureService, AIProvider } from '@/services/aiInfrastructureService';

interface AIProviderInfo {
  id: AIProvider;
  name: string;
  description: string;
  available: boolean;
  model: string;
}

interface AIProviderSelectorProps {
  onProviderChange?: (provider: AIProvider) => void;
  isDarkMode?: boolean;
}

const getProviderIcon = (provider: AIProvider) => {
  switch (provider) {
    case 'openai':
      return Brain;
    case 'claude':
      return Sparkles;
    case 'claude-code':
      return Code;
    default:
      return Brain;
  }
};

const getProviderColor = (provider: AIProvider, isDarkMode: boolean) => {
  const colors = {
    openai: isDarkMode 
      ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' 
      : 'from-green-100 to-emerald-100 border-green-300',
    claude: isDarkMode 
      ? 'from-purple-500/20 to-violet-500/20 border-purple-500/30' 
      : 'from-purple-100 to-violet-100 border-purple-300',
    'claude-code': isDarkMode 
      ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' 
      : 'from-blue-100 to-cyan-100 border-blue-300'
  };
  return colors[provider];
};

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ 
  onProviderChange,
  isDarkMode = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>('openai');

  useEffect(() => {
    // Load available providers
    const availableProviders = aiInfrastructureService.getAvailableProviders();
    setProviders(availableProviders);
    
    // Set current provider
    const current = aiInfrastructureService.getCurrentProvider();
    setCurrentProvider(current);
  }, []);

  const handleProviderSelect = (provider: AIProvider) => {
    setCurrentProvider(provider);
    aiInfrastructureService.setProvider(provider);
    setIsOpen(false);
    onProviderChange?.(provider);
  };

  const selectedProvider = providers.find(p => p.id === currentProvider);
  const availableProviders = providers.filter(p => p.available);
  const hasAvailableProviders = availableProviders.length > 0;

  const themeClasses = isDarkMode ? {
    bg: 'bg-slate-800',
    border: 'border-slate-600',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    hover: 'hover:bg-slate-700',
    dropdown: 'bg-slate-800 border-slate-600',
    shadow: 'shadow-xl shadow-black/20'
  } : {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    hover: 'hover:bg-gray-50 dark:bg-gray-900',
    dropdown: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    shadow: 'shadow-lg'
  };

  if (!hasAvailableProviders) {
    return (
      <div className={`relative inline-block ${themeClasses.bg} ${themeClasses.border} border rounded-lg px-3 py-2`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className={`text-sm ${themeClasses.textSecondary}`}>
            No AI providers configured
          </span>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs ${themeClasses.dropdown} ${themeClasses.border} border rounded-lg ${themeClasses.shadow} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
              Configure API keys in environment variables:
              <br />• NEXT_PUBLIC_OPENAI_API_KEY
              <br />• NEXT_PUBLIC_ANTHROPIC_API_KEY
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${themeClasses.bg} ${themeClasses.border} ${themeClasses.hover} ${themeClasses.text}`}
      >
        {selectedProvider && (
          <>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getProviderColor(selectedProvider.id, isDarkMode)} border flex items-center justify-center`}>
              {React.createElement(getProviderIcon(selectedProvider.id), { 
                className: 'w-4 h-4' 
              })}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{selectedProvider.name}</span>
              <span className={`text-xs ${themeClasses.textSecondary}`}>
                {selectedProvider.model}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute top-full left-0 mt-2 w-80 ${themeClasses.dropdown} border rounded-lg ${themeClasses.shadow} z-20`}>
            <div className={`p-3 border-b ${themeClasses.border}`}>
              <h3 className={`text-sm font-semibold ${themeClasses.text}`}>
                Select AI Provider
              </h3>
              <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                Choose your preferred AI engine for infrastructure generation
              </p>
            </div>
            
            <div className="py-2 max-h-64 overflow-y-auto">
              {providers.map((provider) => {
                const Icon = getProviderIcon(provider.id);
                const isSelected = provider.id === currentProvider;
                const isAvailable = provider.available;
                
                return (
                  <button
                    key={provider.id}
                    onClick={() => isAvailable && handleProviderSelect(provider.id)}
                    disabled={!isAvailable}
                    className={`w-full px-3 py-3 text-left transition-colors ${
                      isAvailable ? themeClasses.hover : 'opacity-50 cursor-not-allowed'
                    } ${isSelected ? (isDarkMode ? 'bg-slate-700' : 'bg-gray-100 dark:bg-gray-800') : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getProviderColor(provider.id, isDarkMode)} border flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${themeClasses.text}`}>
                            {provider.name}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                          {!isAvailable && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <p className={`text-xs ${themeClasses.textSecondary} mt-1 line-clamp-2`}>
                          {provider.description}
                        </p>
                        <p className={`text-xs ${themeClasses.textSecondary} mt-1 font-mono`}>
                          {provider.model}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className={`p-3 border-t ${themeClasses.border}`}>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className={`text-xs ${themeClasses.textSecondary}`}>
                  Each provider offers unique strengths for different use cases
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIProviderSelector;
