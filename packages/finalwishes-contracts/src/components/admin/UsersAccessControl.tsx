import { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { useUsers, useManageUserRole } from '../../hooks/useAdmin';
import { User } from '../../gen/proto/admin/v1/admin_pb';

const columnHelper = createColumnHelper<User>();

export function UsersAccessControl() {
    const { data, isLoading, error } = useUsers();
    const manageRole = useManageUserRole();

    const handleRoleChange = (userId: string, newRole: string) => {
        manageRole.mutate({ userId, role: newRole });
    };

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Full Name',
            cell: info => <span className="text-white font-medium">{info.getValue()}</span>,
        }),
        columnHelper.accessor('email', {
            header: 'Email Address',
            cell: info => <span className="text-blue-200/70 font-mono text-xs">{info.getValue()}</span>,
        }),
        columnHelper.accessor('role', {
            header: 'Access Role',
            cell: info => {
                const role = info.getValue();
                const userId = info.row.original.id;
                return (
                    <select
                        value={role}
                        onChange={(e) => handleRoleChange(userId, e.target.value)}
                        className="bg-black/40 text-gold border border-gold/30 rounded px-2 py-1 text-xs inter focus:outline-none focus:border-gold transition-colors"
                    >
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                    </select>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Security',
            cell: () => (
                <button className="text-[10px] text-slate-500 hover:text-red-400 uppercase tracking-widest font-bold transition-colors">
                    Revoke Access
                </button>
            ),
        }),
    ], [manageRole]);

    const tableData = useMemo(() => data?.users ?? [], [data]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) return <div className="text-gold inter animate-pulse">Scanning Personnel Ledger...</div>;
    if (error) return <div className="text-red-500 border border-red-500/20 bg-red-500/5 p-4 rounded-lg inter">Neural Link Failure: Unable to fetch user data</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-gold/20 pb-4">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">Access Control</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Manage system-wide permissions & roles</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-300 inter text-xs font-semibold">
                        Export Audit Log
                    </button>
                    <button className="px-6 py-2 bg-gold/10 border border-gold text-gold rounded-lg hover:bg-gold hover:text-navy transition-all duration-300 cinzel font-bold text-sm tracking-wider">
                        Invite Operator
                    </button>
                </div>
            </div>

            <div className="neo-glass-panel overflow-hidden border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-white/5 border-b border-white/10">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 cinzel text-[10px] text-gold/60 tracking-[0.2em] uppercase font-bold">
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
                            <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
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
                    <div className="p-12 text-center text-slate-500 inter italic">
                        No authorization records found.
                    </div>
                )}
            </div>
        </div>
    );
}
