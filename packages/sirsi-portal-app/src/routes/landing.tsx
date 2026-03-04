/**
 * Landing Page — sirsi.ai homepage (pixel-perfect port of index.html)
 *
 * This is a PUBLIC page — no sidebar, no admin header.
 * Uses its own full-width layout matching the original HTML.
 *
 * Sections: Hero, Dual-Path, AI Differentiators, Core Capabilities,
 * Multi-Cloud Platform, CTA Banner
 */

import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/home',
    component: LandingPage,
})

// ── Reusable check icon (matches HTML SVG) ──
function CheckIcon({ color = '#10b981' }: { color?: string }) {
    return (
        <svg className="w-5 h-5 flex-shrink-0" fill={color} viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    )
}

function LandingPage() {
    return (
        <>
            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section
                className="relative py-24 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #f8fafc, #ecfdf5, #d1fae5)' }}
            >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-6">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-emerald-700">
                            Revolutionary AI-Powered Infrastructure Platform
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6" style={{ lineHeight: 1.1 }}>
                        The Future of <br className="hidden md:block" />
                        <span className="text-emerald-600">Intelligent Infrastructure</span>
                    </h1>

                    <p className="text-2xl text-slate-600 mb-4 max-w-4xl mx-auto" style={{ fontWeight: 300 }}>
                        SirsiNexus doesn't just manage infrastructure—it{' '}
                        <span className="font-semibold text-emerald-600">thinks, learns, and evolves</span> with your business.
                    </p>
                    <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
                        Our AI agents embed directly into your cloud ecosystem, making autonomous decisions,
                        predicting failures before they happen, and optimizing resources in real-time.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Start Live Demo
                        </button>
                        <LinkComp to="/documentation"
                            className="inline-flex items-center px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-300">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Technical Deep Dive
                        </LinkComp>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-30 animate-pulse" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </section>

            {/* ═══════════════ DUAL PATH SECTION ═══════════════ */}
            <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff, #f8fafc, #ecfdf5)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Path to Revolutionary Infrastructure</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Whether you're building the future or investing in it, SirsiNexus provides the tools and opportunities you need
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Enterprise/Developer Path */}
                        <div className="group relative bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:border-blue-300">
                            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">For Enterprises & Developers</h3>
                            <p className="text-slate-600 mb-6">
                                Deploy AI agents that think, learn, and evolve with your infrastructure.
                                Experience autonomous decision-making and predictive optimization.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm"><CheckIcon color="#3b82f6" /> Access open-source codebase</li>
                                <li className="flex items-center gap-3 text-sm"><CheckIcon color="#3b82f6" /> Join developer community</li>
                                <li className="flex items-center gap-3 text-sm"><CheckIcon color="#3b82f6" /> Get early access updates</li>
                            </ul>
                            <div className="space-y-3">
                                <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener"
                                    className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.645.349-1.086.635-1.335-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.682-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.578 9.578 0 0110 4.836a9.578 9.578 0 012.504.337c1.909-1.293 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.698 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.48C17.138 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                        </svg>
                                        Explore on GitHub
                                    </span>
                                </a>
                                <LinkComp to="/signup"
                                    className="block w-full text-center px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                                    Sign Up for Updates
                                </LinkComp>
                            </div>
                        </div>

                        {/* Investor Path */}
                        <div className="group relative bg-white rounded-2xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:border-emerald-300 overflow-hidden">
                            <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl" style={{ background: 'linear-gradient(to left, #ecfdf5, #d1fae5)' }}>
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Exclusive Access</span>
                            </div>
                            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">For Investors</h3>
                            <p className="text-slate-600 mb-6">
                                Access exclusive investment opportunities in the future of AI-powered infrastructure.
                                Join strategic partners shaping enterprise technology.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm"><CheckIcon /> Financial projections & KPIs</li>
                                <li className="flex items-center gap-3 text-sm"><CheckIcon /> Secure data room access</li>
                                <li className="flex items-center gap-3 text-sm"><CheckIcon /> Strategic committee insights</li>
                            </ul>
                            <div className="space-y-3">
                                <LinkComp to="/investor-portal"
                                    className="block w-full text-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                                    style={{ background: 'linear-gradient(to right, #059669, #047857)' }}>
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Access Investor Portal
                                    </span>
                                </LinkComp>
                                <LinkComp to="/signup"
                                    className="block w-full text-center px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                                    Request Investor Access
                                </LinkComp>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ AI DIFFERENTIATORS ═══════════════ */}
            <section className="py-24 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #064e3b, #1e293b)' }}>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <p className="text-emerald-400 font-medium mb-4 text-sm uppercase tracking-widest">
                            Traditional infrastructure tools manage resources. SirsiNexus <span className="text-emerald-300">thinks about them</span>.
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-500">Autonomous Decision Making</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                        <div className="space-y-6">
                            {[
                                { title: 'Predictive Failure Prevention', desc: 'Our AI agents analyze patterns across millions of data points to predict and prevent failures before they impact your business—often weeks in advance.' },
                                { title: 'Self-Healing Infrastructure', desc: "When issues arise, SirsiNexus doesn't just alert you—it automatically implements fixes, routes traffic, and maintains service continuity without human intervention." },
                                { title: 'Intelligent Cost Optimization', desc: 'Beyond simple scaling—our agents understand your business cycles, predict demand patterns, and optimize costs across multi-cloud environments in real-time.' },
                            ].map(d => (
                                <div key={d.title} className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 text-lg">{d.title}</h4>
                                        <p className="text-slate-300">{d.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 rounded-2xl border border-emerald-500/20" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))' }}>
                            <div className="text-center mb-6">
                                <h4 className="text-2xl font-bold text-emerald-400 mb-2">AI Agent Performance</h4>
                                <p className="text-slate-300">Real-time intelligence metrics</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { val: '4.7s', label: 'Avg. Decision Time' },
                                    { val: '99.97%', label: 'Prediction Accuracy' },
                                    { val: '847K', label: 'Decisions/Hour' },
                                    { val: '-73%', label: 'Incident Reduction' },
                                ].map(m => (
                                    <div key={m.label} className="text-center">
                                        <div className="text-3xl font-bold text-emerald-400 mb-1">{m.val}</div>
                                        <div className="text-sm text-slate-400">{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feature Cards Row 1 */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {[
                            { title: 'Zero-Touch Operations', desc: 'From deployment to optimization, SirsiNexus handles the complexity so your team can focus on innovation instead of infrastructure maintenance.', gradient: 'from-emerald-500 to-emerald-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                            { title: 'Adaptive Intelligence', desc: "Our AI doesn't just follow rules—it learns your business patterns, adapts to your growth, and evolves its decision-making over time.", gradient: 'from-blue-500 to-blue-600', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                            { title: 'Enterprise Security', desc: 'Built-in security intelligence that continuously monitors, detects threats, and adapts security policies across your entire infrastructure ecosystem.', gradient: 'from-purple-500 to-purple-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                        ].map(card => (
                            <div key={card.title} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md">
                                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-6`}>
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-800">{card.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Feature Cards Row 2 */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-800">Natural Language Interfaces</h3>
                            <p className="text-slate-600 leading-relaxed">Transform app building, migration, and optimization with conversational AI. Simply describe your infrastructure needs in plain English.</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-emerald-50 p-8 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-800">LLM & Knowledge Graphs</h3>
                            <p className="text-slate-600 leading-relaxed">Turbocharge your AI integration with state-of-the-art Large Language Models and dynamic knowledge graphs.</p>
                        </div>
                    </div>
                </div>
                {/* Background blurs */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </section>

            {/* ═══════════════ CORE CAPABILITIES ═══════════════ */}
            <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff, #ecfdf5, #ffffff)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Platform Capabilities</h2>
                        <p className="text-xl text-slate-600">Comprehensive infrastructure management with AI-powered automation</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Smart Migration Wizards', desc: 'AI-guided migration processes that analyze your current infrastructure and create optimized migration paths with zero-downtime strategies.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                            { title: 'Predictive Auto-Scaling', desc: 'Machine learning algorithms that predict traffic patterns and business cycles to scale resources proactively, not reactively.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                            { title: 'Intelligent Analytics', desc: 'Deep learning models that provide actionable insights, anomaly detection, and performance optimization recommendations in real-time.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                        ].map(item => (
                            <div key={item.title} className="p-6 rounded-lg hover:shadow-lg transition-shadow border" style={{ background: 'linear-gradient(135deg, #f8fafc, #ecfdf5, #f8fafc)', borderColor: 'rgba(16,185,129,0.15)' }}>
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA SECTION ═══════════════ */}
            <section className="py-20" style={{ background: 'linear-gradient(to right, #059669, #2563eb)' }}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Infrastructure?</h2>
                    <p className="text-xl text-white/90 mb-8">Join hundreds of enterprises already using SirsiNexus for their cloud operations</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/business-case"
                            className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            View Business Case
                        </a>
                        <LinkComp to="/login"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-emerald-600 transition-colors">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Login
                        </LinkComp>
                    </div>
                </div>
            </section>
        </>
    )
}
