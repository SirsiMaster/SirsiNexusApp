/**
 * Cache Status — Port of system-status/cache-status.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: 4 stat cards, cache distribution bars, performance grid, top entries table
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Target, HardDrive, Key, AlertCircle } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/cache-status',
    component: CacheStatus,
})

const stats = [
    { label: 'Hit Rate', icon: Target, value: '94.2%', sub: '+2.1% from last hour', color: 'text-emerald-600' },
    { label: 'Memory Used', icon: HardDrive, value: '3.2 GB', sub: 'of 8 GB allocated', color: 'text-emerald-600' },
    { label: 'Total Keys', icon: Key, value: '45.8K', sub: 'Active cache entries', color: 'text-amber-600' },
    { label: 'Evictions', icon: AlertCircle, value: '127', sub: 'Last 24 hours', color: 'text-amber-600' },
]

const distribution = [
    { name: 'Session Cache', size: '1.2 GB (37.5%)', pct: 37.5 },
    { name: 'Query Cache', size: '896 MB (28%)', pct: 28 },
    { name: 'Static Assets', size: '640 MB (20%)', pct: 20 },
    { name: 'API Responses', size: '464 MB (14.5%)', pct: 14.5, amber: true },
]

const perfMetrics = [
    { label: 'Avg Read Time', value: '0.8ms' },
    { label: 'Avg Write Time', value: '1.2ms' },
    { label: 'Hit/Miss Ratio', value: '16:1' },
    { label: 'TTL Avg', value: '45min' },
]

const cacheEntries = [
    { key: 'user:session:abc123', type: 'Session', size: '2.4 KB', hits: '1,234', ttl: '25 min' },
    { key: 'api:users:list:page1', type: 'API', size: '156 KB', hits: '892', ttl: '10 min' },
    { key: 'static:logo.png', type: 'Static', size: '45 KB', hits: '5,678', ttl: 'Permanent' },
    { key: 'query:select_all_documents', type: 'Query', size: '234 KB', hits: '456', ttl: '5 min' },
    { key: 'user:profile:12345', type: 'Session', size: '8.2 KB', hits: '234', ttl: '30 min' },
    { key: 'api:dashboard:metrics', type: 'API', size: '12 KB', hits: '3,456', ttl: '2 min' },
]

function CacheStatus() {
    return (
        <div>
            <div className="page-header">
                <h1>Cache Status</h1>
                <p className="page-subtitle">Cache hit rates, memory allocation, and invalidation metrics across platform nodes.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {stats.map(s => {
                    const Icon = s.icon as any
                    return (
                        <div key={s.label} className="sirsi-card">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400" style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                                <Icon size={20} className={s.color} />
                            </div>
                            <p className={`text-3xl font-medium ${s.color}`}>{s.value}</p>
                            <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</p>
                        </div>
                    )
                })}
            </div>

            {/* Distribution + Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="sirsi-card">
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Cache Distribution</h3>
                    <div className="space-y-4">
                        {distribution.map(d => (
                            <div key={d.name}>
                                <div className="flex justify-between mb-1" style={{ fontSize: 14 }}>
                                    <span className="text-slate-500 dark:text-slate-400">{d.name}</span>
                                    <span style={{ fontWeight: 500 }}>{d.size}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full" style={{ height: 8 }}>
                                    <div className={`${d.amber ? 'bg-amber-600' : 'bg-emerald-600'} rounded-full`} style={{ height: '100%', width: `${d.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sirsi-card">
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {perfMetrics.map(m => (
                            <div key={m.label} className="bg-slate-50 dark:bg-slate-700" style={{ padding: 16, borderRadius: 8 }}>
                                <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: 14, marginBottom: 4 }}>{m.label}</p>
                                <p className="text-slate-900 dark:text-slate-100" style={{ fontSize: 24, fontWeight: 500 }}>{m.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Cache Entries */}
            <div className="sirsi-card">
                <div className="flex justify-between items-center mb-4">
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Top Cache Entries</h3>
                    <select className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600" style={{ padding: '4px 12px', borderWidth: 1, borderStyle: 'solid', borderRadius: 8, fontSize: 14 }}>
                        <option>By Size</option>
                        <option>By Hits</option>
                        <option>By Age</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {['Key', 'Type', 'Size', 'Hits', 'TTL', 'Actions'].map(h => (
                                    <th key={h} className="text-slate-700 dark:text-slate-300" style={{ textAlign: 'left', padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cacheEntries.map(e => (
                                <tr key={e.key} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="text-slate-700 dark:text-slate-300" style={{ padding: '12px 16px', fontSize: 14, fontFamily: 'monospace' }}>{e.key}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            fontSize: 12, padding: '2px 8px', borderRadius: 12,
                                            background: (e.type === 'Session' || e.type === 'API') ? '#d1fae5' : '#fef3c7',
                                            color: (e.type === 'Session' || e.type === 'API') ? '#047857' : '#b45309',
                                        }}>{e.type}</span>
                                    </td>
                                    <td className="text-slate-700 dark:text-slate-300" style={{ padding: '12px 16px', fontSize: 14 }}>{e.size}</td>
                                    <td className="text-slate-700 dark:text-slate-300" style={{ padding: '12px 16px', fontSize: 14 }}>{e.hits}</td>
                                    <td className="text-slate-500 dark:text-slate-400" style={{ padding: '12px 16px', fontSize: 14 }}>{e.ttl}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button className="text-red-600 hover:text-red-700" style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>Invalidate</button>
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
