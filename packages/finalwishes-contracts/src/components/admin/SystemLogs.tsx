import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SECURITY';
    source: string;
    message: string;
    user?: string;
}

const MotionTr = motion.tr as any;

export function SystemLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'SECURITY' | 'WARNING'>('ALL');

    useEffect(() => {
        const initialLogs: LogEntry[] = [
            { id: '1', timestamp: new Date().toISOString(), level: 'SECURITY', source: 'AUTH_GATE', message: 'MFA Verification Successful', user: 'cylton@sirsi.ai' },
            { id: '2', timestamp: new Date(Date.now() - 5000).toISOString(), level: 'INFO', source: 'LEDGER_ENGINE', message: 'Calculated project valuation for PRJ-9921', user: 'admin@sirsi.ai' },
            { id: '3', timestamp: new Date(Date.now() - 15000).toISOString(), level: 'SUCCESS', source: 'STRIPE_RAIL', message: 'Payment intent confirmed: $12,500.00' },
            { id: '4', timestamp: new Date(Date.now() - 60000).toISOString(), level: 'WARNING', source: 'DB_CLUSTER', message: 'P99 Latency spike detected on read nodes' },
            { id: '5', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'ERROR', source: 'MAIL_RELAY', message: 'Upstream SMTP connection timeout' },
            { id: '6', timestamp: new Date(Date.now() - 300000).toISOString(), level: 'SECURITY', source: 'GATEKEEPER', message: 'Rate limit enforced for IP 192.168.1.1' },
        ];
        setLogs(initialLogs);

        const interval = setInterval(() => {
            const newLog: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                level: (['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SECURITY'] as any)[Math.floor(Math.random() * 5)],
                source: (['API_HUB', 'CONTRACT_FS', 'VAULT_STORE', 'OPEN_SIGN'] as any)[Math.floor(Math.random() * 4)],
                message: 'Automated health check executed',
                user: Math.random() > 0.5 ? 'system' : 'admin@sirsi.ai'
            };
            setLogs(prev => [newLog, ...prev.slice(0, 49)]);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

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
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
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
