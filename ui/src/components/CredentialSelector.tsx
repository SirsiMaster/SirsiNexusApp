'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Server,
  Key,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Info
} from 'lucide-react';

export interface Credential {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'vsphere';
  status: 'valid' | 'warning' | 'expired';
  region?: string;
  account?: string;
  subscription?: string;
  project?: string;
  lastUsed: string;
  expiresIn: string;
  scopes: string[];
  // Enhanced security fields
  encryptionStatus: string;
  rotationEnabled: boolean;
  lastRotated: string;
  healthCheck: string;
  minimumTtl?: number; // Minimum time-to-live in days
}

interface CredentialSelectorProps {
  title: string;
  description: string;
  selectedCredential: Credential | null;
  onSelect: (credential: Credential) => void;
  allowedTypes?: string[];
  required?: boolean;
}

const mockCredentials: Credential[] = [
  {
    id: '1',
    name: 'AWS Production',
    type: 'aws',
    status: 'valid',
    region: 'us-east-1',
    account: '123456789012',
    lastUsed: '2 hours ago',
    expiresIn: '29 days',
    scopes: ['ec2:DescribeInstances', 's3:ListBucket', 'rds:DescribeDBInstances', 'iam:read*'],
    encryptionStatus: 'AES-256 encrypted at rest',
    rotationEnabled: true,
    lastRotated: '15 days ago',
    healthCheck: 'Passed',
    minimumTtl: 30,
  },
  {
    id: '2',
    name: 'Azure Development',
    type: 'azure',
    status: 'warning',
    subscription: 'Dev-Subscription-001',
    region: 'East US',
    lastUsed: '1 day ago',
    expiresIn: '5 days',
    scopes: ['Microsoft.Compute/*/read', 'Microsoft.Storage/*/read', 'Microsoft.Network/*/read'],
    encryptionStatus: 'AES-256 encrypted at rest',
    rotationEnabled: true,
    lastRotated: '45 days ago',
    healthCheck: 'Warning: Expires soon',
    minimumTtl: 7,
  },
  {
    id: '3',
    name: 'GCP Production',
    type: 'gcp',
    status: 'valid',
    project: 'my-project-prod',
    region: 'us-central1',
    lastUsed: '4 hours ago',
    expiresIn: '45 days',
    scopes: ['compute.instances.list', 'storage.buckets.list', 'iam.serviceAccounts.list'],
    encryptionStatus: 'AES-256 encrypted at rest',
    rotationEnabled: false,
    lastRotated: 'Never',
    healthCheck: 'Passed',
    minimumTtl: 30,
  },
  {
    id: '4',
    name: 'vSphere Staging',
    type: 'vsphere',
    status: 'expired',
    region: 'vCenter-DC1',
    lastUsed: '30 days ago',
    expiresIn: 'Expired',
    scopes: ['vm.read', 'datastore.read', 'network.read'],
    encryptionStatus: 'Legacy encryption',
    rotationEnabled: false,
    lastRotated: 'Never',
    healthCheck: 'Failed: Expired credentials',
    minimumTtl: 0,
  },
  {
    id: '5',
    name: 'AWS Staging',
    type: 'aws',
    status: 'valid',
    region: 'us-west-2',
    account: '987654321098',
    lastUsed: '6 hours ago',
    expiresIn: '22 days',
    scopes: ['ec2:DescribeInstances', 's3:ListBucket', 'rds:DescribeDBInstances'],
    encryptionStatus: 'AES-256 encrypted at rest',
    rotationEnabled: true,
    lastRotated: '8 days ago',
    healthCheck: 'Passed',
    minimumTtl: 30,
  },
];

export const CredentialSelector: React.FC<CredentialSelectorProps> = ({
  title,
  description,
  selectedCredential,
  onSelect,
  allowedTypes = ['aws', 'azure', 'gcp', 'vsphere'],
  required = true,
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredCredentials = mockCredentials.filter(cred => 
    allowedTypes.includes(cred.type) && cred.status !== 'expired'
  );

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'aws':
      case 'azure':
      case 'gcp':
        return Cloud;
      case 'vsphere':
        return Server;
      default:
        return Key;
    }
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'aws':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'azure':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'gcp':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'vsphere':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <Lock className="h-4 w-4 text-red-600" />;
      default:
        return <Key className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Key className="h-5 w-5 mr-2 text-sirsi-500" />
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>

      {/* Selected Credential Display */}
      {selectedCredential && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sirsi-50 dark:bg-sirsi-900/30 border border-sirsi-200 dark:border-sirsi-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getProviderColor(selectedCredential.type)}`}>
                {React.createElement(getProviderIcon(selectedCredential.type), { className: 'h-5 w-5' })}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedCredential.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCredential.type.toUpperCase()} - {selectedCredential.region || selectedCredential.subscription || selectedCredential.project}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(selectedCredential.status)}
              <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Credential Selection */}
      <div className="grid grid-cols-1 gap-3">
        {filteredCredentials.map((credential) => {
          const ProviderIcon = getProviderIcon(credential.type);
          const isSelected = selectedCredential?.id === credential.id;
          
          return (
            <motion.div
              key={credential.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`cursor-pointer rounded-lg border p-4 transition-all ${
                isSelected 
                  ? 'border-sirsi-500 bg-sirsi-50 dark:bg-sirsi-900/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-sirsi-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900'
              }`}
              onClick={() => onSelect(credential)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getProviderColor(credential.type)}`}>
                    <ProviderIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{credential.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {credential.type.toUpperCase()} • {credential.region || credential.subscription || credential.project}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last used: {credential.lastUsed} • Expires: {credential.expiresIn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(credential.status)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(showDetails === credential.id ? null : credential.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showDetails === credential.id ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {showDetails === credential.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Account/Project:</span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {credential.account || credential.subscription || credential.project || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <p className="text-gray-600 dark:text-gray-400 capitalize">{credential.status}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Health Check:</span>
                      <p className={`text-xs ${
                        credential.healthCheck.includes('Passed') ? 'text-green-600' :
                        credential.healthCheck.includes('Warning') ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{credential.healthCheck}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Encryption:</span>
                      <p className="text-gray-600 dark:text-gray-400">{credential.encryptionStatus}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Auto-Rotation:</span>
                      <div className="flex items-center space-x-1">
                        {credential.rotationEnabled ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        )}
                        <span className={credential.rotationEnabled ? 'text-green-600' : 'text-yellow-600'}>
                          {credential.rotationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Last Rotated:</span>
                      <p className={`text-gray-600 dark:text-gray-400 ${credential.lastRotated === 'Never' ? 'text-yellow-600' : ''}`}>
                        {credential.lastRotated}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Permissions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {credential.scopes.slice(0, 3).map((scope, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                          >
                            {scope}
                          </span>
                        ))}
                        {credential.scopes.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{credential.scopes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add New Credential */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-sirsi-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
        onClick={() => window.location.href = '/credentials'}
      >
        <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Credentials</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Configure additional cloud provider access</p>
      </motion.div>

      {/* Validation Message */}
      {required && !selectedCredential && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Please select credentials to proceed</span>
        </div>
      )}
    </div>
  );
};
