import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuditTrail } from '../../hooks/useAdmin';

const MotionTr = motion.tr as any;

export function SystemLogs() {
    const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'SECURITY' | 'WARNING'>('ALL');
    const { data: logData, isLoading, isError } = useAuditTrail(filter);

    const logs = logData?.logs || [];

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
            <p className="inter text-[10px] text-gold uppercase tracking-[0.3em]">Syncing Multi-Region Logs...</p>
        </div>
    );

    if (isError) return (
        <div className="neo-glass-panel p-10 border border-rose-500/30 rounded-2xl bg-rose-500/5 text-center">
            <p className="inter text-xs text-rose-500 uppercase tracking-widest font-bold mb-2">Telemetry Sync Failed</p>
            <p className="inter text-[10px] text-slate-500 uppercase">Upstream connection timeout or unauthorized access</p>
        </div>
    );

    const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.level === filter);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'SUCCESS': return 'text-emerald shadow-[0_0_10px_#10b981]';
            case 'WARNING': return 'text-amber-500 shadow-[0_0_10px_#f59e0b]';
            case 'ERROR': return 'text-rose-500 shadow-[0_0_10px_#f43f5e]';
            case 'SECURITY': return 'text-gold shadow-[0_0_10px_#C8A951]';
            default: return 'text-blue-400 shadow-[0_0_10px_#60a5fa]';
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest font-bold uppercase">System telemetry</h2>
                    <p className="inter text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-medium">Real-time infrastructure audit trail</p>
                </div>
                <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-lg backdrop-blur-md">
                    {['ALL', 'SECURITY', 'WARNING', 'ERROR'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-1 inter text-[10px] font-bold tracking-widest uppercase rounded transition-all duration-300 ${filter === f ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Uptime', value: '99.998%', status: 'emerald', sub: 'Last 30 days' },
                    { label: 'Auth Success', value: '98.2%', status: 'emerald', sub: 'MFA Verified' },
                    { label: 'API Latency', value: '42ms', status: 'blue', sub: 'Global Average' },
                    { label: 'Error Rate', value: '0.04%', status: 'amber', sub: 'Standard Deviance' },
                ].map((stat, i) => (
                    <div key={i} className="neo-glass-panel p-6 border border-white/10 rounded-2xl bg-white/5 group hover:border-white/20 transition-all duration-500">
                        <h4 className="inter text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</h4>
                        <div className="flex items-end gap-2">
                            <span className="cinzel text-2xl font-bold text-white tracking-tighter">{stat.value}</span>
                            <div className={`w-2 h-2 rounded-full bg-emerald mb-2 shadow-[0_0_10px_#10b981] animate-pulse`} />
                        </div>
                        <p className="inter text-[9px] text-slate-600 mt-2 uppercase tracking-tight">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="neo-glass-panel border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-2xl">
                <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="cinzel text-xs text-slate-300 font-bold tracking-widest uppercase">Live Audit Stream</h3>
                    <div className="flex gap-4">
                        <span className="inter text-[9px] text-slate-500 uppercase">Buffer: 50 Records</span>
                        <span className="inter text-[9px] text-slate-500 uppercase">Sync: Active</span>
                    </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full inter text-left">
                        <thead>
                            <tr className="inter text-[9px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <th className="px-6 py-4 font-bold">Timestamp</th>
                                <th className="px-6 py-4 font-bold">Severity</th>
                                <th className="px-6 py-4 font-bold">Module</th>
                                <th className="px-6 py-4 font-bold">Message</th>
                                <th className="px-6 py-4 font-bold">Entity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLogs.map((log) => (
                                <MotionTr
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={log.id}
                                    className="group hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4 text-[11px] font-mono text-slate-500">
                                        {new Date(Number(log.timestamp)).toLocaleTimeString([], { hour12: false })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-black/20 border border-white/5 ${getLevelColor(log.level)}`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-bold text-slate-300 tracking-tighter">
                                        {log.source}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {log.message}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-slate-600 font-medium">
                                        {log.user || 'SYSTEM'}
                                    </td>
                                </MotionTr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
