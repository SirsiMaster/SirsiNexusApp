// src/routes/index.tsx
import { createRoute } from '@tanstack/react-router'
import { useSystemSettings } from '../hooks/useAdminService'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/',
    component: Dashboard,
})

function Dashboard() {
    const { data: settings } = useSystemSettings()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl">Command Center</h1>
                    <p className="text-white/40 mt-1">Global System Overview & Telemetry</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 border-sirsi-emerald/30 border">
                        <div className="text-[10px] text-sirsi-emerald uppercase">System Status</div>
                        <div className="text-sm font-bold">OPERATIONAL</div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Tenants" value="12" change="+2" />
                <StatCard title="Total Contracts" value="142" change="+12" />
                <StatCard title="Revenue (MTD)" value="$42,500" change="+15%" />
                <StatCard title="Sirsi Multiplier" value={settings?.sirsiMultiplier.toFixed(1) || "..."} change="Locked" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-lg mb-4">Unified Activity Feed</h3>
                        <div className="space-y-4">
                            <ActivityItem
                                time="2m ago"
                                user="Cylton Collymore"
                                action="created contract"
                                meta="FW-992 (FinalWishes)"
                            />
                            <ActivityItem
                                time="15m ago"
                                user="System"
                                action="deployed gateway"
                                meta="v2.1.0-alpha"
                            />
                            <ActivityItem
                                time="1h ago"
                                user="Tameeka Lockhart"
                                action="signed contract"
                                meta="TL-001 (FinalWishes)"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 border-sirsi-gold/20 border">
                        <h3 className="text-lg mb-4">Maintenance</h3>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-sm">Maintenance Mode</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings?.maintenanceMode ? 'bg-sirsi-emerald' : 'bg-white/10'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings?.maintenanceMode ? 'left-6' : 'left-1'}`} />
                            </div>
                        </div>
                        <p className="text-[10px] text-white/30 mt-3 italic">
                            * Enabling maintenance mode will block client-facing portals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, change }: { title: string, value: string, change: string }) {
    return (
        <div className="glass-panel p-6 gold-border">
            <div className="text-[10px] text-sirsi-gold uppercase tracking-widest mb-1">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-[10px] text-sirsi-emerald mt-2">{change} this month</div>
        </div>
    )
}

function ActivityItem({ time, user, action, meta }: { time: string, user: string, action: string, meta: string }) {
    return (
        <div className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
            <div className="w-2 h-2 rounded-full bg-sirsi-gold mt-2 shadow-[0_0_10px_#C8A951]" />
            <div className="flex-1">
                <div className="text-xs">
                    <span className="text-white/80 font-bold">{user}</span>
                    <span className="text-white/40 ml-2">{action}</span>
                    <span className="text-sirsi-gold/80 ml-2">{meta}</span>
                </div>
                <div className="text-[10px] text-white/20 mt-1">{time}</div>
            </div>
        </div>
    )
}
