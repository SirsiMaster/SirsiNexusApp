'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Clock, 
  Hash,
  File,
  Settings,
  Users,
  Database,
  Folder
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'pages' | 'projects' | 'settings' | 'recent';
  icon: React.ElementType;
  path: string;
  keywords: string[];
}

const searchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Migration Wizard',
    description: 'Start a new infrastructure migration',
    category: 'pages',
    icon: ArrowRight,
    path: '/migration',
    keywords: ['migrate', 'wizard', 'infrastructure', 'move']
  },
  {
    id: '2',
    title: 'Analytics Dashboard',
    description: 'View detailed reports and metrics',
    category: 'pages',
    icon: Database,
    path: '/analytics',
    keywords: ['analytics', 'reports', 'metrics', 'data']
  },
  {
    id: '3',
    title: 'Project Management',
    description: 'Manage your migration projects',
    category: 'pages',
    icon: Folder,
    path: '/projects',
    keywords: ['projects', 'manage', 'migration']
  },
  {
    id: '4',
    title: 'Team Settings',
    description: 'Configure team members and permissions',
    category: 'settings',
    icon: Users,
    path: '/settings/team',
    keywords: ['team', 'users', 'permissions', 'settings']
  },
  {
    id: '5',
    title: 'System Configuration',
    description: 'Configure system settings and preferences',
    category: 'settings',
    icon: Settings,
    path: '/settings/system',
    keywords: ['system', 'config', 'settings', 'preferences']
  }
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setFilteredResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const results = searchResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredResults(results);
      setSelectedIndex(0);
    } else {
      setFilteredResults([]);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!filteredResults.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    window.location.href = result.path;
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pages': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'projects': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'settings': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'recent': return 'text-orange-600 bg-orange-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'pages': return 'Pages';
      case 'projects': return 'Projects';
      case 'settings': return 'Settings';
      case 'recent': return 'Recent';
      default: return category;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl mx-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-200">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for pages, projects, settings..."
                  className="flex-1 text-lg placeholder-slate-400 focus:outline-none"
                />
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {query.trim() && filteredResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600">No results found for "{query}"</p>
                    <p className="text-xs text-slate-500 mt-1">Try searching for pages, projects, or settings</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="p-2">
                    {filteredResults.map((result, index) => {
                      const Icon = result.icon;
                      const isSelected = index === selectedIndex;
                      
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className={`w-full p-3 rounded-lg transition-colors text-left ${
                            isSelected 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100'
                            }`}>
                              <Icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium text-slate-900 truncate">
                                  {result.title}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(result.category)}`}>
                                  {getCategoryLabel(result.category)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 truncate">
                                {result.description}
                              </p>
                            </div>
                            {isSelected && (
                              <ArrowRight className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : !query.trim() ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Quick Search</p>
                    <p className="text-xs text-slate-500">Search for pages, projects, and settings across SirsiNexus</p>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              {filteredResults.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>↑↓ to navigate</span>
                      <span>↵ to select</span>
                      <span>esc to close</span>
                    </div>
                    <span>{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
