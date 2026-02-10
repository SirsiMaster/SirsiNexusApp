// src/routes/contracts.tsx
import { createRoute } from '@tanstack/react-router'
import { useContracts } from '../hooks/useContractsService'
import { Route as rootRoute } from './__root'
import type { Contract } from '../gen/sirsi/contracts/v2/contract_service_pb'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/contracts',
    component: Contracts,
})

function Contracts() {
    const { data: contracts, isLoading } = useContracts("finalwishes") // Defaulting to finalwishes

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl">Contract Ledger</h1>
                    <p className="text-white/40 mt-1">Cross-Tenant Execution Tracking</p>
                </div>
                <button className="action-btn">New Contract</button>
            </header>

            <div className="glass-panel gold-border">
                <table className="w-full text-left">
                    <thead className="text-[10px] text-sirsi-gold uppercase tracking-[0.2em] bg-white/5">
                        <tr>
                            <th className="px-6 py-4">Contract</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Evidence</th>
                            <th className="px-6 py-4 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-white/20">Syncing with ledger...</td></tr>
                        ) : contracts?.map((contract: Contract) => (
                            <tr key={contract.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold flex items-center gap-2">
                                        {contract.projectName}
                                        <div className="w-1.5 h-1.5 rounded-full bg-sirsi-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-[10px] text-white/30 uppercase tracking-tighter">{contract.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">{contract.clientName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-sirsi-emerald shadow-[0_0_8px_#10B981]" />
                                        <span className="text-[10px] uppercase font-bold text-sirsi-emerald">Active</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-[10px] font-mono text-white/30 truncate max-w-[100px]">
                                        SHA-256: 8a3b...
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-sm font-bold">$2,500.00</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
