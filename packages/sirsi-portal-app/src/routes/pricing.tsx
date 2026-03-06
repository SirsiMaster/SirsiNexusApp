/**
 * Pricing — SaaS Tier Selection (Path A)
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Canonical tiers: Free ($0), Solo ($49/mo), Business ($499/mo)
 * Source of truth: ADR-030
 *
 * Typography: Inter body ≤ 500 (Rule 21)
 * Cards + Feature Comparison Matrix (Decision 8)
 */

import { createRoute, Link } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'
import {
    Check, X, Zap, Building2, Rocket,
    Shield, Globe, BarChart3, MessageCircle, FileText,
    HardDrive, Github, Users, ArrowRight,
} from 'lucide-react'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/pricing',
    component: PricingPage,
})

/* ── Tier data (aligned with ADR-030 & catalog SAAS_TIERS) ── */
const TIERS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: '/mo',
        tagline: 'Explore the platform',
        description: 'Get a read-only window into the Sirsi platform. Perfect for evaluation and exploration.',
        cta: 'Get Started',
        ctaVariant: 'outline' as const,
        href: '/signup',
        icon: Zap,
        features: [
            '1 user',
            'Read-only dashboard',
            'View 3 contracts',
            '100MB document vault',
            'Basic health monitoring',
            'Shared infrastructure (GCP)',
        ],
    },
    {
        id: 'solo',
        name: 'Solo',
        price: 49,
        interval: '/mo',
        tagline: 'For solo founders & startups',
        description: 'Everything you need to launch and scale. Dedicated infrastructure with full platform access.',
        cta: 'Start Solo',
        ctaVariant: 'primary' as const,
        href: '/signup?plan=solo',
        icon: Rocket,
        popular: true,
        features: [
            'Up to 5 users',
            'Full e-signature (25/mo)',
            '5GB document vault',
            'Secure messaging',
            'Private GitHub repo',
            'Dedicated Cloud Run instance',
            'AI optimization recommendations',
            'Standard Hypervisor telemetry',
        ],
    },
    {
        id: 'business',
        name: 'Business',
        price: 499,
        interval: '/mo',
        tagline: 'For existing businesses',
        description: 'Full autonomous optimization for companies with existing infrastructure — both on-prem and cloud.',
        cta: 'Go Business',
        ctaVariant: 'outline' as const,
        href: '/signup?plan=business',
        icon: Building2,
        features: [
            'Unlimited users',
            'Unlimited e-signature',
            '50GB document vault',
            'Priority support channel',
            'Custom invoicing + ACH',
            'GitHub repo + CI/CD templates',
            'Multi-cloud (GCP, AWS, Azure)',
            'Full autonomous AI optimization',
            'Custom domain ({slug}.sirsi.ai)',
            'Full-spectrum diagnostics + SLA',
        ],
    },
]

/* ── Feature comparison matrix rows ── */
const MATRIX = [
    {
        category: 'Infrastructure', icon: HardDrive, rows: [
            { feature: 'Cloud provider', free: 'GCP (shared)', solo: 'GCP (dedicated)', business: 'GCP, AWS, Azure' },
            { feature: 'Cloud Run instance', free: 'Shared', solo: 'Dedicated', business: 'Dedicated + DB' },
            { feature: 'Custom domain', free: false, solo: false, business: true },
            { feature: 'On-premise support', free: false, solo: false, business: 'Phase 5' },
        ]
    },
    {
        category: 'Contracts & Documents', icon: FileText, rows: [
            { feature: 'Contract viewing', free: '3 max', solo: '25/mo', business: 'Unlimited' },
            { feature: 'E-signature (Sirsi Sign)', free: false, solo: true, business: true },
            { feature: 'Document vault', free: '100MB', solo: '5GB', business: '50GB' },
            { feature: 'Versioned documents', free: false, solo: true, business: true },
        ]
    },
    {
        category: 'Collaboration', icon: MessageCircle, rows: [
            { feature: 'Secure messaging', free: false, solo: true, business: true },
            { feature: 'Priority support', free: false, solo: false, business: true },
            { feature: 'Team members', free: '1', solo: '5', business: 'Unlimited' },
        ]
    },
    {
        category: 'AI & Optimization', icon: BarChart3, rows: [
            { feature: 'Sirsi AI Agent', free: 'Read-only', solo: 'Basic recs', business: 'Full autonomous' },
            { feature: 'Hypervisor monitoring', free: 'Basic health', solo: 'Standard telemetry', business: 'Full diagnostics + SLA' },
            { feature: 'Cost optimization', free: false, solo: 'Recommendations', business: 'Autonomous' },
        ]
    },
    {
        category: 'Development', icon: Github, rows: [
            { feature: 'GitHub repository', free: false, solo: 'Private repo', business: 'Repo + CI/CD' },
            { feature: 'CI/CD pipeline', free: false, solo: false, business: true },
            { feature: 'Repo transferable on exit', free: '—', solo: true, business: true },
        ]
    },
    {
        category: 'Security', icon: Shield, rows: [
            { feature: 'Firebase Auth + MFA', free: true, solo: true, business: true },
            { feature: 'AES-256 encryption', free: true, solo: true, business: true },
            { feature: 'Superadmin + Hypervisor oversight', free: true, solo: true, business: true },
            { feature: 'SOC 2 compliance', free: false, solo: false, business: true },
        ]
    },
    {
        category: 'Commerce', icon: Globe, rows: [
            { feature: 'Billing', free: '—', solo: 'Stripe self-serve', business: 'Custom invoicing + ACH' },
            { feature: 'Stripe Checkout', free: '—', solo: true, business: true },
        ]
    },
]

