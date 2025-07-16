'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Network, 
  Users, 
  HardDrive, 
  Cpu, 
  Shield, 
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface DiscoveredAsset {
  id: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'user' | 'device' | 'application' | 'storage';
  status: 'active' | 'inactive' | 'warning' | 'critical';
  ip?: string;
  location: string;
  owner?: string;
  lastSeen: string;
  securityStatus: 'secure' | 'vulnerable' | 'unknown';
  migrationReady: boolean;
  metadata: Record<string, any>;
}

interface ProcessCatalogComponentProps {
  assets?: DiscoveredAsset[];
  onAssetSelect: (asset: DiscoveredAsset) => void;
  onExport: () => void;
}

const MOCK_ASSETS: DiscoveredAsset[] = [
  {
    id: 'srv-001',
    name: 'web-server-01',
    type: 'server',
    status: 'active',
    ip: '10.0.1.10',
    location: 'us-east-1',
    owner: 'admin@company.com',
    lastSeen: '2025-07-08T05:50:00Z',
    securityStatus: 'secure',
    migrationReady: true,
    metadata: {
      os: 'Ubuntu 22.04',
      cpu: '4 cores',
      memory: '16GB',
      storage: '100GB SSD'
    }
  },
  {
    id: 'db-001',
    name: 'postgres-primary',
    type: 'database',
    status: 'active',
    ip: '10.0.1.20',
    location: 'us-east-1',
    owner: 'dba@company.com',
    lastSeen: '2025-07-08T05:50:00Z',
    securityStatus: 'secure',
    migrationReady: true,
    metadata: {
      engine: 'PostgreSQL 15',
      size: '500GB',
      connections: '45/100'
    }
  },
  {
    id: 'net-001',
    name: 'production-vpc',
    type: 'network',
    status: 'active',
    location: 'us-east-1',
    owner: 'netops@company.com',
    lastSeen: '2025-07-08T05:50:00Z',
    securityStatus: 'secure',
    migrationReady: false,
    metadata: {
      cidr: '10.0.0.0/16',
      subnets: '4',
      gateways: '2'
    }
  },
  {
    id: 'usr-001',
    name: 'john.doe',
    type: 'user',
    status: 'active',
    location: 'global',
    lastSeen: '2025-07-08T05:45:00Z',
    securityStatus: 'secure',
    migrationReady: true,
    metadata: {
      role: 'admin',
      lastLogin: '2025-07-08T05:45:00Z',
      permissions: 'full'
    }
  }
];

export function ProcessCatalogComponent({ 
  assets = MOCK_ASSETS, 
  onAssetSelect, 
  onExport 
}: ProcessCatalogComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<DiscoveredAsset | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'network':
        return <Network className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'device':
        return <Cpu className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'inactive':
        return 'text-gray-600 dark:text-gray-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSecurityIcon = (securityStatus: string) => {
    switch (securityStatus) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'vulnerable':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const assetCounts = {
    total: assets.length,
    ready: assets.filter(a => a.migrationReady).length,
    secure: assets.filter(a => a.securityStatus === 'secure').length,
    vulnerable: assets.filter(a => a.securityStatus === 'vulnerable').length
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Discovered Assets Catalog
          </h2>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <Download className="h-4 w-4" />
            Export Catalog
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{assetCounts.total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Assets</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{assetCounts.ready}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Migration Ready</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{assetCounts.secure}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Secure</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{assetCounts.vulnerable}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Vulnerable</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets by name, IP, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="server">Servers</option>
              <option value="database">Databases</option>
              <option value="network">Networks</option>
              <option value="user">Users</option>
              <option value="device">Devices</option>
              <option value="storage">Storage</option>
            </select>
          </div>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Asset</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">IP/Location</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Security</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Migration</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(asset.type)}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{asset.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{asset.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-slate-700 dark:text-slate-300">{asset.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`capitalize ${getStatusColor(asset.status)}`}>{asset.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {asset.ip && <div className="font-mono">{asset.ip}</div>}
                      <div className="text-slate-600 dark:text-slate-400">{asset.location}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {getSecurityIcon(asset.securityStatus)}
                      <span className="text-sm capitalize">{asset.securityStatus}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      asset.migrationReady 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {asset.migrationReady ? 'Ready' : 'Not Ready'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            No assets found matching your criteria.
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Asset Details: {selectedAsset.name}
              </h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                  <div className="capitalize">{selectedAsset.type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <div className={getStatusColor(selectedAsset.status)}>{selectedAsset.status}</div>
                </div>
                {selectedAsset.ip && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">IP Address</label>
                    <div className="font-mono">{selectedAsset.ip}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                  <div>{selectedAsset.location}</div>
                </div>
                {selectedAsset.owner && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Owner</label>
                    <div>{selectedAsset.owner}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Seen</label>
                  <div>{new Date(selectedAsset.lastSeen).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Metadata</label>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <pre className="text-sm text-slate-700 dark:text-slate-300">
                    {JSON.stringify(selectedAsset.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
