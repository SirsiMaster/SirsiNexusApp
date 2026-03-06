/**
 * Database Health — Port of system-status/database-health.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: Connection status grid, query performance bars, storage usage bars, recent operations table
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/database-health',
    component: DatabaseHealth,
})

const connections = [
    { label: 'Primary DB', status: 'Connected', value: 'Healthy', bg: 'bg-emerald-50', valueColor: 'text-emerald-600' },
    { label: 'Replicas', status: '3/3 Active', value: 'Synced', bg: 'bg-emerald-50', valueColor: 'text-emerald-600' },
    { label: 'Connections', status: 'Pool Size: 100', value: '47/100', bg: 'bg-amber-50', valueColor: 'text-amber-600' },
    { label: 'Query Queue', status: 'Max: 1000', value: '12', bg: 'bg-amber-50', valueColor: 'text-amber-600' },
]

const queryPerf = [
    { label: 'Average Response Time', value: '45ms', pct: 45, color: 'bg-emerald-600' },
    { label: 'Slow Queries (>100ms)', value: '3%', pct: 3, color: 'bg-amber-600' },
    { label: 'Cache Hit Rate', value: '94%', pct: 94, color: 'bg-emerald-600' },
]

const storageUsage = [
    { label: 'Data Size', value: '245 GB / 500 GB', pct: 49, color: 'bg-emerald-600' },
    { label: 'Index Size', value: '32 GB', pct: 6.4, color: 'bg-emerald-600' },
    { label: 'Backup Storage', value: '180 GB / 1 TB', pct: 18, color: 'bg-cyan-600' },
]

const operations = [
    { op: 'SELECT', table: 'users', duration: '12ms', status: 'success', time: '2 min ago' },
    { op: 'UPDATE', table: 'sessions', duration: '45ms', status: 'success', time: '5 min ago' },
    { op: 'INSERT', table: 'audit_logs', duration: '8ms', status: 'success', time: '7 min ago' },
    { op: 'DELETE', table: 'temp_cache', duration: '156ms', status: 'warning', time: '10 min ago' },
    { op: 'INDEX', table: 'documents', duration: '2.3s', status: 'success', time: '15 min ago' },
    { op: 'BACKUP', table: 'all', duration: '45s', status: 'success', time: '1 hour ago' },
]

function DatabaseHealth() {
    return (
        <div>
            <div className="page-header">
                <h1>Database Health</h1>
                <p className="page-subtitle">Connection pools, query performance, and replication status across the cluster.</p>
            </div>

            {/* Connection Status */}
            <div className="sirsi-card p-5 mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Connection Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {connections.map(c => (
                        <div key={c.label} className={`${c.bg} dark:bg-slate-800/50 p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{c.label}</span>
                                {c.status.includes('Connected') || c.status.includes('Active')
                                    ? <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full italic">{c.status}</span>
                                    : <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">{c.status}</span>
                                }
                            </div>
                            <p className={`text-2xl font-semibold tracking-tighter ${c.valueColor} group-hover:scale-105 transition-transform origin-left`}>{c.value}</p>
                            <div className="mt-4 flex gap-1">
                                {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${c.valueColor.replace('text', 'bg')} opacity-20`} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance + Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="sirsi-card p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Query Performance</h3>
                    <div className="space-y-5">
                        {queryPerf.map(q => (
                            <div key={q.label} className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{q.label}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{q.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div className={`${q.color} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${q.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="sirsi-card p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Storage Usage</h3>
                    <div className="space-y-5">
                        {storageUsage.map(s => (
                            <div key={s.label} className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{s.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div className={`${s.color} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Operations */}
            <div className="sirsi-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Recent Database Operations</h3>
                <div className="sirsi-table-wrap">
                    <table className="sirsi-table">
                        <thead>
                            <tr>
                                <th className="ps-6">Operation / Target</th>
                                <th>Latency Assertion</th>
                                <th>Status State</th>
                                <th className="text-right pe-6">Time Horizon</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0">
                                    <td className="ps-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${op.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-[13px]">{op.op}</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Table: {op.table}</div>
                                    </td>
                                    <td className="font-mono text-xs text-emerald-600 font-semibold">{op.duration}</td>
                                    <td>
                                        <span className={`sirsi-badge ${op.status === 'success' ? 'sirsi-badge-success' : 'sirsi-badge-warning'}`}>
                                            {op.status}
                                        </span>
                                    </td>
                                    <td className="text-right pe-6 text-[11px] font-bold text-slate-400 font-mono italic">{op.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
