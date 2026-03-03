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
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</span>
                                <Icon size={16} style={{ color: '#059669' }} />
                            </div>
                            <div style={{ fontSize: 30, fontWeight: 600, color: '#111827' }}>{card.value}</div>
                            <div style={{ fontSize: 9, color: '#059669', fontWeight: 500, marginTop: 8, fontStyle: 'italic' }}>{card.note}</div>
                        </div>
                    )
                })}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between" style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 448, width: '100%' }}>
                    <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search identities, tags, or CID hashes..."
                        style={{ width: '100%', paddingLeft: 48, paddingRight: 16, padding: '10px 16px 10px 48px', background: '#f9fafb', border: '1px solid transparent', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                    {filters.map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} style={{
                            padding: '8px 16px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                            borderRadius: 8, border: 'none', cursor: 'pointer',
                            ...(activeFilter === f
                                ? { background: '#059669', color: 'white', boxShadow: '0 4px 6px rgba(5,150,105,0.1)' }
                                : { background: '#f9fafb', color: '#9ca3af' }),
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
                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td style={{ paddingLeft: 24, paddingTop: 20, paddingBottom: 20 }}>
                                        <div className="flex items-center gap-4">
                                            <div style={{ width: 40, height: 40, background: '#ecfdf5', color: '#059669', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1fae5' }}>
                                                <Icon size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#111827' }}>{doc.name}</div>
                                                <div style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>ID: {doc.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{doc.category}</span></td>
                                    <td><span className={`sirsi-badge ${doc.accessClass}`}>{doc.access}</span></td>
                                    <td><span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>{doc.date}</span></td>
                                    <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                        <div className="flex gap-2 justify-end">
                                            <button style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-emerald-600 transition-colors"><Eye size={16} /></button>
                                            <button style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-blue-600 transition-colors"><Download size={16} /></button>
                                            <button style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
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
