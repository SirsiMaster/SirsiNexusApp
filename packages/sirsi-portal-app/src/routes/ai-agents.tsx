/**
 * AI Agent Taskforce — Theme-aware rewrite using canonical CSS classes
 *
 * Uses: page-header, page-subtitle, sirsi-card, sirsi-table-wrap, sirsi-table, btn-primary
 * ADR: ADR-027 Phase 5 — React is source of truth
 * Typography: Inter, body ≤ 500 weight (Rule 21)
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Shield, Cpu, Scale, PenTool, Home, PieChart, SlidersHorizontal, Bot } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/ai-agents',
    component: AiAgents,
})

interface AgentCard {
    icon: any; name: string; desc: string; status: string
    statusBg: string; statusText: string; borderColor: string
    iconBg: string; footer: [string, string]; footerColor: string
    tenant?: string; opacity?: boolean
}

const platformAgents: AgentCard[] = [
    { icon: Shield, name: 'Aegis Sentinel', desc: 'Secures global gRPC gateways & MFA routing protocols.', status: 'ACTIVE', statusBg: 'bg-emerald-50 dark:bg-emerald-900/30', statusText: 'text-emerald-600', borderColor: 'border-emerald-600', iconBg: 'bg-emerald-600', footer: ['Core Architecture', 'v1.2.0'], footerColor: 'text-emerald-600' },
    { icon: Cpu, name: 'Nexus Optimizer', desc: 'Manages global token density & multi-cloud cost delta.', status: 'ACTIVE', statusBg: 'bg-emerald-50 dark:bg-emerald-900/30', statusText: 'text-emerald-600', borderColor: 'border-emerald-600', iconBg: 'bg-emerald-600', footer: ['Platform Infra', 'v0.9.4'], footerColor: 'text-emerald-600' },
]
const fwAgents: AgentCard[] = [
    { icon: Scale, name: 'Lexicon Auditor', desc: 'Bespoke: Analyzes estate complexity & legal document integrity.', status: 'PROVISIONED', statusBg: 'bg-amber-50 dark:bg-amber-900/30', statusText: 'text-amber-600', borderColor: 'border-amber-600', iconBg: 'bg-amber-500', footer: ['Bespoke Domain', 'Legal Execution'], footerColor: 'text-amber-600', tenant: 'finalwishes' },
    { icon: PenTool, name: 'Witness Syncer', desc: 'Bespoke: Synchronizes cryptographic evidence for legal acks.', status: 'STANDBY', statusBg: 'bg-amber-50 dark:bg-amber-900/30', statusText: 'text-amber-600', borderColor: 'border-amber-600', iconBg: 'bg-amber-500', footer: ['Bespoke Domain', 'Signature Evidence'], footerColor: 'text-amber-600' },
]
const assAgents: AgentCard[] = [
    { icon: Home, name: 'Portfolio Valuator', desc: 'Bespoke: Predictive market yield & property valuations.', status: 'PENDING', statusBg: 'bg-blue-50 dark:bg-blue-900/30', statusText: 'text-blue-600', borderColor: 'border-blue-600', iconBg: 'bg-blue-600', footer: ['Bespoke Domain', 'Real Estate Delta'], footerColor: 'text-blue-600', tenant: 'assiduous', opacity: true },
    { icon: PieChart, name: 'Conversion Strategist', desc: 'Bespoke: Lead-to-Ledger conversion optimization agent.', status: 'QUEUED', statusBg: 'bg-blue-50 dark:bg-blue-900/30', statusText: 'text-blue-600', borderColor: 'border-blue-600', iconBg: 'bg-blue-600', footer: ['Bespoke Domain', 'User Acquisition'], footerColor: 'text-blue-600', opacity: true },
]

const tableRows = [
    { id: 'AS-01', name: 'Aegis Sentinel', tenant: 'Sirsi Master', tenantColor: 'text-slate-400', task: 'Global Firewall Audit', delta: '✓ 42ms', deltaColor: 'text-emerald-600', idBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100 dark:border-emerald-800' },
    { id: 'LA-04', name: 'Lexicon Auditor', tenant: 'finalwishes', tenantColor: 'text-amber-600', task: 'Complex Will Evaluation #FW-2026', delta: '▲ 1.4s', deltaColor: 'text-blue-600', idBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-100 dark:border-amber-800' },
]

function AgentCardComp({ agent }: { agent: AgentCard }) {
    const Icon = agent.icon as any
    return (
        <div className={`sirsi-card border-l-4 ${agent.borderColor} group hover:bg-emerald-50/5 dark:hover:bg-emerald-900/10 transition-all`} style={{ padding: 20, ...(agent.opacity ? { opacity: 0.8 } : {}) }}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${agent.iconBg} text-white rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={18} />
                </div>
                <div className="flex flex-col items-end">
                    <span className={`${agent.statusBg} ${agent.statusText}`} style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontStyle: 'italic' }}>{agent.status}</span>
                    {agent.tenant && <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Tenant: {agent.tenant}</span>}
                </div>
            </div>
            <h4 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>{agent.name}</h4>
            <p className="text-slate-400 dark:text-slate-500" style={{ fontSize: 10, fontWeight: 500, marginTop: 4, lineHeight: 1.6 }}>{agent.desc}</p>
            <div className="border-t border-slate-100 dark:border-slate-700" style={{ marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, fontWeight: 500 }}>
                <span className="text-slate-400 dark:text-slate-500">{agent.footer[0]}</span>
                <span className={agent.footerColor} style={{ fontStyle: 'italic' }}>{agent.footer[1]}</span>
            </div>
        </div>
    )
}

function AiAgents() {
    return (
        <div>
            <div className="page-header">
                <div className="flex justify-between items-end">
                    <div>
                        <h1>Agent Taskforce</h1>
                        <p className="page-subtitle">Orchestrating specialized AI entities deployed across the tenant portfolio.</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2" style={{ padding: '10px 24px' }}>
                        <Bot size={14} /> Deploy Specialized Agent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {[
                    { title: 'Platform Sentinels', agents: platformAgents },
                    { title: 'FinalWishes Operatives', agents: fwAgents },
                    { title: 'Assiduous Operatives', agents: assAgents },
                ].map(col => (
                    <div key={col.title}>
                        <h3 className="flex items-center gap-3 mb-6 text-slate-400 dark:text-slate-500" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            {col.title}
                            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        </h3>
                        <div className="space-y-4">
                            {col.agents.map(a => <AgentCardComp key={a.name} agent={a} />)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sirsi-table-wrap">
                <table className="sirsi-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>Agent Identity</th>
                            <th>Tenant Context</th>
                            <th>Active Task</th>
                            <th>Execution Delta</th>
                            <th style={{ textAlign: 'right', paddingRight: 24 }}>Routing Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.map(r => (
                            <tr key={r.id}>
                                <td style={{ paddingLeft: 24 }}>
                                    <div className="flex items-center gap-3">
                                        <div className={`${r.idBg} border`} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, fontStyle: 'italic' }}>{r.id}</div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">{r.name}</span>
                                    </div>
                                </td>
                                <td><span className={r.tenantColor} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>{r.tenant}</span></td>
                                <td className="text-slate-600 dark:text-slate-400" style={{ fontSize: 12, fontWeight: 500 }}>{r.task}</td>
                                <td><span className={r.deltaColor} style={{ fontSize: 9, fontWeight: 600 }}>{r.delta}</span></td>
                                <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                    <button className="text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <SlidersHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
