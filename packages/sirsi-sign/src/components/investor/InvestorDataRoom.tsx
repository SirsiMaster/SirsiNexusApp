import { useState, useEffect } from 'react';
import { listVaultFiles } from '../../lib/opensign';

interface DataFile {
    id: string;
    name: string;
    size: string;
    type: string;
    access: 'Restricted' | 'Confidential' | 'Internal';
    uploaded: string;
}

export function InvestorDataRoom() {
    const [activeSection, setActiveSection] = useState<'legal' | 'financial' | 'product' | 'governance'>('legal');
    const [files, setFiles] = useState<DataFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const res = await listVaultFiles();
                if (res.success) {
                    const formatted = res.files.map((f: any) => ({
                        id: f.id,
                        name: f.name,
                        size: f.size,
                        type: f.type,
                        access: 'Confidential' as const,
                        uploaded: new Date(f.updated).toLocaleDateString()
                    }));
                    setFiles(formatted);
                }
            } catch (err) {
                console.error('DataRoom Access Error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const sections = [
        { id: 'legal', label: 'Legal & Intellectual Property', icon: '⚖️' },
        { id: 'financial', label: 'Financials & Projections', icon: '💰' },
        { id: 'product', label: 'Product & Technology', icon: '🛠️' },
        { id: 'governance', label: 'Studio Governance', icon: '🏛️' },
    ];

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h2 className="cinzel text-2xl text-white tracking-widest font-bold">Investor <span className="text-emerald-500">Data Room</span></h2>
                <p className="inter text-xs text-slate-400 mt-1 uppercase tracking-tighter">Secure cryptographic repository for due diligence artifacts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="flex flex-col gap-2">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id as any)}
                            className={`flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-300 ${activeSection === s.id
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{s.icon}</span>
                            <span className="inter text-[11px] font-bold uppercase tracking-widest text-left">{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* File List */}
                <div className="lg:col-span-3 bg-black/40 border border-white/5 rounded-2xl p-8 min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">📁</div>
                            <div className="flex flex-col">
                                <span className="inter text-sm font-bold text-white uppercase tracking-widest">
                                    {sections.find(s => s.id === activeSection)?.label}
                                </span>
                                <span className="inter text-[9px] text-slate-500 uppercase">Synchronized with Secure Storage</span>
                            </div>
                        </div>
                        <button className="px-4 py-2 border border-white/10 rounded-lg inter text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase">Batch Download</button>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <span className="inter text-[10px] text-slate-500 uppercase tracking-[0.3em]">Accessing Cryptographic Vault...</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.length === 0 ? (
                                <div className="p-20 text-center border border-dashed border-white/10 rounded-xl">
                                    <p className="inter text-sm text-slate-500 italic">No artifacts available in this section.</p>
                                </div>
                            ) : (
                                files.map(file => (
                                    <div key={file.id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-12 bg-slate-800 rounded flex flex-col items-center justify-center border border-white/10 group-hover:border-emerald-500/30">
                                                <span className="inter text-[8px] font-bold text-slate-500 group-hover:text-emerald-500">{file.type}</span>
                                                <div className="w-4 h-[1px] bg-slate-600 mt-1" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="inter text-xs font-semibold text-slate-200 group-hover:text-white">{file.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inter text-[9px] text-slate-500 uppercase">{file.size}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className="inter text-[9px] text-emerald-500/70 font-bold uppercase tracking-tighter">{file.access}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="inter text-[9px] text-slate-600 uppercase">Uploaded {file.uploaded}</span>
                                            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 group-hover:opacity-100 opacity-0 transition-all">
                                                <span className="text-white text-xs">↓</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
