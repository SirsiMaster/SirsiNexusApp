/**
 * Development Intelligence — React Migration Dashboard
 * Canonical Swiss Neo-Deco design (sirsi-card, sirsi-table, page-header)
 *
 * Shows real migration statistics, commit history, phase progress,
 * governance document links, and feature breakdown.
 *
 * Typography: Inter (body ≤ 500, Rule 21)
 * Layout: page-header + KPI cards + phase progress + commit table + governance
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    GitCommit, FileCode, Route as RouteIcon, Code2, CheckCircle2, Circle,
    FileText, BookOpen, Shield, Scale, Gauge, Bug, Zap, Wrench,
    ExternalLink, TrendingUp
} from 'lucide-react'
import { APP_VERSION_DISPLAY } from '@/lib/version'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/development',
    component: DevelopmentIntelligence,
})

// ── Migration Data (hardcoded — ConnectRPC Phase 5) ──────────────

const MIGRATION_COMMITS = [
    { hash: 'be3afe5', type: 'fix', message: 'Persist dark mode across page reloads', date: 'Mar 3, 2026', phase: 4 },
    { hash: '48cd5dc', type: 'perf', message: 'Code splitting — lazy-load all 24 routes', date: 'Mar 3, 2026', phase: 4 },
    { hash: '2bb42e9', type: 'fix', message: 'Fix blank strategic module cards on Portal', date: 'Mar 3, 2026', phase: 4 },
    { hash: '4d576d5', type: 'chore', message: 'Infrastructure updates — deps, config, ADR-026', date: 'Mar 3, 2026', phase: 0 },
    { hash: '9bcd4d9', type: 'feat', message: 'Register all 25 routes in router + sidebar', date: 'Mar 3, 2026', phase: 3 },
    { hash: '3c2a8cb', type: 'feat', message: 'Phase 3 — port system-status and dashboard sub-pages', date: 'Mar 3, 2026', phase: 3 },
    { hash: '870d3a5', type: 'feat', message: 'Phase 2 — 6 remaining investor/intelligence routes', date: 'Mar 2, 2026', phase: 2 },
    { hash: '31d4f42', type: 'feat', message: 'Phase 1 — pixel-perfect parity for 5 core routes', date: 'Mar 2, 2026', phase: 1 },
    { hash: 'bb2f112', type: 'chore', message: 'SIRSI_RULES.md v6.1.0 — Typography Canon + React Migration', date: 'Mar 1, 2026', phase: 0 },
    { hash: 'ad77595', type: 'feat', message: 'Typography standardization — bold purge + headers', date: 'Mar 1, 2026', phase: 0 },
    { hash: '1905dfd', type: 'fix', message: 'React dedupe in monorepo + router-core dep', date: 'Feb 28, 2026', phase: 0 },
    { hash: '0b862d9', type: 'feat', message: 'Phase 2: Port premium components to portal-app', date: 'Feb 28, 2026', phase: 2 },
    { hash: '749319d', type: 'feat', message: 'Technical Stack Convergence Phase 1 + cleanup', date: 'Feb 27, 2026', phase: 0 },
]

const MIGRATION_PHASES = [
    { id: 1, name: 'Core Route Porting', description: '5 routes — Dashboard, Security, Portal, Telemetry, System Logs', status: 'complete' as const, commits: 1 },
    { id: 2, name: 'Extended Routes', description: '6 routes — Analytics, KPI, Committee, Messaging, Monitoring, Console', status: 'complete' as const, commits: 2 },
    { id: 3, name: 'System Status Pages', description: '9 routes — Cache, API, Database, Backup, Contracts, etc.', status: 'complete' as const, commits: 2 },
    { id: 4, name: 'QA, Polish & Performance', description: 'Visual QA, code splitting, dark mode, responsive', status: 'complete' as const, commits: 3 },
    { id: 5, name: 'ConnectRPC Integration', description: 'Replace mock data with live gRPC backend', status: 'planned' as const, commits: 0 },
    { id: 6, name: 'Authentication & MFA Gate', description: 'Firebase Auth + ProtectedRoute + MFA wiring', status: 'planned' as const, commits: 0 },
]

const GOVERNANCE_DOCS = [
    { name: 'ADR-027: React Portal Migration', path: '/docs/ADR-027-REACT-PORTAL-MIGRATION.md', type: 'ADR' },
    { name: 'ADR-026: Hypervisor Command Protocol', path: '/docs/ADR-026-HYPERVISOR-COMMAND-PROTOCOL.md', type: 'ADR' },
    { name: 'ADR-025: Unified App Architecture', path: '/docs/ADR-025-UNIFIED-APP-ARCHITECTURE.md', type: 'ADR' },
    { name: 'ADR-018: Technical Stack Convergence', path: '/docs/ADR-018-TECHNICAL-STACK-CONVERGENCE.md', type: 'ADR' },
    { name: 'SIRSI_RULES.md v6.1.0', path: '/SIRSI_RULES.md', type: 'Canon' },
    { name: 'Swiss Neo-Deco Style Guide', path: '/docs/SWISS_NEO_DECO_STYLE_GUIDE.md', type: 'Design' },
    { name: `Version History (${APP_VERSION_DISPLAY})`, path: '/docs/core/VERSION.md', type: 'Version' },
    { name: 'ADR Index (23 ADRs)', path: '/docs/ADR-INDEX.md', type: 'Index' },
]

// ── Commit type config ───────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    feat: { label: 'Feature', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Zap },
    fix: { label: 'Fix', color: 'text-amber-600', bg: 'bg-amber-50', icon: Bug },
    perf: { label: 'Perf', color: 'text-blue-600', bg: 'bg-blue-50', icon: Gauge },
    chore: { label: 'Chore', color: 'text-gray-500', bg: 'bg-gray-50', icon: Wrench },
}

// ── Component ────────────────────────────────────────────────────
function DevelopmentIntelligence() {
    // Computed stats
    const totalCommits = MIGRATION_COMMITS.length
    const featCount = MIGRATION_COMMITS.filter(c => c.type === 'feat').length
    const fixCount = MIGRATION_COMMITS.filter(c => c.type === 'fix').length
    const perfCount = MIGRATION_COMMITS.filter(c => c.type === 'perf').length
    const choreCount = MIGRATION_COMMITS.filter(c => c.type === 'chore').length
    const completedPhases = MIGRATION_PHASES.filter(p => p.status === 'complete').length
    const totalPhases = MIGRATION_PHASES.length

    return (
        <div>
            {/* ── Page Header ──────────────────────────────────── */}
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>Development Intelligence</h1>
                    <p className="page-subtitle">
                        React migration progress, commit history, and governance documentation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-medium uppercase tracking-widest border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {APP_VERSION_DISPLAY}
                    </span>
                </div>
            </div>

            {/* ── KPI Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KpiCard icon={GitCommit} label="Total Commits" value={String(totalCommits)} unit="pushed" />
                <KpiCard icon={RouteIcon} label="Routes Ported" value="25" unit="of 25" />
                <KpiCard icon={FileCode} label="Source Files" value="64" unit=".tsx/.ts/.css" />
                <KpiCard icon={Code2} label="Lines of Code" value="6,135" unit="total" />
            </div>

            {/* ── Two-column layout ───────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

                {/* LEFT 2/3: Migration Phases */}
                <div className="xl:col-span-2 space-y-6">
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest border-l-4 border-emerald-600 ps-4 italic mb-6">
                        Migration Phases — {completedPhases}/{totalPhases} Complete
                    </h3>

                    <div className="space-y-3">
                        {MIGRATION_PHASES.map((phase) => (
                            <div
                                key={phase.id}
                                className="sirsi-card flex items-center gap-4 group hover:border-emerald-200 transition-all"
                            >
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    {phase.status === 'complete' ? (
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    ) : (
                                        <Circle size={20} className="text-gray-300" />
                                    )}
                                </div>

                                {/* Phase Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                            Phase {phase.id}
                                        </span>
                                        {phase.status === 'complete' && (
                                            <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">
                                                Complete
                                            </span>
                                        )}
                                        {phase.status === 'planned' && (
                                            <span className="text-[8px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-gray-100">
                                                Planned
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-900 mt-0.5">{phase.name}</h4>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{phase.description}</p>
                                </div>

                                {/* Commit Count */}
                                <div className="flex-shrink-0 text-right">
                                    {phase.commits > 0 && (
                                        <span className="text-xs font-medium text-gray-500">
                                            {phase.commits} commit{phase.commits !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider mb-1.5">
                            <span className="text-gray-500">Overall Migration Progress</span>
                            <span className="text-emerald-600">{Math.round((completedPhases / totalPhases) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${(completedPhases / totalPhases) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT 1/3: Governance Docs + Feature Breakdown */}
                <div className="space-y-8">
                    {/* Governance Documents */}
                    <div>
                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                            Governance Documents
                            <span className="h-[1px] flex-1 bg-gray-100" />
                        </h3>

                        <div className="space-y-2">
                            {GOVERNANCE_DOCS.map((doc) => (
                                <a
                                    key={doc.name}
                                    href={doc.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sirsi-card flex items-center gap-3 px-3 py-2.5 hover:border-emerald-200 transition-all no-underline group"
                                >
                                    <DocTypeIcon type={doc.type} />
                                    <span className="text-xs font-medium text-gray-700 flex-1 group-hover:text-emerald-700 transition-colors">
                                        {doc.name}
                                    </span>
                                    <ExternalLink size={10} className="text-gray-300 group-hover:text-emerald-400 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Feature Breakdown */}
                    <div>
                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                            Commit Breakdown
                            <span className="h-[1px] flex-1 bg-gray-100" />
                        </h3>

                        <div className="sirsi-card space-y-4">
                            <BreakdownBar label="Features" count={featCount} total={totalCommits} color="bg-emerald-500" />
                            <BreakdownBar label="Fixes" count={fixCount} total={totalCommits} color="bg-amber-500" />
                            <BreakdownBar label="Performance" count={perfCount} total={totalCommits} color="bg-blue-500" />
                            <BreakdownBar label="Chores" count={choreCount} total={totalCommits} color="bg-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Commit Registry (full-width table) ──────────── */}
            <div className="sirsi-table-wrap">
                <div className="p-5 border-b border-gray-50 bg-gray-50/10 flex justify-between items-center">
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest italic m-0">
                        Commit Registry — React Migration
                    </h3>
                    <span className="text-[10px] font-medium text-gray-400">
                        {totalCommits} commits
                    </span>
                </div>
                <table className="sirsi-table">
                    <thead>
                        <tr>
                            <th className="ps-6" style={{ width: '100px' }}>Hash</th>
                            <th style={{ width: '80px' }}>Type</th>
                            <th>Message</th>
                            <th style={{ width: '80px' }}>Phase</th>
                            <th className="text-right pe-6" style={{ width: '120px' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MIGRATION_COMMITS.map((commit) => {
                            const config = TYPE_CONFIG[commit.type] || TYPE_CONFIG.chore
                            const TypeIcon = config.icon
                            return (
                                <tr key={commit.hash} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                    <td className="ps-6">
                                        <code className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            {commit.hash.substring(0, 7)}
                                        </code>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.color} ${config.bg}`}>
                                            <TypeIcon size={10} />
                                            {config.label}
                                        </span>
                                    </td>
                                    <td className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {commit.message}
                                    </td>
                                    <td>
                                        {commit.phase > 0 ? (
                                            <span className="text-[10px] font-semibold text-gray-500">P{commit.phase}</span>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">infra</span>
                                        )}
                                    </td>
                                    <td className="text-right pe-6 text-[10px] font-medium text-gray-400">
                                        {commit.date}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ── Sub-Components ───────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, unit }: {
    icon: any; label: string; value: string; unit: string
}) {
    return (
        <div className="sirsi-card">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-gray-400" />
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                {value}
                <span className="text-xs font-normal text-gray-400 ml-1.5">{unit}</span>
            </div>
        </div>
    )
}

function DocTypeIcon({ type }: { type: string }) {
    switch (type) {
        case 'ADR': return <Scale size={12} className="text-emerald-500 flex-shrink-0" />
        case 'Canon': return <BookOpen size={12} className="text-amber-500 flex-shrink-0" />
        case 'Design': return <TrendingUp size={12} className="text-blue-500 flex-shrink-0" />
        case 'Version': return <FileText size={12} className="text-purple-500 flex-shrink-0" />
        case 'Index': return <FileText size={12} className="text-gray-400 flex-shrink-0" />
        default: return <Shield size={12} className="text-gray-400 flex-shrink-0" />
    }
}

function BreakdownBar({ label, count, total, color }: {
    label: string; count: number; total: number; color: string
}) {
    const pct = Math.round((count / total) * 100)
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-[10px] font-medium text-gray-400">
                    {count} <span className="text-gray-300">({pct}%)</span>
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}
