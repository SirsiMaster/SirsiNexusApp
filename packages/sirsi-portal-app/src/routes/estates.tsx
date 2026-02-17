// src/routes/estates.tsx
import { createRoute } from '@tanstack/react-router'
import { useEstates } from '../hooks/useAdminService'
import { Route as rootRoute } from './__root'
import type { Estate } from '../gen/sirsi/admin/v2/estate_pb'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/estates',
    component: Estates,
})

function Estates() {
    const { data: estates, isLoading } = useEstates()

    const getPhaseColor = (phase: number) => {
        switch (phase) {
            case 1: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'; // PLANNING
            case 2: return 'text-sirsi-gold bg-sirsi-gold/10 border-sirsi-gold/20'; // FUNDING
            case 3: return 'text-sirsi-emerald bg-sirsi-emerald/10 border-sirsi-emerald/20'; // DISTRIBUTION
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    }

    const getPhaseLabel = (phase: number) => {
        switch (phase) {
            case 1: return 'Planning';
            case 2: return 'Funding';
            case 3: return 'Distribution';
            case 4: return 'Closed';
            default: return 'Unknown';
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-serif text-sirsi-gold tracking-widest uppercase">Estate Management</h1>
                    <p className="text-white/40 mt-2 text-sm tracking-wide">Legacy Orchestration & Wealth Preservation Hub</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 border border-white/10 text-white/60 text-xs hover:border-sirsi-gold transition-colors uppercase tracking-widest">
                        Export Audit
                    </button>
                    <button className="action-btn">
                        New Estate Ledger
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel text-center py-8">
                    <div className="text-[10px] text-sirsi-gold uppercase tracking-[0.3em] mb-2 opacity-60">Total AUM</div>
                    <div className="text-3xl font-serif">$42.8M</div>
                </div>
                <div className="glass-panel text-center py-8">
                    <div className="text-[10px] text-sirsi-gold uppercase tracking-[0.3em] mb-2 opacity-60">Active Estates</div>
                    <div className="text-3xl font-serif">{estates?.length || 0}</div>
                </div>
                <div className="glass-panel text-center py-8">
                    <div className="text-[10px] text-sirsi-gold uppercase tracking-[0.3em] mb-2 opacity-60">Realization Rate</div>
                    <div className="text-3xl font-serif text-sirsi-emerald">94.2%</div>
                </div>
            </div>

            <div className="glass-panel gold-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="text-[10px] text-sirsi-gold uppercase tracking-[0.2em] bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-8 py-5">Estate Entity</th>
                            <th className="px-8 py-5">Principal Owner</th>
                            <th className="px-8 py-5">Phase Status</th>
                            <th className="px-8 py-5">Asset Valuation</th>
                            <th className="px-8 py-5 text-right">Ledger</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-white/20 italic tracking-widest">Querying Permanent Ledger...</td></tr>
                        ) : estates?.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-20 text-center text-white/40">No active estate entities found in this jurisdiction.</td></tr>
                        ) : estates?.map((estate: Estate) => (
                            <tr key={estate.id} className="group hover:bg-white/5 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-white group-hover:text-sirsi-gold transition-colors">{estate.name}</div>
                                    <div className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">ID: {estate.id.slice(0, 8)}...</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm">{estate.ownerEmail}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] border uppercase tracking-widest ${getPhaseColor(estate.phase)}`}>
                                        {getPhaseLabel(estate.phase)}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="font-mono text-sirsi-gold">
                                        ${(Number(estate.valuation?.amountCents || 0) / 100).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-white/40 hover:text-sirsi-gold hover:underline text-xs uppercase tracking-widest transition-colors">
                                        Inspect Hub →
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
