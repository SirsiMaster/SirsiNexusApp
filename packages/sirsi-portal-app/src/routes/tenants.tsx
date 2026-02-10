// src/routes/tenants.tsx
import { createRoute } from '@tanstack/react-router'
import { useTenants } from '../hooks/useTenantService'
import { Route as rootRoute } from './__root'
import type { Tenant } from '../gen/sirsi/admin/v2/tenant_pb'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/tenants',
    component: Tenants,
})

function Tenants() {
    const { data: tenants, isLoading } = useTenants()

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl">Tenant Registry</h1>
                    <p className="text-white/40 mt-1">Multi-tenant Project Isolation & Branding</p>
                </div>
                <button className="action-btn">Add Tenant</button>
            </header>

            <div className="glass-panel gold-border">
                <table className="w-full text-left">
                    <thead className="text-[10px] text-sirsi-gold uppercase tracking-[0.2em] bg-white/5">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-white/20">Loading registry...</td></tr>
                        ) : tenants?.map((tenant: Tenant) => (
                            <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-bold">{tenant.name}</td>
                                <td className="px-6 py-4 text-white/40">{tenant.slug}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-sirsi-emerald/20 text-sirsi-emerald border border-sirsi-emerald/30 uppercase">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-white/40">Feb 10, 2026</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-sirsi-gold hover:underline text-xs">Configure</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
