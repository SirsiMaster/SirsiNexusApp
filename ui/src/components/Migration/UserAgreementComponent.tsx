'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, Shield, Lock } from 'lucide-react';

interface PlanAgreement {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'process' | 'risk';
  required: boolean;
  agreed: boolean;
}

interface UserAgreementComponentProps {
  onComplete: (approved: boolean) => void;
}

const DEFAULT_AGREEMENTS: PlanAgreement[] = [
  {
    id: 'discovery-complete',
    name: 'Discovery Phase Acknowledgment',
    description: 'I acknowledge that the discovery phase has identified all relevant assets, IPs, users, and devices in my environment.',
    category: 'process',
    required: true,
    agreed: false,
  },
  {
    id: 'migration-plan-accepted',
    name: 'Migration Plan Acceptance',
    description: 'I accept the proposed migration plan and understand the implications of the migration strategy.',
    category: 'process',
    required: true,
    agreed: false,
  },
  {
    id: 'security-protocols',
    name: 'Security Protocol Compliance',
    description: 'I acknowledge that all communications will use secure protocols (mTLS, HTTPS, SFTP, SSH) and understand the security requirements.',
    category: 'security',
    required: true,
    agreed: false,
  },
  {
    id: 'backup-strategy',
    name: 'Backup and Recovery Strategy',
    description: 'I understand the backup strategy and disaster recovery procedures that will be implemented during migration.',
    category: 'risk',
    required: true,
    agreed: false,
  },
  {
    id: 'audit-logging',
    name: 'Audit and Logging Consent',
    description: 'I consent to comprehensive logging of all migration activities, including agent communications and error tracking.',
    category: 'compliance',
    required: true,
    agreed: false,
  },
  {
    id: 'rollback-procedures',
    name: 'Rollback Procedure Understanding',
    description: 'I understand the rollback procedures and acknowledge the risks associated with migration rollback.',
    category: 'risk',
    required: false,
    agreed: false,
  },
];

export function UserAgreementComponent({ onComplete }: UserAgreementComponentProps) {
  const [agreements, setAgreements] = useState<PlanAgreement[]>(DEFAULT_AGREEMENTS);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleAgreementToggle = (agreementId: string) => {
    const updated = agreements.map(agreement =>
      agreement.id === agreementId
        ? { ...agreement, agreed: !agreement.agreed }
        : agreement
    );
    setAgreements(updated);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'compliance':
        return <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'process':
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'compliance':
        return 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20';
      case 'process':
        return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
      case 'risk':
        return 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const requiredAgreements = agreements.filter(a => a.required);
  const allRequiredAgreed = requiredAgreements.every(a => a.agreed);
  const totalAgreed = agreements.filter(a => a.agreed).length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Migration Plan Agreement
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {totalAgreed}/{agreements.length} Agreed
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Please review and acknowledge each aspect of the migration plan. Required items must be agreed to before proceeding.
          </p>
        </div>

        <div className="space-y-4">
          {agreements.map((agreement) => (
            <motion.div
              key={agreement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${getCategoryColor(agreement.category)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 flex-1">
                  {getCategoryIcon(agreement.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {agreement.name}
                      </h3>
                      {agreement.required && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {agreement.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDetails(showDetails === agreement.id ? null : agreement.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Details
                  </button>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreement.agreed}
                      onChange={() => handleAgreementToggle(agreement.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      {agreement.agreed ? 'Agreed' : 'Agree'}
                    </span>
                  </label>
                </div>
              </div>

              {showDetails === agreement.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600"
                >
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <p><strong>Category:</strong> {agreement.category}</p>
                    <p><strong>Required:</strong> {agreement.required ? 'Yes' : 'No'}</p>
                    <p><strong>Impact:</strong> This agreement affects the migration security and compliance posture.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {allRequiredAgreed ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  All required agreements completed
                </span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {requiredAgreements.length - requiredAgreements.filter(a => a.agreed).length} required agreements remaining
                </span>
              )}
            </div>
            <button
              onClick={() => onComplete(allRequiredAgreed)}
              disabled={!allRequiredAgreed}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                allRequiredAgreed
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Proceed with Migration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
