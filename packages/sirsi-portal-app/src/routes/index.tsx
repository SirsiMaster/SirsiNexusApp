/**
 * Sirsi Command Center — Unified Dashboard
 * Merged from: ui/src/app/page.tsx + sirsinexusportal/dashboard/index.html + sirsi-portal-app
 * Identity: This is the central nerve center for the Sirsi platform.
 */

import { createRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import {
    LayoutDashboard,
    FileText,
    Users,
    Building2,
    TrendingUp,
    Zap,
    Activity,
    Cloud,
    Server,
    Database,
    Shield,
    Settings,
    Plus,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Sparkles,
    Terminal,
    Clock,
    CheckCircle,
    AlertTriangle,
    Info,
} from 'lucide-react'

const DashboardIcon = LayoutDashboard as any
const FileTextIcon = FileText as any
const UsersIcon = Users as any
const Building2Icon = Building2 as any
const TrendingUpIcon = TrendingUp as any
const ZapIcon = Zap as any
const ActivityIcon = Activity as any
const CloudIcon = Cloud as any
const ServerIcon = Server as any
const DatabaseIcon = Database as any
const ShieldIcon = Shield as any
const SettingsIcon = Settings as any
const PlusIcon = Plus as any
const ArrowRightIcon = ArrowRight as any
const ArrowUpRightIcon = ArrowUpRight as any
const BarChart3Icon = BarChart3 as any
const SparklesIcon = Sparkles as any
const TerminalIcon = Terminal as any
const ClockIcon = Clock as any
const CheckCircleIcon = CheckCircle as any
const AlertTriangleIcon = AlertTriangle as any
const InfoIcon = Info as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/',
    component: CommandCenter,
})

// ─── Mock / Fallback Data ─────────────────────────────────────────
// This renders immediately so the dashboard is never empty.
// When the gRPC backend is live, replace with useSystemOverview().
const platformMetrics = [
    { label: 'Total Tenants', value: '3', trend: '+1', icon: Building2Icon, color: 'emerald' },
    { label: 'Active Contracts', value: '12', trend: '+3', icon: FileTextIcon, color: 'blue' },
    { label: 'Revenue (MTD)', value: '$4,850', trend: '+15.7%', icon: TrendingUpIcon, color: 'amber' },
    { label: 'Sirsi Multiplier', value: '1.00', trend: 'LOCKED', icon: ZapIcon, color: 'purple' },
    { label: 'Team Members', value: '4', trend: '+1', icon: UsersIcon, color: 'teal' },
    { label: 'Success Rate', value: '99.2%', trend: '+0.7%', icon: ActivityIcon, color: 'green' },
]

const systemStatus = [
    { label: 'Active Projects', value: '2', icon: DatabaseIcon },
    { label: 'API Calls Today', value: '1,247', icon: ZapIcon },
    { label: 'Storage Used', value: '142 MB', icon: ServerIcon },
    { label: 'Current Bill', value: '$0', icon: CloudIcon },
]

const quickActions = [
    { label: 'New Contract', desc: 'Create from template', icon: PlusIcon, color: 'emerald', route: '/contracts' },
    { label: 'Manage Users', desc: 'Roles & permissions', icon: UsersIcon, color: 'blue', route: '/users' },
    { label: 'Analytics', desc: 'View detailed reports', icon: BarChart3Icon, color: 'purple', route: '/telemetry' },
    { label: 'Tenants', desc: 'Portfolio organizations', icon: Building2Icon, color: 'amber', route: '/tenants' },
    { label: 'AI Assistant', desc: 'Sirsi Guidance Engine', icon: SparklesIcon, color: 'orange', route: '/' },
    { label: 'Console', desc: 'System administration', icon: TerminalIcon, color: 'gray', route: '/development' },
    { label: 'Security', desc: 'MFA & access control', icon: ShieldIcon, color: 'red', route: '/settings' },
    { label: 'Settings', desc: 'Application config', icon: SettingsIcon, color: 'slate', route: '/settings' },
]

const recentActivity = [
    { id: '1', user: 'Cylton Collymore', message: 'created contract MSA-2026-001', source: 'Sirsi Sign', time: '2 hours ago', type: 'success' as const },
    { id: '2', user: 'System', message: 'MFA enrollment completed for cylton@sirsi.ai', source: 'Auth', time: '4 hours ago', type: 'info' as const },
    { id: '3', user: 'Sirsi Multiplier', message: 'pricing locked at 1.0x canonical rate', source: 'Engine', time: '6 hours ago', type: 'success' as const },
    { id: '4', user: 'Stripe Webhook', message: 'payment of $2,500 received — INV-0047', source: 'Payments', time: '1 day ago', type: 'success' as const },
    { id: '5', user: 'System', message: 'SSL certificate renewal scheduled', source: 'Infra', time: '2 days ago', type: 'warning' as const },
]

