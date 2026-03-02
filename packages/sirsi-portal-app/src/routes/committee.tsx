/** Committee — Committee Documents Portal */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Calendar, FileText, ExternalLink } from 'lucide-react'

const CalendarIcon = Calendar as any
const FileTextIcon = FileText as any
const ExternalLinkIcon = ExternalLink as any

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/committee', component: Committee })

const meetings = [
    { id: '1', title: 'Q1 2026 Strategy Review', date: 'Mar 15, 2026', status: 'Upcoming', docs: 3 },
    { id: '2', title: 'Investment Committee - Series A', date: 'Feb 20, 2026', status: 'Completed', docs: 5 },
    { id: '3', title: 'Board of Directors Meeting', date: 'Jan 28, 2026', status: 'Completed', docs: 4 },
    { id: '4', title: 'Product Roadmap Approval', date: 'Jan 10, 2026', status: 'Completed', docs: 2 },
    { id: '5', title: 'Q4 2025 Financial Review', date: 'Dec 15, 2025', status: 'Completed', docs: 6 },
]

function Committee() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="border-b border-gray-200 dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: "'Cinzel', serif" }}>COMMITTEE DOCUMENTS</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Executive committee meeting index and strategic documents</p>
            </header>
            <div className="space-y-4">
                {meetings.map(m => (
                    <div key={m.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.status === 'Upcoming' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                    <CalendarIcon className={`w-6 h-6 ${m.status === 'Upcoming' ? 'text-amber-600' : 'text-emerald-600'}`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{m.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500">{m.date}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${m.status === 'Upcoming' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>{m.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-gray-400">
                                    <FileTextIcon className="w-4 h-4" />
                                    <span className="text-xs">{m.docs} docs</span>
                                </div>
                                <ExternalLinkIcon className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
