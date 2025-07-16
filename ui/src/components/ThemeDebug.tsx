'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeDebug() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading theme...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-sm">
      <div className="space-y-2">
        <div>Theme: {theme}</div>
        <div>System: {systemTheme}</div>
        <div>Resolved: {resolvedTheme}</div>
        <div>HTML classes: {document.documentElement.className}</div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTheme('light')}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
