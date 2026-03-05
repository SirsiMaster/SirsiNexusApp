/**
 * KPI / Unit Metrics — Pixel-perfect port of investor/kpi-metrics.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card, sirsi-badge, sirsi-table-wrap, sirsi-table
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/kpi-metrics',
    component: KpiMetrics,
})

const kpiCards = [
    { code: 'ARR', badge: 'Y3 GOAL', value: '$33M', label: 'Annual Recurring Revenue', target: 'Target Path: $40M', pct: 82 },
    { code: 'C#', badge: 'ACTIVE', value: '280', label: 'Global Customer Count', target: 'Target Path: 500', pct: 56 },
    { code: 'ROI', badge: 'VALUE', value: '8.5x', label: 'Average Return on Investment', target: 'Target Path: 10x', pct: 85 },
]

const unitEconomics = [
    { metric: 'Customer Acquisition Cost (CAC)', value: '$2,400', trend: '▼ 12%' },
    { metric: 'Lifetime Value (LTV)', value: '$48,000', trend: '▲ 18%' },
    { metric: 'LTV/CAC Ratio', value: '20:1', trend: '▲ 3.2x' },
    { metric: 'Monthly Revenue Churn', value: '1.8%', trend: '▼ 0.3%' },
    { metric: 'Net Revenue Retention (NRR)', value: '118%', trend: '▲ 5%' },
    { metric: 'Gross Platform Margin', value: '82%', trend: '▲ 2%' },
]

function KpiMetrics() {
    return (
        <div>
            <div className="page-header">
                <h1>KPI / Unit Metrics</h1>
                <p className="page-subtitle">Strategic performance indicators and unit economics oversight</p>
            </div>

            <h3 className="border-l-4 border-emerald-600 pl-4 mb-6" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institutional KPIs</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {kpiCards.map(kpi => (
                    <div key={kpi.code} className="sirsi-card group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800" style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', fontWeight: 600, fontSize: 12 }}>{kpi.code}</div>
                            <span className="sirsi-badge sirsi-badge-success" style={{ fontWeight: 600 }}>{kpi.badge}</span>
                        </div>
                        <div style={{ fontSize: 30, fontWeight: 600, marginBottom: 4 }}>{kpi.value}</div>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 16 }}>{kpi.label}</div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center" style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' }}>
                                <span>{kpi.target}</span>
                                <span style={{ color: '#059669' }}>{kpi.pct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full overflow-hidden" style={{ height: 6 }}>
                                <div className="bg-emerald-600 rounded-full" style={{ height: '100%', width: `${kpi.pct}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="border-l-4 border-emerald-600 pl-4 mb-6" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Economics Ledger</h3>

            <div className="sirsi-table-wrap">
                <table className="sirsi-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>Strategic Metric</th>
                            <th>Current Value</th>
                            <th style={{ textAlign: 'right', paddingRight: 24 }}>Rolling Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unitEconomics.map(row => (
                            <tr key={row.metric}>
                                <td style={{ paddingLeft: 24 }}><span className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 500 }}>{row.metric}</span></td>
                                <td style={{ fontFamily: 'monospace' }}>{row.value}</td>
                                <td style={{ textAlign: 'right', paddingRight: 24 }}><span style={{ color: '#059669', fontWeight: 600, fontStyle: 'italic' }}>{row.trend}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
