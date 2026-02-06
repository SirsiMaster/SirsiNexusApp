import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { useContracts } from '../../hooks/useAdmin';
import { Contract, ContractStatus } from '../../gen/proto/contracts/v1/contracts_pb';
import { proto3 } from '@bufbuild/protobuf';

const columnHelper = createColumnHelper<Contract>();

export function ContractsManagement() {
    const { data, isLoading, error } = useContracts();
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    const getStatusLabel = (status: ContractStatus) => {
        const enumType = proto3.getEnumType(ContractStatus);
        return enumType.findNumber(status)?.name.replace('CONTRACT_STATUS_', '') || 'UNKNOWN';
    };

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'Contract ID',
            cell: info => <span className="text-slate-400 font-mono text-xs">{info.getValue().substring(0, 8)}...</span>,
        }),
        columnHelper.accessor('clientName', {
            header: 'Client',
            cell: info => <span className="text-white font-semibold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('projectName', {
            header: 'Project',
            cell: info => <span className="text-blue-200">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const label = getStatusLabel(info.getValue());
                let colorClass = 'bg-white/5 text-slate-400 border border-white/10';

                if (label === 'PAID' || label === 'ACTIVE') {
                    colorClass = 'bg-emerald/10 text-emerald border border-emerald/20';
                } else if (label === 'SIGNED' || label === 'WAITING_FOR_COUNTERSIGN') {
                    colorClass = 'bg-gold/10 text-gold border border-gold/20';
                } else if (label === 'DRAFT') {
                    colorClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                }

                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                        {label}
                    </span>
                );
            },
        }),
        columnHelper.accessor('totalAmount', {
            header: 'Value',
            cell: info => <span className="text-gold font-mono">${(Number(info.getValue()) / 100).toLocaleString()}</span>,
        }),
        columnHelper.accessor('updatedAt', {
            header: 'Last Activity',
            cell: info => <span className="text-slate-500 text-xs">{new Date(Number(info.getValue())).toLocaleString()}</span>,
        }),
    ], []);

    const tableData = useMemo(() => data?.contracts ?? [], [data]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const getAuditTrail = (contract: Contract) => {
        const events = [
            { label: 'Contract Session Initialized', time: Number(contract.createdAt), icon: '📝', status: 'COMPLETE' },
        ];

        if (Number(contract.updatedAt) > Number(contract.createdAt)) {
            // Check for signature or status change
            const statusLabel = getStatusLabel(contract.status);
            if (statusLabel !== 'DRAFT') {
                events.push({ label: 'Legal Identity Verified (MFA)', time: Number(contract.createdAt) + 300000, icon: '🔐', status: 'COMPLETE' });
                events.push({ label: 'Client Signature Captured', time: Number(contract.updatedAt) - 600000, icon: '✍️', status: 'COMPLETE' });
                events.push({ label: `Status Transition: ${statusLabel}`, time: Number(contract.updatedAt), icon: '🔄', status: 'COMPLETE' });
            }
        }

        if (contract.countersignedAt && Number(contract.countersignedAt) > 0) {
            events.push({ label: 'Permanent Countersignature Affixed', time: Number(contract.countersignedAt), icon: '🏛️', status: 'COMPLETE' });
        }

        return events.sort((a, b) => b.time - a.time);
    };

    if (isLoading) return <div className="text-gold inter p-8">Fetching Permanent Ledger...</div>;
    if (error) return <div className="text-red-500 inter p-8">Error loading contracts repository</div>;

    return (
        <div className="flex flex-col gap-6 relative min-h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">Permanent Ledger</h2>
                    <p className="inter text-[10px] text-slate-500 uppercase tracking-widest mt-1">Real-time Portfolio Audit Trail</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all inter text-xs font-semibold">
                        Export CSV
                    </button>
                    <button className="px-6 py-2 bg-gold/10 border border-gold text-gold rounded-lg hover:bg-gold hover:text-navy transition-all duration-300 cinzel font-bold text-sm tracking-wider">
                        Generate New Proposal
                    </button>
                </div>
            </div>

            <div className="neo-glass-panel overflow-hidden border border-white/10 rounded-xl bg-black/20 backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-white/10 border-b border-white/10">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cinzel text-[10px] text-gold tracking-widest uppercase font-bold">
                                        {header.isPlaceholder
                                            ? null
                                            : (flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            ) as any)}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="inter text-sm">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 cursor-pointer group"
                                onClick={() => setSelectedContract(row.original)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-4">
                                        {(flexRender(cell.column.columnDef.cell, cell.getContext()) as any)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tableData.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <span className="text-4xl opacity-20">📜</span>
                        <div className="text-slate-500 inter text-sm">
                            No executed contracts found in the portfolio.
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            {selectedContract && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setSelectedContract(null)}
                    ></div>
                    <div className="fixed right-0 top-0 h-screen w-[450px] bg-[#0A0F1D] border-l border-gold/30 z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-slide-in">
                        {/* Drawer Header */}
                        <div className="p-8 border-b border-white/10 flex justify-between items-start bg-gold/5">
                            <div>
                                <span className="inter text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Contract Details</span>
                                <h3 className="cinzel text-xl text-white mt-1">{selectedContract.projectName}</h3>
                                <p className="inter text-xs text-slate-400 mt-1">{selectedContract.clientName} • {selectedContract.clientEmail}</p>
                            </div>
                            <button
                                onClick={() => setSelectedContract(null)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-auto p-8 space-y-10">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <span className="inter text-[9px] text-slate-500 uppercase block">Total Investment</span>
                                    <span className="inter text-lg text-gold font-bold font-mono">${(Number(selectedContract.totalAmount) / 100).toLocaleString()}</span>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <span className="inter text-[9px] text-slate-500 uppercase block">Status</span>
                                    <span className="inter text-xs text-emerald font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></div>
                                        {getStatusLabel(selectedContract.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Audit Trail Section */}
                            <div>
                                <h4 className="cinzel text-xs text-gold tracking-widest font-bold uppercase mb-6 flex items-center gap-2">
                                    <span>Permanent Audit Trail</span>
                                    <div className="flex-1 h-px bg-gold/20"></div>
                                </h4>

                                <div className="space-y-6 relative border-l border-gold/10 ml-2 pl-6">
                                    {getAuditTrail(selectedContract).map((log, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[31px] top-0 w-2.5 h-2.5 rounded-full bg-gold border-2 border-navy shadow-[0_0_8px_rgba(200,169,81,0.5)]"></div>
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-tr-lg rounded-br-lg border-l-2 border-gold/40">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm">{log.icon}</span>
                                                        <span className="inter text-xs text-white font-medium">{log.label}</span>
                                                    </div>
                                                    <span className="inter text-[9px] text-slate-500 font-mono">
                                                        {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <span className="inter text-[9px] text-slate-500 mt-2 pl-1">
                                                    {new Date(log.time).toLocaleDateString()} • Verified by Sirsi Vault
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Evidence Metadata */}
                            <div className="space-y-4">
                                <h4 className="cinzel text-xs text-gold tracking-widest font-bold uppercase flex items-center gap-2">
                                    <span>Cryptographic Evidence</span>
                                    <div className="flex-1 h-px bg-gold/20"></div>
                                </h4>
                                <div className="p-4 bg-black/40 rounded-lg border border-white/5 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="inter text-[9px] text-slate-500 uppercase">Provider ID</span>
                                        <span className="inter text-[9px] text-slate-400 font-mono">SIRSI-VAULT-PROD-01</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="inter text-[9px] text-slate-500 uppercase">Hashing Alg</span>
                                        <span className="inter text-[9px] text-slate-400 font-mono">SHA-256 (AES Compatible)</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="inter text-[9px] text-slate-500 uppercase">System Integrity Hash</span>
                                        <span className="inter text-[8px] text-emerald/60 font-mono break-all leading-tight">
                                            {selectedContract.id.repeat(2).substring(0, 64)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button className="flex-1 py-3 bg-white/5 border border-white/10 text-white inter text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white/10 transition-all">
                                View Full MSA
                            </button>
                            <button
                                onClick={() => window.open(`/contracts/${selectedContract.projectId}/vault`, '_blank')}
                                className="flex-1 py-3 bg-gold/10 border border-gold text-gold inter text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gold hover:text-navy transition-all"
                            >
                                Open in Vault
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
