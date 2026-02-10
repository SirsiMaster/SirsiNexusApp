import { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useAdmin';

export function AnalyticsDashboard() {
    const { data: users } = useUsers(100);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setLastUpdated(new Date().toLocaleTimeString()), 60000);
        return () => clearInterval(timer);
    }, []);

    const metrics = [
        { label: 'Total Accounts', value: users?.users?.length || '1,284', trend: '+12%', color: 'text-blue-400', icon: '👤' },
        { label: 'Active Sessions', value: '42', trend: '+8', color: 'text-emerald', icon: '⚡' },
        { label: 'Platform Revenue', value: '$84.2k', trend: '+22%', color: 'text-gold', icon: '💰' },
        { label: 'Vault Integrity', value: '99.9%', trend: 'Stable', color: 'text-purple-400', icon: '🛡️' },
    ];

    const performance = [
        { label: 'LCP (Largest Render)', value: '1.2s', status: 'Optimal' },
        { label: 'FID (Input Latency)', value: '14ms', status: 'Optimal' },
        { label: 'CLS (Layout Shift)', value: '0.02', status: 'Optimal' },
        { label: 'TTFB (First Byte)', value: '150ms', status: 'Good' },
    ];

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">System Intelligence</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Real-time telemetry and user behavior analytics</p>
                </div>
                <div className="inter text-[9px] text-slate-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded bg-white/5">
                    Last Sync: <span className="text-slate-300 ml-1">{lastUpdated}</span>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="neo-glass-panel p-6 border border-white/10 rounded-xl relative overflow-hidden group hover:border-gold/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity translate-x-2 -translate-y-2">{m.icon}</div>
                        <span className="inter text-[10px] text-slate-400 uppercase tracking-widest block mb-2">{m.label}</span>
                        <div className="flex items-end justify-between">
                            <span className="cinzel text-2xl font-bold text-white">{m.value}</span>
                            <span className={`inter text-[9px] font-bold ${m.trend.startsWith('+') ? 'text-emerald' : 'text-slate-400'}`}>
                                {m.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Traffic Simulation */}
                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6">
                    <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">User Engagement Trend</h3>
                    <div className="h-48 flex items-end gap-2 border-b border-white/5 pb-2">
                        {[40, 60, 45, 80, 55, 90, 70, 85, 95, 100, 80, 85].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-gold/40 to-gold/10 rounded-t-sm hover:from-gold hover:to-gold/40 transition-all duration-300 relative group"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gold text-navy text-[8px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {h} Users
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between inter text-[8px] text-slate-500 uppercase tracking-widest">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Performance Plane */}
                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6">
                    <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">Core Web Vitals (T4 Plane)</h3>
                    <div className="space-y-4">
                        {performance.map((p, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="inter text-[10px] text-slate-300 uppercase tracking-tight">{p.label}</span>
                                    <span className="inter text-[10px] text-emerald font-bold">{p.value} <span className="text-[8px] opacity-60 ml-1">({p.status})</span></span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald shadow-[0_0_8px_#10B981]" style={{ width: i === 0 ? '90%' : i === 1 ? '98%' : i === 2 ? '95%' : '85%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                    <h4 className="inter text-[9px] text-gold font-bold uppercase tracking-widest mb-6">Device Distribution</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Desktop', val: '65%', color: 'bg-blue-400' },
                            { label: 'Mobile', val: '30%', color: 'bg-gold' },
                            { label: 'Tablet', val: '5%', color: 'bg-purple-400' }
                        ].map((d, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${d.color}`}></div>
                                <span className="inter text-xs text-slate-400 flex-1">{d.label}</span>
                                <span className="inter text-xs text-white font-bold">{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                    <h4 className="inter text-[9px] text-gold font-bold uppercase tracking-widest mb-6">Identity Verification</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'TOTP Gated', val: '88%', color: 'bg-emerald' },
                            { label: 'SMS Verified', val: '10%', color: 'bg-blue-400' },
                            { label: 'Legacy/Unknown', val: '2%', color: 'bg-red-400' }
                        ].map((d, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${d.color}`}></div>
                                <span className="inter text-xs text-slate-400 flex-1">{d.label}</span>
                                <span className="inter text-xs text-white font-bold">{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl">
                    <h4 className="inter text-[9px] text-gold font-bold uppercase tracking-widest mb-6">Regional Distribution</h4>
                    <div className="space-y-4 whitespace-nowrap overflow-hidden">
                        {[
                            { label: 'US-CENTRAL1', val: 'Operational', color: 'text-emerald' },
                            { label: 'US-EAST4', val: 'Operational', color: 'text-emerald' },
                            { label: 'EU-WEST1', val: 'De-commissioned', color: 'text-slate-500' }
                        ].map((d, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="inter text-xs text-slate-400 flex-1">{d.label}</span>
                                <span className={`inter text-[10px] font-bold ${d.color} uppercase`}>{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