const resourceUsage = [
    { label: 'API Calls', used: 1247, total: 50000, color: 'emerald' },
    { label: 'Storage', used: 142, total: 5000, unit: 'MB', color: 'blue' },
    { label: 'Active Contracts', used: 12, total: 100, color: 'purple' },
    { label: 'Team Seats', used: 4, total: 25, color: 'amber' },
]

// ─── Component ────────────────────────────────────────────────────
function CommandCenter() {
    const navigate = useNavigate()
    const [maintenanceMode, setMaintenanceMode] = useState(false)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ── Page Header ─────────────────────────────────── */}
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1
                        className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
                        style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}
                    >
                        COMMAND CENTER
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="pulse-dot" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">
                            Sirsi Platform — All Systems Operational
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">v6.0.0</span>
                </div>
            </header>

            {/* ── Platform Metrics (6 cards) ──────────────────── */}
            <section>
                <h2
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4"
                    style={{ fontFamily: "'Cinzel', serif" }}
                >
                    Platform Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {platformMetrics.map((metric) => (
                        <MetricCard key={metric.label} {...metric} />
                    ))}
                </div>
            </section>

            {/* ── Quick Actions (8 tiles) ─────────────────────── */}
            <section>
                <h2
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4"
                    style={{ fontFamily: "'Cinzel', serif" }}
                >
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate({ to: action.route })}
                            className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 group text-left"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-9 h-9 bg-${action.color}-100 dark:bg-${action.color}-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <action.icon className={`w-4 h-4 text-${action.color}-600 dark:text-${action.color}-400`} />
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{action.label}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Two-Column: Activity Feed + Sidebar ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Activity Feed (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3
                                className="font-bold text-gray-900 dark:text-white"
                                style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}
                            >
                                UNIFIED ACTIVITY FEED
                            </h3>
                            <button className="text-xs text-emerald-600 font-bold hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {recentActivity.map((item) => (
                                <div key={item.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                            item.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                'bg-blue-100 dark:bg-blue-900/30'
                                        }`}>
                                        {item.type === 'success' ? <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> :
                                            item.type === 'warning' ? <AlertTriangleIcon className="w-4 h-4 text-amber-600" /> :
                                                <InfoIcon className="w-4 h-4 text-blue-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm">
                                                <span className="font-bold text-gray-900 dark:text-white">{item.user}</span>
                                                <span className="text-gray-500 dark:text-slate-400 ml-2">{item.message}</span>
                                            </p>
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-4">{item.time}</span>
                                        </div>
                                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold uppercase tracking-widest">
                                            {item.source}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6">

                    {/* System Status */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3
                            className="font-bold text-gray-900 dark:text-white mb-4 text-sm"
                            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}
                        >
                            SYSTEM STATUS
                        </h3>
                        <div className="space-y-4">
                            {systemStatus.map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <stat.icon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3
                            className="font-bold text-gray-900 dark:text-white mb-4 text-sm"
                            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}
                        >
                            RESOURCE USAGE
                        </h3>
                        <div className="space-y-4">
                            {resourceUsage.map((res) => {
                                const pct = Math.round((res.used / res.total) * 100)
                                return (
                                    <div key={res.label}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{res.label}</span>
                                            <span className="text-xs text-gray-500">
                                                {res.used.toLocaleString()}{res.unit ? ` ${res.unit}` : ''} / {res.total.toLocaleString()}{res.unit ? ` ${res.unit}` : ''}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
                                            <div
                                                className={`bg-${res.color}-500 h-1.5 rounded-full transition-all duration-700`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3
                            className="font-bold text-gray-900 dark:text-white mb-4 text-sm"
                            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}
                        >
                            MAINTENANCE MODE
                        </h3>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Global Access</span>
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-emerald-500'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${maintenanceMode ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                            Maintenance mode restricts access to all tenant portals and Sirsi Sign for scheduled updates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Sub-Components ───────────────────────────────────────────────

function MetricCard({ label, value, trend, icon: Icon, color }: {
    label: string; value: string; trend: string; icon: any; color: string
}) {
    const isPositive = trend.startsWith('+')
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                </div>
                {trend !== 'LOCKED' ? (
                    <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {isPositive && '↗ '}{trend}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Locked
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
        </div>
    )
}
