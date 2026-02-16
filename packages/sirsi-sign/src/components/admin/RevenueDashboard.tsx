import { useState, useEffect } from 'react';

interface Transaction {
    transactionId: string;
    description: string;
    amount: string | number;
    timestamp: string;
    category: 'business' | 'personal';
    status?: string;
    payerName?: string;
}

interface Invoice {
    invoiceNumber: string;
    clientName?: string;
    companyName?: string;
    service: string;
    amount: string | number;
    timestamp: string;
    category: 'business' | 'personal';
    description?: string;
}

export function RevenueDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filter, setFilter] = useState<'all' | 'business' | 'personal'>('all');

    useEffect(() => {
        // Load from localStorage to match legacy parity for now
        // In the future, this will move to Firestore/Go API
        const allTransactions: Transaction[] = [];
        const allInvoices: Invoice[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('transaction-')) {
                const t = JSON.parse(localStorage.getItem(key)!);
                allTransactions.push({ ...t, category: 'business' });
            } else if (key?.startsWith('personal-transaction-')) {
                const t = JSON.parse(localStorage.getItem(key)!);
                allTransactions.push({ ...t, category: 'personal' });
            } else if (key?.startsWith('invoice-request-')) {
                const inv = JSON.parse(localStorage.getItem(key)!);
                allInvoices.push({ ...inv, category: 'business' });
            } else if (key?.startsWith('personal-invoice-')) {
                const inv = JSON.parse(localStorage.getItem(key)!);
                allInvoices.push({ ...inv, category: 'personal' });
            }
        }

        setTransactions(allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setInvoices(allInvoices.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, []);

    const filteredTransactions = transactions.filter(t => filter === 'all' || t.category === filter);

    const stats = {
        total: transactions.reduce((acc, t) => acc + parseFloat(t.amount as string), 0),
        business: transactions.filter(t => t.category === 'business').reduce((acc, t) => acc + parseFloat(t.amount as string), 0),
        personal: transactions.filter(t => t.category === 'personal').reduce((acc, t) => acc + parseFloat(t.amount as string), 0),
        count: transactions.length
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">Revenue & Tax Tracking</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Financial settlement and tax preparation ledger</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-all">Export CSV</button>
                    <button className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg text-[10px] uppercase font-bold text-gold hover:bg-gold/20 transition-all">Prepare Tax Export</button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald/5 blur-2xl rounded-full -mr-8 -mt-8"></div>
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest">Total Revenue</span>
                    <span className="cinzel text-2xl font-bold text-white">${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl flex flex-col gap-2">
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest">Sirsi Business</span>
                    <span className="cinzel text-2xl font-bold text-emerald">${stats.business.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl flex flex-col gap-2">
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest">Collymore Consulting</span>
                    <span className="cinzel text-2xl font-bold text-blue-400">${stats.personal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="neo-glass-panel p-6 border border-white/10 rounded-xl flex flex-col gap-2">
                    <span className="inter text-[10px] text-slate-400 uppercase tracking-widest">Transactions</span>
                    <span className="cinzel text-2xl font-bold text-gold">{stats.count}</span>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="neo-glass-panel border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">Recent Ledger Transactions</h3>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="bg-black/40 border border-white/10 rounded px-3 py-1 inter text-[10px] text-slate-300 uppercase focus:outline-none focus:border-gold/50"
                    >
                        <option value="all">All Channels</option>
                        <option value="business">Sirsi Business</option>
                        <option value="personal">Collymore Consulting</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left inter text-xs">
                        <thead className="bg-black/20 text-slate-500 uppercase text-[9px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Ref ID</th>
                                <th className="px-6 py-4 font-bold">Description</th>
                                <th className="px-6 py-4 font-bold">Channel</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTransactions.length > 0 ? filteredTransactions.map((t, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-slate-300">{new Date(t.timestamp).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-mono text-gold opacity-70 group-hover:opacity-100">{t.transactionId}</td>
                                    <td className="px-6 py-4 text-white capitalize">{t.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${t.category === 'business' ? 'bg-blue-500/10 text-blue-400 border border-blue-400/20' : 'bg-emerald/10 text-emerald border border-emerald/20'
                                            }`}>
                                            {t.category === 'business' ? 'Sirsi' : 'Consulting'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">${parseFloat(t.amount as string).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="flex items-center justify-end gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span>
                                            <span className="text-[9px] text-emerald uppercase font-bold">{t.status || 'Verified'}</span>
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 inter italic">No transactions found in this channel.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoices Section */}
            <div className="neo-glass-panel border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="cinzel text-sm text-gold tracking-[0.2em] font-bold uppercase">Open Payment Requests</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left inter text-xs">
                        <thead className="bg-black/20 text-slate-500 uppercase text-[9px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-bold">Request Date</th>
                                <th className="px-6 py-4 font-bold">Inv #</th>
                                <th className="px-6 py-4 font-bold">Client</th>
                                <th className="px-6 py-4 font-bold">Service</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold text-right">Channel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.length > 0 ? invoices.map((inv, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-slate-300">{new Date(inv.timestamp).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-mono text-white">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4 text-slate-300">{inv.clientName || inv.companyName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-white capitalize">{inv.service}</td>
                                    <td className="px-6 py-4 font-bold text-white">${parseFloat(inv.amount as string).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${inv.category === 'business' ? 'bg-blue-500/10 text-blue-400 border border-blue-400/20' : 'bg-emerald/10 text-emerald border border-emerald/20'
                                            }`}>
                                            {inv.category === 'business' ? 'Sirsi' : 'Consulting'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 inter italic">No pending payment requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
