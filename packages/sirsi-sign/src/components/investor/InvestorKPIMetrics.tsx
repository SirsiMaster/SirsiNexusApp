export function InvestorKPIMetrics() {
    return (
        <div className="flex flex-col gap-10">
            <div>
                <h2 className="cinzel text-2xl text-white tracking-widest font-bold">KPI <span className="text-emerald-500">& Unit Metrics</span></h2>
                <p className="inter text-xs text-slate-400 mt-1 uppercase tracking-tighter">Strategic traction metrics and unit economics analysis</p>
            </div>

            {/* Top Row: Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Customer Lifetime Value"
                    value="$412.5k"
                    sub="Gross Margin: 82%"
                    icon="💎"
                    trend="+15%"
                />
                <MetricCard
                    label="CAC (Total Blended)"
                    value="$14.2k"
                    sub="Payback: 3.2Mo"
                    icon="🎯"
                    trend="-8%"
                />
                <MetricCard
                    label="Churn Rate (Gross)"
                    value="0.8%"
                    sub="Expansion: +112%"
                    icon="🔄"
                    trend="Stable"
                />
            </div>

            {/* Strategic Traction Chart */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-8">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h3 className="inter text-sm font-bold text-white uppercase tracking-widest">Growth Velocity</h3>
                        <p className="inter text-[9px] text-slate-500 uppercase mt-1">Institutional portfolio adoption rate</p>
                    </div>
                    <div className="flex gap-4">
                        <LegendItem color="bg-emerald-500" label="SaaS Revenue" />
                        <LegendItem color="bg-blue-500" label="Professional Services" />
                    </div>
                </div>

                <div className="h-64 flex items-end gap-4 pb-2 border-b border-white/5">
                    {[30, 45, 40, 65, 55, 80, 75, 95, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1">
                            <div className="flex flex-col h-full justify-end">
                                <div className="w-full bg-blue-500/30 rounded-t-sm" style={{ height: `${h * 0.3}%` }} />
                                <div className="w-full bg-emerald-500 rounded-t-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]" style={{ height: `${h * 0.7}%` }} />
                            </div>
                            <span className="inter text-[8px] text-slate-600 text-center uppercase mt-1">Q{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Market Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
                    <h4 className="inter text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Unfair Competitive Moats</h4>
                    <div className="space-y-4">
                        <MoatItem title="NVIDIA Inception" desc="Exclusive hardware orchestration access and compute subsidies." />
                        <MoatItem title="Hedera Alliance" desc="Institutional-grade consensus and permanent audit trail verification." />
                        <MoatItem title="AWS MAP Pilot" desc="Direct migration funding for F100 portfolio optimization." />
                    </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8">
                    <h4 className="inter text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">Unit Economic Stability</h4>
                    <div className="space-y-4">
                        <MoatItem title="82% Contribution Margin" desc="Highly scalable infrastructure with minimal manual overhead." />
                        <MoatItem title="8.5x ROI Projection" desc="Verified via pilot deployments across University networks." />
                        <MoatItem title="Exclusivity Lock" desc="Multi-year mandates for estate settlement orchestration." />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, sub, icon, trend }: { label: string; value: string; sub: string; icon: string; trend: string }) {
    return (
        <div className="neo-glass-panel p-6 border border-white/10 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity translate-x-1 -translate-y-1">{icon}</div>
            <span className="inter text-[9px] text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
            <div className="flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="cinzel text-2xl font-bold text-white tracking-wider">{value}</span>
                    <span className="inter text-[9px] text-slate-500 uppercase mt-1">{sub}</span>
                </div>
                <span className={`inter text-[9px] font-bold ${trend === 'Stable' ? 'text-slate-500' : trend.startsWith('+') ? 'text-emerald-400' : 'text-emerald-400'}`}>
                    {trend} {trend !== 'Stable' && '↑'}
                </span>
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-sm ${color}`} />
            <span className="inter text-[10px] text-slate-400 uppercase tracking-tighter">{label}</span>
        </div>
    );
}

function MoatItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="flex flex-col">
            <span className="inter text-xs font-bold text-slate-200">{title}</span>
            <span className="inter text-[11px] text-slate-500 mt-0.5">{desc}</span>
        </div>
    );
}
