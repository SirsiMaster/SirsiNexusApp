/**
 * Pricing — Consumption-based SaaS tiers
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Content sourced from Product_Roadmap_and_Go_To_Market_Strategy.md.
 */

import { createRoute, Link } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/pricing',
    component: PricingPage,
})

/* ── Check icon ── */
function Ck() {
    return <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}

/* ── Feature row ── */
function F({ children }: { children: React.ReactNode }) {
    return <li className="flex items-start gap-3"><Ck /><span className="text-slate-600 dark:text-slate-400">{children}</span></li>
}

function PricingPage() {
    usePageMeta('Pricing | SirsiNexus', 'Consumption-based pricing for Sirsi Nexus. Start free, scale to enterprise. No hidden fees.')
    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #022c22, #064e3b, #000000)' }}>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Simple, Transparent <span className="text-emerald-400">Pricing</span>
                    </h1>
                    <p className="text-xl text-emerald-100/80 max-w-3xl mx-auto leading-relaxed">
                        Consumption-based SaaS that scales with your infrastructure.
                        Platform cost represents 10–20% of savings generated — positive ROI within 3–6 months.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            </section>

            {/* ═══════════════ PRICING TIERS ═══════════════ */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Starter */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
                            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Starter</span>
                            <div className="mt-4 mb-2">
                                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">$49</span>
                                <span className="text-slate-500 dark:text-slate-400">/month</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">+ 2% of managed cloud spend</p>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">For small-to-medium businesses starting their cloud optimization journey.</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <F>Single cloud provider support</F>
                                <F>AI-powered cost optimization</F>
                                <F>Standard analytics dashboard</F>
                                <F>Basic anomaly detection</F>
                                <F>Email support</F>
                                <F>Up to 5 team members</F>
                                <F>Monthly performance reports</F>
                            </ul>
                            <LinkComp to="/signup" className="w-full block text-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-medium transition-colors">
                                Get Started
                            </LinkComp>
                        </div>

                        {/* Professional — highlighted */}
                        <div className="bg-emerald-600 rounded-2xl p-8 border-2 border-emerald-400 flex flex-col relative shadow-xl shadow-emerald-600/20">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                            <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">Professional</span>
                            <div className="mt-4 mb-2">
                                <span className="text-4xl font-bold text-white">$499</span>
                                <span className="text-emerald-200">/month</span>
                            </div>
                            <p className="text-sm text-emerald-200 mb-6">+ 1.5% of managed cloud spend</p>
                            <p className="text-emerald-100 mb-6">For mid-market enterprises needing multi-cloud intelligence and advanced AI.</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Multi-cloud support (AWS, Azure, GCP)</span></li>
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Advanced AI optimization engine</span></li>
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Full API access (gRPC &amp; REST)</span></li>
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Predictive cost forecasting</span></li>
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Priority support (4-hour SLA)</span></li>
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Up to 25 team members</span></li>
                                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-white">Weekly executive reports</span></li>
                            </ul>
                            <LinkComp to="/signup" className="w-full block text-center px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold transition-colors">
                                Start Free Trial
                            </LinkComp>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
                            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Enterprise</span>
                            <div className="mt-4 mb-2">
                                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">$4,999</span>
                                <span className="text-slate-500 dark:text-slate-400">/month</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">+ 1% of managed cloud spend</p>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">For large enterprises requiring full platform capabilities and dedicated support.</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <F>Everything in Professional</F>
                                <F>Tri-Silicon orchestration (NVIDIA, TPU, Apple)</F>
                                <F>Custom integrations &amp; white-label</F>
                                <F>Dedicated success manager</F>
                                <F>SLA guarantees (99.9% uptime)</F>
                                <F>Unlimited team members</F>
                                <F>SOC 2 compliance reporting</F>
                                <F>On-premise deployment option</F>
                            </ul>
                            <a href="mailto:cylton@sirsi.ai" className="w-full block text-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-medium transition-colors">
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ ROI SECTION ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">ROI-Positive Pricing</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                            Our platform cost represents 10–20% of the savings we generate for you. Most customers achieve positive ROI within 90 days.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { value: '20–30%', label: 'Average Cost Reduction', desc: 'Immediate infrastructure savings through AI-driven optimization' },
                            { value: '3–6 mo', label: 'ROI Payback', desc: 'Time to achieve positive return on platform investment' },
                            { value: '60%', label: 'Ops Reduction', desc: 'Decrease in manual infrastructure management effort' },
                            { value: '85%', label: 'Incident Reduction', desc: 'Fewer configuration-related incidents through automation' },
                        ].map(item => (
                            <div key={item.label} className="text-center">
                                <div className="text-3xl font-bold text-emerald-600 mb-1">{item.value}</div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{item.label}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FAQ ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">Frequently Asked Questions</h2>
                    {[
                        { q: 'What\'s included in "managed cloud spend"?', a: 'Managed cloud spend includes the total monthly billing from the cloud providers (AWS, Azure, GCP) that Sirsi monitors and optimizes on your behalf. Only resources actively managed by our platform are counted.' },
                        { q: 'Is there a free trial?', a: 'Yes. Professional tier includes a 14-day free trial with full feature access. No credit card required to start. Enterprise trials are available with a custom scope.' },
                        { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle. Prorated refunds are available for downgrades.' },
                        { q: 'What payment methods are accepted?', a: 'We accept all major credit cards via Stripe, ACH bank transfers, and wire transfers for Enterprise contracts. All payments are processed through PCI DSS Level 1 certified infrastructure.' },
                        { q: 'Is there volume-based pricing?', a: 'Yes. For organizations managing over $5M in annual cloud spend, we offer custom pricing with additional volume discounts. Contact sales for a custom quote.' },
                        { q: 'What about data security?', a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We target SOC 2 Type II compliance and require MFA for all access. See our Security page for complete details.' },
                    ].map(item => (
                        <div key={item.q} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-0">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.q}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{item.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════ CTA ═══════════════ */}
            <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Reduce Your Cloud Costs?</h2>
                    <p className="text-xl text-emerald-100 mb-8">Start your free trial today or contact our team for a custom enterprise quote.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <LinkComp to="/signup" className="px-8 py-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold transition-colors">
                            Start Free Trial
                        </LinkComp>
                        <a href="mailto:cylton@sirsi.ai" className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 rounded-lg font-medium transition-colors">
                            Contact Sales
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
