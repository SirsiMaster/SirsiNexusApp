/** Data Room — Secure document repository */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import { Search, Download, Eye, Upload, FileText } from 'lucide-react'

const SearchIcon = Search as any
const DownloadIcon = Download as any
const EyeIcon = Eye as any
const UploadIcon = Upload as any
const FileTextIcon = FileText as any

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/data-room', component: DataRoom })

const docs = [
    { id: '1', name: 'Business Case Analysis', cat: 'Financial', type: 'PDF', size: '2.4 MB', date: 'Feb 2026' },
    { id: '2', name: 'Market Analysis Report', cat: 'Metrics', type: 'PDF', size: '1.8 MB', date: 'Feb 2026' },
    { id: '3', name: 'Privacy Policy v2.4', cat: 'Legal', type: 'PDF', size: '540 KB', date: 'Jan 2026' },
    { id: '4', name: 'Product Roadmap 2026', cat: 'Strategic', type: 'PDF', size: '3.1 MB', date: 'Feb 2026' },
    { id: '5', name: 'MSA Template v6', cat: 'Legal', type: 'DOCX', size: '125 KB', date: 'Feb 2026' },
    { id: '6', name: 'Investor Pitch Deck', cat: 'Comms', type: 'HTML', size: '4.2 MB', date: 'Feb 2026' },
    { id: '7', name: 'Q4 Financial Summary', cat: 'Financial', type: 'PDF', size: '1.2 MB', date: 'Jan 2026' },
    { id: '8', name: 'Investment Terms Sheet', cat: 'Investment', type: 'PDF', size: '340 KB', date: 'Jan 2026' },
]

const cats = ['All', 'Financial', 'Metrics', 'Legal', 'Strategic', 'Comms', 'Investment']

function DataRoom() {
    const [q, setQ] = useState('')
    const [cat, setCat] = useState('All')
    const filtered = docs.filter(d =>
        (cat === 'All' || d.cat === cat) && d.name.toLowerCase().includes(q.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: "'Cinzel', serif" }}>DATA ROOM</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Secure document repository — {docs.length} documents</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold">
                    <UploadIcon className="w-4 h-4" /> Upload
                </button>
            </header>

            <div className="flex flex-wrap gap-2">
                {cats.map(c => (
                    <button key={c} onClick={() => setCat(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${cat === c ? 'bg-emerald-600 text-white' : 'border border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        {c}
                    </button>
                ))}
            </div>

            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search documents..." value={q} onChange={e => setQ(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-600/20 outline-none" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Document</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Size</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filtered.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FileTextIcon className="w-5 h-5 text-gray-300" />
                                        <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{d.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">{d.cat}</td>
                                <td className="px-6 py-4"><span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{d.type}</span></td>
                                <td className="px-6 py-4 text-xs text-gray-400">{d.size}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg" title="Preview"><EyeIcon className="w-4 h-4" /></button>
                                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg" title="Download"><DownloadIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
