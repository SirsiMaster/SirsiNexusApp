'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'simple';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'button', 
  className = '',
  showLabel = false 
}) => {
  const { theme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[0];

  const handleThemeToggle = () => {
    if (variant === 'simple') {
      const themeOrder = ['light', 'dark', 'system'];
      const currentIndex = themeOrder.indexOf(theme || 'system');
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      const newTheme = themeOrder[nextIndex];
      setTheme(newTheme);
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setShowDropdown(false);
  };

  if (variant === 'simple') {
    return (
      <button
        onClick={handleThemeToggle}
        className={`p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${className}`}
        title={`Current: ${currentTheme.label} theme`}
      >
        <currentTheme.icon className="h-4 w-4" />
        {showLabel && (
          <span className="ml-2 text-sm">{currentTheme.label}</span>
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleThemeToggle}
          className="flex items-center gap-2 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <currentTheme.icon className="h-4 w-4" />
          {showLabel && <span className="text-sm">{currentTheme.label}</span>}
          <ChevronDown className="h-3 w-3" />
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)} 
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeSelect(option.value)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleThemeToggle}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <currentTheme.icon className="h-4 w-4" />
        {showLabel && <span className="text-sm">{currentTheme.label}</span>}
        <ChevronDown className="h-3 w-3" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeSelect(option.value)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
