import { useRouter } from '@tanstack/react-router';

export function Pricing() {
    const { navigate } = useRouter();

    const plans = [
        {
            name: "Developer",
            price: "Free",
            description: "Perfect for individuals and experimenters.",
            features: [
                "Up to 5 active projects",
                "Community SDK support",
                "Basic AI agent orchestration",
                "Standard CI/CD pipeline",
                "GitHub integration"
            ],
            buttonText: "Start Building",
            highlight: false
        },
        {
            name: "Professional",
            price: "$99/mo",
            description: "For growing teams scaling production workloads.",
            features: [
                "Unlimited active projects",
                "Priority engineer support",
                "Advanced AI memory graphs",
                "Dedicated gRPC endpoints",
                "Comprehensive analytics",
                "99.9% uptime SLA"
            ],
            buttonText: "Scale Now",
            highlight: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Private Sovereign AI infrastructure.",
            features: [
                "On-premise deployment",
                "Custom LLM training",
                "Dedicated Hardware HSM",
                "Multi-Tenant Vaults",
                "24/7 Concierge Dev-Ops",
                "Unlimited User Access"
            ],
            buttonText: "Contact Forge",
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen bg-navy text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="text-center mb-20">
                    <h1 className="cinzel text-5xl md:text-6xl text-gold tracking-widest mb-6">Forge Your Infrastructure</h1>
                    <p className="inter text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Institutional-grade scaling for the next generation of AI-driven applications.
                        Transparent, predictable, and permanent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`neo-glass-panel border ${plan.highlight ? 'border-gold/50 scale-105 shadow-[0_0_50px_rgba(200,169,81,0.15)]' : 'border-white/10'} rounded-3xl p-10 flex flex-col h-full transition-all hover:translate-y-[-8px]`}>
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="cinzel text-2xl text-white tracking-wider mb-2">{plan.name}</h3>
                                <p className="inter text-xs text-slate-500 uppercase tracking-widest mb-6">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="cinzel text-4xl font-bold text-gold">{plan.price}</span>
                                    {plan.price !== "Custom" && plan.price !== "Free" && <span className="inter text-slate-500 text-xs tracking-tighter">/ monthly</span>}
                                </div>
                            </div>

                            <div className="h-px bg-white/5 mb-8"></div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="inter text-sm text-slate-300 font-light">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => plan.price === "Custom" ? navigate({ to: '/contact' }) : navigate({ to: '/signup', search: { plan: plan.name.toLowerCase() } })}
                                className={`w-full py-4 rounded-xl cinzel text-xs font-bold tracking-[0.2em] uppercase transition-all ${plan.highlight
                                    ? 'bg-gold text-navy hover:bg-gold-bright hover:shadow-[0_0_30px_rgba(200,169,81,0.3)]'
                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Preview */}
                <div className="mt-40 max-w-4xl mx-auto">
                    <h2 className="cinzel text-3xl text-gold tracking-widest text-center mb-16">Intelligence Briefing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h4 className="inter text-sm font-bold text-white mb-3 uppercase tracking-wider">Can I move between tiers?</h4>
                            <p className="inter text-sm text-slate-400 font-light leading-relaxed">
                                Seamless migration is built into the Sirsi Nexus core. Upgrade or adjust your resource allocation
                                instantly through the Command Center.
                            </p>
                        </div>
                        <div>
                            <h4 className="inter text-sm font-bold text-white mb-3 uppercase tracking-wider">What about data sovereignty?</h4>
                            <p className="inter text-sm text-slate-400 font-light leading-relaxed">
                                Every plan utilizes encrypted Sirsi Vaults. For Enterprise partners, we offer full on-premise
                                knowledge graph synchronization for absolute air-gapped security.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="py-20 text-center opacity-30">
                <p className="inter text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} Sirsi Technologies • Institutional Grade AI Infrastructure</p>
            </footer>
        </div>
    );
}
