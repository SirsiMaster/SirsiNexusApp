/**
 * Operations Command Center — Hypervisor Cockpit
 *
 * Pixel-perfect port following Swiss Neo-Deco Admin Portal rubric:
 *  - page-header / page-subtitle for header (shared.css)
 *  - sirsi-card for all panel containers (shared.css)
 *  - sirsi-table-wrap / sirsi-table for all data tables (shared.css)
 *  - sirsi-badge / sirsi-badge-* for status badges (shared.css)
 *  - btn-primary / btn-secondary for actions (shared.css)
 *  - Inter headings (NOT Cinzel — admin portal convention per shared.css)
 *  - Body text ≤ 500 weight (Rule 21)
 *  - No inline style={{}} for typography, colors, or spacing
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import * as Tabs from '@radix-ui/react-tabs'
import {
    Activity, Shield, Database, Globe, Server, DollarSign, AlertTriangle,
    GitBranch, Monitor, Cpu, Clock, CheckCircle, Plus,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import {
    RadialGauge, Sparkline, StatusLED, ProgressGauge, MetricCard,
    TenantFilter, EnvironmentFilter,
} from '../components/instruments'
import { useHypervisorStore } from '../stores/hypervisor-store'
import {
    useOverviewData, useDevOpsData, useInfrastructureData,
    useSecurityData, useDatabaseData, useFrontendData,
    useBackendData, useIntegrationData, useCostData, useIncidentData,
} from '../hooks/useHypervisorData'
import type { LEDStatus } from '../components/instruments'

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/tenants', component: HypervisorCommandCenter })

const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'devops', label: 'DevOps', icon: GitBranch },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'frontend', label: 'Frontend', icon: Monitor },
    { id: 'backend', label: 'Backend', icon: Cpu },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'cost', label: 'Cost', icon: DollarSign },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
]

const EMERALD_PALETTE = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

function HypervisorCommandCenter() {
    const { selectedTenant, selectedEnvironment, activeTab, setTenant, setEnvironment, setTab } = useHypervisorStore()
    const filters = { tenant: selectedTenant, environment: selectedEnvironment }

    return (
        <div>
            {/* ── Page Header (canonical: shared.css .page-header) ── */}
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>Operations Command Center</h1>
                    <p className="page-subtitle">
                        Hypervisor — Full Spectrum Portfolio Diagnostics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <StatusLED status="operational" label="All Systems Operational" />
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest font-mono">
                        <Clock size={12} className="inline mr-1" />
                        {new Date().toLocaleTimeString()}
                    </span>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus size={12} />
                        Sync Tenant
                    </button>
                </div>
            </div>

            {/* ── Filter Bar + Tab Cluster ── */}
            <div className="flex gap-6">
                {/* Left: Filters */}
                <div className="shrink-0" style={{ width: 200 }}>
                    <div className="sirsi-card p-4">
                        <TenantFilter value={selectedTenant} onChange={setTenant} className="mb-5" />
                        <EnvironmentFilter value={selectedEnvironment} onChange={setEnvironment} />
                    </div>
                </div>

                {/* Right: Tab Cluster */}
                <div className="flex-1 min-w-0">
                    <Tabs.Root value={activeTab} onValueChange={setTab}>
                        <Tabs.List className="hyp-tab-list">
                            {TABS.map((tab) => (
                                <Tabs.Trigger key={tab.id} value={tab.id} className="hyp-tab-trigger">
                                    <tab.icon size={14} />
                                    <span>{tab.label}</span>
                                </Tabs.Trigger>
                            ))}
                        </Tabs.List>

                        <Tabs.Content value="overview"><OverviewTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="devops"><DevOpsTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="infrastructure"><InfrastructureTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="security"><SecurityTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="database"><DatabaseTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="frontend"><FrontendTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="backend"><BackendTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="integrations"><IntegrationsTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="cost"><CostTab filters={filters} /></Tabs.Content>
                        <Tabs.Content value="incidents"><IncidentsTab filters={filters} /></Tabs.Content>
                    </Tabs.Root>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════
// TAB IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════

interface TabProps { filters: { tenant: string; environment: string } }

