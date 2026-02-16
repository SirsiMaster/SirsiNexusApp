import { useState } from 'react';
import { MFAGate, isMFASessionVerified } from '../auth/MFAGate';
import { InvestorDashboard } from './InvestorDashboard';
import { InvestorDataRoom } from './InvestorDataRoom';
import { InvestorKPIMetrics } from './InvestorKPIMetrics';
import { auth } from '../../lib/firebase';

type InvestorTab = 'dashboard' | 'dataroom' | 'metrics' | 'committee' | 'support';

export function InvestorPortal() {
    const [activeTab, setActiveTab] = useState<InvestorTab>('dashboard');
    const [mfaVerified, setMfaVerified] = useState(() => isMFASessionVerified());

    const tabs: { id: InvestorTab; label: string; icon: string; category?: string }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', category: 'Portal' },
        { id: 'dataroom', label: 'Data Room', icon: '📁', category: 'Portal' },
        { id: 'metrics', label: 'KPI Metrics', icon: '📈', category: 'Portal' },
        { id: 'committee', label: 'Committee Docs', icon: '🤝', category: 'Resources' },
        { id: 'support', label: 'Investor Support', icon: '💬', category: 'Resources' },
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
        <div className="min-h-screen bg-[#022c22] text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 font-bold">SN</div>
                        <div>
                            <h1 className="inter text-sm font-bold tracking-tight text-white">SirsiNexus</h1>
                            <p className="inter text-[10px] text-emerald-500/80 font-medium uppercase tracking-[0.2em]">Investor Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 flex flex-col gap-6">
                    {['Portal', 'Resources'].map(category => (
                        <div key={category}>
                            <p className="inter text-[9px] text-slate-500 tracking-[0.2em] font-bold px-4 mb-3 uppercase">{category}</p>
                            <div className="flex flex-col gap-1">
                                {tabs.filter(t => t.category === category).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 inter text-sm font-medium ${activeTab === tab.id
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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

                <div className="p-6 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {auth.currentUser?.email?.[0].toUpperCase() || 'I'}
                        </div>
                        <div className="flex flex-col">
                            <span className="inter text-xs font-semibold text-white truncate max-w-[140px]">
                                {auth.currentUser?.email || 'Authorized Investor'}
                            </span>
                            <span className="inter text-[9px] text-emerald-500 uppercase tracking-tighter">Tier 1 Access</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-[#022c22] to-slate-950">
                {/* Live KPI Banner */}
                <div className="bg-emerald-500/5 border-b border-white/5 px-12 py-3">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <KPIBadge label="ARR Y3" value="$33M" color="emerald" />
                            <KPIBadge label="Customers" value="280" color="blue" />
                            <KPIBadge label="Savings" value="25%" color="purple" />
                            <KPIBadge label="Uptime" value="99.2%" color="orange" />
                            <KPIBadge label="ROI" value="8.5x" color="indigo" />
                        </div>
                        <span className="inter text-[10px] text-slate-500 uppercase tracking-widest">
                            Live Feed • {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                <div className="p-12 max-w-6xl mx-auto">
                    {activeTab === 'dashboard' && <InvestorDashboard />}
                    {activeTab === 'dataroom' && <InvestorDataRoom />}
                    {activeTab === 'metrics' && <InvestorKPIMetrics />}
                    {activeTab === 'committee' && (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="text-4xl mb-4">📂</div>
                            <h2 className="cinzel text-xl text-gold mb-2">Committee Documents</h2>
                            <p className="inter text-sm text-slate-400 max-w-md">Access strategic committee records, market analysis, and product roadmaps from the secure repository.</p>
                            <button className="mt-8 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inter text-xs font-bold transition-all">Launch Document Store</button>
                        </div>
                    )}
                    {activeTab === 'support' && (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="text-4xl mb-4">💬</div>
                            <h2 className="cinzel text-xl text-gold mb-2">Investor Relations</h2>
                            <p className="inter text-sm text-slate-400 max-w-md">Primary contact: Cylton Collymore (General Partner). Direct support for cap table inquiries and strategic mandates.</p>
                            <button className="mt-8 px-6 py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg inter text-xs font-bold transition-all">Open Secure Channel</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function KPIBadge({ label, value, color }: { label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        indigo: 'bg-indigo-500',
        rose: 'bg-rose-500'
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${colors[color]} animate-pulse`} />
            <span className="inter text-[10px] font-medium text-slate-400 uppercase tracking-tight">{label}:</span>
            <span className={`inter text-[11px] font-bold text-${color}-400`}>{value}</span>
        </div>
    );
}
