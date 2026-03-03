/**
 * Telemetry — Pixel-perfect port of dashboard/telemetry.html
 *
 * Canonical CSS: page-header, page-subtitle, metric-card,
 * sirsi-table-wrap, sirsi-table, border-l-4 patterns
 * Typography: Inter body ≤ 500 (Rule 21), font-medium for values
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    Users, Eye, MousePointer2, Download, ArrowRight,
    FileText, Folder, Video
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/telemetry',
    component: Telemetry,
})

// ── Mock Data ──
const scrollDepthData = [
    { range: '0-25% Page Depth', percent: 82, color: 'bg-green-500', textColor: 'text-green-600' },
    { range: '25-50% Page Depth', percent: 64, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { range: '50-75% Page Depth', percent: 41, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { range: '75-100% Page Depth', percent: 23, color: 'bg-red-500', textColor: 'text-red-600' },
]

const contentData = [
    { name: 'Q4 Financial Report.pdf', icon: FileText, iconColor: 'text-red-500', views: '1,234', avgTime: '3:45', interactions: '842 downloads', interactionColor: 'text-green-600', exitRate: '12%' },
    { name: '/data-room/investments', icon: Folder, iconColor: 'text-emerald-500', views: '892', avgTime: '5:12', interactions: '423 clicks', interactionColor: 'text-emerald-600', exitRate: '28%' },
    { name: 'Company Overview.mp4', icon: Video, iconColor: 'text-amber-500', views: '654', avgTime: '8:32', interactions: '89% watched', interactionColor: 'text-amber-600', exitRate: '5%' },
]

const sessionData = [
    {
        id: '#4521', email: 'john.doe@example.com', location: 'New York, US',
        status: 'Started session', markerColor: 'bg-green-500', time: 'Just now',
        actions: [
            '• Viewed Dashboard (12s)',
            '• Clicked on "Financial Reports" link',
            '• Downloaded Q4_Report.pdf (2.3MB)',
            '• Scrolled to 75% of page',
        ],
        activeAction: '• Currently viewing: Data Room',
    },
    {
        id: '#4520', email: 'jane.smith@example.com', location: 'London, UK',
        status: 'Active session', markerColor: 'bg-yellow-500', time: '2 min ago',
        actions: [
            '• Uploaded presentation.pptx (15.2MB)',
            '• Filled out metadata form (took 45s)',
            '• Navigated to user settings',
        ],
    },
]

const engagementData = [
    { label: 'Page Load Time', value: '1.2s', percent: 85, color: 'bg-green-500' },
    { label: 'Bounce Rate', value: '32%', percent: 32, color: 'bg-yellow-500' },
    { label: 'Form Completion', value: '78%', percent: 78, color: 'bg-emerald-500' },
    { label: 'Error Rate', value: '2.1%', percent: 2, color: 'bg-red-500' },
]

function Telemetry() {
    return (
        <div>
            {/* ── Page Header (canonical) ── */}
            <div className="page-header">
                <h1>Enhanced Telemetry Analytics</h1>
                <p className="page-subtitle">Infrastructure telemetry, throughput monitoring, and resource allocation</p>
            </div>

            {/* ── Real-time Metrics Overview ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    icon={<Users size={20} className="text-emerald-600" />}
                    iconBg="bg-emerald-100"
                    trend="+12.5%" trendColor="text-green-600"
                    value="247" label="Active Users Now"
                    subtext="Across 12 countries"
                />
                <MetricCard
                    icon={<Eye size={20} className="text-green-600" />}
                    iconBg="bg-green-100"
                    trend="+8.3%" trendColor="text-green-600"
                    value="15,832" label="Page Views Today"
                    subtext="Avg. session: 12m 34s"
                />
                <MetricCard
                    icon={<MousePointer2 size={20} className="text-yellow-600" />}
                    iconBg="bg-yellow-100"
                    trend="-3.2%" trendColor="text-red-600"
                    value="9,421" label="Total Interactions"
                    subtext="CTR: 4.2%"
                />
                <MetricCard
                    icon={<Download size={20} className="text-amber-600" />}
                    iconBg="bg-amber-100"
                    trend="+22.1%" trendColor="text-green-600"
                    value="523" label="Downloads Today"
                    subtext="Top: Report_Q4.pdf"
                />
            </div>

            {/* ── Heatmap + Scroll Depth (2 col) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Click Heatmap */}
                <div className="metric-card">
                    <h2 className="text-lg font-medium mb-4" style={{ fontWeight: 500 }}>Click Heatmap</h2>
                    <div className="heatmap-container" style={{
                        position: 'relative', width: '100%', height: 400,
                        background: '#f9fafb', borderRadius: 8, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <MousePointer2 size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p style={{ fontSize: 13, fontWeight: 500 }}>Click heatmap visualization</p>
                            <p style={{ fontSize: 12, marginTop: 4 }}>Requires heatmap.js integration</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span style={{ color: '#6b7280', fontSize: 13 }}>Hot zones indicate high interaction areas</span>
                        <button style={{ color: '#059669', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View Full Report</button>
                    </div>
                </div>

                {/* Scroll Depth Analysis */}
                <div className="metric-card">
                    <h2 className="text-lg font-medium mb-4" style={{ fontWeight: 500 }}>Scroll Depth Analysis</h2>
                    <div className="space-y-3">
                        {scrollDepthData.map((item) => (
                            <div key={item.range} className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.range}</span>
                                    <span className={`text-2xl font-medium ${item.textColor}`}>{item.percent}%</span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }} />
                                </div>
                                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Users reached this depth</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── User Journey Paths ── */}
            <div className="metric-card mb-8">
                <h2 className="text-lg font-medium mb-4" style={{ fontWeight: 500 }}>User Journey Paths</h2>
                <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                        <h3 style={{ fontWeight: 500 }}>Most Common Path (42% of users)</h3>
                        <div className="mt-2 flex flex-wrap items-center">
                            {['Landing Page', 'Data Room', 'Download File'].map((step, i) => (
                                <span key={i} className="flex items-center">
                                    <span className="user-journey-node" style={{
                                        padding: '8px 16px', background: '#e5e7eb',
                                        borderRadius: 20, fontSize: 14, display: 'inline-block', margin: 4,
                                    }}>{step}</span>
                                    <ArrowRight size={16} style={{ color: '#9ca3af', margin: '0 8px' }} />
                                </span>
                            ))}
                            <span style={{
                                padding: '8px 16px', background: '#dcfce7',
                                borderRadius: 20, fontSize: 14, display: 'inline-block', margin: 4,
                                color: '#166534',
                            }}>Success</span>
                        </div>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h3 style={{ fontWeight: 500 }}>High Drop-off Path (18% of users)</h3>
                        <div className="mt-2 flex flex-wrap items-center">
                            {['Landing Page', 'Login'].map((step, i) => (
                                <span key={i} className="flex items-center">
                                    <span style={{
                                        padding: '8px 16px', background: '#e5e7eb',
                                        borderRadius: 20, fontSize: 14, display: 'inline-block', margin: 4,
                                    }}>{step}</span>
                                    <ArrowRight size={16} style={{ color: '#9ca3af', margin: '0 8px' }} />
                                </span>
                            ))}
                            <span style={{
                                padding: '8px 16px', background: '#fee2e2',
                                borderRadius: 20, fontSize: 14, display: 'inline-block', margin: 4,
                                color: '#991b1b',
                            }}>Exit</span>
                            <span style={{ marginLeft: 16, fontSize: 14, color: '#6b7280' }}>Avg. time: 45s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Live Sessions + Engagement (3 col) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 metric-card">
                    <h2 className="text-lg font-medium mb-4" style={{ fontWeight: 500 }}>Live Session Activity</h2>
                    <div className="space-y-3" style={{ maxHeight: 384, overflowY: 'auto' }}>
                        {sessionData.map((session) => (
                            <div key={session.id} style={{ position: 'relative', paddingLeft: 40 }}>
                                <div className={`${session.markerColor}`} style={{
                                    position: 'absolute', left: 0, width: 12, height: 12,
                                    borderRadius: '50%', top: 6,
                                }} />
                                <div style={{
                                    position: 'absolute', left: 5, top: 18, bottom: 0,
                                    width: 2, background: '#e5e7eb',
                                }} />
                                <div style={{ paddingLeft: 8 }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p style={{ fontWeight: 500 }}>User {session.id} - {session.email}</p>
                                            <p style={{ fontSize: 14, color: '#6b7280' }}>{session.status} • {session.location}</p>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{session.time}</span>
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 14, color: '#4b5563' }}>
                                        {session.actions.map((a, i) => <p key={i}>{a}</p>)}
                                        {session.activeAction && (
                                            <p style={{ color: '#059669' }}>{session.activeAction}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="metric-card">
                    <h2 className="text-lg font-medium mb-4" style={{ fontWeight: 500 }}>Engagement Metrics</h2>
                    <div className="space-y-4">
                        {engagementData.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1">
                                    <span style={{ fontSize: 14, color: '#4b5563' }}>{item.label}</span>
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content Performance Table ── */}
            <div className="metric-card">
                <h2 className="text-lg font-medium mb-4" style={{ fontWeight: 500 }}>Content Performance</h2>
                <div className="sirsi-table-wrap">
                    <table className="sirsi-table">
                        <thead>
                            <tr>
                                <th>Page/Content</th>
                                <th>Views</th>
                                <th>Avg. Time</th>
                                <th>Interactions</th>
                                <th>Exit Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contentData.map((item) => {
                                const IconComp = item.icon as any
                                return (
                                    <tr key={item.name}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <IconComp size={16} className={item.iconColor} />
                                                {item.name}
                                            </div>
                                        </td>
                                        <td>{item.views}</td>
                                        <td>{item.avgTime}</td>
                                        <td><span className={item.interactionColor}>{item.interactions}</span></td>
                                        <td>{item.exitRate}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ── Metric Card (matches HTML metric-card) ──
function MetricCard({ icon, iconBg, trend, trendColor, value, label, subtext }: any) {
    return (
        <div className="metric-card cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${iconBg} rounded-lg`}>
                    {icon}
                </div>
                <span className={`text-xs ${trendColor}`}>{trend}</span>
            </div>
            <h3 className="text-2xl font-medium">{value}</h3>
            <p style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>{label}</p>
            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>{subtext}</div>
        </div>
    )
}
