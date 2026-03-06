/**
 * Investor Portal — Standalone portal for investor role
 * 
 * Pixel-perfect port of: packages/sirsi-portal/investor/investor-portal.html
 * Features: Hero section, executive summary, data room cards,
 * KPI ticker, quick nav sidebar, document control footer
 * 
 * Typography: Inter body ≤ 500 (Rule 21)
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    BarChart3, TrendingUp,
    PieChart, Scale, Lightbulb, Mail, DollarSign,
    FolderOpen, Users, MessageCircle,
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/investor-portal',
    component: InvestorPortalPage,
})

// ── KPI ticker data ──
const kpiTicker = [
    { label: 'ARR Y3', value: '$33M', color: '#059669' },
    { label: 'Customers', value: '280', color: '#2563eb' },
    { label: 'Savings', value: '25%', color: '#7c3aed' },
    { label: 'Uptime', value: '99.2%', color: '#ea580c' },
    { label: 'ROI', value: '8.5x', color: '#4f46e5' },
    { label: 'Payback', value: '3.2mo', color: '#e11d48' },
]

// ── Data room sections ──
const dataRoomSections = [
    { icon: BarChart3, title: 'Financial Reports', docs: 4, sub: 'Business Case & Projections', bg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600', borderColor: 'border-blue-100 dark:border-blue-900' },
    { icon: TrendingUp, title: 'Business Metrics', docs: 3, sub: 'Analysis & Competitive Position', bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconColor: 'text-emerald-600', borderColor: 'border-emerald-100 dark:border-emerald-900' },
    { icon: Scale, title: 'Legal Documents', docs: 5, sub: 'Compliance & Terms', bg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600', borderColor: 'border-purple-100 dark:border-purple-900' },
    { icon: Lightbulb, title: 'Strategic Plans', docs: 2, sub: 'Roadmap & Milestones', bg: 'bg-orange-50 dark:bg-orange-950/30', iconColor: 'text-orange-600', borderColor: 'border-orange-100 dark:border-orange-900' },
    { icon: Mail, title: 'Communications', docs: 3, sub: 'Committee & Updates', bg: 'bg-red-50 dark:bg-red-950/30', iconColor: 'text-red-600', borderColor: 'border-red-100 dark:border-red-900' },
    { icon: DollarSign, title: 'Investment Terms', docs: 2, sub: 'Terms & Conditions', bg: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600', borderColor: 'border-green-100 dark:border-green-900' },
]

// ── Strategic quick access modules ──
const modules = [
    { icon: Users, label: 'Committee Hub', bg: '#059669', to: '/committee' },
    { icon: FolderOpen, label: 'Data Room', bg: '#2563eb', to: '/data-room' },
    { icon: PieChart, label: 'KPI Ledger', bg: '#065f46', to: '/kpi-metrics' },
    { icon: MessageCircle, label: 'Messaging', bg: '#d97706', to: '/messaging' },
]

function InvestorPortalPage() {
    return (
        <div>
            {/* ── Page Header ── */}
            <div className="page-header">
                <h1>Investor Portal</h1>
                <p className="page-subtitle">
                    Your secure gateway to comprehensive platform insights, financial projections,
                    and strategic documentation
                </p>
            </div>

            {/* ── KPI Ticker Banner ── */}
            <div className="sirsi-card mb-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-emerald-200 dark:border-slate-700" style={{ padding: '24px 32px' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase" style={{ letterSpacing: '0.15em' }}>
                            Live Platform KPIs
                        </span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Synchronized 2m Ago
                    </span>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
                    {kpiTicker.map(kpi => (
                        <div key={kpi.label} className="text-center">
                            <div className="text-2xl font-semibold text-emerald-800 dark:text-emerald-300">{kpi.value}</div>
                            <div style={{ fontSize: 9, fontWeight: 500, color: 'rgba(5,150,105,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                                {kpi.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Executive Summary ── */}
            <div className="bg-white dark:bg-gray-800 border-l-4 border-emerald-600 rounded-r-xl p-8 shadow-sm mb-10">
                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                    Executive Summary
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" style={{ fontWeight: 400 }}>
                    SirsiNexus represents a unique convergence of technological innovation and strategic market positioning.
                    With a proven AI-powered cloud optimization platform and exceptional network access through Techstars
                    Universe, academic partnerships, and VC connections, we are positioned to capture significant market share
                    in the rapidly growing cloud cost optimization space.
                </p>
            </div>

            {/* ── Strategic Modules Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {modules.map(mod => (
                    <a
                        key={mod.label}
                        href={mod.to}
                        className="sirsi-card p-6 flex items-center gap-4 group transition-all shadow-lg border-none"
                        style={{ background: mod.bg }}
                    >
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/20">
                            <mod.icon size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            {mod.label}
                        </span>
                    </a>
                ))}
            </div>

            {/* ── Secure Data Room ── */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-8"
                style={{ borderLeft: '4px solid #059669', paddingLeft: 16 }}>
                Secure Data Room
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {dataRoomSections.map(section => (
                    <div
                        key={section.title}
                        className={`sirsi-card group cursor-pointer hover:border-emerald-200 transition-all ${section.bg} ${section.borderColor}`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${section.bg} ${section.iconColor} ${section.borderColor}`}>
                                <section.icon size={22} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 transition-colors">
                                    {section.title}
                                </h4>
                                <p style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                    {section.sub}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center" style={{ fontSize: 10, fontWeight: 500 }}>
                            <span>{section.docs} DOCUMENTS</span>
                            <span className="text-emerald-600">VIEW →</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Compliance Footer ── */}
            <div className="sirsi-card bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-center py-6">
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
                    Institutional Compliance Disclaimer
                </p>
                <p className="text-xs text-gray-500 italic max-w-2xl mx-auto">
                    This portal contains highly confidential strategic data. Unauthorized access or reproduction
                    is strictly prohibited and subject to legal enforcement under the Sirsi Nexus Non-Disclosure Agreement.
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