const FAQ = [
    { q: 'What does the Free tier include?', a: 'Free gives you a read-only dashboard, the ability to view up to 3 contracts, and 100MB of document vault storage. It\'s designed for evaluation — enough to feel the quality of the platform before committing.' },
    { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the start of your next billing cycle. No lock-in contracts.' },
    { q: 'What happens to my code if I leave Sirsi?', a: 'Your GitHub repository is fully transferable. If you cancel, Sirsi will transfer repo ownership to your personal or organizational GitHub account. You keep your code — Sirsi retains only the scaffold template and UCS component IP.' },
    { q: 'What payment methods are accepted?', a: 'Solo and Business tiers accept all major credit cards via Stripe. Business tier also supports ACH bank transfers and custom invoicing. All payments are processed through PCI DSS Level 1 certified infrastructure.' },
    { q: 'Do you offer custom enterprise pricing?', a: 'Yes. For organizations with bespoke requirements, we offer fully custom engagements through Sirsi Sign — including product catalog scoping, MSA/SOW generation, and per-phase billing. Contact us at cylton@sirsi.ai.' },
    { q: 'Is my data secure?', a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Every tenant instance is monitored by the Sirsi Hypervisor with full telemetry. Firebase Auth with MFA is enforced for all access levels.' },
]

/* ── Cell renderer for the matrix ── */
function MatrixCell({ value }: { value: boolean | string }) {
    if (value === true) return <Check size={16} className="text-emerald-500" />
    if (value === false) return <X size={14} className="text-slate-300 dark:text-slate-600" />
    return <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
}

function PricingPage() {
    usePageMeta(
        'Pricing | SirsiNexus',
        'Simple, transparent pricing. Start free, scale with Solo, or go Business. The Sirsi platform grows with you.'
    )

    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section
                className="relative py-24 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #000000 100%)' }}
            >
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
                        Pricing
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Start Free. <span className="text-emerald-400">Scale</span> Without Limits.
                    </h1>
                    <p className="text-lg text-emerald-100/80 max-w-3xl mx-auto leading-relaxed">
                        Three tiers designed for your journey — from exploration to enterprise-grade
                        autonomous infrastructure optimization.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl" />
            </section>

            {/* ═══════════════ TIER CARDS ═══════════════ */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {TIERS.map(tier => (
                            <div
                                key={tier.id}
                                className={`rounded-2xl p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${tier.popular
                                    ? 'bg-emerald-600 border-2 border-emerald-400 shadow-xl shadow-emerald-600/20'
                                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                {/* Tier header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.popular
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800'
                                        }`}>
                                        <tier.icon size={20} />
                                    </div>
                                    <span className={`text-sm font-semibold uppercase tracking-wider ${tier.popular ? 'text-emerald-100' : 'text-emerald-600'
                                        }`}>
                                        {tier.name}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mb-2">
                                    {tier.price === 0 ? (
                                        <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>Free</span>
                                    ) : (
                                        <>
                                            <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                                                ${tier.price}
                                            </span>
                                            <span className={tier.popular ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'}>
                                                {tier.interval}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Tagline */}
                                <p className={`text-sm mb-2 font-medium ${tier.popular ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {tier.tagline}
                                </p>

                                {/* Description */}
                                <p className={`text-sm mb-6 leading-relaxed ${tier.popular ? 'text-emerald-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {tier.description}
                                </p>

                                {/* Feature list */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {tier.features.map(feat => (
                                        <li key={feat} className="flex items-start gap-3">
                                            <Check size={16} className={`mt-0.5 flex-shrink-0 ${tier.popular ? 'text-emerald-200' : 'text-emerald-500'}`} />
                                            <span className={`text-sm ${tier.popular ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {feat}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <LinkComp
                                    to={tier.href}
                                    className={`w-full block text-center px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${tier.popular
                                        ? 'bg-white text-emerald-700 hover:bg-emerald-50 hover:shadow-lg'
                                        : 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                        }`}
                                >
                                    {tier.cta}
                                    <ArrowRight size={14} />
                                </LinkComp>
                            </div>
                        ))}
                    </div>

                    {/* Enterprise callout */}
                    <div className="mt-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Need a bespoke engagement with custom requirements?{' '}
                            <a
                                href="https://sign.sirsi.ai"
                                className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                            >
                                Enterprise Sales via Sirsi Sign →
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FEATURE COMPARISON MATRIX ═══════════════ */}
            <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            Compare Plans
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            A detailed breakdown of what's included in each tier.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Matrix header */}
                        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4" />
                            {TIERS.map(tier => (
                                <div key={tier.id} className={`p-4 text-center ${tier.popular ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tier.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Matrix categories */}
                        {MATRIX.map(section => (
                            <div key={section.category}>
                                {/* Category header */}
                                <div className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="p-3 pl-4 flex items-center gap-2">
                                        <section.icon size={14} className="text-emerald-600" />
                                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                            {section.category}
                                        </span>
                                    </div>
                                    <div />
                                    <div />
                                    <div />
                                </div>

                                {/* Feature rows */}
                                {section.rows.map(row => (
                                    <div key={row.feature} className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <div className="p-3 pl-6 flex items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{row.feature}</span>
                                        </div>
                                        <div className="p-3 flex items-center justify-center">
                                            <MatrixCell value={row.free} />
                                        </div>
                                        <div className={`p-3 flex items-center justify-center ${TIERS[1].popular ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                                            <MatrixCell value={row.solo} />
                                        </div>
                                        <div className="p-3 flex items-center justify-center">
                                            <MatrixCell value={row.business} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ ROI SECTION ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            ROI-Positive from Day One
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                            The Sirsi Hypervisor pays for itself. Our AI optimization engine typically delivers
                            20–30% infrastructure cost savings within the first 90 days.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { value: '20–30%', label: 'Cost Reduction', desc: 'Average infrastructure savings through AI-driven optimization' },
                            { value: '3–6 mo', label: 'ROI Payback', desc: 'Time to achieve positive return on platform investment' },
                            { value: '60%', label: 'Ops Reduction', desc: 'Decrease in manual infrastructure management effort' },
                            { value: '85%', label: 'Incident Reduction', desc: 'Fewer configuration-related incidents through automation' },
                        ].map(item => (
                            <div key={item.label} className="text-center group">
                                <div className="text-3xl font-bold text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                                    {item.value}
                                </div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">{item.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FAQ ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-10 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-0">
                        {FAQ.map(item => (
                            <div key={item.q} className="py-6 border-b border-slate-200 dark:border-slate-700 last:border-0">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                    {item.q}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA ═══════════════ */}
            <section
                className="py-20 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #065f46 50%, #022c22 100%)' }}
            >
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Optimize Your Infrastructure?
                    </h2>
                    <p className="text-lg text-emerald-100/80 mb-10 max-w-2xl mx-auto">
                        Start free — no credit card required. Upgrade when you're ready.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <LinkComp
                            to="/signup"
                            className="px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            Get Started Free <ArrowRight size={16} />
                        </LinkComp>
                        <a
                            href="mailto:cylton@sirsi.ai"
                            className="px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Users size={16} />
                            Contact Enterprise Sales
                        </a>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
            </section>
        </>
    )
}
