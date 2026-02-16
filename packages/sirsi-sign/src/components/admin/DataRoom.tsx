import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listVaultFiles } from '../../lib/opensign';

interface DataFile {
    id: string;
    name: string;
    size: string;
    type: string;
    access: 'Public' | 'Restricted' | 'Private';
    uploaded: string;
    downloads: number;
    description: string;
}

interface DataRoomSection {
    id: string;
    title: string;
    icon: string;
    color: string;
    type: string;
    files: DataFile[];
}

const MotionDiv = motion.div as any;
const APresence = AnimatePresence as any;

export function DataRoom() {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [realFiles, setRealFiles] = useState<DataFile[]>([]);
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
                        access: 'Restricted' as const,
                        uploaded: new Date(f.updated).toLocaleDateString(),
                        downloads: 0,
                        description: `Secure document: ${f.name}`
                    }));
                    setRealFiles(formatted);
                }
            } catch (err) {
                console.error('DataRoom Feed Error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const sections: DataRoomSection[] = [
        {
            id: 'financials',
            title: 'Financial Reports',
            icon: '📊',
            color: 'blue',
            type: 'Financial Data',
            files: realFiles.filter(f => f.name.toLowerCase().includes('invoice') || f.name.toLowerCase().includes('ledger'))
        },
        {
            id: 'legal',
            title: 'Legal Documents',
            icon: '📜',
            color: 'purple',
            type: 'Compliance & IP',
            files: realFiles.filter(f => f.name.toLowerCase().includes('executed') || f.name.toLowerCase().includes('agreement'))
        },
        {
            id: 'strategy',
            title: 'Strategic Plans',
            icon: '💡',
            color: 'amber',
            type: 'Roadmaps & Growth',
            files: []
        },
        {
            id: 'investment',
            title: 'Investment Terms',
            icon: '💰',
            color: 'emerald',
            type: 'Capital & Equity',
            files: []
        }
    ];

    // Add fallback if no real files match filters
    if (realFiles.length > 0 && sections[1].files.length === 0 && sections[0].files.length === 0) {
        sections[1].files = realFiles;
    }

    const stats = [
        { label: 'Total Storage', value: '0.04 GB', sub: '92% Available', icon: '💽' },
        { label: 'Total Files', value: realFiles.length.toString(), sub: '4 Categories', icon: '📁' },
        { label: 'Active Shares', value: '142', sub: '24 Secure Links', icon: '🔗' },
        { label: 'Audit Events', value: '1.2k', sub: 'Last 24 hours', icon: '🔍' },
    ];

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest font-bold uppercase">The Data Vault</h2>
                    <p className="inter text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-medium">Secure repository for sensitive documents and evidence</p>
                </div>
                <button className="px-6 py-2 bg-gold/10 border border-gold/20 rounded-full inter text-[10px] font-bold text-gold uppercase tracking-widest hover:bg-gold hover:text-navy transition-all duration-300">
                    Secure Upload +
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="neo-glass-panel p-6 border border-white/10 rounded-2xl bg-white/5 relative group cursor-default"
                    >
                        <span className="absolute top-4 right-4 text-xl opacity-20 group-hover:opacity-100 transition-opacity duration-500">{stat.icon}</span>
                        <h4 className="inter text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</h4>
                        <div className="flex items-end gap-2">
                            <span className="cinzel text-2xl font-bold text-white tracking-widest">{stat.value}</span>
                        </div>
                        <p className="inter text-[9px] text-slate-600 mt-2 uppercase tracking-tight">{stat.sub}</p>
                    </MotionDiv>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                    <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
                    <p className="inter text-[10px] text-gold uppercase tracking-[0.3em]">Accessing Cryptographic Vault...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${activeSectionId === section.id
                                ? 'bg-gold/10 border-gold shadow-[0_0_30px_rgba(200,169,81,0.1)]'
                                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.07]'
                                }`}
                            onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                        >
                            <div className="flex flex-col gap-4">
                                <span className="text-4xl">{section.icon}</span>
                                <div>
                                    <h3 className="cinzel text-lg text-white tracking-widest font-bold mb-1">{section.title}</h3>
                                    <p className="inter text-[10px] text-slate-500 uppercase font-medium">{section.type}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="inter text-[10px] text-slate-400 font-bold">{section.files.length} DOCUMENTS</span>
                                    <span className={`text-gold transition-transform duration-300 ${activeSectionId === section.id ? 'rotate-90' : ''}`}>→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <APresence>
                {activeSectionId && (
                    <MotionDiv
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="neo-glass-panel border border-white/10 rounded-3xl overflow-hidden bg-black/20 backdrop-blur-3xl p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="cinzel text-xl text-gold tracking-widest font-bold uppercase">
                                    {sections.find(s => s.id === activeSectionId)?.title}
                                </h3>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Filter files..."
                                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 inter text-xs text-white focus:outline-none focus:border-gold/30"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {sections.find(s => s.id === activeSectionId)?.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-xl">
                                                {file.type === 'PDF' ? '📄' : '📁'}
                                            </div>
                                            <div>
                                                <h4 className="inter text-sm font-semibold text-slate-200">{file.name}</h4>
                                                <p className="inter text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{file.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="hidden md:block text-right">
                                                <p className="inter text-[10px] text-slate-500 uppercase font-bold tracking-widest">Access</p>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${file.access === 'Public' ? 'text-emerald bg-emerald/10' :
                                                    file.access === 'Restricted' ? 'text-amber-500 bg-amber-500/10' :
                                                        'text-rose-500 bg-rose-500/10'
                                                    }`}>
                                                    {file.access}
                                                </span>
                                            </div>
                                            <div className="hidden md:block text-right w-20">
                                                <p className="inter text-[10px] text-slate-500 uppercase font-bold tracking-widest">Size</p>
                                                <p className="inter text-xs text-slate-300 font-medium">{file.size}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">📥</button>
                                                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">⚙️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {sections.find(s => s.id === activeSectionId)?.files.length === 0 && (
                                    <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <p className="inter text-[10px] text-slate-600 uppercase tracking-widest">No documents matching this partition</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </APresence>
        </div>
    );
}
