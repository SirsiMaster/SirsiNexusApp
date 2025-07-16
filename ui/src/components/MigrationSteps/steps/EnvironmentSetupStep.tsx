'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Server,
  Key,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Lock,
  Globe
} from 'lucide-react';
import { CredentialSelector, type Credential } from '@/components/CredentialSelector';

interface EnvironmentSetupStepProps {
  wizardType: 'migration' | 'optimization' | 'scaling';
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const EnvironmentSetupStep: React.FC<EnvironmentSetupStepProps> = ({ 
  wizardType, 
  onComplete 
}) => {
  const [sourceCredential, setSourceCredential] = useState<Credential | null>(null);
  const [targetCredential, setTargetCredential] = useState<Credential | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const getWizardConfig = () => {
    switch (wizardType) {
      case 'migration':
        return {
          title: 'Migration Environment Setup',
          description: 'Configure source and destination environments for migration',
          sourceTitle: 'Source Environment Credentials',
          sourceDescription: 'Select credentials for the environment you\'re migrating FROM',
          targetTitle: 'Target Environment Credentials', 
          targetDescription: 'Select credentials for the environment you\'re migrating TO',
          sourceRequired: true,
          targetRequired: true,
          sourceTypes: ['aws', 'azure', 'gcp', 'vsphere'],
          targetTypes: ['aws', 'azure', 'gcp'], // Can't migrate TO vsphere
        };
      case 'optimization':
        return {
          title: 'Optimization Environment Setup',
          description: 'Configure environment credentials for cost and performance optimization',
          sourceTitle: 'Environment Credentials',
          sourceDescription: 'Select credentials for the environment you want to optimize',
          targetTitle: null,
          targetDescription: null,
          sourceRequired: true,
          targetRequired: false,
          sourceTypes: ['aws', 'azure', 'gcp'],
          targetTypes: [],
        };
      case 'scaling':
        return {
          title: 'Auto-Scaling Environment Setup', 
          description: 'Configure environment credentials for auto-scaling configuration',
          sourceTitle: 'Environment Credentials',
          sourceDescription: 'Select credentials for the environment where you want to configure auto-scaling',
          targetTitle: null,
          targetDescription: null,
          sourceRequired: true,
          targetRequired: false,
          sourceTypes: ['aws', 'azure', 'gcp'],
          targetTypes: [],
        };
      default:
        return {
          title: 'Environment Setup',
          description: 'Configure environment credentials',
          sourceTitle: 'Environment Credentials',
          sourceDescription: 'Select your environment credentials',
          targetTitle: null,
          targetDescription: null,
          sourceRequired: true,
          targetRequired: false,
          sourceTypes: ['aws', 'azure', 'gcp', 'vsphere'],
          targetTypes: [],
        };
    }
  };

  const config = getWizardConfig();

  const validateSetup = () => {
    const errors: string[] = [];
    
    if (config.sourceRequired && !sourceCredential) {
      errors.push('Source environment credentials are required');
    }
    
    if (config.targetRequired && !targetCredential) {
      errors.push('Target environment credentials are required');
    }
    
    if (wizardType === 'migration' && sourceCredential && targetCredential) {
      if (sourceCredential.id === targetCredential.id) {
        errors.push('Source and target credentials must be different');
      }
      
      if (sourceCredential.type === targetCredential.type && 
          sourceCredential.region === targetCredential.region) {
        errors.push('Source and target environments should be in different regions for best practices');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinue = () => {
    if (!validateSetup()) {
      return;
    }

    // Generate environment configuration artifact
    const environmentConfig = {
      wizardType,
      source: sourceCredential ? {
        name: sourceCredential.name,
        type: sourceCredential.type,
        region: sourceCredential.region || sourceCredential.subscription || sourceCredential.project,
        account: sourceCredential.account || sourceCredential.subscription || sourceCredential.project,
        status: sourceCredential.status,
        lastUsed: sourceCredential.lastUsed,
        scopes: sourceCredential.scopes,
      } : null,
      target: targetCredential ? {
        name: targetCredential.name,
        type: targetCredential.type,
        region: targetCredential.region || targetCredential.subscription || targetCredential.project,
        account: targetCredential.account || targetCredential.subscription || targetCredential.project,
        status: targetCredential.status,
        lastUsed: targetCredential.lastUsed,
        scopes: targetCredential.scopes,
      } : null,
      configuredAt: new Date().toISOString(),
    };

    const artifact = {
      name: 'Environment Configuration',
      type: 'JSON',
      size: '2.1 KB',
      content: JSON.stringify(environmentConfig, null, 2)
    };

    onComplete(artifact);
  };

  const isValid = () => {
    return config.sourceRequired ? !!sourceCredential : true &&
           config.targetRequired ? !!targetCredential : true;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center slide-up">
        <div className="w-20 h-20 card-gradient rounded-full flex items-center justify-center mx-auto mb-6 hover-glow">
          <Key className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-display text-3xl mb-4">{config.title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">{config.description}</p>
      </div>

      {/* Environment Configuration Status */}
      {(sourceCredential || targetCredential) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-professional hover-lift p-8 border-gradient"
        >
          <h3 className="text-xl font-bold text-gradient mb-6 flex items-center">
            <Settings className="h-6 w-6 mr-3 text-sirsi-600" />
            Environment Configuration Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sourceCredential && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {wizardType === 'migration' ? 'Source Environment' : 'Target Environment'}
                </h4>
                <div className="card-professional p-6 hover-lift">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      sourceCredential.type === 'aws' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                      sourceCredential.type === 'azure' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      sourceCredential.type === 'gcp' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                      {sourceCredential.type === 'vsphere' ? (
                        <Server className="h-5 w-5" />
                      ) : (
                        <Cloud className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sourceCredential.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sourceCredential.type.toUpperCase()} • {sourceCredential.region || sourceCredential.subscription || sourceCredential.project}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {targetCredential && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Target Environment</h4>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      targetCredential.type === 'aws' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                      targetCredential.type === 'azure' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{targetCredential.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {targetCredential.type.toUpperCase()} • {targetCredential.region || targetCredential.subscription || targetCredential.project}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Source Environment Credentials */}
      <div className="card-professional hover-lift p-8">
        <CredentialSelector
          title={config.sourceTitle}
          description={config.sourceDescription}
          selectedCredential={sourceCredential}
          onSelect={setSourceCredential}
          allowedTypes={config.sourceTypes}
          required={config.sourceRequired}
        />
      </div>

      {/* Target Environment Credentials (if needed) */}
      {config.targetTitle && (
        <div className="card-professional hover-lift p-8">
          <CredentialSelector
            title={config.targetTitle}
            description={config.targetDescription!}
            selectedCredential={targetCredential}
            onSelect={setTargetCredential}
            allowedTypes={config.targetTypes}
            required={config.targetRequired}
          />
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="notification-error slide-up"
        >
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-red-900 dark:text-red-400">Configuration Issues</h4>
          </div>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-800 dark:text-red-300 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="card-glass p-6 backdrop-blur">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-primary rounded-xl">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Security Notice</h4>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Your credentials are securely stored and encrypted. We only use the minimum required permissions 
              for {wizardType} operations. You can revoke access at any time through the Credentials Management page.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!isValid()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg px-10 py-5 font-bold flex items-center space-x-3"
        >
          <span>Continue to {wizardType === 'migration' ? 'Resource Discovery' : wizardType === 'optimization' ? 'Analysis' : 'Monitoring Setup'}</span>
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
