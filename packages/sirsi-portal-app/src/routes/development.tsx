// src/routes/development.tsx
import { createRoute } from '@tanstack/react-router'
import { useDevMetrics, useSyncGitHub } from '../hooks/useAdminService'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/development',
    component: DevelopmentIntelligence,
})

function DevelopmentIntelligence() {
    // Defaulting to "sirsi" tenant for now
    const { data: metrics, isLoading } = useDevMetrics({
        tenantId: "sirsi",
        startTime: BigInt(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endTime: BigInt(Date.now())
    })
    const syncGitHub = useSyncGitHub()

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-serif text-sirsi-gold tracking-widest uppercase">Dev Intelligence</h1>
                    <p className="text-white/40 mt-2 text-sm tracking-wide">Studio Velocity, Resource Utilization & Git Sync</p>
                </div>
                <button
                    onClick={() => syncGitHub.mutate({ repoUrl: "https://github.com/sirsimaster/sirsi-nexus" })}
                    disabled={syncGitHub.isPending}
                    className="action-btn"
                >
                    {syncGitHub.isPending ? "Synchronizing..." : "Sync GitHub Registry"}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    label="Studio Velocity"
                    value={metrics?.velocity.toFixed(1) || "0.0"}
                    unit="pts/spr"
                    trend="+12%"
                />
                <MetricCard
                    label="Open Issues"
                    value={metrics?.openIssues.toString() || "0"}
                    unit="tickets"
                    trend="-3"
                />
                <MetricCard
                    label="Resource Multiplier"
                    value="2.0x"
                    unit="Efficiency"
                    trend="Stable"
                />
                <MetricCard
                    label="MTTR"
                    value="4.2"
                    unit="Hours"
                    trend="-18%"
                    isSuccess
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel gold-border p-8">
                    <h3 className="text-sirsi-gold uppercase tracking-[0.2em] text-xs mb-6">Velocity History (30 Days)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {metrics?.activity.map((day: any, i: number) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="bg-sirsi-gold/20 group-hover:bg-sirsi-gold/40 transition-all rounded-t-sm"
                                    style={{ height: `${(day.commits / 20) * 100}%`, minHeight: '4px' }}
                                />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-white/20 whitespace-nowrap rotate-45">
                                    {day.date.split('-').slice(1).join('/')}
                                </div>
                            </div>
                        )) || (
                                <div className="w-full h-full flex items-center justify-center text-white/10 italic">
                                    No activity records found
                                </div>
                            )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel p-6 border-l-2 border-sirsi-gold">
                        <div className="text-[10px] text-sirsi-gold uppercase tracking-[0.3em] mb-2 opacity-60">Internal Rate</div>
                        <div className="text-2xl font-serif">$125/hr</div>
                        <p className="text-[10px] text-white/40 mt-1 italic">Sirsi Portfolio Boutique Access</p>
                    </div>
                    <div className="glass-panel p-6 border-l-2 border-sirsi-emerald">
                        <div className="text-[10px] text-sirsi-emerald uppercase tracking-[0.3em] mb-2 opacity-60">Market Value Realized</div>
                        <div className="text-2xl font-serif">$250/hr</div>
                        <p className="text-[10px] text-white/40 mt-1 italic">Blended External Engineering Rate</p>
                    </div>
                    <div className="glass-panel p-6">
                        <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Active Dev Sessions</h4>
                        {isLoading ? (
                            <div className="text-xs text-white/20">Polling telemetry...</div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/60">Antigravity (Agent)</span>
                                    <span className="text-sirsi-emerald animate-pulse text-[10px] uppercase">● Active</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/60">Lead Architect</span>
                                    <span className="text-white/20 text-[10px] uppercase tracking-widest">Idle - 14m</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ label, value, unit, trend, isSuccess }: { label: string, value: string, unit: string, trend: string, isSuccess?: boolean }) {
    return (
        <div className="glass-panel p-6 hover:gold-border transition-all duration-300">
            <div className="text-[10px] text-sirsi-gold uppercase tracking-[0.3em] mb-4 opacity-70">{label}</div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif">{value}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{unit}</span>
            </div>
            <div className={`text-[10px] mt-2 uppercase tracking-tighter ${isSuccess ? 'text-sirsi-emerald' : 'text-white/40'}`}>
                {trend} <span className="opacity-40">vs last month</span>
            </div>
        </div>
    )
}
