'use client';

import React from 'react';
import { SupportStep } from '@/components/MigrationSteps/steps/SupportStep';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Support & Monitor</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Configure ongoing support and monitoring</p>
        </div>
        <SupportStep onComplete={(artifact) => {
          console.log('Support step completed with artifact:', artifact);
          // Handle completion - migration is now complete!
        }} />
      </div>
    </div>
  );
};

export default SupportPage;
