'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Home, 
  Settings, 
  User, 
  Database, 
  Cloud, 
  BarChart,
  Sparkles,
  Zap,
  Clock,
  Star,
  Hash
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  shortcut?: string;
  category: string;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commands: Command[] = [
  {
    id: 'go-home',
    title: 'Go to Dashboard',
    description: 'Navigate to the main dashboard',
    icon: Home,
    shortcut: 'G then H',
    category: 'Navigation',
    action: () => window.location.href = '/',
    keywords: ['dashboard', 'home', 'main', 'overview']
  },
  {
    id: 'new-migration',
    title: 'Start New Migration',
    description: 'Begin a new cloud migration project',
    icon: Cloud,
    shortcut: 'N then M',
    category: 'Actions',
    action: () => window.location.href = '/migration',
    keywords: ['migration', 'new', 'create', 'start', 'cloud']
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Open analytics and reports dashboard',
    icon: BarChart,
    shortcut: 'G then A',
    category: 'Navigation',
    action: () => window.location.href = '/analytics',
    keywords: ['analytics', 'reports', 'data', 'statistics']
  },
  {
    id: 'optimization',
    title: 'Resource Optimization',
    description: 'Optimize cloud resources for cost and performance',
    icon: Zap,
    shortcut: 'N then O',
    category: 'Actions',
    action: () => window.location.href = '/optimization',
    keywords: ['optimization', 'performance', 'cost', 'resources']
  },
  {
    id: 'projects',
    title: 'View Projects',
    description: 'Browse all migration projects',
    icon: Database,
    shortcut: 'G then P',
    category: 'Navigation',
    action: () => window.location.href = '/projects',
    keywords: ['projects', 'list', 'browse', 'migrations']
  },
  {
    id: 'settings',
    title: 'Open Settings',
    description: 'Configure application settings',
    icon: Settings,
    shortcut: 'G then S',
    category: 'Navigation',
    action: () => console.log('Settings'),
    keywords: ['settings', 'preferences', 'configuration']
  },
  {
    id: 'profile',
    title: 'View Profile',
    description: 'Manage your user profile',
    icon: User,
    shortcut: 'G then U',
    category: 'Navigation',
    action: () => console.log('Profile'),
    keywords: ['profile', 'user', 'account', 'personal']
  }
];

const categories = {
  'Navigation': { icon: ArrowRight, color: 'text-blue-600' },
  'Actions': { icon: Sparkles, color: 'text-emerald-600' },
  'Recent': { icon: Clock, color: 'text-green-600' },
  'Favorites': { icon: Star, color: 'text-amber-600' }
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
      setFilteredCommands(commands);
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = commands.filter(command => {
      const searchTerm = query.toLowerCase();
      return (
        command.title.toLowerCase().includes(searchTerm) ||
        command.description.toLowerCase().includes(searchTerm) ||
        command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    });
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [query]);

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
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="relative w-full max-w-2xl glass-magnetic rounded-2xl overflow-hidden spring-entrance">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-slate-600">
            <Command className="h-5 w-5" />
            <span className="text-sm font-semibold">Command Palette</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <kbd className="px-2 py-1 glass-subtle rounded text-xs font-semibold">Esc</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="w-full pl-12 pr-4 py-3 glass-subtle rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-slate-800 placeholder-slate-500 text-lg"
            />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto px-2 pb-4">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 glass-subtle rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No commands found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => {
                const categoryInfo = categories[category as keyof typeof categories];
                const CategoryIcon = categoryInfo?.icon || Hash;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <CategoryIcon className={`h-4 w-4 ${categoryInfo?.color || 'text-slate-500'}`} />
                      <span className="text-sm font-semibold text-slate-700">{category}</span>
                    </div>
                    
                    <div className="space-y-1">
                      {categoryCommands.map((command, commandIndex) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const isSelected = globalIndex === selectedIndex;
                        const Icon = command.icon;
                        
                        return (
                          <button
                            key={command.id}
                            onClick={() => {
                              command.action();
                              onClose();
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 mx-2 rounded-xl text-left transition-all duration-200 ${
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
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">
                                {command.title}
                              </div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {command.description}
                              </div>
                            </div>
                            
                            {command.shortcut && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                <kbd className="px-2 py-1 glass-subtle rounded text-xs font-semibold">
                                  {command.shortcut}
                                </kbd>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
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
            </div>
            <div className="text-slate-400">
              {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
