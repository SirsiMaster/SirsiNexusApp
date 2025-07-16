'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Breadcrumb } from '@/components/Breadcrumb';
import { credentialService, type Credential, type CredentialFormData, type CloudProvider } from '@/services/credentialService';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Settings,
  Trash2,
  TestTube,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Cloud,
  Key,
  Clock,
  AlertTriangle,
  Edit3,
  Copy,
  Shield,
  Database,
  Zap,
} from 'lucide-react';

// Use types from service

// Use types from service


export default function CredentialsPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [testingCredentials, setTestingCredentials] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CredentialFormData>({
    provider: 'aws',
    alias: '',
    credentials: {},
    test_connection: true,
  });
  const [showSensitiveData, setShowSensitiveData] = useState<Set<string>>(new Set());

  // Load credentials on mount
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    loadCredentials();
  }, [isAuthenticated]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialService.listCredentials();
      setCredentials(response.credentials);
    } catch (error: any) {
      console.error('Failed to load credentials:', error);
      toast.error(error.error || 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async () => {
    try {
      // Validate form data
      const errors = credentialService.validateCredentials(formData.provider, formData.credentials);
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }

      const response = await credentialService.createCredential(formData);
      
      // Add to local state
      const newCredential: Credential = {
        id: response.id,
        provider: response.provider,
        alias: response.alias,
        created_at: response.created_at,
        updated_at: response.updated_at,
        testStatus: response.test_result?.success ? 'success' : response.test_result ? 'failed' : 'never',
      };
      
      setCredentials(prev => [...prev, newCredential]);
      setShowCreateModal(false);
      setFormData({
        provider: 'aws',
        alias: '',
        credentials: {},
        test_connection: true,
      });
      
      toast.success('Credential created successfully');
      
      if (response.test_result) {
        if (response.test_result.success) {
          toast.success('Credential test passed');
        } else {
          toast.error(`Credential test failed: ${response.test_result.message}`);
        }
      }
    } catch (error: any) {
      console.error('Failed to create credential:', error);
      toast.error(error.error || 'Failed to create credential');
    }
  };

  const handleTestCredential = async (credentialId: string) => {
    setTestingCredentials(prev => new Set([...prev, credentialId]));
    
    try {
      const result = await credentialService.testCredential(credentialId);
      
      // Update the credential status
      setCredentials(prev => prev.map(cred => 
        cred.id === credentialId 
          ? { 
              ...cred, 
              lastTested: new Date().toISOString(),
              testStatus: result.success ? 'success' : 'failed',
            }
          : cred
      ));
      
      if (result.success) {
        toast.success('Credential test passed');
      } else {
        toast.error(`Credential test failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Failed to test credential:', error);
      toast.error(error.error || 'Failed to test credential');
      
      setCredentials(prev => prev.map(cred => 
        cred.id === credentialId 
          ? { ...cred, testStatus: 'failed' }
          : cred
      ));
    } finally {
      setTestingCredentials(prev => {
        const newSet = new Set(prev);
        newSet.delete(credentialId);
        return newSet;
      });
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        await credentialService.deleteCredential(credentialId);
        setCredentials(prev => prev.filter(cred => cred.id !== credentialId));
        toast.success('Credential deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete credential:', error);
        toast.error(error.error || 'Failed to delete credential');
      }
    }
  };

  const toggleSensitiveData = (fieldId: string) => {
    setShowSensitiveData(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const renderCredentialForm = () => {
    const { provider, credentials: creds } = formData;
    const providers = credentialService.getAllProviders();
    const currentProvider = credentialService.getProviderInfo(provider);

    return (
      <div className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Cloud Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            {providers.map((providerInfo) => (
              <button
                key={providerInfo.id}
                onClick={() => setFormData({ ...formData, provider: providerInfo.id })}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  provider === providerInfo.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{providerInfo.icon}</span>
                  <span className="font-medium">{providerInfo.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alias */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Alias (Optional)
          </label>
          <input
            type="text"
            value={formData.alias}
            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
            placeholder={`e.g., Production ${currentProvider.name}`}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Provider-specific fields */}
        {provider === 'aws' && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">AWS Credentials</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Access Key ID *
              </label>
              <input
                type="text"
                value={creds.access_key_id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, access_key_id: e.target.value }
                })}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secret Access Key *
              </label>
              <div className="relative">
                <input
                  type={showSensitiveData.has('aws_secret') ? 'text' : 'password'}
                  value={creds.secret_access_key || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: { ...creds, secret_access_key: e.target.value }
                  })}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSensitiveData('aws_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSensitiveData.has('aws_secret') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Region
              </label>
              <input
                type="text"
                value={creds.region || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, region: e.target.value }
                })}
                placeholder="us-east-1"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {provider === 'azure' && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Azure Credentials</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client ID *
              </label>
              <input
                type="text"
                value={creds.client_id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, client_id: e.target.value }
                })}
                placeholder="12345678-1234-1234-1234-123456789012"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client Secret *
              </label>
              <div className="relative">
                <input
                  type={showSensitiveData.has('azure_secret') ? 'text' : 'password'}
                  value={creds.client_secret || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: { ...creds, client_secret: e.target.value }
                  })}
                  placeholder="Client secret value"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSensitiveData('azure_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSensitiveData.has('azure_secret') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tenant ID *
              </label>
              <input
                type="text"
                value={creds.tenant_id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, tenant_id: e.target.value }
                })}
                placeholder="87654321-4321-4321-4321-210987654321"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subscription ID
              </label>
              <input
                type="text"
                value={creds.subscription_id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, subscription_id: e.target.value }
                })}
                placeholder="11111111-1111-1111-1111-111111111111"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {provider === 'gcp' && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Google Cloud Credentials</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Service Account Key (JSON) *
              </label>
              <textarea
                value={creds.service_account_key || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, service_account_key: e.target.value }
                })}
                placeholder="Paste your service account JSON key file content here"
                rows={6}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project ID
              </label>
              <input
                type="text"
                value={creds.project_id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...creds, project_id: e.target.value }
                })}
                placeholder="my-gcp-project"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {provider === 'digitalocean' && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">DigitalOcean Credentials</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                API Token *
              </label>
              <div className="relative">
                <input
                  type={showSensitiveData.has('do_token') ? 'text' : 'password'}
                  value={creds.api_token || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: { ...creds, api_token: e.target.value }
                  })}
                  placeholder="dop_v1_..."
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSensitiveData('do_token')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSensitiveData.has('do_token') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Connection */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="test_connection"
            checked={formData.test_connection}
            onChange={(e) => setFormData({ ...formData, test_connection: e.target.checked })}
            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="test_connection" className="text-sm text-slate-700">
            Test connection after saving
          </label>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="bg-transparent">
      <Breadcrumb />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Cloud Credentials
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your cloud provider credentials securely
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Credential
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Key className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Credentials</p>
                <p className="text-xl font-semibold text-slate-900">{credentials.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-xl font-semibold text-slate-900">
                  {credentials.filter(c => c.testStatus === 'success').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Failed</p>
                <p className="text-xl font-semibold text-slate-900">
                  {credentials.filter(c => c.testStatus === 'failed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Untested</p>
                <p className="text-xl font-semibold text-slate-900">
                  {credentials.filter(c => c.testStatus === 'never').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-2 text-slate-600">Loading credentials...</span>
        </div>
      )}

      {/* Credentials List */}
      {!loading && (
        <div className="space-y-4">
          {credentials.map((credential) => (
          <div
            key={credential.id}
            className="bg-white dark:bg-gray-800 border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{credentialService.getProviderInfo(credential.provider).icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">
                      {credential.alias || `${credentialService.getProviderInfo(credential.provider).name} Credential`}
                    </h3>
                    {credential.testStatus === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {credential.testStatus === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {credential.testStatus === 'pending' && (
                      <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                    )}
                    {credential.testStatus === 'never' && (
                      <AlertTriangle className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {credentialService.getProviderInfo(credential.provider).name} • Created {new Date(credential.created_at).toLocaleDateString()}
                  </p>
                  {credential.lastTested && (
                    <p className="text-xs text-slate-500">
                      Last tested: {new Date(credential.lastTested).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestCredential(credential.id)}
                  disabled={testingCredentials.has(credential.id)}
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Test Connection"
                >
                  <TestTube className={`h-4 w-4 ${testingCredentials.has(credential.id) ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setSelectedCredential(credential);
                    setShowEditModal(true);
                  }}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCredential(credential.id)}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {credentials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Key className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No credentials yet
            </h3>
            <p className="text-slate-600 mb-6">
              Add your first cloud provider credential to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Credential
            </button>
          </div>
        )}
      </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                Add Cloud Credential
              </h2>
            </div>
            <div className="p-6">
              {renderCredentialForm()}
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCredential}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
