'use client';

import React from 'react';
import { TransferStep } from '@/components/MigrationSteps/steps/TransferStep';

const TransferPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Transfer Resources</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Execute the migration and transfer your resources</p>
        </div>
        <TransferStep onComplete={(artifact) => {
          console.log('Transfer step completed with artifact:', artifact);
          // Handle completion - could redirect to next step or show success
        }} />
      </div>
    </div>
  );
};

export default TransferPage;
