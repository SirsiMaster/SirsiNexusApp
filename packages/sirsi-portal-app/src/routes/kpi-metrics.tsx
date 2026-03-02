/**
 * KPI Metrics — Investor KPI Dashboard
 * Merged from: portal.html KPI banner + kpi-unit-metrics.html
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { TrendingUp, DollarSign, Users, Clock, Zap, Target } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/kpi-metrics',
    component: KPIMetrics,
})

const metrics = [
    { label: 'Annual Recurring Revenue (Y3)', value: '$33M', target: '$40M', pct: 82, icon: DollarSign, color: 'emerald' },
    { label: 'Customer Count', value: '280', target: '500', pct: 56, icon: Users, color: 'blue' },
    { label: 'Average Cost Savings', value: '25%', target: '30%', pct: 83, icon: TrendingUp, color: 'purple' },
    { label: 'Platform Uptime', value: '99.2%', target: '99.9%', pct: 99, icon: Zap, color: 'orange' },
    { label: 'Return on Investment', value: '8.5x', target: '10x', pct: 85, icon: Target, color: 'indigo' },
    { label: 'Payback Period', value: '3.2 mo', target: '< 6 mo', pct: 100, icon: Clock, color: 'green' },
]

const unitEconomics = [
    { label: 'Customer Acquisition Cost (CAC)', value: '$2,400', trend: '-12%', good: true },
    { label: 'Lifetime Value (LTV)', value: '$48,000', trend: '+18%', good: true },
    { label: 'LTV/CAC Ratio', value: '20:1', trend: '+3.2', good: true },
    { label: 'Monthly Churn', value: '1.8%', trend: '-0.3%', good: true },
    { label: 'Net Revenue Retention', value: '118%', trend: '+5%', good: true },
    { label: 'Gross Margin', value: '82%', trend: '+2%', good: true },
]

function KPIMetrics() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="border-b border-gray-200 dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: "'Cinzel', serif" }}>KPI / UNIT METRICS</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Key performance indicators and unit economics</p>
            </header>

            {/* KPI Cards */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>KEY PERFORMANCE INDICATORS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {metrics.map(m => {
                        const Icon = m.icon as any
                        return (
                            <div key={m.label} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 bg-${m.color}-100 dark:bg-${m.color}-900/30 rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 text-${m.color}-600`} />
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">{m.label}</div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{m.value}</div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] text-gray-400">Target: {m.target}</span>
                                    <span className="text-[10px] font-bold text-emerald-600">{m.pct}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${m.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${m.pct}%` }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Unit Economics */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>UNIT ECONOMICS</h2>
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Metric</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Value</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {unitEconomics.map(u => (
                                <tr key={u.label} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.label}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{u.value}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${u.good ? 'text-emerald-600' : 'text-red-600'}`}>{u.trend}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
