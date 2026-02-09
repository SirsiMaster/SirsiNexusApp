import { useState } from 'react';
import { MFAGate, isMFASessionVerified } from '../auth/MFAGate';
import { ContractsManagement } from './ContractsManagement';
import { TenantManager } from './TenantManager';
import { UsersAccessControl } from './UsersAccessControl';
import { DevDashboard } from './DevDashboard';
import { NotificationEngine } from './NotificationEngine';
import { SystemSettings } from './SystemSettings';
import { MFAEnrollment } from '../auth/MFAEnrollment';

type AdminTab = 'contracts' | 'tenants' | 'users' | 'development' | 'notifications' | 'settings' | 'mfa';

export function AdminPortal() {
    const [activeTab, setActiveTab] = useState<AdminTab>('contracts');
    const [mfaVerified, setMfaVerified] = useState(() => isMFASessionVerified());

    const tabs: { id: AdminTab; label: string; icon: string }[] = [
        { id: 'contracts', label: 'Contract Manager', icon: '📜' },
        { id: 'tenants', label: 'Tenant Registry', icon: '🏛️' },
        { id: 'users', label: 'Users & Roles', icon: '👤' },
        { id: 'development', label: 'Dev KPIs', icon: '💻' },
        { id: 'notifications', label: 'Omni-Notify', icon: '🔔' },
        { id: 'settings', label: 'System Config', icon: '⚙️' },
        { id: 'mfa', label: 'Security (MFA)', icon: '🔐' },
    ];

    if (!mfaVerified) {
        return (
            <MFAGate
                purpose="vault"
                onVerified={() => setMfaVerified(true)}
                onCancel={() => window.location.href = '/'}
            />
        );
    }

    return (
        <div className="min-h-screen bg-navy text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col backdrop-blur-xl bg-black/20">
                <div className="p-8">
                    <h1 className="cinzel text-xl text-gold tracking-widest font-bold">SIRSI ADMIN</h1>
                    <p className="inter text-[10px] text-slate-500 tracking-[0.2em] font-medium mt-1 uppercase">Permanent Ledger Hub</p>
                </div>

                <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                    {tabs.map(tab => (
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
                    {activeTab === 'development' && <DevDashboard />}
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
