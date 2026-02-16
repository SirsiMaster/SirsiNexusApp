import { useLogDevSession } from '../../hooks/useAdmin';
import { useState } from 'react';

export function DevDashboard() {
    const logSession = useLogDevSession();
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleSimulation = (action: string) => {
        logSession.mutate({
            developerId: 'dev_cylton_001',
            action,
            metadata: JSON.stringify({ timestamp: Date.now(), environment: 'staging' })
        }, {
            onSuccess: (data) => {
                setLastAction(`${action} (SID: ${data.sessionId})`);
            }
        });
    };

    const kpis = [
        { label: 'System Uptime', value: '99.98%', trend: '+0.02%', color: 'text-emerald' },
        { label: 'API Latency', value: '24ms', trend: '-4ms', color: 'text-emerald' },
        { label: 'Estates Secured', value: '1,284', trend: '+12', color: 'text-gold' },
        { label: 'Secure Logins', value: '8.4k', trend: '+412', color: 'text-gold' },
    ];

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div>
                <h2 className="cinzel text-2xl text-gold tracking-widest">Development KPIs</h2>
                <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Real-time system health & session analytics</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="neo-glass-panel p-6 border border-white/10 rounded-xl flex flex-col gap-2">
                        <span className="inter text-[10px] text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                        <div className="flex items-end justify-between">
                            <span className="cinzel text-xl font-bold text-white">{kpi.value}</span>
                            <span className={`inter text-[10px] font-bold ${kpi.trend.startsWith('+') ? 'text-emerald' : 'text-blue-400'}`}>
                                {kpi.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* GitHub Sync & Logging */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6">
                    <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">Simulation Engine</h3>
                    <div className="flex flex-wrap gap-3">
                        {['GitHub Sync', 'Database Backup', 'Cache Flush', 'Re-index Search'].map(action => (
                            <button
                                key={action}
                                onClick={() => handleSimulation(action)}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 inter text-xs font-medium"
                                disabled={logSession.isPending}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                    {lastAction && (
                        <div className="mt-4 p-4 bg-emerald/5 border border-emerald/20 rounded-lg">
                            <p className="inter text-[10px] text-emerald font-medium uppercase tracking-wider">Session Logged: {lastAction}</p>
                        </div>
                    )}
                </div>

                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">System Integrity</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                            <span className="inter text-xs text-slate-300">gRPC Endpoint Status</span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_#10B981]"></span>
                                <span className="inter text-[10px] text-emerald font-bold uppercase">Operational</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                            <span className="inter text-xs text-slate-300">Cloud Run Version</span>
                            <span className="inter text-[10px] text-blue-400 font-bold font-mono">v5.3.0-gold</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                            <span className="inter text-xs text-slate-300">Last Git Commit</span>
                            <span className="inter text-[10px] text-slate-400 font-mono">#fe4a23 (Initial Foundation)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
