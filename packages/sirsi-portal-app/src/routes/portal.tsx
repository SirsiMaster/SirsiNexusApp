/**
 * Investor Portal — Pixel-perfect port of investor/portal.html
 *
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: KPI banner, executive summary, strategic modules grid,
 * Virtual Data Room taxonomy, compliance footer
 * Typography: Inter body ≤ 500 (Rule 21), font-semibold only for KPI values
 */

import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    Users, FolderOpen, PieChart, MessageCircle
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/portal',
    component: InvestorPortal,
})

// ── KPI Data ──
const kpis = [
    { value: '$33M', label: 'ARR Y3' },
    { value: '280', label: 'Customers' },
    { value: '25%', label: 'Savings' },
    { value: '99.2%', label: 'Uptime' },
    { value: '8.5x', label: 'ROI' },
    { value: '3.2m', label: 'Payback' },
]

const strategicModules = [
    { icon: Users, label: 'Committee Hub', route: '/committee' as const, bg: '#059669', hoverBg: '#047857' },
    { icon: FolderOpen, label: 'Data Room', route: '/data-room' as const, bg: '#2563eb', hoverBg: '#1d4ed8' },
    { icon: PieChart, label: 'KPI Ledger', route: '/kpi-metrics' as const, bg: '#065f46', hoverBg: '#064e3b' },
    { icon: MessageCircle, label: 'Messaging', route: '/messaging' as const, bg: '#d97706', hoverBg: '#b45309' },
]

const dataRoomCategories = [
    { letter: 'F', name: 'Financial Reports', sub: 'Business Case & Projections', letterBg: 'bg-blue-50 text-blue-600 border-blue-100', audit: 'Q1 2026', docs: 4 },
    { letter: 'M', name: 'Market Metrics', sub: 'Analysis & Competitive Position', letterBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', audit: 'FEB 2026', docs: 3 },
    { letter: 'L', name: 'Legal Ledger', sub: 'Compliance & Terms', letterBg: 'bg-purple-50 text-purple-600 border-purple-100', audit: 'JAN 2026', docs: 5 },
]

function InvestorPortal() {
    return (
        <div>
            {/* ── Page Header (canonical) ── */}
            <div className="page-header">
                <h1>Investor Portal</h1>
                <p className="page-subtitle">Your secure gateway to platform insights, projections, and strategic documentation</p>
            </div>

            {/* ── KPI Banner ── */}
            <div className="sirsi-card mb-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-emerald-200 dark:border-slate-700" style={{ padding: 40 }}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase" style={{ letterSpacing: '0.1em' }}>Live Platform KPIs</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Synchronized 2m Ago</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
                    {kpis.map(kpi => (
                        <div key={kpi.label} className="text-center">
                            <div className="text-2xl font-semibold text-emerald-800 dark:text-emerald-300">{kpi.value}</div>
                            <div style={{ fontSize: 9, fontWeight: 500, color: 'rgba(5,150,105,0.6)', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: 4 }}>{kpi.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Executive Summary ── */}
            <div className="bg-white dark:bg-slate-800 border-l-4 border-emerald-600 rounded-r-xl p-8 shadow-sm mb-10">
                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Executive Summary</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>
                    SirsiNexus represents a unique convergence of technological innovation and strategic market positioning.
                    With a proven AI-powered cloud optimization platform and exceptional network access through Techstars Universe,
                    academic partnerships, and VC connections, we are positioned to capture significant market share in the
                    rapidly growing cloud cost optimization space.
                </p>
            </div>

            {/* ── Strategic Modules Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {strategicModules.map(mod => {
                    const Icon = mod.icon as any
                    return (
                        <Link key={mod.label} to={mod.route}
                            className="sirsi-card transition-all shadow-lg"
                            style={{ background: mod.bg, borderColor: 'transparent', padding: 24, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}
                            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.background = mod.hoverBg }}
                            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.background = mod.bg }}
                        >
                            <div style={{
                                width: 40, height: 40, background: 'rgba(255,255,255,0.1)',
                                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                            }}>
                                <Icon size={18} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{mod.label}</span>
                        </Link>
                    )
                })}
            </div>

            {/* ── Virtual Data Room Taxonomy ── */}
            <h3 className="border-l-4 border-emerald-600 pl-4 mb-8" style={{
                fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Virtual Data Room Taxonomy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {dataRoomCategories.map(cat => (
                    <div key={cat.letter} className="sirsi-card group cursor-pointer hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-5 mb-4">
                            <div className={`w-12 h-12 ${cat.letterBg} rounded-xl flex items-center justify-center border`}
                                style={{ fontStyle: 'italic', fontWeight: 600, fontSize: 20 }}>
                                {cat.letter}
                            </div>
                            <div>
                                <h4 className="text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors" style={{ fontWeight: 500 }}>{cat.name}</h4>
                                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{cat.sub}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center" style={{ fontSize: 10, fontWeight: 500 }}>
                            <span>LATEST AUDIT: {cat.audit}</span>
                            <span style={{ color: '#059669' }}>{cat.docs} DOCUMENTS</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Compliance Footer ── */}
            <div className="sirsi-card bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-center" style={{ paddingTop: 24, paddingBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Institutional Compliance Disclaimer</p>
                <p style={{ fontSize: 12, fontStyle: 'italic', maxWidth: 672, margin: '0 auto' }}>
                    This portal contains highly confidential strategic data. Unauthorized access or reproduction is strictly
                    prohibited and subject to legal enforcement under the Sirsi Nexus Non-Disclosure Agreement.
                </p>
                <div className="mt-4 flex justify-center gap-8" style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase' }}>
                    <span>PREPARED BY: STRATEGY TEAM</span>
                    <span>REVIEW: QUARTERLY</span>
                    <span>DISTRIBUTION: COMMITTEE ONLY</span>
                </div>
            </div>
        </div>
    )
}
