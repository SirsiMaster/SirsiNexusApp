import { useState, useEffect } from 'react';
import { ContractsManagement } from './ContractsManagement';
import { TenantManager } from './TenantManager';
import { UsersAccessControl } from './UsersAccessControl';
import { DevDashboard } from './DevDashboard';
import { NotificationEngine } from './NotificationEngine';
import { SystemSettings } from './SystemSettings';
import { MFAEnrollment } from '../auth/MFAEnrollment';
import { useLogDevSession } from '../../hooks/useAdmin';
import { auth } from '../../lib/firebase';

import { AnalyticsDashboard } from './AnalyticsDashboard';
import { RevenueDashboard } from './RevenueDashboard';
import { CreateInvoice } from './CreateInvoice';
import { DeveloperPortal } from './DeveloperPortal';
import { DataRoom } from './DataRoom';
import { SystemLogs } from './SystemLogs';
import { DocumentationPortal } from './DocumentationPortal';
import { GovernancePortal } from './governance/GovernancePortal';

type AdminTab = 'contracts' | 'tenants' | 'users' | 'governance' | 'analytics' | 'revenue' | 'invoices' | 'dataroom' | 'developers' | 'logs' | 'docs' | 'development' | 'notifications' | 'settings' | 'mfa';

export function AdminPortal() {
    const [activeTab, setActiveTab] = useState<AdminTab>('contracts');
    const logSession = useLogDevSession();

    useEffect(() => {
        if (auth.currentUser) {
            logSession.mutate({
                developerId: auth.currentUser.uid,
                action: 'ADMIN_PORTAL_ENTER',
                metadata: JSON.stringify({
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    initialTab: activeTab
                })
            });
        }
    }, []);

    const tabs: { id: AdminTab; label: string; icon: string; category?: string }[] = [
        { id: 'contracts', label: 'Contract Manager', icon: '📜', category: 'Operations' },
        { id: 'tenants', label: 'Tenant Registry', icon: '🏛️', category: 'Operations' },
        { id: 'users', label: 'Users & Roles', icon: '👤', category: 'Operations' },
        { id: 'dataroom', label: 'Data Room', icon: '🔐', category: 'Operations' },
        { id: 'governance', label: 'Studio Governance', icon: '⚖️', category: 'Operations' },

        { id: 'analytics', label: 'Intelligence', icon: '🧠', category: 'Intelligence' },
        { id: 'revenue', label: 'Financials', icon: '💰', category: 'Intelligence' },
        { id: 'invoices', label: 'Billing', icon: '🧾', category: 'Intelligence' },

        { id: 'developers', label: 'Dev Forge', icon: '🚀', category: 'Engineering' },
        { id: 'development', label: 'System Engineering', icon: '💻', category: 'Engineering' },
        { id: 'logs', label: 'System Logs', icon: '📑', category: 'Engineering' },

        { id: 'docs', label: 'Documentation', icon: '📚', category: 'Knowledge' },
        { id: 'notifications', label: 'Omni-Notify', icon: '🔔', category: 'Knowledge' },
        { id: 'settings', label: 'System Config', icon: '⚙️', category: 'Knowledge' },
        { id: 'mfa', label: 'Security (MFA)', icon: '🛡️', category: 'Knowledge' },
    ];

    return (
        <div className="min-h-screen bg-navy text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col backdrop-blur-xl bg-black/20">
                <div className="p-8">
                    <h1 className="cinzel text-xl text-gold tracking-widest font-bold">SIRSI ADMIN</h1>
                    <p className="inter text-[10px] text-slate-500 tracking-[0.2em] font-medium mt-1 uppercase">Permanent Ledger Hub</p>
                </div>

                <nav className="flex-1 px-4 py-2 flex flex-col gap-6">
                    {/* Main Section */}
                    <div>
                        <p className="inter text-[9px] text-slate-500 tracking-[0.2em] font-bold px-4 mb-3 uppercase">Main</p>
                        <a
                            href="https://sign.sirsi.ai/vault"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 inter text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-transparent group"
                        >
                            <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">🛡️</span>
                            Document Vault
                        </a>
                    </div>

                    {/* Dynamic Tabs by Category */}
                    {['Operations', 'Intelligence', 'Engineering', 'Knowledge'].map(category => (
                        <div key={category}>
                            <p className="inter text-[9px] text-slate-500 tracking-[0.2em] font-bold px-4 mb-3 uppercase">{category}</p>
                            <div className="flex flex-col gap-1">
                                {tabs.filter(t => t.category === category).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 inter text-sm font-medium ${activeTab === tab.id
                                            ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_15px_rgba(200,169,81,0.1)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <span className="text-lg opacity-70">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald/20 border border-emerald/50 flex items-center justify-center text-[10px] text-emerald font-bold">CC</div>
                        <div className="flex flex-col">
                            <span className="inter text-xs font-semibold text-white">Cylton Collymore</span>
                            <span className="inter text-[9px] text-slate-500 uppercase tracking-tighter">System Architect</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-12">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'contracts' && <ContractsManagement />}
                    {activeTab === 'tenants' && <TenantManager />}
                    {activeTab === 'users' && <UsersAccessControl />}
                    {activeTab === 'analytics' && <AnalyticsDashboard />}
                    {activeTab === 'revenue' && <RevenueDashboard />}
                    {activeTab === 'invoices' && <CreateInvoice />}
                    {activeTab === 'dataroom' && <DataRoom />}
                    {activeTab === 'governance' && <GovernancePortal />}
                    {activeTab === 'developers' && <DeveloperPortal />}
                    {activeTab === 'development' && <DevDashboard />}
                    {activeTab === 'logs' && <SystemLogs />}
                    {activeTab === 'docs' && <DocumentationPortal />}
                    {activeTab === 'notifications' && <NotificationEngine />}
                    {activeTab === 'settings' && <SystemSettings />}
                    {activeTab === 'mfa' && (
                        <MFAEnrollment
                            onComplete={() => setActiveTab('contracts')}
                            onCancel={() => setActiveTab('contracts')}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
