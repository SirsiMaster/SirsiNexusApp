
export function InvestorDashboard() {
    return (
        <div className="flex flex-col gap-10">
            {/* Hero Summary */}
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="cinzel text-3xl text-white tracking-widest font-bold">Investor <span className="text-emerald-500">Dashboard</span></h2>
                    <p className="inter text-xs text-slate-400 mt-2 uppercase tracking-[0.2em]">Secure gateway to comprehensive investment insights</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex flex-col gap-6">
                        <p className="inter text-sm leading-relaxed text-slate-300 max-w-3xl">
                            SirsiNexus is revolutionizing cloud infrastructure management through our proprietary <span className="text-emerald-400 font-bold">Graph of Thought AI</span> architecture integrated with <span className="text-emerald-400 font-bold">Hedera Hashgraph</span> technology. Our unique superpower lies in strategic traction - exclusive access to NVIDIA's invite-only Inception Program and AWS's Migration Acceleration Program positions us at the epicenter of cloud transformation.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Investment Opportunity"
                                content="Pre-Seed funding of $1.5M unlocks NVIDIA and AWS co-investment commitments, plus Hedera Hashgraph strategic investment interest."
                                color="emerald"
                            />
                            <SummaryCard
                                title="Use of Funds"
                                content="40% Intelligence development, 35% enterprise sales expansion, 15% F100 adoption, and 10% working capital."
                                color="blue"
                            />
                            <SummaryCard
                                title="Target Return"
                                content="10x return potential within 5 years through strategic exit or IPO, driven by dominant market position."
                                color="purple"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Anchors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-8">
                    <h3 className="inter text-sm font-bold text-white uppercase tracking-widest mb-6">Market Opportunity</h3>
                    <div className="space-y-6">
                        <MarketBullet
                            label="$78.8B TAM"
                            description="Growing cloud infrastructure optimization market with 28.5% CAGR, driven by enterprise digital transformation."
                        />
                        <MarketBullet
                            label="28.5% CAGR"
                            description="Rapid market expansion driven by cloud adoption and AI-powered optimization demand."
                        />
                        <MarketBullet
                            label="Enterprise Focus"
                            description="Targeting high-value enterprise customers with $125K average contract value and 96% logo retention."
                        />
                    </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-8">
                    <h3 className="inter text-sm font-bold text-white uppercase tracking-widest mb-6">Financial Projections</h3>
                    <div className="h-48 flex items-end gap-3 pb-2 border-b border-white/5">
                        {[20, 35, 55, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-gradient-to-t from-emerald-500/40 to-emerald-500/20 rounded-t-sm group-hover:from-emerald-500 transition-all duration-500 relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -track-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500 text-black text-[8px] font-bold px-1 rounded">
                                        Year {i + 1}
                                    </div>
                                </div>
                                <span className="inter text-[8px] text-slate-500">Y{i + 1}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="inter text-[10px] text-slate-500 uppercase">Projected ARR</span>
                            <span className="inter text-lg font-bold text-white">$100M+</span>
                        </div>
                        <div className="text-right flex flex-col">
                            <span className="inter text-[10px] text-slate-500 uppercase">Exit Multiple</span>
                            <span className="inter text-lg font-bold text-emerald-400">12x - 15x</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, content, color }: { title: string; content: string; color: string }) {
    const borders: Record<string, string> = {
        emerald: 'border-emerald-500/30 bg-emerald-500/5',
        blue: 'border-blue-500/30 bg-blue-500/5',
        purple: 'border-purple-500/30 bg-purple-500/5'
    };

    const textColors: Record<string, string> = {
        emerald: 'text-emerald-400',
        blue: 'text-blue-400',
        purple: 'text-purple-400'
    };

    return (
        <div className={`p-4 rounded-xl border ${borders[color]}`}>
            <h4 className={`inter text-[10px] font-bold uppercase tracking-wider mb-2 ${textColors[color]}`}>{title}</h4>
            <p className="inter text-[11px] text-slate-400 leading-relaxed">{content}</p>
        </div>
    );
}

function MarketBullet({ label, description }: { label: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs">✓</div>
            <div className="flex flex-col">
                <span className="inter text-xs font-bold text-white tracking-wide">{label}</span>
                <span className="inter text-[11px] text-slate-400 mt-0.5">{description}</span>
            </div>
        </div>
    );
}
