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
                <div className="sirsi-card p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-4">Click Heatmap</h2>
                    <div className="heatmap-container bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 h-[400px] rounded-lg relative overflow-hidden flex items-center justify-center">
                        <div className="text-slate-400 dark:text-slate-500 text-center">
                            <MousePointer2 size={48} className="mx-auto mb-3 opacity-20" />
                            <p className="text-[13px] font-semibold uppercase tracking-tight">Click heatmap visualization</p>
                            <p className="text-[11px] mt-1 italic">Requires heatmap.js layer</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <span>Hot zones indicate high interaction areas</span>
                        <button className="text-emerald-600 hover:text-emerald-500 bg-transparent border-0 cursor-pointer font-semibold uppercase tracking-wider">View Full Report</button>
                    </div>
                </div>

                {/* Scroll Depth Analysis */}
                <div className="sirsi-card p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-4">Scroll Depth Analysis</h2>
                    <div className="space-y-4">
                        {scrollDepthData.map((item) => (
                            <div key={item.range} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 rounded-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.range}</span>
                                    <span className={`text-2xl font-semibold tracking-tighter ${item.textColor}`}>{item.percent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percent}%` }} />
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wide">Retention Delta</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── User Journey Paths ── */}
            <div className="sirsi-card p-5 mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">User Journey Paths</h2>
                <div className="space-y-6">
                    <div className="border-l-4 border-emerald-500 pl-4">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">Most Common Path (42% of users)</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            {['Landing Page', 'Data Room', 'Download File'].map((step, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                                        {step}
                                    </span>
                                    <ArrowRight size={14} className="text-slate-300" />
                                </span>
                            ))}
                            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-800 italic">
                                Success
                            </span>
                        </div>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">High Drop-off Path (18% of users)</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            {['Landing Page', 'Login'].map((step, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                                        {step}
                                    </span>
                                    <ArrowRight size={14} className="text-slate-300" />
                                </span>
                            ))}
                            <span className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-full text-xs font-semibold border border-red-100 dark:border-red-800 italic">
                                Exit
                            </span>
                            <span className="ml-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Avg. time: 45s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Live Sessions + Engagement (3 col) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 sirsi-card p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Live Session Activity</h2>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {sessionData.map((session) => (
                            <div key={session.id} className="relative pl-8">
                                <div className={`absolute left-0 w-3 h-3 rounded-full top-1.5 ${session.markerColor} ring-4 ring-white dark:ring-slate-900 z-10`} />
                                <div className="absolute left-[5px] top-6 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-800" />
                                <div className="pl-4 pb-6 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 underline decoration-emerald-500/30 underline-offset-4">User {session.id} — {session.email}</p>
                                            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{session.status} • {session.location}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 font-mono italic">{session.time}</span>
                                    </div>
                                    <div className="space-y-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                        {session.actions.map((a, i) => <p key={i}>{a}</p>)}
                                        {session.activeAction && (
                                            <p className="text-emerald-600 font-semibold italic">{session.activeAction}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sirsi-card p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Engagement Metrics</h2>
                    <div className="space-y-5">
                        {engagementData.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className={`${item.color} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content Performance Table ── */}
            <div className="sirsi-card p-5">
                <h2 className="text-xs font-semibold uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-6">Content Performance</h2>
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
        </div >
    )
}

// ── Metric Card (matches HTML metric-card) ──
function MetricCard({ icon, iconBg, trend, trendColor, value, label, subtext }: any) {
    return (
        <div className="sirsi-card p-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${iconBg} rounded-xl shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded italic ${trendColor} bg-slate-50 dark:bg-slate-800`}>{trend}</span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tighter text-slate-900 dark:text-slate-100">{value}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">{label}</p>
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{subtext}</div>
        </div>
    )
}
