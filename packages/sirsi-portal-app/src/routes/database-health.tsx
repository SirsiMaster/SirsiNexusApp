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
            <div className="sirsi-card mb-6">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Connection Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {connections.map(c => (
                        <div key={c.label} className={`${c.bg} p-4 rounded-lg`}>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: 14 }}>{c.label}</span>
                                {c.status.includes('Connected') || c.status.includes('Active')
                                    ? <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12 }}>{c.status}</span>
                                    : <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: 12 }}>{c.status}</span>
                                }
                            </div>
                            <p className={`text-2xl font-medium ${c.valueColor} mt-2`}>{c.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="sirsi-card">
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Query Performance</h3>
                    <div className="space-y-4">
                        {queryPerf.map(q => (
                            <div key={q.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500 dark:text-slate-400">{q.label}</span>
                                    <span style={{ fontWeight: 500 }}>{q.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full" style={{ height: 8 }}>
                                    <div className={`${q.color} rounded-full`} style={{ height: '100%', width: `${q.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="sirsi-card">
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Storage Usage</h3>
                    <div className="space-y-4">
                        {storageUsage.map(s => (
                            <div key={s.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span style={{ color: '#6b7280' }}>{s.label}</span>
                                    <span style={{ fontWeight: 500 }}>{s.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full" style={{ height: 8 }}>
                                    <div className={`${s.color} rounded-full`} style={{ height: '100%', width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Operations */}
            <div className="sirsi-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Database Operations</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {['Operation', 'Table', 'Duration', 'Status', 'Time'].map(h => (
                                    <th key={h} className="text-slate-700 dark:text-slate-300" style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op, i) => (
                                <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="text-slate-900 dark:text-slate-100" style={{ padding: '12px 16px', fontSize: 14 }}>{op.op}</td>
                                    <td className="text-slate-500 dark:text-slate-400" style={{ padding: '12px 16px', fontSize: 14 }}>{op.table}</td>
                                    <td className="text-slate-700 dark:text-slate-300" style={{ padding: '12px 16px', fontSize: 14 }}>{op.duration}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            fontSize: 12, padding: '2px 8px', borderRadius: 12,
                                            background: op.status === 'success' ? '#d1fae5' : '#fef3c7',
                                            color: op.status === 'success' ? '#047857' : '#b45309',
                                        }}>{op.status}</span>
                                    </td>
                                    <td className="text-slate-500 dark:text-slate-400" style={{ padding: '12px 16px', fontSize: 14 }}>{op.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
