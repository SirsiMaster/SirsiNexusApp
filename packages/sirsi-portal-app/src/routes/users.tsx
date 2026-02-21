// src/routes/users.tsx
import { createRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useUsers } from '../hooks/useAdminService'
import { Route as rootRoute } from './__root'
import { Search as SearchIcon, MoreVertical as MoreVerticalIcon } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/users',
    component: Users,
})

const SearchComp = SearchIcon as any
const MoreVerticalComp = MoreVerticalIcon as any

function Users() {
    const [selectedTenant, setSelectedTenant] = useState("finalwishes")
    const { data: users, isLoading } = useUsers(selectedTenant)
    const [searchQuery, setSearchQuery] = useState("")

    if (isLoading) return <div className="p-8 text-gray-400 uppercase tracking-widest text-[10px]">Loading Identity Management...</div>

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm tracking-wide">Identity & RBAC Access Control Hub</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                    >
                        <option value="finalwishes">FinalWishes</option>
                        <option value="assiduous">Assiduous</option>
                    </select>
                    <button className="btn-primary flex items-center gap-2">
                        <span>+</span>
                        <span>Add New User</span>
                    </button>
                </div>
            </header>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Identities" value={users?.length.toString() || "0"} icon="👥" color="text-blue-600" />
                <StatCard title="Active Sessions" value={users?.filter((u: any) => u.status === 'active').length.toString() || "0"} icon="🟢" color="text-emerald-600" />
                <StatCard title="Pending Invite" value="12" icon="✉️" color="text-amber-600" />
                <StatCard title="Flagged Actions" value="0" icon="🚩" color="text-red-600" />
            </div>

            {/* Action Bar */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <SearchComp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Bulk Actions</button>
                    <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Export CSV</button>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">User Identity</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Access Role</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Activity</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {users?.filter((u: any) =>
                            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-600 font-bold text-xs border border-emerald-600/20">
                                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{user.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded ring-1 ring-gray-200 dark:ring-slate-700 uppercase tracking-tighter">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.status === 'active'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-800/30'
                                        : 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-800/30'
                                        }`}>
                                        <span className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs text-gray-500 dark:text-slate-400">2 hours ago</span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="text-gray-400 hover:text-emerald-600 p-2 transition-colors">
                                        <MoreVerticalComp className="w-4 h-4" />
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

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xl`}>
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</div>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                </div>
            </div>
        </div>
    )
}
