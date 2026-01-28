import { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { useEstates } from '../../hooks/useAdmin';
import { Estate } from '../../gen/proto/admin/v1/admin_pb';

const columnHelper = createColumnHelper<Estate>();

export function EstatesManagement() {
    const { data, isLoading, error } = useEstates();

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => <span className="text-slate-400 font-mono text-xs">{info.getValue()}</span>,
        }),
        columnHelper.accessor('name', {
            header: 'Estate Name',
            cell: info => <span className="text-white font-semibold">{info.getValue()}</span>,
        }),
        columnHelper.accessor('ownerName', {
            header: 'Owner',
            cell: info => <span className="text-blue-200">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${info.getValue() === 'Active' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: info => <span className="text-slate-500">{new Date(Number(info.getValue()) * 1000).toLocaleDateString()}</span>,
        }),
    ], []);

    const tableData = useMemo(() => data?.estates ?? [], [data]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) return <div className="text-gold inter">Loading Estates...</div>;
    if (error) return <div className="text-red-500 inter">Error loading estates</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="cinzel text-2xl text-gold tracking-widest">Estates Management</h2>
                <button className="px-6 py-2 bg-gold/10 border border-gold text-gold rounded-lg hover:bg-gold hover:text-navy transition-all duration-300 cinzel font-bold text-sm tracking-wider">
                    Add New Estate
                </button>
            </div>

            <div className="neo-glass-panel overflow-hidden border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-white/5 border-b border-white/10">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cinzel text-xs text-gold tracking-widest uppercase font-bold">
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
                            <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 cursor-pointer">
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
                    <div className="p-12 text-center text-slate-500 inter">
                        No estates found in the permanent ledger.
                    </div>
                )}
            </div>
        </div>
    );
}
