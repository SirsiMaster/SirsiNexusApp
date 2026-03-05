/**
 * Backup Status — Port of system-status/backup-status.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: 4 stat cards, active schedules, health metrics bars, backup history table
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Clock, Calendar, Archive, HardDrive } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/backup-status',
    component: BackupStatus,
})

const stats = [
    { label: 'Last Backup', icon: Clock, value: '2h ago', sub: 'Completed successfully', color: 'text-emerald-600' },
    { label: 'Next Scheduled', icon: Calendar, value: '4h', sub: 'Daily at 2:00 AM', color: 'text-emerald-600' },
    { label: 'Total Backups', icon: Archive, value: '247', sub: '30 days retention', color: 'text-amber-600' },
    { label: 'Storage Used', icon: HardDrive, value: '1.2 TB', sub: 'of 5 TB allocated', color: 'text-amber-600' },
]

const schedules = [
    { name: 'Full Database Backup', freq: 'Daily at 2:00 AM UTC', bg: 'bg-emerald-50', border: 'border-emerald-200', textColor: 'text-emerald-900' },
    { name: 'Incremental Backup', freq: 'Every 6 hours', bg: 'bg-emerald-50', border: 'border-blue-200', textColor: 'text-emerald-900' },
    { name: 'File System Backup', freq: 'Weekly on Sunday', bg: 'bg-amber-50', border: 'border-purple-200', textColor: 'text-amber-900' },
]

const healthMetrics = [
    { label: 'Success Rate (30 days)', value: '98.5%', pct: 98.5, color: 'bg-emerald-600' },
    { label: 'Average Backup Duration', value: '12 min', pct: 40, color: 'bg-emerald-600' },
    { label: 'Compression Ratio', value: '68%', pct: 68, color: 'bg-emerald-600' },
    { label: 'Storage Efficiency', value: '85%', pct: 85, color: 'bg-amber-600' },
]

const backupHistory = [
    { type: 'Full', started: '2024-01-22 02:00:00', duration: '15 min', size: '45.2 GB', status: 'success' },
    { type: 'Incremental', started: '2024-01-22 08:00:00', duration: '3 min', size: '2.1 GB', status: 'success' },
    { type: 'Incremental', started: '2024-01-22 14:00:00', duration: '4 min', size: '3.4 GB', status: 'success' },
    { type: 'Full', started: '2024-01-21 02:00:00', duration: '16 min', size: '44.8 GB', status: 'success' },
    { type: 'File System', started: '2024-01-21 00:00:00', duration: '45 min', size: '156 GB', status: 'warning' },
    { type: 'Incremental', started: '2024-01-21 20:00:00', duration: '3 min', size: '1.9 GB', status: 'failed' },
]

function BackupStatus() {
    return (
        <div>
            <div className="page-header">
                <h1>Backup Status</h1>
                <p className="page-subtitle">Scheduled backup health, recovery points, and retention policies.</p>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {stats.map(s => {
                    const Icon = s.icon as any
                    return (
                        <div key={s.label} className="sirsi-card">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                                <Icon size={20} className={s.color} />
                            </div>
                            <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
                            <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</p>
                        </div>
                    )
                })}
            </div>

            {/* Schedules + Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="sirsi-card">
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Active Backup Schedules</h3>
                    <div className="space-y-3">
                        {schedules.map(s => (
                            <div key={s.name} className={`${s.bg} ${s.border} border p-4 rounded-lg`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`font-medium ${s.textColor}`}>{s.name}</h4>
                                        <p style={{ fontSize: 14, marginTop: 4 }} className={s.textColor.replace('900', '700')}>{s.freq}</p>
                                    </div>
                                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12 }}>Active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sirsi-card">
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Backup Health Metrics</h3>
                    <div className="space-y-4">
                        {healthMetrics.map(m => (
                            <div key={m.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
                                    <span style={{ fontWeight: 500 }}>{m.value}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full" style={{ height: 8 }}>
                                    <div className={`${m.color} rounded-full`} style={{ height: '100%', width: `${m.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Backup History */}
            <div className="sirsi-card">
                <div className="flex justify-between items-center mb-4">
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Recent Backup History</h3>
                    <select className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600" style={{ padding: '4px 12px', borderWidth: 1, borderStyle: 'solid', borderRadius: 8, fontSize: 14 }}>
                        <option>All Types</option>
                        <option>Full Backup</option>
                        <option>Incremental</option>
                        <option>File System</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {['Type', 'Started', 'Duration', 'Size', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-slate-700 dark:text-slate-300" style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {backupHistory.map((b, i) => (
                                <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="text-slate-900 dark:text-slate-100" style={{ padding: '12px 16px', fontWeight: 500 }}>{b.type}</td>
                                    <td className="text-slate-500 dark:text-slate-400" style={{ padding: '12px 16px', fontSize: 14 }}>{b.started}</td>
                                    <td className="text-slate-700 dark:text-slate-300" style={{ padding: '12px 16px', fontSize: 14 }}>{b.duration}</td>
                                    <td className="text-slate-700 dark:text-slate-300" style={{ padding: '12px 16px', fontSize: 14 }}>{b.size}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            fontSize: 12, padding: '2px 8px', borderRadius: 12,
                                            background: b.status === 'success' ? '#d1fae5' : b.status === 'warning' ? '#fef3c7' : '#fee2e2',
                                            color: b.status === 'success' ? '#047857' : b.status === 'warning' ? '#b45309' : '#dc2626',
                                        }}>{b.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div className="flex gap-2">
                                            <button className="text-emerald-600 hover:text-emerald-700" style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>Restore</button>
                                            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700" style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>Download</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
