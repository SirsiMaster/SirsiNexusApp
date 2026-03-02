/**
 * System Logs — Audit trail and activity monitoring
 * Merged from: sirsinexusportal/system-logs.html + dashboard activity feed
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import { Filter, Download, Search, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

const FilterIcon = Filter as any
const DownloadIcon = Download as any
const SearchIcon = Search as any
const CheckCircleIcon = CheckCircle as any
const AlertTriangleIcon = AlertTriangle as any
const InfoIcon = Info as any
const XCircleIcon = XCircle as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/system-logs',
    component: SystemLogs,
})

type LogLevel = 'info' | 'success' | 'warning' | 'error'

interface LogEntry {
    id: string; timestamp: string; level: LogLevel; source: string; message: string; user: string; ip: string
}

const mockLogs: LogEntry[] = [
    { id: '1', timestamp: '2026-02-28 12:01:42', level: 'success', source: 'Auth', message: 'User cylton@sirsi.ai authenticated via MFA', user: 'Cylton Collymore', ip: '192.168.1.xxx' },
    { id: '2', timestamp: '2026-02-28 11:58:03', level: 'info', source: 'System', message: 'Deployment pipeline triggered for sirsi-sign', user: 'CI/CD', ip: '10.0.0.1' },
    { id: '3', timestamp: '2026-02-28 11:45:22', level: 'warning', source: 'Stripe', message: 'Webhook delivery delayed by 3s (threshold: 2s)', user: 'Stripe', ip: '54.187.xxx.xxx' },
    { id: '4', timestamp: '2026-02-28 11:30:11', level: 'success', source: 'Contracts', message: 'Contract MSA-2026-001 executed and signed', user: 'Cylton Collymore', ip: '192.168.1.xxx' },
    { id: '5', timestamp: '2026-02-28 10:15:07', level: 'error', source: 'gRPC', message: 'AdminService.getSystemOverview: connection refused (backend offline)', user: 'System', ip: 'localhost' },
    { id: '6', timestamp: '2026-02-28 09:00:00', level: 'info', source: 'Firebase', message: 'Firestore security rules deployed v2.4.1', user: 'SirsiMaster', ip: '10.0.0.1' },
    { id: '7', timestamp: '2026-02-27 23:30:00', level: 'success', source: 'Deploy', message: 'sirsi-sign.web.app deployed successfully (build #247)', user: 'GitHub Actions', ip: '140.82.xxx.xxx' },
    { id: '8', timestamp: '2026-02-27 18:12:33', level: 'warning', source: 'Auth', message: 'Failed login attempt for admin@sirsi.ai (2FA timeout)', user: 'Unknown', ip: '45.33.xxx.xxx' },
]

function SystemLogs() {
    const [filter, setFilter] = useState<LogLevel | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filtered = mockLogs.filter(log => {
        const matchesFilter = filter === 'all' || log.level === filter
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.source.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
                        style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}>
                        SYSTEM LOGS
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Platform-wide audit trail and event monitoring</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold">
                    <DownloadIcon className="w-4 h-4" />
                    Export Logs
                </button>
            </header>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs by message or source..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'info', 'success', 'warning', 'error'] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${filter === level
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log Entries */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {filtered.map((log) => (
                        <div key={log.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.level === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                    log.level === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                        log.level === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                                            'bg-blue-100 dark:bg-blue-900/30'
                                }`}>
                                {log.level === 'success' ? <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> :
                                    log.level === 'warning' ? <AlertTriangleIcon className="w-4 h-4 text-amber-600" /> :
                                        log.level === 'error' ? <XCircleIcon className="w-4 h-4 text-red-600" /> :
                                            <InfoIcon className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap ml-4">{log.timestamp}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="inline-block text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-full font-bold uppercase tracking-widest">{log.source}</span>
                                    <span className="text-[10px] text-gray-400">{log.user}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{log.ip}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
