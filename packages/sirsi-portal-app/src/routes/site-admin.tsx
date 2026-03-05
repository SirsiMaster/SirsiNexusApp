/**
 * System Status Dashboard — Pixel-perfect port of system-status/index.html
 *
 * Canonical CSS: page-header, page-subtitle, sirsi-card, sirsi-badge
 * Features: SVG ring gauges, core/external service grid, recharts 24h latency & error,
 * audit trail with border-l-4 incident cards
 * Typography: Inter body ≤ 500 (Rule 21)
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useEffect } from 'react'
import {
    Server, Database as DatabaseIcon, Cpu, Mail, CreditCard, TrendingUp,
    ChevronRight
} from 'lucide-react'
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/site-admin',
    component: SystemStatus,
})

// ── Mock Data ──
const gauges = [
    { label: 'System Uptime', sub: '30-Day Rolling Average', value: 90, color: '#10b981' },
    { label: 'Latency Optima', sub: 'Inference & Response', value: 75, color: '#059669' },
    { label: 'Security Posture', sub: 'Threat Mitigation Rate', value: 85, color: '#C8A951' },
    { label: 'Resource Velocity', sub: 'Compute & Storage Flow', value: 95, color: '#C8A951' },
]

const coreServices = [
    { icon: Server, name: 'API Architecture', status: 'Operational', detail: 'Response: 45ms • Cloud Run' },
    { icon: DatabaseIcon, name: 'Database Cluster', status: 'Healthy', detail: '3 Active Nodes • Cloud SQL' },
    { icon: Cpu, name: 'Cache Architecture', status: 'Optimal', detail: '94% Hit Ratio • Redis' },
]

const externalServices = [
    { icon: Mail, name: 'Communication Gateway', status: 'Connected', detail: 'SendGrid • 1,234 Sent Today' },
    { icon: CreditCard, name: 'Financial Settlement', status: 'Active', detail: 'Stripe • 99.9% Success' },
    { icon: TrendingUp, name: 'Intelligence Engine', status: 'Operational', detail: 'Mixpanel • Normal Flow' },
]

const incidents = [
    {
        title: 'CDN Peripheral Latency',
        subtitle: 'Detected in European Region Gateway',
        desc: 'Telemetry indicates minor throughput degradation. Engineering team is currently performing localized packet analysis.',
        time: 'Initiated: 2h Ago • Persistence: Ongoing',
        badge: 'Investigating', badgeClass: 'sirsi-badge-warning',
        borderColor: 'border-amber-500', bgColor: 'bg-amber-50/20',
    },
    {
        title: 'Database Maintenance Cycle',
        subtitle: 'High-availability cluster patch completed',
        desc: 'Successfully optimized indexing for legal artifact searches. Zero downtime maintenance protocol verified.',
        time: 'Resolved: 6h Ago • Duration: 45m',
        badge: 'Operational', badgeClass: 'sirsi-badge-success',
        borderColor: 'border-emerald-600', bgColor: 'bg-emerald-50/20',
        titleItalic: true,
    },
]

// Generate 24h chart data
const genChartData = () => Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    responseTime: Math.floor(Math.random() * 50) + 30,
    errors: Math.floor(Math.random() * 10),
}))

function SystemStatus() {
    const [clockTime, setClockTime] = useState('--:--:--')
    const [chartData] = useState(genChartData)

    useEffect(() => {
        const update = () => {
            const now = new Date()
            setClockTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`)
        }
        update()
        const id = setInterval(update, 5000)
        return () => clearInterval(id)
    }, [])

    return (
        <div>
            {/* ── Page Header (canonical) ── */}
            <div className="page-header">
                <h1>System Status Dashboard</h1>
                <p className="page-subtitle">Real-time telemetry and health monitoring across the Sirsi Nexus infrastructure</p>
            </div>

            {/* ── Overall Health — SVG Ring Gauges ── */}
            <div className="sirsi-card mb-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perimeter & Core Infrastructure Health</h3>
                    <div className="flex items-center space-x-2">
                        <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' }}>Synchronized:</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 500, color: '#059669' }}>{clockTime}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {gauges.map(g => {
                        const circumference = 2 * Math.PI * 34 // ~213.6
                        const offset = circumference * (1 - g.value / 100)
                        return (
                            <div key={g.label} className="text-center">
                                <div style={{ width: 80, height: 80, margin: '0 auto 16px', position: 'relative' }}>
                                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="40" cy="40" r="34" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                                        <circle cx="40" cy="40" r="34" stroke={g.color} strokeWidth="6" fill="none"
                                            strokeDasharray={circumference} strokeDashoffset={offset} />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 18, fontWeight: 600 }}>{g.value}%</span>
                                    </div>
                                </div>
                                <h4 style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{g.label}</h4>
                                <p style={{ fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>{g.sub}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Service Status Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="sirsi-card">
                    <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>Internal Core Clusters</h3>
                    <div className="space-y-4">
                        {coreServices.map(svc => {
                            const Icon = svc.icon as any
                            return (
                                <div key={svc.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:bg-white dark:hover:bg-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-all group cursor-pointer">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800" style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 500, fontStyle: 'italic' }} className="group-hover:text-emerald-600 transition-colors">{svc.name}</h4>
                                            <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '-0.02em' }}>{svc.detail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="sirsi-badge sirsi-badge-success">{svc.status}</span>
                                        <ChevronRight size={10} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 transition-colors" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="sirsi-card">
                    <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>External Service Integrity</h3>
                    <div className="space-y-4">
                        {externalServices.map(svc => {
                            const Icon = svc.icon as any
                            return (
                                <div key={svc.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:bg-white dark:hover:bg-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-all group cursor-pointer">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800" style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 500, fontStyle: 'italic' }} className="group-hover:text-emerald-600 transition-colors">{svc.name}</h4>
                                            <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '-0.02em' }}>{svc.detail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="sirsi-badge sirsi-badge-success">{svc.status}</span>
                                        <ChevronRight size={10} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 transition-colors" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Performance Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="sirsi-card">
                    <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24, fontStyle: 'italic' }}>Internal Response Latency (24h)</h3>
                    <div style={{ height: 256 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="responseTime" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} fill="rgba(16,185,129,0.05)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sirsi-card">
                    <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24, fontStyle: 'italic' }}>Infrastructure Error Density (24h)</h3>
                    <div style={{ height: 256 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip />
                                <Bar dataKey="errors" fill="rgba(5,150,105,0.8)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Audit Trail ── */}
            <div className="sirsi-card">
                <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 32 }}>System Audit Trail & Service Logs</h3>
                <div className="space-y-6">
                    {incidents.map(inc => (
                        <div key={inc.title} className={`p-6 ${inc.bgColor} border-l-4 ${inc.borderColor} rounded-r-xl`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 style={{ fontWeight: 500, fontStyle: inc.titleItalic ? 'italic' : 'normal' }}>{inc.title}</h4>
                                    <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4, fontStyle: 'italic' }}>{inc.subtitle}</p>
                                    <p style={{ fontSize: 12, marginTop: 8, fontWeight: 500 }}>{inc.desc}</p>
                                    <p style={{ fontSize: 9, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{inc.time}</p>
                                </div>
                                <span className={`sirsi-badge ${inc.badgeClass}`}>{inc.badge}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
