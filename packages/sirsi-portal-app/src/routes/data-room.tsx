/**
 * Data Room Management — Pixel-perfect port of data-room/index.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card, sirsi-table-wrap, sirsi-table, sirsi-badge, btn-primary, btn-secondary
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import {
    FolderOpen, History, HardDrive, Globe, Search,
    Eye, Download, Trash2, FileText, Shield, GitBranch, Upload
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/data-room',
    component: DataRoom,
})

const statCards = [
    { label: 'Total Artifacts', icon: FolderOpen, value: '8', note: '✓ Indexed and searchable' },
    { label: 'Recent Syncs', icon: History, value: '3', note: '▲ Within last 7 cycles' },
    { label: 'Vault Volume', icon: HardDrive, value: '14 MB', note: '✓ Storage utilization: 2%' },
    { label: 'Live Assets', icon: Globe, value: '6', note: '✓ Investor visibility active' },
]

const documents = [
    { icon: FileText, name: 'Financial Report Q4 2025', id: '#DR-2025-092 • 2.4 MB', category: 'Financial', access: 'Restricted', accessClass: 'sirsi-badge-warning', date: 'Jan 10, 2026' },
    { icon: Shield, name: 'SOC 2 Compliance Framework', id: '#DR-2025-081 • 1.8 MB', category: 'Legal', access: 'Confidential', accessClass: 'sirsi-badge-error', date: 'Jan 05, 2026' },
    { icon: GitBranch, name: 'Platform Scaling Specification', id: '#DR-2026-004 • 3.2 MB', category: 'Technical', access: 'Operational', accessClass: 'sirsi-badge-success', date: 'Feb 28, 2026' },
]

const filters = ['All', 'Financial', 'Legal', 'Technical']

function DataRoom() {
    const [activeFilter, setActiveFilter] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div>
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>Data Room Management</h1>
                    <p className="page-subtitle">Governance of the secure investor document registry and due diligence artifacts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2" style={{ padding: '10px 24px' }}>
                        <Download size={14} /> Export Registry
                    </button>
                    <button className="btn-primary flex items-center gap-2" style={{ padding: '10px 24px' }}>
                        <Upload size={14} /> Ingest Document
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map(card => {
                    const Icon = card.icon as any
                    return (
                        <div key={card.label} className="sirsi-card">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</span>
                                <Icon size={16} className="text-emerald-600" />
                            </div>
                            <div className="text-slate-900 dark:text-slate-100" style={{ fontSize: 30, fontWeight: 600 }}>{card.value}</div>
                            <div className="text-emerald-600" style={{ fontSize: 9, fontWeight: 500, marginTop: 8, fontStyle: 'italic' }}>{card.note}</div>
                        </div>
                    )
                })}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between sirsi-card">
                <div style={{ position: 'relative', flex: 1, maxWidth: 448, width: '100%' }}>
                    <Search size={16} className="text-slate-400 dark:text-slate-500" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search identities, tags, or CID hashes..."
                        className="bg-slate-50 dark:bg-slate-700 border border-transparent dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        style={{ width: '100%', paddingLeft: 48, paddingRight: 16, padding: '10px 16px 10px 48px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                    {filters.map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} className={
                            activeFilter === f
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                        } style={{
                            padding: '8px 16px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                            borderRadius: 8, border: 'none', cursor: 'pointer',
                        }}>{f}</button>
                    ))}
                </div>
            </div>

            {/* Documents Table */}
            <div className="sirsi-table-wrap">
                <table className="sirsi-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>Document Registry</th>
                            <th>Class</th>
                            <th>Protocol Level</th>
                            <th>Sync State</th>
                            <th style={{ textAlign: 'right', paddingRight: 24 }}>System Proxy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => {
                            const Icon = doc.icon as any
                            return (
                                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td style={{ paddingLeft: 24, paddingTop: 20, paddingBottom: 20 }}>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800" style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon size={16} />
                                            </div>
                                            <div>
                                                <div className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 500 }}>{doc.name}</div>
                                                <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>ID: {doc.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="text-slate-500 dark:text-slate-400" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{doc.category}</span></td>
                                    <td><span className={`sirsi-badge ${doc.accessClass}`}>{doc.access}</span></td>
                                    <td><span className="text-slate-400 dark:text-slate-500" style={{ fontSize: 12, fontWeight: 500 }}>{doc.date}</span></td>
                                    <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                        <div className="flex gap-2 justify-end">
                                            <button className="text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Eye size={16} /></button>
                                            <button className="text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Download size={16} /></button>
                                            <button className="text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
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
