'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Clock, Star, TrendingUp, X, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon?: React.ReactNode;
  priority: number;
  tags: string[];
}

interface SearchCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  maxResults?: number;
}

// Mock search data
const searchData: SearchResult[] = [
  {
    id: '1',
    title: 'Dashboard Overview',
    description: 'Main dashboard with project statistics and recent activity',
    category: 'Pages',
    url: '/',
    priority: 10,
    tags: ['dashboard', 'overview', 'stats', 'main']
  },
  {
    id: '2',
    title: 'Start Migration',
    description: 'Begin a new cloud migration project',
    category: 'Actions',
    url: '/migration',
    priority: 9,
    tags: ['migration', 'start', 'new', 'cloud', 'project']
  },
  {
    id: '3',
    title: 'View Analytics',
    description: 'Access detailed analytics and reporting dashboard',
    category: 'Pages',
    url: '/analytics',
    priority: 8,
    tags: ['analytics', 'reports', 'data', 'metrics']
  },
  {
    id: '4',
    title: 'Project Management',
    description: 'Manage all your migration projects',
    category: 'Pages',
    url: '/projects',
    priority: 7,
    tags: ['projects', 'management', 'list']
  },
  {
    id: '5',
    title: 'Resource Optimization',
    description: 'Optimize cloud resources for cost and performance',
    category: 'Features',
    url: '/optimization',
    priority: 8,
    tags: ['optimization', 'resources', 'cost', 'performance']
  },
  {
    id: '6',
    title: 'User Settings',
    description: 'Configure your account and preferences',
    category: 'Settings',
    url: '/settings',
    priority: 5,
    tags: ['settings', 'preferences', 'account', 'config']
  }
];

const categories: Record<string, SearchCategory> = {
  'Pages': { name: 'Pages', icon: <ArrowRight className="h-4 w-4" />, color: 'text-blue-600' },
  'Actions': { name: 'Actions', icon: <Star className="h-4 w-4" />, color: 'text-emerald-600' },
  'Features': { name: 'Features', icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-600' },
  'Settings': { name: 'Settings', icon: <Clock className="h-4 w-4" />, color: 'text-amber-600' }
};

// Fuzzy search implementation
const fuzzyMatch = (pattern: string, text: string): number => {
  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(patternLower)) {
    return 100; // Exact substring match gets highest score
  }
  
  let score = 0;
  let patternIndex = 0;
  
  for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIndex]) {
      score += 1;
      patternIndex++;
    }
  }
  
  return patternIndex === patternLower.length ? score : 0;
};

const searchItems = (query: string, items: SearchResult[]): SearchResult[] => {
  if (!query.trim()) return [];
  
  const results = items
    .map(item => {
      const titleScore = fuzzyMatch(query, item.title) * 3;
      const descScore = fuzzyMatch(query, item.description) * 2;
      const tagScore = Math.max(...item.tags.map(tag => fuzzyMatch(query, tag)));
      const categoryScore = fuzzyMatch(query, item.category);
      
      const totalScore = titleScore + descScore + tagScore + categoryScore + item.priority;
      
      return { ...item, score: totalScore };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
    
  return results;
};

export const SmartSearch: React.FC<SmartSearchProps> = ({ 
  isOpen, 
  onClose, 
  placeholder = "Search anything...",
  maxResults = 8
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    return searchItems(query, searchData).slice(0, maxResults);
  }, [query, maxResults]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelectResult = useCallback((result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });

    // Navigate to result
    window.location.href = result.url;
    onClose();
  }, [query, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelectResult(searchResults[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, onClose, handleSelectResult]);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  if (!isOpen) return null;

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Interface */}
      <div className="relative w-full max-w-2xl glass-magnetic rounded-2xl overflow-hidden spring-entrance">
        {/* Search Input */}
        <div className="relative p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-4 glass-subtle rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-slate-800 placeholder-slate-500 text-lg font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {showRecentSearches ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:glass-subtle transition-all"
                  >
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-4 space-y-4">
              {Object.entries(groupedResults).map(([category, results]) => {
                const categoryInfo = categories[category];
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <span className={categoryInfo?.color || 'text-slate-500'}>
                        {categoryInfo?.icon}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {categoryInfo?.name || category}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {results.map((result, resultIndex) => {
                        const globalIndex = searchResults.indexOf(result);
                        const isSelected = globalIndex === selectedIndex;
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelectResult(result)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                              isSelected
                                ? 'glass-chromatic text-slate-800 scale-[1.02]'
                                : 'hover:glass-subtle text-slate-700'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-white dark:bg-gray-800/20 scale-110'
                                : 'glass-subtle'
                            }`}>
                              {result.icon || <ArrowRight className="h-5 w-5" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">
                                {result.title}
                              </div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {result.description}
                              </div>
                            </div>
                            
                            <ArrowRight className={`h-4 w-4 transition-transform ${
                              isSelected ? 'translate-x-1' : ''
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 glass-subtle rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No results found</p>
              <p className="text-slate-500 text-sm mt-1">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 glass-subtle rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Start typing to search</p>
              <p className="text-slate-500 text-sm mt-1">
                Find pages, actions, and features instantly
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10 glass-subtle">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 glass-subtle rounded text-xs font-semibold">↑</kbd>
                  <kbd className="px-1.5 py-0.5 glass-subtle rounded text-xs font-semibold">↓</kbd>
                  <span>navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 glass-subtle rounded text-xs font-semibold">↵</kbd>
                  <span>select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 glass-subtle rounded text-xs font-semibold">Esc</kbd>
                  <span>close</span>
                </div>
              </div>
              <div className="text-slate-400">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
