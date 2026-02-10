// src/routes/users.tsx
import { createRoute } from '@tanstack/react-router'
import { useUsers } from '../hooks/useAdminService'
import { Route as rootRoute } from './__root'
import type { User } from '../gen/sirsi/admin/v2/admin_service_pb'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/users',
    component: Users,
})

function Users() {
    const { data: users, isLoading } = useUsers("finalwishes") // Defaulting to finalwishes for now

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl">Access Control</h1>
                    <p className="text-white/40 mt-1">Identity & RBAC Management</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white/5 border border-white/10 rounded px-4 py-2 text-xs focus:border-sirsi-gold outline-none">
                        <option value="finalwishes">FinalWishes (Default)</option>
                    </select>
                    <button className="action-btn">Invite User</button>
                </div>
            </header>

            <div className="glass-panel gold-border">
                <table className="w-full text-left">
                    <thead className="text-[10px] text-sirsi-gold uppercase tracking-[0.2em] bg-white/5">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Permissions</th>
                            <th className="px-6 py-4 text-right">Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-white/20">Loading permissions...</td></tr>
                        ) : users?.map((user: User) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-tighter">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase border ${user.role === 'Admin' ? 'bg-sirsi-emerald/20 text-sirsi-emerald border-sirsi-emerald/30' : 'bg-white/10 text-white/60 border-white/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-white/40">
                                    all:manage, contracts:write, vault:delete
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-sirsi-gold hover:underline text-xs">Revoke</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
