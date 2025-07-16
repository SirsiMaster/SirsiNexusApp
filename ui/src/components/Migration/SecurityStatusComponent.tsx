'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wifi, 
  Key, 
  Database,
  Server,
  Globe,
  RefreshCw
} from 'lucide-react';

interface SecurityProtocol {
  id: string;
  name: string;
  type: 'transport' | 'authentication' | 'encryption' | 'identity';
  status: 'active' | 'inactive' | 'warning' | 'error';
  description: string;
  port?: number;
  version?: string;
  lastChecked: string;
  details: {
    algorithm?: string;
    keyLength?: string;
    certificate?: string;
    expiry?: string;
  };
}

interface SecurityStatusComponentProps {
  onSecurityValidated: (validated: boolean) => void;
  onRefresh: () => void;
}

const MOCK_SECURITY_PROTOCOLS: SecurityProtocol[] = [
  {
    id: 'mtls',
    name: 'mTLS (Mutual TLS)',
    type: 'transport',
    status: 'active',
    description: 'Mutual TLS for secure bidirectional authentication',
    port: 443,
    version: '1.3',
    lastChecked: '2025-07-08T06:05:00Z',
    details: {
      algorithm: 'ECDHE-RSA-AES256-GCM-SHA384',
      keyLength: '2048-bit',
      certificate: 'sirsi-nexus.crt',
      expiry: '2026-01-15T00:00:00Z'
    }
  },
  {
    id: 'https',
    name: 'HTTPS',
    type: 'transport',
    status: 'active',
    description: 'Secure HTTP communications with TLS encryption',
    port: 443,
    version: '1.3',
    lastChecked: '2025-07-08T06:05:00Z',
    details: {
      algorithm: 'AES-256-GCM',
      keyLength: '256-bit',
      certificate: 'wildcard.sirsi-nexus.com',
      expiry: '2026-03-20T00:00:00Z'
    }
  },
  {
    id: 'ssh',
    name: 'SSH',
    type: 'transport',
    status: 'active',
    description: 'Secure Shell for encrypted remote access',
    port: 22,
    version: '2.0',
    lastChecked: '2025-07-08T06:05:00Z',
    details: {
      algorithm: 'RSA-SHA256',
      keyLength: '4096-bit',
      certificate: 'ssh-host-key'
    }
  },
  {
    id: 'sftp',
    name: 'SFTP',
    type: 'transport',
    status: 'active',
    description: 'Secure File Transfer Protocol over SSH',
    port: 22,
    version: '3.0',
    lastChecked: '2025-07-08T06:05:00Z',
    details: {
      algorithm: 'AES-256-CTR',
      keyLength: '256-bit'
    }
  },
  {
    id: 'spiffe',
    name: 'SPIFFE/SPIRE',
    type: 'identity',
    status: 'active',
    description: 'Secure Production Identity Framework for Everyone',
    lastChecked: '2025-07-08T06:05:00Z',
    details: {
      certificate: 'spiffe://sirsi-nexus.com/workload',
      expiry: '2025-07-08T18:00:00Z'
    }
  },
  {
    id: 'vault',
    name: 'HashiCorp Vault',
    type: 'encryption',
    status: 'active',
    description: 'Secrets management and encryption',
    port: 8200,
    lastChecked: '2025-07-08T06:05:00Z',
    details: {
      algorithm: 'AES-256-GCM',
      keyLength: '256-bit'
    }
  }
];

export function SecurityStatusComponent({ onSecurityValidated, onRefresh }: SecurityStatusComponentProps) {
  const [protocols, setProtocols] = useState<SecurityProtocol[]>(MOCK_SECURITY_PROTOCOLS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<SecurityProtocol | null>(null);

  useEffect(() => {
    const allActive = protocols.every(p => p.status === 'active');
    onSecurityValidated(allActive);
  }, [protocols, onSecurityValidated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();
    
    // Simulate refresh
    setTimeout(() => {
      setProtocols(prev => prev.map(p => ({
        ...p,
        lastChecked: new Date().toISOString()
      })));
      setIsRefreshing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return <Wifi className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'authentication':
        return <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'encryption':
        return <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'identity':
        return <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
      case 'inactive':
        return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const protocolsByType = protocols.reduce((acc, protocol) => {
    if (!acc[protocol.type]) {
      acc[protocol.type] = [];
    }
    acc[protocol.type].push(protocol);
    return acc;
  }, {} as Record<string, SecurityProtocol[]>);

  const activeCount = protocols.filter(p => p.status === 'active').length;
  const warningCount = protocols.filter(p => p.status === 'warning').length;
  const errorCount = protocols.filter(p => p.status === 'error' || p.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Protocol Status
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Active</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{warningCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Warnings</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{errorCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Errors</div>
          </div>
        </div>

        {/* Protocol Groups */}
        <div className="space-y-4">
          {Object.entries(protocolsByType).map(([type, typeProtocols]) => (
            <div key={type} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
              <h3 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 capitalize">
                {getTypeIcon(type)}
                {type} Protocols
              </h3>
              <div className="space-y-2">
                {typeProtocols.map((protocol) => (
                  <motion.div
                    key={protocol.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all ${getStatusColor(protocol.status)}`}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(protocol.status)}
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {protocol.name}
                            {protocol.port && <span className="text-xs text-slate-500 ml-2">:{protocol.port}</span>}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{protocol.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium capitalize ${
                          protocol.status === 'active' ? 'text-green-600 dark:text-green-400' :
                          protocol.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {protocol.status}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(protocol.lastChecked).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Status */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${
              errorCount > 0 ? 'text-red-600 dark:text-red-400' :
              warningCount > 0 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {getStatusIcon(errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'active')}
              <span className="font-medium">
                {errorCount > 0 ? 'Security Issues Detected' :
                 warningCount > 0 ? 'Security Warnings Present' :
                 'All Security Protocols Active'}
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last checked: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-2xl w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {getTypeIcon(selectedProtocol.type)}
                {selectedProtocol.name} Details
              </h3>
              <button
                onClick={() => setSelectedProtocol(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedProtocol.status)}
                    <span className="capitalize">{selectedProtocol.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                  <div className="flex items-center gap-2 capitalize">
                    {getTypeIcon(selectedProtocol.type)}
                    {selectedProtocol.type}
                  </div>
                </div>
                {selectedProtocol.port && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Port</label>
                    <div>{selectedProtocol.port}</div>
                  </div>
                )}
                {selectedProtocol.version && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Version</label>
                    <div>{selectedProtocol.version}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <p className="text-slate-600 dark:text-slate-400">{selectedProtocol.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Security Details</label>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedProtocol.details.algorithm && (
                      <div>
                        <span className="font-medium">Algorithm:</span>
                        <div className="font-mono text-xs">{selectedProtocol.details.algorithm}</div>
                      </div>
                    )}
                    {selectedProtocol.details.keyLength && (
                      <div>
                        <span className="font-medium">Key Length:</span>
                        <div>{selectedProtocol.details.keyLength}</div>
                      </div>
                    )}
                    {selectedProtocol.details.certificate && (
                      <div>
                        <span className="font-medium">Certificate:</span>
                        <div className="font-mono text-xs">{selectedProtocol.details.certificate}</div>
                      </div>
                    )}
                    {selectedProtocol.details.expiry && (
                      <div>
                        <span className="font-medium">Expires:</span>
                        <div>{new Date(selectedProtocol.details.expiry).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
