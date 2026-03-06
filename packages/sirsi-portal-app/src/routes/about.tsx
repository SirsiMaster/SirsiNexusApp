/**
 * About — Sirsi Technologies company page
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Content sourced from PROJECT_SCOPE.md, INVESTOR_SUMMARY_Q1_2026.md,
 * TEDCO_Investment_Memo_Updated.md, and pitch deck materials.
 * NOTE: No partnerships listed per user directive.
 */

import { createRoute } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/about',
    component: AboutPage,
})

/* ── Timeline item ── */
function TL({ year, title, desc }: { year: string; title: string; desc: string }) {
    return (
        <div className="flex gap-4 mb-8">
            <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900 flex-shrink-0" />
                <div className="w-0.5 flex-1 bg-emerald-200 dark:bg-emerald-800" />
            </div>
            <div className="pb-4">
                <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">{year}</span>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">{title}</h4>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{desc}</p>
            </div>
        </div>
    )
}

/* ── Stat card ── */
function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</div>
        </div>
    )
}

function AboutPage() {
    usePageMeta('About | SirsiNexus', 'Sirsi Technologies — AI-powered infrastructure management platform. $100K TEDCO investment, $147K contracted revenue, DCA Live AI Leadership Award.')
    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #022c22, #064e3b, #000000)' }}>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        About <span className="text-emerald-400">Sirsi Technologies</span>
                    </h1>
                    <p className="text-xl text-emerald-100/80 max-w-3xl mx-auto leading-relaxed">
                        We're building the world's first autonomous AI infrastructure platform —
                        transforming how organizations build, deploy, and optimize cloud environments
                        through natural conversation.
                    </p>
                </div>
                {/* Decorative gradient orb */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl" />
            </section>

            {/* ═══════════════ MISSION ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Our Mission</span>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 mb-4">
                                Bridging the Cloud Expertise Gap
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Sirsi was created to bridge the cloud expertise gap by letting organizations build, host,
                                optimize, and scale infrastructure through a natural conversation. Our platform seamlessly
                                harmonizes complex resources across major cloud service providers and on-premises datacenters.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                By leveraging our proprietary knowledge-graph technology, we improve LLM memory resilience
                                to prevent the context-drift common in standard AI, ensuring accuracy in
                                mission-critical infrastructure deployments.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Stat value="20-40%" label="Avg. Infrastructure Cost Reduction" />
                            <Stat value="5×" label="Faster Agent Communication" />
                            <Stat value="$147K" label="Contracted Revenue" />
                            <Stat value="60%" label="Reduction in Manual Ops" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHAT WE DO ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">What We Build</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                            Sirsi Nexus is the architect of the autonomous infrastructure OS, designed to dynamically
                            orchestrate high-performance compute across multiple silicon architectures.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Tri-Silicon Orchestration', desc: 'Dynamically orchestrate NVIDIA GPUs, Google TPUs, and Apple Silicon into a unified compute mesh — the first platform to bridge all three architectures.', icon: '⚡' },
                            { title: 'Conversational Infrastructure', desc: 'Replace complex configuration files and CLIs with natural language. Describe your needs, and Sirsi generates complete deployment solutions.', icon: '💬' },
                            { title: 'Autonomous Operations', desc: 'Self-healing infrastructure that predicts issues, automatically scales, and continuously optimizes for cost and performance.', icon: '🤖' },
                            { title: 'Knowledge Graph Engine', desc: 'Predictive "Infrastructure-as-Data" powered by our proprietary graph protocol, eliminating waste and reducing technical debt by 40%+.', icon: '🧠' },
                            { title: 'Enterprise Security', desc: 'SOC 2 compliant, AES-256 encryption, mandatory MFA, and zero-trust architecture with defense-in-depth security controls.', icon: '🔒' },
                            { title: 'Universal Component System', desc: 'Centralized library of premium infrastructure utilities — Stripe, Plaid, SendGrid — serving the entire portfolio with integrated independence.', icon: '🏗️' },
                        ].map(item => (
                            <div key={item.title} className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOUNDER ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Leadership</span>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">Founder &amp; CEO</h2>
                    </div>
                    <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Cylton Collymore</h3>
                        <p className="text-emerald-600 font-medium mb-4">CEO &amp; Founder, Sirsi Technologies Inc.</p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            Distinguished technologist with a unique blend of enterprise, government, and startup
                            experience spanning 20+ years in cybersecurity, privacy, and infrastructure management.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {[
                                { role: 'Meta (Facebook)', detail: 'Data and Access Controls Manager — Architected global privacy standards for 100,000+ employees across Meta\'s ecosystem' },
                                { role: 'Federal Reserve Bank of Atlanta', detail: 'Cyber Risk Examiner — Assessed cyber resilience for major financial institutions' },
                                { role: 'U.S. State Department', detail: 'Foreign Service Officer — Designed classified infrastructure including privileged access management for U.S. Passport and Visa Database' },
                                { role: 'Serial Entrepreneur', detail: 'CEO/Founder of Zimbali Networks (Visa and Techstars-backed fintech) · 20+ years Federal IT service' },
                            ].map(exp => (
                                <div key={exp.role} className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{exp.role}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{exp.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHITEPAPERS ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Research</span>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 mb-4">Whitepapers in Development</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                            Three foundational whitepapers that define the Sirsi deep-tech advantage.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'NebuLang Protocol',
                                sub: 'LLM Memory Resilience',
                                desc: 'Proprietary knowledge-graph grounding that eliminates AI hallucinations in infrastructure code. Ensures 100% deterministic infrastructure-as-code by enforcing consensus-verified state mappings.',
                                status: 'In Progress',
                            },
                            {
                                title: 'Neural-Fractal Architecture',
                                sub: 'Recursive Infrastructure Verification',
                                desc: 'A recursive AI logic system that converts business requirements into verified, silicon-native cloud solutions. Provides total fault-tolerance across all cloud providers, automatically healing desynchronized infrastructure states.',
                                status: 'In Progress',
                            },
                            {
                                title: 'KG Query Engine',
                                sub: 'Predictive Infrastructure-as-Data',
                                desc: 'Transitioning from reactive observability to predictive "Infrastructure-as-Data." Utilizes the knowledge graph to identify waste and technical debt in real-time, delivering 40%+ cost reductions across enterprise deployments.',
                                status: 'In Progress',
                            },
                        ].map(paper => (
                            <div key={paper.title} className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full uppercase tracking-wider">{paper.status}</span>
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{paper.title}</h3>
                                <p className="text-sm text-emerald-600 font-medium mb-2">{paper.sub}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm flex-1">{paper.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ TIMELINE ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Company Timeline</h2>
                    </div>
                    <TL year="Late 2023" title="Inception" desc="Founder identifies critical gap in cloud infrastructure management — $62B wasted annually on cloud overprovisioning, 1.8M unfilled DevOps positions globally." />
                    <TL year="January 2024" title="Incorporation" desc="SIRSI Inc. formally incorporated. Initial concept development and architecture design begins." />
                    <TL year="Q1–Q2 2024" title="Core Development" desc="Core technology development — Rust engine, AI integrations, and multi-cloud connector framework built." />
                    <TL year="June 2024" title="Platform Evolution" desc="Platform evolves to SirsiNexus. SOC 2 Type II compliance framework established." />
                    <TL year="September 2024" title="Pre-Seed Funding" desc="$75K pre-seed funding secured from friends and family investors." />
                    <TL year="October 2024" title="Intensive Build Phase" desc="10-month intensive development resulting in production-ready platform with 41+ functional UI pages." />
                    <TL year="February 2025" title="NebuLang Development" desc="Development begins on the proprietary NebuLang machine-native query language — 5× faster agent communication." />
                    <TL year="August 2025" title="$147K Contracted Revenue" desc="Commercial traction secured — $147K in contracted revenue validated across heavy industry clients." />
                    <TL year="Q1 2026" title="UCS Infrastructure Layer" desc="Stripe, Plaid, SendGrid, and Chase integrations complete. Universal Component System operational across portfolio." />
                    <TL year="February 2026" title="TEDCO Investment" desc="TEDCO Social Impact Builder Fund invests $100K in Sirsi to support acceleration of AI-powered infrastructure management." />
                    <TL year="Q3 2026" title="Apple Cluster Beta" desc="Target: Beta launch of Sirsi Apple Cluster Hypervisor using Mac Studio M5 clusters with Thunderbolt 5 RDMA." />
                </div>
            </section>

            {/* ═══════════════ LOCATION & CONTACT ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Headquarters</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">Sirsi Technologies Inc.</p>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">909 Rose Avenue, Suite 400</p>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">North Bethesda, MD 20852</p>
                            <a href="mailto:cylton@sirsi.ai" className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                                Contact Us
                            </a>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Connect</h2>
                            <div className="space-y-3">
                                <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    GitHub — SirsiMaster/SirsiNexusApp
                                </a>
                                <a href="mailto:cylton@sirsi.ai" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    cylton@sirsi.ai
                                </a>
                                <a href="https://sirsi.ai" target="_blank" rel="noopener" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    sirsi.ai
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
