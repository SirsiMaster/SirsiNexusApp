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
            <div className="sirsi-card mb-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-emerald-200 dark:border-slate-700 p-8 shadow-xl shadow-emerald-500/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">
                            Live Platform KPIs
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Synchronized 2m Ago
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {kpiTicker.map(kpi => (
                        <div key={kpi.label} className="text-center group">
                            <div className="text-2xl font-bold tracking-tighter text-emerald-800 dark:text-emerald-300 group-hover:scale-110 transition-transform cursor-default">{kpi.value}</div>
                            <div className="text-[9px] font-bold text-emerald-600/50 dark:text-emerald-400/50 uppercase tracking-widest mt-2 font-mono italic">
                                {kpi.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Executive Summary ── */}
            <div className="sirsi-card border-none bg-white dark:bg-slate-900 border-l-4 border-emerald-600 rounded-r-xl p-10 shadow-lg mb-10 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4">
                    Executive Summary
                </h3>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
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
                        className="sirsi-card p-6 flex items-center gap-4 group transition-all shadow-lg border-none hover:-translate-y-1"
                        style={{ background: mod.bg }}
                    >
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20 group-hover:rotate-12 transition-transform">
                            <mod.icon size={20} />
                        </div>
                        <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">
                            {mod.label}
                        </span>
                    </a>
                ))}
            </div>

            {/* ── Secure Data Room ── */}
            <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-4 py-1">
                    Secure Data Room
                </h3>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {dataRoomSections.map(section => (
                    <div
                        key={section.title}
                        className={`sirsi-card group cursor-pointer border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all ${section.bg} ${section.borderColor} p-6 relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-500">
                            <section.icon size={64} />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${section.bg} ${section.iconColor} ${section.borderColor} shadow-inner`}>
                                <section.icon size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                    {section.title}
                                </h4>
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                    {section.sub}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1.5 font-mono">
                                <section.icon size={12} className="opacity-50" />
                                {section.docs} DOCUMENTS
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">VIEW →</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Compliance Footer ── */}
            <div className="sirsi-card bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-center p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.25em] mb-4">
                    Institutional Compliance Disclaimer
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic max-w-2xl mx-auto leading-relaxed">
                    This portal contains highly confidential strategic data. Unauthorized access or reproduction
                    is strictly prohibited and subject to legal enforcement under the Sirsi Nexus Non-Disclosure Agreement.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest font-mono">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        PREPARED BY: STRATEGY TEAM
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        REVIEW: QUARTERLY
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        DISTRIBUTION: COMMITTEE ONLY
                    </span>
                </div>
            </div>
        </div>
    )
}
