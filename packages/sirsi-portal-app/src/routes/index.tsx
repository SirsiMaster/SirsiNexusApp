// src/routes/index.tsx
import { createRoute } from '@tanstack/react-router'
import { useSystemOverview } from '../hooks/useAdminService'
import { Route as rootRoute } from './__root'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/',
    component: Dashboard,
})

function Dashboard() {
    const { data: overview, isLoading } = useSystemOverview()
    const [lastRefresh, setLastRefresh] = useState<string>('Just now')

    useEffect(() => {
        if (overview) {
            setLastRefresh(DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS))
        }
    }, [overview])

    if (isLoading) return <div className="p-8 text-white/20 uppercase tracking-widest text-[10px]">Initialising Command Center...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Dashboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="pulse-dot" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">
                            Real-time Stream • Last updated: {lastRefresh}
                        </span>
                    </div>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="Total Tenants"
                    value={overview?.totalTenants.toString() || "0"}
                    trend="+12.5%"
                    icon="👥"
                    subtitle="Platform isolation instances"
                />
                <AnalyticsCard
                    title="Active Contracts"
                    value={overview?.totalContracts.toString() || "0"}
                    trend="+8.3%"
                    icon="📄"
                    subtitle="Legal execution flow"
                />
                <AnalyticsCard
                    title="Revenue (MTD)"
                    value={`$${((overview?.revenueMtd?.amountCents || 0) / 100).toLocaleString()}`}
                    trend="+15.7%"
                    icon="💰"
                    subtitle="Processed via Sirsi Sign"
                />
                <AnalyticsCard
                    title="Sirsi Multiplier"
                    value={overview?.sirsiMultiplier.toFixed(2) || "0.00"}
                    trend="LOCKED"
                    icon="⚡"
                    subtitle="System efficiency index"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Unified Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">Unified Activity Feed</h3>
                            <button className="text-xs text-emerald-600 font-bold hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {overview?.activityFeed?.map((item: any) => (
                                <ActivityItem
                                    key={item.id}
                                    timestamp={DateTime.fromSeconds(Number(item.timestamp)).toRelative() || ""}
                                    user={item.user}
                                    message={item.message}
                                    source={item.source}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Controls */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Maintenance Mode</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            <span className="text-sm font-medium">Global Access</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${overview?.maintenanceMode ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${overview?.maintenanceMode ? 'left-6' : 'left-1'}`} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
                            * Maintenance mode will restrict access to all tenant portals and the Sirsi Sign platform for scheduled updates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AnalyticsCard({ title, value, trend, icon, subtitle }: { title: string, value: string, trend: string, icon: string, subtitle: string }) {
    return (
        <div className="analytics-card">
            <div className="flex items-center justify-between mb-4">
                <div className="metric-icon">{icon}</div>
                <div className={`metric-trend ${trend.startsWith('+') ? 'trend-up' : 'text-gray-400'}`}>
                    <span>{trend.startsWith('+') ? '↗' : ''}</span>
                    <span>{trend}</span>
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{title}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500">{subtitle}</div>
        </div>
    )
}

function ActivityItem({ timestamp, user, message, source }: { timestamp: string, user: string, message: string, source: string }) {
    return (
        <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                <DashboardIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <p className="text-sm">
                        <span className="font-bold text-gray-900 dark:text-white">{user}</span>
                        <span className="text-gray-500 dark:text-slate-400 ml-2">{message}</span>
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">{timestamp}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold uppercase tracking-widest">
                        {source}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Stub for Icon - should import from lucide-react in __root but re-import here if needed
import { LayoutDashboard } from 'lucide-react'
const DashboardIcon = LayoutDashboard as any