function OverviewTab({ filters }: TabProps) {
    const { overview, isLoading } = useOverviewData(filters as any)
    if (isLoading || !overview) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard label="System Uptime" value={`${overview.uptime.current}%`} sparkData={overview.uptime.trend} trend={{ direction: 'up', percent: 0.02, label: 'vs target' }} accentColor="#059669" />
                <MetricCard label="Deployments (24h)" value={overview.deployments24h.count} sparkData={overview.deployments24h.trend} trend={{ direction: 'up', percent: 14, label: 'vs yesterday' }} accentColor="#10b981" />
                <MetricCard label="Cloud Spend MTD" value={`$${overview.cloudSpendMTD.current.toLocaleString()}`} unit={`/ $${overview.cloudSpendMTD.budget.toLocaleString()}`} sparkData={overview.cloudSpendMTD.trend} accentColor="#C8A951" />
                <MetricCard label="Open Incidents" value={overview.openIncidents.length} trend={overview.openIncidents.length === 0 ? { direction: 'flat', percent: 0, label: 'all clear' } : { direction: 'up', percent: overview.openIncidents.length, label: 'active' }} accentColor={overview.openIncidents.length > 0 ? '#f59e0b' : '#059669'} />
            </div>

            {/* Tenant Health + Activity */}
            <div className="grid grid-cols-3 gap-4">
                {/* Tenant Health Panel */}
                <div className="col-span-2">
                    <SectionHeader title="Tenant Health" />
                    <div className="sirsi-table-wrap">
                        <table className="sirsi-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Tenant</th>
                                    <th>Status</th>
                                    <th>Uptime 30d</th>
                                    <th>Deploys 24h</th>
                                    <th>Incidents</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overview.tenants.map((t) => (
                                    <tr key={t.id}>
                                        <td className="ps-4 font-medium text-gray-900">{t.name}</td>
                                        <td><StatusLED status={t.status as LEDStatus} label={t.status} /></td>
                                        <td className={t.uptime30d >= 99.5 ? 'text-emerald-600 font-medium' : 'text-amber-500 font-medium'}>{t.uptime30d}%</td>
                                        <td>{t.deployments24h}</td>
                                        <td className={t.openIncidents > 0 ? 'text-red-500 font-medium' : 'text-emerald-600 font-medium'}>{t.openIncidents}</td>
                                        <td><Sparkline data={t.uptimeTrend} width={80} height={20} color={t.status === 'operational' ? '#10b981' : '#f59e0b'} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="sirsi-card p-5">
                    <SectionHeader title="Activity Feed" />
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {overview.recentActivity.map(e => (
                            <div key={e.id} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                                <ActivityIcon type={e.type} severity={e.severity} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] text-gray-600 m-0 leading-snug font-normal">{e.message}</p>
                                    <p className="text-[11px] text-gray-400 m-0 mt-0.5">{e.tenant} · {e.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gauges Row */}
            <div className="sirsi-card p-5">
                <SectionHeader title="System Gauges" />
                <div className="flex justify-around">
                    <RadialGauge value={overview.uptime.current} max={100} label="Uptime" thresholds={{ warning: 99, critical: 95 }} />
                    <RadialGauge value={Math.round((overview.cloudSpendMTD.current / overview.cloudSpendMTD.budget) * 100)} max={100} label="Budget" thresholds={{ warning: 75, critical: 90 }} />
                    <RadialGauge value={overview.deployments24h.count} max={20} label="Deploys" />
                    <RadialGauge value={overview.openIncidents.length} max={5} label="Incidents" thresholds={{ warning: 60, critical: 80 }} />
                </div>
            </div>
        </div>
    )
}

function DevOpsTab({ filters }: TabProps) {
    const { data, isLoading } = useDevOpsData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-4 gap-4">
                {data.changeFailureRate.map(m => (
                    <MetricCard key={m.tenant} label={`CFR — ${m.tenant}`} value={m.value} unit={m.unit} sparkData={m.trend} trend={{ direction: m.value < 5 ? 'down' : 'up', percent: m.value, label: m.doraLevel }} accentColor={m.doraLevel === 'elite' ? '#059669' : '#f59e0b'} />
                ))}
                {data.mttr.map(m => (
                    <MetricCard key={m.tenant} label={`MTTR — ${m.tenant}`} value={m.value} unit={m.unit} sparkData={m.trend} trend={{ direction: 'down', percent: 8, label: m.doraLevel }} accentColor={m.doraLevel === 'elite' ? '#059669' : '#f59e0b'} />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Deploy Frequency Chart */}
                <div className="sirsi-card p-5">
                    <SectionHeader title="Deployment Frequency (7d)" />
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.deploymentFrequency[0].dailyCounts.map((v, i) => ({ day: `D-${7 - i}`, fw: v, as: data.deploymentFrequency[1]?.dailyCounts[i] || 0 }))}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip />
                            <Bar dataKey="fw" name="FinalWishes" fill="#059669" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="as" name="Assiduous" fill="#C8A951" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pipeline Matrix */}
                <div className="sirsi-card p-5">
                    <SectionHeader title="Pipeline Status" />
                    <div className="sirsi-table-wrap">
                        <table className="sirsi-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Tenant</th>
                                    <th>Env</th>
                                    <th>Status</th>
                                    <th>Last Run</th>
                                    <th>Branch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pipelineMatrix.map((p, i) => (
                                    <tr key={i}>
                                        <td className="ps-4">{p.tenant}</td>
                                        <td>{p.environment}</td>
                                        <td><StatusLED status={p.status} /></td>
                                        <td className="text-gray-400">{p.lastRun}</td>
                                        <td><code className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">{p.branch}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Deployments */}
            <div>
                <SectionHeader title="Recent Deployments" />
                <div className="sirsi-table-wrap">
                    <table className="sirsi-table">
                        <thead>
                            <tr>
                                <th className="ps-4">SHA</th>
                                <th>Tenant</th>
                                <th>Env</th>
                                <th>Version</th>
                                <th>Status</th>
                                <th>Deployer</th>
                                <th>Duration</th>
                                <th className="pe-4">When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentDeployments.map(d => (
                                <tr key={d.id}>
                                    <td className="ps-4"><code className="text-xs">{d.sha}</code></td>
                                    <td>{d.tenant}</td>
                                    <td>{d.environment}</td>
                                    <td className="font-medium">{d.version}</td>
                                    <td><StatusBadge status={d.status} /></td>
                                    <td>{d.deployer}</td>
                                    <td className="font-mono text-xs">{d.duration}</td>
                                    <td className="pe-4 text-gray-400">{d.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function InfrastructureTab({ filters }: TabProps) {
    const { data, isLoading } = useInfrastructureData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-3 gap-4">
                <MetricCard label="In Sync" value={data.resources.inSync} accentColor="#059669" />
                <MetricCard label="Drifted" value={data.resources.drifted} accentColor={data.resources.drifted > 0 ? '#f59e0b' : '#059669'} />
                <MetricCard label="Pending" value={data.resources.pending} accentColor="#94a3b8" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title="Drift Detection" />
                    {data.driftItems.map((d, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <StatusLED status={d.severity === 'critical' ? 'critical' : d.severity === 'warning' ? 'degraded' : 'operational'} />
                                <div>
                                    <p className="text-[13px] font-medium text-gray-900 m-0">{d.resource}</p>
                                    <p className="text-[11px] text-gray-400 m-0">{d.type} · {d.tenant}</p>
                                </div>
                            </div>
                            <span className="text-[11px] text-gray-400">{d.detected}</span>
                        </div>
                    ))}
                </div>

                <div>
                    <SectionHeader title="Environment Matrix" />
                    <div className="sirsi-table-wrap">
                        <table className="sirsi-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Tenant</th>
                                    <th>Env</th>
                                    <th>Version</th>
                                    <th>Status</th>
                                    <th>Last Deploy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.environmentMatrix.map((e, i) => (
                                    <tr key={i}>
                                        <td className="ps-4">{e.tenant}</td>
                                        <td>{e.environment}</td>
                                        <td className="font-mono text-xs">{e.version}</td>
                                        <td><StatusLED status={e.status} /></td>
                                        <td className="text-gray-400">{e.lastDeploy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Cloud Run Services */}
            <div>
                <SectionHeader title="Cloud Run Services" />
                <div className="grid grid-cols-3 gap-4">
                    {data.cloudRunServices.map((s, i) => (
                        <div key={i} className="sirsi-card p-4">
                            <p className="text-sm font-medium text-gray-900 m-0 mb-1">{s.name}</p>
                            <p className="text-[11px] text-gray-400 m-0 mb-3">{s.tenant}</p>
                            <ProgressGauge value={s.cpu} max={100} label="CPU" />
                            <div className="mt-2"><ProgressGauge value={s.memory} max={100} label="Memory" /></div>
                            <p className="text-[11px] text-gray-400 m-0 mt-2">{s.instances}/{s.maxInstances} instances</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function SecurityTab({ filters }: TabProps) {
    const { data, isLoading } = useSecurityData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-3 gap-4">
                <RadialGaugeCard value={data.vulnerabilityScore.score} max={100} label="Vulnerability Score" thresholds={{ warning: 70, critical: 50 }} />
                <RadialGaugeCard value={data.soc2Score} max={100} label="SOC 2 Compliance" thresholds={{ warning: 80, critical: 60 }} />
                <RadialGaugeCard value={data.secretRotationCompliance} max={100} label="Secret Rotation" thresholds={{ warning: 80, critical: 60 }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title="MFA Compliance" />
                    {data.mfaCompliance.map((m, i) => (
                        <div key={i} className="mb-3">
                            <ProgressGauge value={m.enrolled} max={m.total} label={`${m.tenant} (${m.enrolled}/${m.total})`} thresholds={{ warning: 80, critical: 50 }} />
                        </div>
                    ))}
                </div>

                <div className="sirsi-card p-5">
                    <SectionHeader title="SSL Certificates" />
                    {data.certificates.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <StatusLED status={c.status as LEDStatus} />
                                <div>
                                    <p className="text-[13px] font-medium text-gray-900 m-0">{c.domain}</p>
                                    <p className="text-[11px] text-gray-400 m-0">{c.issuer}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-medium ${c.daysRemaining < 14 ? 'text-red-500' : 'text-emerald-600'}`}>{c.daysRemaining}d</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Auth Activity Chart */}
            <div className="sirsi-card p-5">
                <SectionHeader title="Auth Activity (24h)" />
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.authActivity24h}>
                        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="successful" stroke="#059669" fill="#059669" fillOpacity={0.1} />
                        <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function DatabaseTab({ filters }: TabProps) {
    const { data, isLoading } = useDatabaseData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-2 gap-4">
                {data.connectionPools.map((p, i) => (
                    <div key={i} className="sirsi-card p-4">
                        <p className="text-[13px] font-medium text-gray-900 m-0 mb-2">{p.database}</p>
                        <ProgressGauge value={p.active} max={p.max} label={`Active: ${p.active} / ${p.max}`} />
                        <p className="text-[11px] text-gray-400 m-0 mt-1">Idle: {p.idle}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title="Slow Queries" />
                    {data.slowQueries.map((q, i) => (
                        <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                            <code className="text-xs text-gray-600 block mb-1">{q.query}</code>
                            <div className="flex gap-4">
                                <span className="text-[11px] text-gray-400">Avg: {q.avgTime}ms</span>
                                <span className="text-[11px] text-gray-400">Freq: {q.frequency}/hr</span>
                                <span className="text-[11px] text-gray-400">{q.lastSeen}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <SectionHeader title="Firestore Collections" />
                    <div className="sirsi-table-wrap">
                        <table className="sirsi-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Collection</th>
                                    <th>Docs</th>
                                    <th>Reads</th>
                                    <th>Writes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.firestoreCollections.map((c, i) => (
                                    <tr key={i}>
                                        <td className="ps-4"><code className="text-xs">{c.name}</code></td>
                                        <td className="font-medium">{c.documentCount.toLocaleString()}</td>
                                        <td><Sparkline data={c.readsTrend} width={60} height={16} /></td>
                                        <td><Sparkline data={c.writesTrend} width={60} height={16} color="#C8A951" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="sirsi-card p-5">
                <SectionHeader title="Backup Status" />
                <div className="grid grid-cols-2 gap-4">
                    {data.backupStatus.map((b, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <StatusLED status={b.status} />
                                <span className="text-[13px] font-medium">{b.database}</span>
                            </div>
                            <span className="text-[11px] text-gray-400">Last: {b.lastBackup}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function FrontendTab({ filters }: TabProps) {
    const { data, isLoading } = useFrontendData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-3 gap-4">
                {data.webVitals.map(v => (
                    <MetricCard key={v.name} label={v.name} value={v.value} unit={v.unit} accentColor={v.rating === 'good' ? '#059669' : v.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444'} />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title={`Bundle Size: ${data.bundleSize.current}KB / ${data.bundleSize.budget}KB`} />
                    <ProgressGauge value={data.bundleSize.current} max={data.bundleSize.budget} className="mb-4" />
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={data.bundleSize.byModule} dataKey="size" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, size }) => `${name}: ${size}KB`} labelLine={false}>
                                {data.bundleSize.byModule.map((_, i) => <Cell key={i} fill={EMERALD_PALETTE[i % EMERALD_PALETTE.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <SectionHeader title="Page Inventory" />
                    <div className="sirsi-table-wrap">
                        <table className="sirsi-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Route</th>
                                    <th>Components</th>
                                    <th>Load (ms)</th>
                                    <th>Errors</th>
                                    <th>Traffic</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pageInventory.map((p, i) => (
                                    <tr key={i}>
                                        <td className="ps-4"><code className="text-xs">{p.route}</code></td>
                                        <td className="text-center">{p.componentCount}</td>
                                        <td className="font-mono text-xs">{p.loadTimeMs}</td>
                                        <td className={p.errorRate > 0.1 ? 'text-red-500' : 'text-emerald-600'}>{p.errorRate}%</td>
                                        <td className="text-gray-400">{p.traffic.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BackendTab({ filters }: TabProps) {
    const { data, isLoading } = useBackendData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Goroutines" value={data.goRuntime.goroutines} accentColor="#059669" />
                <MetricCard label="Heap" value={data.goRuntime.heapMB} unit="MB" accentColor="#10b981" />
                <MetricCard label="GC Pause" value={data.goRuntime.gcPauseMs} unit="ms" accentColor="#C8A951" />
            </div>

            <div>
                <SectionHeader title="API Endpoints" />
                <div className="sirsi-table-wrap">
                    <table className="sirsi-table">
                        <thead>
                            <tr>
                                <th className="ps-4">Method</th>
                                <th>Path</th>
                                <th>Requests</th>
                                <th>Avg Latency</th>
                                <th>Error Rate</th>
                                <th>p95 Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.apiEndpoints.map((e, i) => (
                                <tr key={i}>
                                    <td className="ps-4"><span className="sirsi-badge sirsi-badge-success">{e.method}</span></td>
                                    <td><code className="text-xs">{e.path}</code></td>
                                    <td className="font-medium">{e.requestCount.toLocaleString()}</td>
                                    <td className="font-mono text-xs">{e.avgLatencyMs}ms</td>
                                    <td className={e.errorRate > 0.1 ? 'text-amber-500' : 'text-emerald-600'}>{e.errorRate}%</td>
                                    <td><Sparkline data={e.p95Trend} width={80} height={16} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title="Service Health" />
                    {data.serviceHealth.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3"><StatusLED status={s.status} /><span className="text-[13px] font-medium">{s.service}</span></div>
                            <span className="text-xs font-medium text-emerald-600">{s.uptime}%</span>
                        </div>
                    ))}
                </div>
                <div className="sirsi-card p-5">
                    <SectionHeader title="gRPC Throughput" />
                    {data.grpcThroughput.map((g, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <span className="text-[13px] font-medium">{g.service}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-900">{g.rps} rps</span>
                                <Sparkline data={g.trend} width={60} height={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function IntegrationsTab({ filters }: TabProps) {
    const { data, isLoading } = useIntegrationData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-3 gap-4">
                {data.serviceHealth.map((s, i) => (
                    <div key={i} className="sirsi-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{s.name}</span>
                            <StatusLED status={s.status} />
                        </div>
                        <p className="text-[11px] text-gray-400 m-0">{s.lastCheck} · {s.responseTimeMs > 0 ? `${s.responseTimeMs}ms` : '—'}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title="Webhooks" />
                    {data.webhooks.map((w, i) => (
                        <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                            <p className="text-[13px] font-medium text-gray-900 m-0 mb-1">{w.url}</p>
                            <div className="flex gap-4">
                                <span className={`text-[11px] ${w.successRate >= 99 ? 'text-emerald-600' : 'text-amber-500'}`}>Success: {w.successRate}%</span>
                                <span className="text-[11px] text-gray-400">Avg: {w.avgResponseMs}ms</span>
                                <span className="text-[11px] text-gray-400">Retries: {w.retryCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sirsi-card p-5">
                    <SectionHeader title="API Keys" />
                    {data.apiKeys.map((k, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="text-[13px] font-medium m-0">{k.service}</p>
                                <p className="text-[11px] text-gray-400 m-0">Expires: {k.expiresAt}</p>
                            </div>
                            <span className={`text-xs font-medium ${k.daysRemaining < 60 ? 'text-red-500' : 'text-emerald-600'}`}>{k.daysRemaining}d — {k.rotationStatus}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function CostTab({ filters }: TabProps) {
    const { data, isLoading } = useCostData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Actual MTD" value={`$${data.budgetVsActual.actual.toLocaleString()}`} accentColor="#059669" />
                <MetricCard label="Budget" value={`$${data.budgetVsActual.budget.toLocaleString()}`} accentColor="#C8A951" />
                <MetricCard label="Cost per User" value={`$${data.costPerUser}`} unit="/mo" accentColor="#10b981" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="sirsi-card p-5">
                    <SectionHeader title="Cost Trend (6 months)" />
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.costTrend6m}>
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
                            <Tooltip />
                            <Area type="monotone" dataKey="finalwishes" stackId="1" stroke="#059669" fill="#059669" fillOpacity={0.2} name="FinalWishes" />
                            <Area type="monotone" dataKey="assiduous" stackId="1" stroke="#C8A951" fill="#C8A951" fillOpacity={0.2} name="Assiduous" />
                            <Area type="monotone" dataKey="sirsiCore" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Sirsi Core" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="sirsi-card p-5">
                    <SectionHeader title="Budget vs Actual" />
                    <div className="space-y-4">
                        <ProgressGauge value={data.budgetVsActual.actual} max={data.budgetVsActual.budget} label="Spend" thresholds={{ warning: 80, critical: 95 }} />
                        <ProgressGauge value={data.budgetVsActual.forecast} max={data.budgetVsActual.budget} label="Forecast" thresholds={{ warning: 80, critical: 95 }} />
                    </div>
                </div>
            </div>

            {data.idleResources.length > 0 && (
                <div className="sirsi-card p-5 border-l-4 border-amber-400">
                    <SectionHeader title="Idle Resources" />
                    {data.idleResources.map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="text-[13px] font-medium text-gray-900 m-0">{r.name}</p>
                                <p className="text-[11px] text-gray-400 m-0">{r.type} · ${r.monthlyCost}/mo</p>
                            </div>
                            <span className="text-xs font-medium text-amber-500">{r.recommendation}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function IncidentsTab({ filters }: TabProps) {
    const { data, isLoading } = useIncidentData(filters as any)
    if (isLoading || !data) return <TabSkeleton />

    return (
        <div className="space-y-6 pt-5">
            <div className="grid grid-cols-2 gap-4">
                <MetricCard label="SLA Compliance" value={`${data.slaCompliance.current}%`} sparkData={data.slaCompliance.trend} trend={{ direction: data.slaCompliance.current >= data.slaCompliance.target ? 'up' : 'down', percent: Math.abs(data.slaCompliance.current - data.slaCompliance.target), label: `target: ${data.slaCompliance.target}%` }} accentColor="#059669" />
                <MetricCard label="Open Incidents" value={data.openIncidents.length} accentColor={data.openIncidents.length > 0 ? '#f59e0b' : '#059669'} />
            </div>

            {data.openIncidents.length > 0 && (
                <div className="sirsi-card p-5 border-l-4 border-red-500">
                    <SectionHeader title="Open Incidents" />
                    {data.openIncidents.map(inc => (
                        <div key={inc.id} className="py-3">
                            <div className="flex items-center gap-3 mb-2">
                                <SeverityBadge severity={inc.severity} />
                                <span className="text-sm font-medium text-gray-900">{inc.title}</span>
                            </div>
                            <p className="text-[13px] text-gray-600 m-0 mb-2 leading-relaxed">{inc.description}</p>
                            <div className="flex gap-4">
                                <span className="text-[11px] text-gray-400">Tenant: {inc.tenant}</span>
                                <span className="text-[11px] text-gray-400">Assignee: {inc.assignee}</span>
                                <span className="text-[11px] text-gray-400">Status: {inc.status}</span>
                                <span className="text-[11px] text-gray-400">Opened: {new Date(inc.openedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="sirsi-card p-5">
                <SectionHeader title="Incident History" />
                {data.incidentHistory.map(inc => (
                    <div key={inc.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                            <SeverityBadge severity={inc.severity} />
                            <div>
                                <p className="text-[13px] font-medium m-0">{inc.title}</p>
                                <p className="text-[11px] text-gray-400 m-0">{inc.tenant} · {inc.assignee}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <StatusBadge status={inc.status} />
                            {inc.resolvedAt && <p className="text-[11px] text-gray-400 m-0 mt-1">Resolved: {new Date(inc.resolvedAt).toLocaleDateString()}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════
// SHARED UTILITIES — no inline styles, canonical classes only
// ═══════════════════════════════════════════════════════════════════

function SectionHeader({ title }: { title: string }) {
    return (
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest italic border-l-4 border-emerald-600 ps-4 mb-4 mt-0">
            {title}
        </h3>
    )
}

function TabSkeleton() {
    return (
        <div className="space-y-4 pt-5">
            {[1, 2, 3].map(i => (
                <div key={i} className="sirsi-card animate-pulse h-28 bg-gray-50" />
            ))}
        </div>
    )
}

function ActivityIcon({ type, severity }: { type: string; severity: string }) {
    const colorMap: Record<string, string> = { deploy: 'text-emerald-600', security: 'text-amber-500', incident: 'text-red-500', config: 'text-gray-400', user: 'text-emerald-500' }
    const sevColorMap: Record<string, string> = { critical: 'text-red-500', warning: 'text-amber-500' }
    const IconMap: Record<string, any> = { deploy: GitBranch, security: Shield, incident: AlertTriangle, config: Server, user: CheckCircle }
    const Icon = IconMap[type] || Activity
    const color = sevColorMap[severity] || colorMap[type] || 'text-gray-400'
    return <Icon size={14} className={`${color} mt-0.5 shrink-0`} />
}

function StatusBadge({ status }: { status: string }) {
    const classMap: Record<string, string> = {
        success: 'sirsi-badge-success',
        resolved: 'sirsi-badge-success',
        failed: 'sirsi-badge-error',
        rolling: 'sirsi-badge-warning',
        investigating: 'sirsi-badge-warning',
        mitigated: 'sirsi-badge-warning',
        open: 'sirsi-badge-error',
    }
    return <span className={`sirsi-badge ${classMap[status] || 'sirsi-badge-warning'}`}>{status.toUpperCase()}</span>
}

function SeverityBadge({ severity }: { severity: string }) {
    const classMap: Record<string, string> = {
        critical: 'sirsi-badge-error',
        warning: 'sirsi-badge-warning',
        info: 'sirsi-badge-success',
    }
    return <span className={`sirsi-badge ${classMap[severity] || 'sirsi-badge-warning'}`}>{severity.toUpperCase()}</span>
}

function RadialGaugeCard({ value, max, label, thresholds }: { value: number; max: number; label: string; thresholds?: { warning: number; critical: number } }) {
    return (
        <div className="sirsi-card flex flex-col items-center justify-center p-5">
            <RadialGauge value={value} max={max} label={label} thresholds={thresholds} />
        </div>
    )
}
