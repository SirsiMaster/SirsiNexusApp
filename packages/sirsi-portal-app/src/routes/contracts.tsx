/**
 * Contract Ledger — Pixel-perfect port of admin/contracts/index.html
 * 
 * Structure: page-header + CTA → 4 stat cards (1 dark emerald, 3 white) → ledger table
 * Typography: Inter, body ≤ 500 weight (Rule 21)
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    FileText, PenLine, Clock, TrendingUp, FilePenLine
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/contracts',
    component: ContractsPage,
})

// ── Ledger Data (matches HTML exactly) ────────────────────────────
const contracts = [
    {
        name: 'FinalWishes MSA',
        refId: 'MSA-2026-001',
        counterparty: 'Cylton Collymore',
        counterpartyColor: 'text-emerald-600',
        status: 'Operational',
        statusType: 'success' as const,
        hash: 'SHA-256: 8a3b7f91...c4e2',
        value: '$15,000.00',
    },
    {
        name: 'Assiduous NDA',
        refId: 'NDA-2026-042',
        counterparty: 'Global Partners',
        counterpartyColor: 'text-gray-600',
        status: 'Operational',
        statusType: 'success' as const,
        hash: 'SHA-256: 4f12d9b8...e5f1',
        value: '$2,500.00',
    },
    {
        name: 'Sirsi SOW v2',
        refId: 'SOW-2026-009',
        counterparty: 'Vertex Systems',
        counterpartyColor: 'text-amber-600',
        status: 'Syncing...',
        statusType: 'warning' as const,
        hash: 'SHA-256: --pending--',
        value: '--TBD--',
    },
]

// ── Component ─────────────────────────────────────────────────────
function ContractsPage() {
    return (
        <div>
            {/* ── Page Header ──────────────────────────────────── */}
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>Contract Ledger</h1>
                    <p className="page-subtitle">
                        Cross-tenant execution tracking, legal compliance assertions, and cryptographic evidence registry.
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <FilePenLine size={12} />
                    Execute Protocol
                </button>
            </div>

            {/* ── Dashboard Stats (4 cards) ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Dark emerald card — Global Documents */}
                <div className="sirsi-card border-none text-white shadow-xl shadow-emerald-500/10" style={{ background: '#022c22' }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-widest">
                            Global Documents
                        </span>
                        <FileText size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-3xl font-semibold">4</div>
                    <div className="text-[9px] text-emerald-400 font-medium mt-2">✓ Permanent Ledger Sync</div>
                </div>

                {/* Active Signatures */}
                <div className="sirsi-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Active Signatures
                        </span>
                        <PenLine size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">2</div>
                    <div className="text-[9px] text-emerald-600 font-medium mt-2 italic">✓ Enforceable State</div>
                </div>

                {/* Pending Verification */}
                <div className="sirsi-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Pending Verification
                        </span>
                        <Clock size={16} className="text-amber-500" />
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">1</div>
                    <div className="text-[9px] text-amber-500 font-medium mt-2 italic">Awaiting hash confirmation</div>
                </div>

                {/* Financial Impact */}
                <div className="sirsi-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            Financial Impact
                        </span>
                        <TrendingUp size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">$17.5K</div>
                    <div className="text-[9px] text-emerald-600 font-medium mt-2 italic">✓ Total Commitment</div>
                </div>
            </div>

            {/* ── Contract Ledger Table ─────────────────────────── */}
            <div className="sirsi-table-wrap">
                <table className="sirsi-table">
                    <thead>
                        <tr>
                            <th className="ps-6">Protocol ID / Template</th>
                            <th>Identity / Counterparty</th>
                            <th className="text-center">Execution State</th>
                            <th className="hidden md:table-cell">Cryptographic Evidence</th>
                            <th className="text-right pe-6">Value Assertion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((c) => (
                            <tr key={c.refId} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                <td className="ps-6">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{c.name}</div>
                                    <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                                        Ref CID: {c.refId}
                                    </div>
                                </td>
                                <td>
                                    <span className={`text-xs font-medium ${c.counterpartyColor} italic`}>
                                        {c.counterparty}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className={`sirsi-badge ${c.statusType === 'success' ? 'sirsi-badge-success' : 'sirsi-badge-warning'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="hidden md:table-cell font-mono text-[9px] text-gray-400">
                                    {c.hash}
                                </td>
                                <td className="text-right pe-6 font-semibold text-gray-900 dark:text-gray-100">
                                    {c.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
