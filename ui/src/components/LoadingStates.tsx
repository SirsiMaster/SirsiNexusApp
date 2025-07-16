'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingCardProps {
  className?: string;
}

interface LoadingStatsProps {
  count?: number;
}

interface LoadingListProps {
  items?: number;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className = '' }) => (
  <div className={`glass-skeleton p-6 rounded-xl ${className}`}>
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 glass-skeleton rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 glass-skeleton rounded w-3/4"></div>
          <div className="h-3 glass-skeleton rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 glass-skeleton rounded"></div>
        <div className="h-3 glass-skeleton rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export const LoadingStats: React.FC<LoadingStatsProps> = ({ count = 6 }) => (
  <div className="glass-grid stagger-children">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="glass-skeleton p-6 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 glass-skeleton rounded-lg"></div>
            <div className="w-16 h-6 glass-skeleton rounded-full"></div>
          </div>
          <div className="w-20 h-8 glass-skeleton rounded"></div>
          <div className="space-y-2">
            <div className="w-full h-3 glass-skeleton rounded"></div>
            <div className="w-4/5 h-3 glass-skeleton rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const LoadingList: React.FC<LoadingListProps> = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="glass-skeleton p-4 rounded-xl">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-10 h-10 glass-skeleton rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 glass-skeleton rounded w-3/4"></div>
            <div className="h-3 glass-skeleton rounded w-1/2"></div>
          </div>
          <div className="w-16 h-8 glass-skeleton rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
    </div>
  );
};

export const LoadingButton: React.FC<{ children: React.ReactNode; loading?: boolean }> = ({ 
  children, 
  loading = false 
}) => (
  <button 
    className="btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={loading}
  >
    <div className="flex items-center gap-2">
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  </button>
);

export const LoadingPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="glass-floating w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Loading...</h2>
        <p className="text-slate-600">Preparing your experience</p>
      </div>
      <div className="w-48 h-2 glass-skeleton rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ columns?: number; rows?: number }> = ({ 
  columns = 3, 
  rows = 2 
}) => (
  <div 
    className="glass-grid"
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: columns * rows }).map((_, index) => (
      <LoadingCard key={index} />
    ))}
  </div>
);

export const ProgressIndicator: React.FC<{ 
  progress: number; 
  label?: string; 
  showPercentage?: boolean 
}> = ({ progress, label, showPercentage = true }) => (
  <div className="space-y-2">
    {label && (
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 font-medium">{label}</span>
        {showPercentage && (
          <span className="text-slate-500">{Math.round(progress)}%</span>
        )}
      </div>
    )}
    <div className="w-full h-3 glass-skeleton rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  </div>
);

export const PulseDot: React.FC<{ 
  color?: 'blue' | 'green' | 'red' | 'yellow'; 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ color = 'blue', size = 'md' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/200',
    green: 'bg-emerald-50 dark:bg-emerald-900/200',
    red: 'bg-red-50 dark:bg-red-900/200',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/200'
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`} />
  );
};

export const LoadingMessage: React.FC<{ 
  message: string; 
  submessage?: string;
  icon?: React.ReactNode;
}> = ({ message, submessage, icon }) => (
  <div className="glass-floating p-6 rounded-xl text-center max-w-md mx-auto">
    <div className="space-y-4">
      {icon && (
        <div className="w-12 h-12 mx-auto glass-subtle rounded-xl flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">{message}</h3>
        {submessage && (
          <p className="text-sm text-slate-600">{submessage}</p>
        )}
      </div>
      <LoadingSpinner />
    </div>
  </div>
);

export const TypewriterText: React.FC<{ 
  text: string; 
  speed?: number;
  className?: string;
}> = ({ text, speed = 100, className = '' }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
