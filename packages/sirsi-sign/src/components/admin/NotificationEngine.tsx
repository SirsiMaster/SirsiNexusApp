import { useState, useMemo } from 'react';
import { useNotifications, useSendNotification } from '../../hooks/useAdmin';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { Notification } from '../../gen/proto/admin/v1/admin_pb';

const columnHelper = createColumnHelper<Notification>();

export function NotificationEngine() {
    const { data: history } = useNotifications();
    const sendNotification = useSendNotification();

    const [recipient, setRecipient] = useState('all');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('info');
    const [channel, setChannel] = useState('in_app');

    const handleSend = () => {
        if (!title || !body) return;
        sendNotification.mutate({
            recipientId: recipient,
            title,
            body,
            type,
            channel
        }, {
            onSuccess: () => {
                setTitle('');
                setBody('');
                alert('Broadcast Dispatched Successfully');
            }
        });
    };

    const columns = useMemo(() => [
        columnHelper.accessor('title', {
            header: 'Subject',
            cell: info => <span className="text-white font-medium">{info.getValue()}</span>,
        }),
        columnHelper.accessor('recipientId', {
            header: 'Recipient',
            cell: info => <span className="text-blue-200/60 font-mono text-xs uppercase">{info.getValue()}</span>,
        }),
        columnHelper.accessor('type', {
            header: 'Type',
            cell: info => (
                <span className={`text-[10px] font-bold uppercase ${info.getValue() === 'warning' ? 'text-yellow-400' :
                    info.getValue() === 'error' ? 'text-red-400' : 'text-emerald'
                    }`}>
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('sentAt', {
            header: 'Timestamp',
            cell: info => <span className="text-slate-500 text-xs">{new Date(Number(info.getValue()) * 1000).toLocaleString()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => <span className="inter text-[10px] text-slate-400 italic">{info.getValue()}</span>,
        }),
    ], []);

    const tableData = useMemo(() => history?.notifications ?? [], [history]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gold/20 pb-4">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">Omni-notify Engine</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Multi-channel broadcast control</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl flex flex-col gap-4">
                        <h3 className="cinzel text-xs text-gold tracking-widest font-bold uppercase">Dispatch Composer</h3>

                        <div className="flex flex-col gap-1">
                            <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Recipient Scope</label>
                            <input
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg p-3 text-white inter text-sm focus:border-gold/50 outline-none"
                                placeholder="User ID or 'all'"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Headline</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg p-3 text-white inter text-sm focus:border-gold/50 outline-none"
                                placeholder="Notification Title"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Message Content</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg p-3 text-white inter text-sm focus:border-gold/50 outline-none min-h-[100px]"
                                placeholder="What is the message?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Severity</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg p-3 text-white inter text-sm outline-none"
                                >
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Priority Channel</label>
                                <select
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg p-3 text-white inter text-sm outline-none"
                                >
                                    <option value="in_app">In-App</option>
                                    <option value="push">Push Notif</option>
                                    <option value="email">Email Hub</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={sendNotification.isPending}
                            className="mt-4 px-6 py-3 bg-gold text-navy cinzel font-bold tracking-widest uppercase text-xs rounded-lg hover:bg-gold-bright transition-all disabled:opacity-50"
                        >
                            {sendNotification.isPending ? 'Dispatching...' : 'Dispatch Signal →'}
                        </button>
                    </div>
                </div>

                {/* Audit Log / History */}
                <div className="lg:col-span-2">
                    <div className="neo-glass-panel border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="cinzel text-xs text-slate-300 tracking-widest font-bold uppercase">Transmission Audit Log</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            headerGroup.headers.map(header => (
                                                <th key={header.id} className="p-4 cinzel text-[9px] text-gold/40 tracking-[0.2em] uppercase font-bold">
                                                    {(flexRender(header.column.columnDef.header, header.getContext()) as any)}
                                                </th>
                                            ))
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="inter text-sm">
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
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
                                <div className="p-12 text-center text-slate-600 inter italic text-xs">
                                    No transmission history found in the ledger.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
