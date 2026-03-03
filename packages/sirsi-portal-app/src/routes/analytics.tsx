/**
 * Analytics Dashboard — Port of dashboard/analytics.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: 4 metric cards, User Growth & Activity Distribution charts, Monthly Engagement bar chart
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Users, Briefcase, FileText, DollarSign } from 'lucide-react'
import {
    LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/analytics',
    component: Analytics,
})

const metrics = [
    { icon: Users, value: '24,567', label: 'Total Users', sub: 'Active across all platforms', trend: '+12.5%' },
    { icon: Briefcase, value: '1,429', label: 'Active Investors', sub: 'Verified and engaged', trend: '+8.3%' },
    { icon: FileText, value: '8,932', label: 'Documents', sub: 'Processed and indexed', trend: '+15.7%' },
    { icon: DollarSign, value: '$2.4M', label: 'Total Revenue', sub: 'Current fiscal year', trend: '+24.1%' },
]

const userGrowthData = [
    { month: 'Jul', users: 15200 }, { month: 'Aug', users: 16800 }, { month: 'Sep', users: 18300 },
    { month: 'Oct', users: 19500 }, { month: 'Nov', users: 21200 }, { month: 'Dec', users: 22800 },
    { month: 'Jan', users: 24567 },
]

const activityData = [
    { name: 'Document Signing', value: 35 }, { name: 'Portfolio Review', value: 25 },
    { name: 'Communication', value: 20 }, { name: 'Administration', value: 20 },
]
const PIE_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7']

const engagementData = [
    { month: 'Jul', sessions: 4200, actions: 12400 }, { month: 'Aug', sessions: 4800, actions: 14200 },
    { month: 'Sep', sessions: 5100, actions: 15800 }, { month: 'Oct', sessions: 5600, actions: 17200 },
    { month: 'Nov', sessions: 6200, actions: 19400 }, { month: 'Dec', sessions: 6800, actions: 21000 },
    { month: 'Jan', sessions: 7400, actions: 23600 },
]

function Analytics() {
    return (
        <div>
            <div className="page-header">
                <h1>Analytics Dashboard</h1>
                <p className="page-subtitle">Platform usage trends, traffic analysis, and engagement metrics.</p>
            </div>

            <div className="mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span style={{ fontSize: 14, color: '#10b981' }}>Real-time data • Last updated: Just now</span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map(m => {
                    const Icon = m.icon as any
                    return (
                        <div key={m.label} className="sirsi-card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                            <div className="flex items-center justify-between mb-4">
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                    <Icon size={24} />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#10b981' }}>↗ {m.trend}</span>
                            </div>
                            <div style={{ fontSize: 48, fontWeight: 500, color: '#1e293b', margin: '8px 0', lineHeight: 1 }}>{m.value}</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                            <div style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>{m.sub}</div>
                        </div>
                    )
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="sirsi-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                    <div className="flex justify-between items-center mb-6">
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>User Growth Trends</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span style={{ fontSize: 14, color: '#10b981' }}>Live</span>
                        </div>
                    </div>
                    <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                                <YAxis tick={{ fill: '#64748b' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sirsi-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                    <div className="flex justify-between items-center mb-6">
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>Activity Distribution</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span style={{ fontSize: 14, color: '#10b981' }}>Live</span>
                        </div>
                    </div>
                    <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={activityData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {activityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="sirsi-card mb-8" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                <div className="flex justify-between items-center mb-6">
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>Monthly Engagement Metrics</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span style={{ fontSize: 14, color: '#10b981' }}>Live</span>
                    </div>
                </div>
                <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={engagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                            <YAxis tick={{ fill: '#64748b' }} />
                            <Tooltip />
                            <Bar dataKey="sessions" fill="#059669" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actions" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
