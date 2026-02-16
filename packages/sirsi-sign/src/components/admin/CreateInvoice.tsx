import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCode = QRCodeSVG as any;

export function CreateInvoice() {
    const [invoiceNum, setInvoiceNum] = useState('');
    const [amount, setAmount] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        setDueDate(defaultDueDate.toISOString().split('T')[0]);

        const num = 'SIRSI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3);
        setInvoiceNum(num);
    }, []);

    const handleCreate = () => {
        if (!invoiceNum || !amount || !clientName || !clientEmail || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        const invoice = {
            number: invoiceNum,
            amount: parseFloat(amount),
            client: clientName,
            email: clientEmail,
            service: description,
            date: new Date().toISOString(),
            dueDate: dueDate
        };

        const invoiceData = encodeURIComponent(JSON.stringify(invoice));
        const link = `${window.location.origin}/pay.html?invoice=${invoiceData}`;

        setGeneratedLink(link);
        setShowResults(true);

        // Store for records (Legacy Parity)
        localStorage.setItem('invoice-' + invoiceNum, JSON.stringify({
            ...invoice,
            type: 'sirsi-invoice',
            status: 'created',
            paymentLink: link,
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString() // for revenue dashboard sorting
        }));
    };

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        alert('Payment link copied to clipboard.');
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div>
                <h2 className="cinzel text-2xl text-gold tracking-widest">Invoice Creator</h2>
                <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Generate professional multi-channel billing requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Form */}
                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="inter text-[10px] text-slate-400 uppercase tracking-widest">Invoice #</label>
                            <input
                                value={invoiceNum}
                                onChange={e => setInvoiceNum(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-sm text-white focus:outline-none focus:border-gold/50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="inter text-[10px] text-slate-400 uppercase tracking-widest">Amount ($USD)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-sm text-white focus:outline-none focus:border-gold/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="inter text-[10px] text-slate-400 uppercase tracking-widest">Client Identity</label>
                        <input
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                            placeholder="Individual or Corporate Name"
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-sm text-white focus:outline-none focus:border-gold/50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="inter text-[10px] text-slate-400 uppercase tracking-widest">Notification Endpoint (Email)</label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={e => setClientEmail(e.target.value)}
                            placeholder="client@governance.ai"
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-sm text-white focus:outline-none focus:border-gold/50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="inter text-[10px] text-slate-400 uppercase tracking-widest">Service Itemization</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe the consultation or service provided..."
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-sm text-white focus:outline-none focus:border-gold/50 resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="inter text-[10px] text-slate-400 uppercase tracking-widest">Maturity Date (Due Date)</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-sm text-white focus:outline-none focus:border-gold/50"
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        className="mt-4 w-full bg-gold hover:bg-gold-bright text-navy font-bold py-4 rounded-xl transition-all duration-300 cinzel tracking-widest shadow-[0_0_20px_rgba(200,169,81,0.2)]"
                    >
                        Execute Request
                    </button>
                </div>

                {/* Preview / Results */}
                <div className="flex flex-col gap-6">
                    {showResults ? (
                        <div className="neo-glass-panel p-8 border border-emerald/20 bg-emerald/5 rounded-xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center text-navy text-lg">✓</div>
                                <h3 className="cinzel text-sm text-emerald tracking-widest font-bold uppercase">Request Generated</h3>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="inter text-[9px] text-slate-400 uppercase tracking-[0.2em]">Universal Payment Link</label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={generatedLink}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 inter text-[10px] text-slate-300 focus:outline-none"
                                    />
                                    <button
                                        onClick={copyLink}
                                        className="px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-all"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border-4 border-emerald/20">
                                <QRCode value={generatedLink} size={160} level="M" fgColor="#022c22" />
                                <span className="inter text-[10px] text-navy font-bold uppercase tracking-widest">Multi-Channel QR</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/30 transition-all">Send Email</button>
                                <button className="py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-purple-400 hover:bg-purple-500/30 transition-all">Show Zelle</button>
                            </div>
                        </div>
                    ) : (
                        <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-6 min-h-[400px] opacity-40 grayscale">
                            <div className="text-4xl">📄</div>
                            <p className="inter text-xs text-slate-400 uppercase tracking-widest text-center">Complete the form to <br />visualize the secure billing request</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
