/**
 * Investor Portal — Unified stakeholder dashboard
 * Merged from: portal.html (investor KPI banner, data room, executive summary)
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useNavigate } from '@tanstack/react-router'
import { TrendingUp, Users, Zap, Eye, Clock, DollarSign, FileText, BarChart3, MessageSquare, FolderOpen } from 'lucide-react'

const TrendingUpIcon = TrendingUp as any
const UsersIcon = Users as any
const ZapIcon = Zap as any
const EyeIcon = Eye as any
const ClockIcon = Clock as any
const DollarSignIcon = DollarSign as any
const FileTextIcon = FileText as any
const BarChart3Icon = BarChart3 as any
const MessageSquareIcon = MessageSquare as any
const FolderOpenIcon = FolderOpen as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/portal',
    component: InvestorPortal,
})

const kpiBanner = [
    { label: 'ARR Y3', value: '$33M', color: 'emerald' },
    { label: 'Customers', value: '280', color: 'blue' },
    { label: 'Savings', value: '25%', color: 'purple' },
    { label: 'Uptime', value: '99.2%', color: 'orange' },
    { label: 'ROI', value: '8.5x', color: 'indigo' },
    { label: 'Payback', value: '3.2mo', color: 'rose' },
]

const dataRoomSections = [
    { title: 'Financial Reports', count: 4, icon: DollarSignIcon, color: 'blue', desc: 'Comprehensive business case and projections' },
    { title: 'Business Metrics', count: 3, icon: TrendingUpIcon, color: 'emerald', desc: 'Market analysis and competitive positioning' },
    { title: 'Legal Documents', count: 5, icon: FileTextIcon, color: 'purple', desc: 'Privacy, terms, compliance' },
    { title: 'Strategic Plans', count: 2, icon: ZapIcon, color: 'orange', desc: 'Product roadmap and milestones' },
    { title: 'Communications', count: 6, icon: MessageSquareIcon, color: 'red', desc: 'Committee meeting summaries' },
    { title: 'Investment Terms', count: 3, icon: DollarSignIcon, color: 'green', desc: 'Terms, conditions, and offering details' },
]

function InvestorPortal() {
    const navigate = useNavigate()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* KPI Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/20 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live KPIs</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Updated 2 min ago</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpiBanner.map((kpi) => (
                        <div key={kpi.label} className="text-center">
                            <div className={`text-2xl font-bold text-${kpi.color}-600 dark:text-${kpi.color}-400`}>{kpi.value}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{kpi.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Header */}
            <header className="text-center border-b border-gray-200 dark:border-slate-800 pb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white"
                    style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}>
                    SIRSINEXUS PORTAL
                </h1>
                <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
                    Your secure gateway to comprehensive platform insights, financial projections, and strategic documentation
                </p>
            </header>

            {/* Executive Summary */}
            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/10 dark:to-slate-900 rounded-2xl p-8 border-l-4 border-emerald-500 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                    EXECUTIVE SUMMARY
                </h2>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                    SirsiNexus represents a unique convergence of technological innovation and strategic market positioning.
                    With a proven AI-powered cloud optimization platform and exceptional network access through Techstars
                    Universe, academic partnerships, and VC connections, we are positioned to capture significant market share
                    in the rapidly growing cloud cost optimization space.
                </p>
            </div>

            {/* Quick Navigation */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                    QUICK ACCESS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction icon={<EyeIcon className="w-5 h-5" />} label="Committee Documents" color="blue" onClick={() => navigate({ to: '/committee' })} />
                    <QuickAction icon={<FolderOpenIcon className="w-5 h-5" />} label="Data Room" color="purple" onClick={() => navigate({ to: '/data-room' })} />
                    <QuickAction icon={<BarChart3Icon className="w-5 h-5" />} label="KPI / Unit Metrics" color="emerald" onClick={() => navigate({ to: '/kpi-metrics' })} />
                    <QuickAction icon={<MessageSquareIcon className="w-5 h-5" />} label="Messaging" color="orange" onClick={() => navigate({ to: '/messaging' })} />
                </div>
            </section>

            {/* Secure Data Room */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                    SECURE DATA ROOM
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dataRoomSections.map((section) => (
                        <div key={section.title}
                            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-600"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 bg-${section.color}-100 dark:bg-${section.color}-900/20 rounded-xl flex items-center justify-center`}>
                                    <section.icon className={`w-6 h-6 text-${section.color}-600`} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">{section.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{section.desc}</p>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{section.count} documents</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Document Control Footer */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500">
                    <strong className="text-gray-700 dark:text-gray-300">Document Control:</strong> Confidential — For Investment Committee Review Only
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                    Prepared by: SirsiNexus Strategy Team | Review Date: Quarterly | Distribution: Executive Team, Investment Committee
                </p>
            </div>
        </div>
    )
}

function QuickAction({ icon, label, color, onClick }: any) {
    return (
        <button onClick={onClick}
            className={`p-5 bg-${color}-600 text-white rounded-xl hover:bg-${color}-700 transition-all font-medium text-sm flex items-center gap-3 shadow-sm hover:shadow-md`}
        >
            {icon}
            {label}
        </button>
    )
}
