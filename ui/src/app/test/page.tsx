'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 SirsiNexus Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This is a simple test page to verify the app is working correctly.
        </p>
        <div className="space-y-4">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200">✅ Next.js Working</h3>
            <p className="text-green-600 dark:text-green-300">React components are rendering correctly</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">✅ Tailwind CSS Working</h3>
            <p className="text-blue-600 dark:text-blue-300">Styles are being applied correctly</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">✅ Dark Mode Working</h3>
            <p className="text-purple-600 dark:text-purple-300">Theme system is functioning</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
