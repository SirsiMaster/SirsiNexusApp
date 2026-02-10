import { useRouter } from '@tanstack/react-router';

export function LandingPage() {
    const { navigate } = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-inter overflow-x-hidden">
            {/* Geometric Overlays */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 hex-pattern" />
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-500/10 to-transparent" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">S</div>
                        <span className="text-xl font-bold tracking-tight">SirsiNexus</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium hover:text-emerald-500 transition-colors">Features</a>
                        <a href="#platform" className="text-sm font-medium hover:text-emerald-500 transition-colors">Architecture</a>
                        <button
                            onClick={() => navigate({ to: '/login' })}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                            Access Vault
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-8">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Revolutionary AI-Powered Infrastructure Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600">Intelligent Infrastructure</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        SirsiNexus doesn't just manage infrastructure—it <span className="font-bold text-emerald-500">thinks, learns, and evolves</span> with your business requirements.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate({ to: '/login' })}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-emerald-600/20 hover:scale-105"
                        >
                            Start Live Demo
                        </button>
                        <button
                            className="px-8 py-4 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-lg transition-all"
                        >
                            Technical Deep Dive
                        </button>
                    </div>
                </div>
            </section>

            {/* Dual Path Section */}
            <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-800/20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Developer Path */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 group hover:border-emerald-500/30 transition-all">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">🚀</div>
                            <h3 className="text-2xl font-bold mb-4">For Enterprises & Developers</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Deploy AI agents that autonomous orchestrate cloud migration, optimization, and scaling. Join the elite community building the future of distributed intelligence.
                            </p>
                            <button
                                onClick={() => navigate({ to: '/login' })}
                                className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Explore Repository
                            </button>
                        </div>

                        {/* Investor Path */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 group hover:border-emerald-500/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">Exclusive</div>
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">💎</div>
                            <h3 className="text-2xl font-bold mb-4">For Strategic Investors</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Access private financial records, growth velocity metrics, and the secure data room. Join us in scaling the foundation of the autonomous web.
                            </p>
                            <button
                                onClick={() => navigate({ to: '/investor' })}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                Investor Portal
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">S</div>
                            <span className="text-lg font-bold">SirsiNexus</span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-xs">Revolutionizing infrastructure through agent-embedded distributed intelligence.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Platform</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="hover:text-emerald-500 cursor-pointer">Architecture</li>
                            <li className="hover:text-emerald-500 cursor-pointer">Security</li>
                            <li className="hover:text-emerald-500 cursor-pointer">Roadmap</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="hover:text-emerald-500 cursor-pointer">Privacy Policy</li>
                            <li className="hover:text-emerald-500 cursor-pointer">Compliance</li>
                            <li className="hover:text-emerald-500 cursor-pointer" onClick={() => navigate({ to: '/admin' })}>Admin Access</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    © {new Date().getFullYear()} Sirsi Technologies Inc • All Rights Reserved
                </div>
            </footer>

            <style>{`
                .hex-pattern {
                    background-image: url('data:image/svg+xml,<svg width="100" height="86.6" xmlns="http://www.w3.org/2000/svg"><polygon points="50,0 100,25 100,61.6 50,86.6 0,61.6 0,25" fill="none" stroke="rgba(16,185,129,0.2)" stroke-width="1"/></svg>');
                    background-size: 100px 86.6px;
                }
            `}</style>
        </div>
    );
}
