/**
 * Committee Documents — Pixel-perfect port of investor/committee.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card, sirsi-badge
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { CalendarCheck, FileText, UserCheck, ChevronRight } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/committee',
    component: Committee,
})

const stats = [
    { icon: CalendarCheck, value: '24', label: 'Total Meetings', bg: 'bg-emerald-600', cardBg: 'bg-emerald-50/50 border-emerald-100', labelColor: 'text-emerald-600' },
    { icon: FileText, value: '86', label: 'Signed Briefs', bg: 'bg-blue-600', cardBg: 'bg-blue-50/50 border-blue-100', labelColor: 'text-blue-600' },
    { icon: UserCheck, value: '12', label: 'Voters Active', bg: 'bg-amber-600', cardBg: 'bg-amber-50/50 border-amber-100', labelColor: 'text-amber-600' },
]

const meetings = [
    { month: 'MAR', day: '01', monthColor: 'text-emerald-600', title: 'Q1 Strategic Alignment Session', ref: '#EX-2026-003 • Status: Finalized', docTitle: 'Vault Document Pack', docSub: '5 PDF Artifacts • 12MB' },
    { month: 'FEB', day: '15', monthColor: 'text-blue-600', title: 'Risk Assessment Review', ref: '#EX-2026-002 • Status: Archive', docTitle: 'Security Audit Logs', docSub: '2 Data Sets • 8MB' },
    { month: 'JAN', day: '28', monthColor: 'text-amber-600', title: 'Annual Infrastructure Roadmap', ref: '#EX-2026-001 • Status: Archive', docTitle: 'Roadmap Specification', docSub: '12 Documents • 45MB' },
]

function Committee() {
    return (
        <div>
            <div className="page-header">
                <h1>Committee Documents</h1>
                <p className="page-subtitle">Historical registry of executive deliberations and strategic coordination logs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map(s => {
                    const Icon = s.icon as any
                    return (
                        <div key={s.label} className={`sirsi-card ${s.cardBg} flex items-center gap-5`} style={{ padding: 24 }}>
                            <div className={`w-12 h-12 ${s.bg} text-white rounded-xl flex items-center justify-center shadow-lg`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <div className="text-slate-900 dark:text-slate-100" style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
                                <div className={`${s.labelColor}`} style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <h3 className="border-l-4 border-emerald-600 pl-4 mb-6 text-slate-400 dark:text-slate-500" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Meeting Archive Protocol</h3>

            <div className="space-y-4">
                {meetings.map(m => (
                    <div key={m.ref} className="sirsi-card group cursor-pointer hover:border-emerald-200 transition-all overflow-hidden" style={{ padding: 0 }}>
                        <div className="flex items-center justify-between" style={{ padding: 24 }}>
                            <div className="flex items-center gap-6">
                                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600" style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                    <span className={m.monthColor} style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', lineHeight: 1, marginBottom: 4 }}>{m.month}</span>
                                    <span className="text-slate-900 dark:text-slate-100" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1 }}>{m.day}</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors" style={{ fontWeight: 500 }}>{m.title}</h4>
                                    <p className="text-slate-400 dark:text-slate-500" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: 4 }}>Ref CID: {m.ref}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right hidden md:block">
                                    <div className="text-slate-900 dark:text-slate-100" style={{ fontSize: 12, fontWeight: 500 }}>{m.docTitle}</div>
                                    <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{m.docSub}</div>
                                </div>
                                <span className="sirsi-badge sirsi-badge-success" style={{ fontWeight: 600 }}>LOCKED</span>
                                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 transition-all" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
