/**
 * User Management — Pixel-perfect port of admin/users/index.html
 * 
 * Structure: page-header → 4 stat cards → action bar (search + buttons) → table → pagination
 * Typography: Inter, body ≤ 500 weight (Rule 21)
 */

import { createRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Route as rootRoute } from './__root'
import {
    Users, UserCheck, Clock, ShieldCheck,
    Search, Plus, Download, Fingerprint, Trash2
} from 'lucide-react'
import { useUsers } from '../hooks/useAdminService'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/users',
    component: UsersPage,
})

// ── Fallback sample data ──────────────────────────────────────────
interface User {
    id: number
    name: string
    email: string
    status: 'active' | 'pending' | 'inactive'
    role: string
}

const fallbackUsers: User[] = [
    { id: 101, name: 'Cylton Collymore', email: 'cylton@sirsi.ai', status: 'active', role: 'super-admin' },
    { id: 102, name: 'John Doe', email: 'j.doe@example.com', status: 'active', role: 'investor' },
    { id: 103, name: 'Jane Smith', email: 'j.smith@nexus.co', status: 'pending', role: 'partner' },
    { id: 104, name: 'Robert Vance', email: 'rvance@sirsi.ai', status: 'active', role: 'admin' },
    { id: 105, name: 'Alice Cooper', email: 'a.cooper@rock.com', status: 'inactive', role: 'investor' },
]

// ── Component ─────────────────────────────────────────────────────
function UsersPage() {
    // Live data from Go backend (ConnectRPC)
    const { data: backendUsers, isLoading } = useUsers()

    const [users, setUsers] = useState<User[]>(fallbackUsers)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Form state
    const [formName, setFormName] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formRole, setFormRole] = useState('investor')
    const [formStatus, setFormStatus] = useState('active')

    // Sync backend users into local state on load
    useEffect(() => {
        if (backendUsers && backendUsers.length > 0) {
            const mapped: User[] = backendUsers.map((u: any, i: number) => ({
                id: i + 101,
                name: u.name || 'Unknown',
                email: u.email || '',
                status: (u.role === 'Admin' ? 'active' : 'pending') as User['status'],
                role: u.role?.toLowerCase() || 'investor',
            }))
            // Merge: backend users first, then append any local-only additions
            setUsers(prev => {
                const backendEmails = new Set(mapped.map(u => u.email))
                const localOnly = prev.filter(u => !backendEmails.has(u.email) && !fallbackUsers.some(f => f.email === u.email))
                return [...mapped, ...localOnly]
            })
        }
    }, [backendUsers])

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Stats
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === 'active').length
    const pendingUsers = users.filter(u => u.status === 'pending').length
    const adminUsers = users.filter(u => u.role.includes('admin')).length

    const openNewUser = () => {
        setEditingUser(null)
        setFormName('')
        setFormEmail('')
        setFormRole('investor')
        setFormStatus('active')
        setShowModal(true)
    }

    const openEditUser = (user: User) => {
        setEditingUser(user)
        setFormName(user.name)
        setFormEmail(user.email)
        setFormRole(user.role)
        setFormStatus(user.status)
        setShowModal(true)
    }

    const saveUser = () => {
        if (editingUser) {
            setUsers(prev => prev.map(u =>
                u.id === editingUser.id
                    ? { ...u, name: formName, email: formEmail, role: formRole, status: formStatus as User['status'] }
                    : u
            ))
        } else {
            const newId = Math.max(...users.map(u => u.id)) + 1
            setUsers(prev => [...prev, { id: newId, name: formName, email: formEmail, role: formRole, status: formStatus as User['status'] }])
        }
        setShowModal(false)
    }

    const deleteUser = (id: number) => {
        if (confirm('Authorized request: Proceed with identity purge?')) {
            setUsers(prev => prev.filter(u => u.id !== id))
        }
    }

    return (
        <div>
            {/* ── Page Header ──────────────────────────────────── */}
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>User Management</h1>
                    <p className="page-subtitle">
                        Unified registry for platform identities, role synchronization, and security assertions
                    </p>
                </div>
                {isLoading && (
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider animate-pulse">Syncing registry...</span>
                )}
            </div>

            {/* ── User Statistics (4 cards) ────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={Users} value={totalUsers} label="Total Registry" color="emerald" />
                <StatCard icon={UserCheck} value={activeUsers} label="Synchronized" color="emerald" />
                <StatCard icon={Clock} value={pendingUsers} label="Awaiting Verification" color="amber" />
                <StatCard icon={ShieldCheck} value={adminUsers} label="Privileged" color="emerald" />
            </div>

            {/* ── Action Bar ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                <div className="flex-1 relative w-full">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                        placeholder="Filter identities by name, email, or system ID..."
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="btn-primary flex items-center gap-2 whitespace-nowrap px-6 py-3" onClick={openNewUser}>
                        <Plus size={12} />
                        Provision Identity
                    </button>
                    <button className="btn-secondary flex items-center gap-2 whitespace-nowrap px-6 py-3">
                        <Download size={12} />
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* ── User Table ───────────────────────────────────── */}
            <div className="sirsi-table-wrap">
                <table className="sirsi-table">
                    <thead>
                        <tr>
                            <th className="ps-6">ID</th>
                            <th>Identity</th>
                            <th>Email Address</th>
                            <th>Status</th>
                            <th>Role Proxy</th>
                            <th className="text-right pe-6">System Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                <td className="ps-6 font-mono text-[11px] text-gray-400">#{user.id}</td>
                                <td className="font-medium text-gray-900">{user.name}</td>
                                <td className="text-gray-500 font-medium">{user.email}</td>
                                <td>
                                    <span className={`sirsi-badge ${user.status === 'active' ? 'sirsi-badge-success' :
                                        user.status === 'pending' ? 'sirsi-badge-warning' :
                                            'sirsi-badge-error'
                                        }`}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                                        {user.role.replace('-', ' ')}
                                    </span>
                                </td>
                                <td className="text-right pe-6 space-x-2">
                                    <button
                                        onClick={() => openEditUser(user)}
                                        className="text-gray-300 hover:text-emerald-600 transition-colors"
                                    >
                                        <Fingerprint size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        className="text-gray-300 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination Footer ────────────────────────────── */}
            <div className="mt-6 flex items-center justify-between px-2">
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Showing 1 to {filteredUsers.length} of {users.length} Entries
                </div>
            </div>

            {/* ── Modal: Identity Provisioning ─────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-widest italic">
                                {editingUser ? 'Re-provisioning Entry' : 'Identity Provisioning'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Email Identity</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Assigned Role</label>
                                    <select value={formRole} onChange={e => setFormRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                                        <option value="investor">Investor</option>
                                        <option value="partner">Partner</option>
                                        <option value="admin">Administrator</option>
                                        <option value="super-admin">Super Administrator</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active State</label>
                                    <select value={formStatus} onChange={e => setFormStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                                        <option value="active">Operational</option>
                                        <option value="pending">Awaiting Sync</option>
                                        <option value="inactive">Deactivated</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveUser} className="btn-primary px-8 py-2.5">
                                Confirm Identity
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color }: {
    icon: any; value: number; label: string; color: 'emerald' | 'amber'
}) {
    const colorMap = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    }
    const c = colorMap[color]

    return (
        <div className="sirsi-card">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                </div>
            </div>
        </div>
    )
}
