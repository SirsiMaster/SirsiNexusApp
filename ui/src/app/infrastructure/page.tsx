'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Code } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { InfrastructureBuilder } from '@/components/InfrastructureBuilder';
import { useAppSelector } from '@/store';

function InfrastructurePageContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('query') || '';
  
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDarkMode = theme === 'dark';

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Add dark mode class to body
  useEffect(() => {
    if (mounted) {
      if (isDarkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
    
    return () => {
      document.body.classList.remove('dark');
    };
  }, [isDarkMode, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access the Infrastructure Builder.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Code className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          Infrastructure Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Build and deploy infrastructure using natural language with AI assistance
        </p>
      </div>
      
      <InfrastructureBuilder 
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
    </div>
  );
}

export default function InfrastructurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <InfrastructurePageContent />
    </Suspense>
  );
}
