'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateUser } from '@/store/slices/authSlice';
import { useToast } from '@/components/ui/toast';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Key,
  Eye,
  EyeOff,
  Save,
  Upload,
  Trash2,
  Plus,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Download,
  Upload as UploadIcon,
  Settings,
  Smartphone,
  Globe,
  CreditCard,
  Activity,
  LogOut,
  UserX
} from 'lucide-react';

interface CredentialItem {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'database' | 'api' | 'ssh';
  description: string;
  lastUsed: string;
  isEncrypted: boolean;
}

export default function AccountSettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { showToast } = useToast();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    migrationAlerts: true,
    securityAlerts: true,
    weeklyReports: false,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });
  
  // Credentials state
  const [credentials, setCredentials] = useState<CredentialItem[]>([
    {
      id: '1',
      name: 'AWS Production',
      type: 'aws',
      description: 'Main AWS account for production workloads',
      lastUsed: '2 hours ago',
      isEncrypted: true,
    },
    {
      id: '2',
      name: 'Azure DevOps',
      type: 'azure',
      description: 'Development environment credentials',
      lastUsed: '1 day ago',
      isEncrypted: true,
    },
    {
      id: '3',
      name: 'Production DB',
      type: 'database',
      description: 'PostgreSQL production database',
      lastUsed: '3 hours ago',
      isEncrypted: true,
    },
  ]);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [editingCredential, setEditingCredential] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleProfileUpdate = async () => {
    try {
      if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
        showToast({
          type: 'error',
          title: 'Password Mismatch',
          message: 'New password and confirmation do not match',
        });
        return;
      }

      dispatch(updateUser({ email: profileData.email }));
      
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleCredentialDelete = (id: string) => {
    setCredentials(prev => prev.filter(cred => cred.id !== id));
    setShowDeleteConfirm(null);
    showToast({
      type: 'success',
      title: 'Credential Deleted',
      message: 'Credential has been permanently removed',
    });
  };

  const handleDataExport = () => {
    const data = {
      profile: { email: user?.email, role: user?.role },
      credentials: credentials.map(c => ({ name: c.name, type: c.type, description: c.description })),
      settings: { notifications, security: securitySettings },
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sirsi-nexus-account-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Data Exported',
      message: 'Your account data has been downloaded',
    });
  };

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case 'aws': return '🟠';
      case 'azure': return '🔵';
      case 'gcp': return '🟡';
      case 'database': return '🗄️';
      case 'api': return '🔗';
      case 'ssh': return '🔑';
      default: return '📁';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'credentials', label: 'Credentials', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Settings</h1>
          <p className="text-slate-600">Manage your account, security, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-50 dark:from-gray-900 dark:to-gray-8000 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
                      <p className="text-slate-600">Update your account details and preferences</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Role
                      </label>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          user?.role === 'admin' 
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {user?.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={profileData.currentPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleProfileUpdate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Credentials Tab */}
              {activeTab === 'credentials' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Stored Credentials</h2>
                      <p className="text-slate-600">Manage your saved infrastructure and service credentials</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="h-4 w-4" />
                      Add Credential
                    </button>
                  </div>

                  <div className="space-y-4">
                    {credentials.map((credential) => (
                      <div key={credential.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{getCredentialIcon(credential.type)}</div>
                            <div>
                              <h3 className="font-medium text-slate-900">{credential.name}</h3>
                              <p className="text-sm text-slate-600">{credential.description}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-slate-500">Last used: {credential.lastUsed}</span>
                                {credential.isEncrypted && (
                                  <span className="flex items-center gap-1 text-xs text-green-600">
                                    <Shield className="h-3 w-3" />
                                    Encrypted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(credential.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">Active Sessions</h3>
                          <p className="text-sm text-slate-600">Manage your active login sessions</p>
                        </div>
                        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                          View Sessions
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">Login Alerts</h3>
                          <p className="text-sm text-slate-600">Get notified of new sign-ins</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securitySettings.loginAlerts}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAlerts: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                        <div>
                          <h3 className="font-medium text-slate-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {key === 'emailNotifications' && 'Receive updates via email'}
                            {key === 'pushNotifications' && 'Browser push notifications'}
                            {key === 'migrationAlerts' && 'Alerts for migration status changes'}
                            {key === 'securityAlerts' && 'Security-related notifications'}
                            {key === 'weeklyReports' && 'Weekly summary reports'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data & Privacy Tab */}
              {activeTab === 'data' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Data & Privacy</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">Export Account Data</h3>
                          <p className="text-sm text-slate-600">Download all your account data and settings</p>
                        </div>
                        <button 
                          onClick={handleDataExport}
                          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Export Data
                        </button>
                      </div>
                    </div>

                    <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-red-900">Delete Account</h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900">Delete Credential</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this credential? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCredentialDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
