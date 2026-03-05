/**
 * System Monitoring — Port of security/monitoring.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: Live telemetry badge, tab registry, encrypted log stream, latency + error density bar charts
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import { Search } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/monitoring',
    component: Monitoring,
})

const tabs = ['Logs Registry', 'Telemetry Charts', 'Error Density']

const logEntries = [
    { time: '14:20:31', type: 'AUTH-INF', typeColor: '#60a5fa', msg: 'MFA handshake verified for identity: cylton@sirsi.ai (CID: #USR-001)' },
    { time: '14:21:05', type: 'DB-SYNC', typeColor: '#60a5fa', msg: 'Postgres-Firebase synchronization complete for /contracts collection.' },
    { time: '14:25:12', type: 'API-WRN', typeColor: '#f59e0b', msg: 'Elevated latency detected in GCP-Central region gateway (85ms).' },
    { time: '14:28:44', type: 'VAULT-INF', typeColor: '#34d399', msg: 'SHA-256 evidence committed for document #DR-2026-004.' },
]

const latencyBars = [40, 35, 55, 45, 65, 60, 40, 30]
const errorBars = [10, 5, 25, 10, 8, 12, 15, 5]
const latencyColors = ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#10b981', '#34d399']

function Monitoring() {
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div>
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>System Monitoring</h1>
                    <p className="page-subtitle">Real-time telemetry, synchronized logs, and performance audit trails.</p>
                </div>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full" style={{ border: '1px solid #d1fae5' }}>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Telemetry</span>
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                {tabs.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)} style={{
                        padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer',
                        ...(activeTab === i
                            ? { background: '#059669', color: 'white', boxShadow: '0 4px 6px rgba(5,150,105,0.1)' }
                            : {}),
                    }}>{tab}</button>
                ))}
            </div>

            {/* Log Stream */}
            <div className="sirsi-card overflow-hidden" style={{ padding: 0 }}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>Encrypted Log Stream</h3>
                    <div className="flex items-center gap-4">
                        <div style={{ position: 'relative' }}>
                            <Search size={10} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input placeholder="Filter identifiers..."
                                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-foreground"
                                style={{ paddingLeft: 36, paddingRight: 12, padding: '6px 12px 6px 36px', borderWidth: 1, borderStyle: 'solid', borderRadius: 8, fontSize: 12, fontWeight: 500, outline: 'none', minWidth: 200 }} />
                        </div>
                        <button className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600" style={{ padding: '6px 16px', borderRadius: 8, fontSize: 10, fontWeight: 500, cursor: 'pointer' }}>
                            Export .LOG
                        </button>
                    </div>
                </div>

                <div style={{ height: 500, overflowY: 'auto', padding: 24, fontFamily: 'monospace', fontSize: 11, background: '#111827', color: '#cbd5e1' }} className="space-y-3">
                    {logEntries.map((log, i) => (
                        <div key={i} className="flex gap-4 hover:bg-white/5 transition-colors p-1 rounded">
                            <span style={{ color: '#10b981', fontWeight: 500, flexShrink: 0 }}>[{log.time}]</span>
                            <span style={{ color: log.typeColor, fontWeight: 500, flexShrink: 0 }}>{log.type}:</span>
                            <span style={{ flex: 1 }}>{log.msg}</span>
                        </div>
                    ))}
                    <div className="flex gap-4 p-1 rounded" style={{ fontStyle: 'italic' }}>
                        <span style={{ flexShrink: 0 }}>[--:--:--]</span>
                        <span style={{ flex: 1 }}>Stream synchronized... awaiting next protocol cycle.</span>
                    </div>
                </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="sirsi-card">
                    <h3 className="border-l-4 border-emerald-600 pl-4 mb-6" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>Response Latency</h3>
                    <div style={{ height: 192, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 8 }}>
                        {latencyBars.map((h, i) => (
                            <div key={i} style={{ flex: 1, background: latencyColors[i], borderRadius: '4px 4px 0 0', height: `${h}%` }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-4" style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase' }}>
                        <span>T-minus 8H</span>
                        <span>Now (Synced)</span>
                    </div>
                </div>
                <div className="sirsi-card">
                    <h3 className="border-l-4 border-amber-600 pl-4 mb-6" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>Error Density</h3>
                    <div style={{ height: 192, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 8 }}>
                        {errorBars.map((h, i) => (
                            <div key={i} className={h > 20 ? '' : 'bg-slate-100 dark:bg-slate-700'} style={{ flex: 1, ...(h > 20 ? { background: '#fde68a' } : {}), borderRadius: '4px 4px 0 0', height: `${h}%` }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-4" style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase' }}>
                        <span>T-minus 8H</span>
                        <span>Now (Healthy)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
