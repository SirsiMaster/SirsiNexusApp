/**
 * System Logs — Pixel-perfect port of dashboard/system-logs.html
 *
 * Canonical CSS: page-header, page-subtitle, stat-card, card
 * Typography: Inter body ≤ 500 (Rule 21), monospace for log entries
 * Features: Log statistics, filters, searchable log viewer, export, real-time simulation
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Info, AlertTriangle, XCircle, Bug, CheckCircle,
    Search, Pause, Play, Trash2, RefreshCw, FileText, FileCode, FileDown
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/system-logs',
    component: SystemLogs,
})

// ── Types ──
interface LogEntry {
    timestamp: string
    level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'SUCCESS'
    message: string
    source: string
}

// ── Sample Data (matches HTML exactly) ──
const sampleLogs: LogEntry[] = [
    { timestamp: '7/22/2025, 8:09:34 PM', level: 'SUCCESS', message: 'Email sent successfully [system]', source: 'system' },
    { timestamp: '7/22/2025, 8:09:29 PM', level: 'ERROR', message: 'Email sent successfully [application]', source: 'application' },
    { timestamp: '7/22/2025, 8:09:24 PM', level: 'SUCCESS', message: 'Background job completed [api]', source: 'api' },
    { timestamp: '7/22/2025, 8:09:19 PM', level: 'INFO', message: 'User login attempt from IP 192.168.1.100', source: 'system' },
    { timestamp: '7/22/2025, 8:09:14 PM', level: 'WARNING', message: 'High memory usage detected: 85%', source: 'system' },
    { timestamp: '7/22/2025, 8:09:09 PM', level: 'ERROR', message: 'Database connection timeout', source: 'database' },
    { timestamp: '7/22/2025, 8:09:04 PM', level: 'DEBUG', message: 'Cache cleared successfully', source: 'system' },
    { timestamp: '7/22/2025, 8:08:59 PM', level: 'INFO', message: 'API request: GET /api/users', source: 'api' },
    { timestamp: '7/22/2025, 8:08:54 PM', level: 'SUCCESS', message: 'Backup completed successfully', source: 'system' },
    { timestamp: '7/22/2025, 8:08:49 PM', level: 'ERROR', message: 'Failed to send notification email', source: 'application' },
]

const realtimeMessages = [
    'New user registration', 'API rate limit warning', 'Database query executed',
    'Cache invalidated', 'File uploaded successfully', 'Background job started',
    'Email notification sent', 'Security scan completed', 'Configuration updated',
    'Memory usage threshold reached',
]

const levelColors: Record<string, string> = {
    INFO: '#059669',
    WARNING: '#C8A951',
    ERROR: '#ef4444',
    DEBUG: '#6b7280',
    SUCCESS: '#10b981',
}

function SystemLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([...sampleLogs])
    const [levelFilter, setLevelFilter] = useState('all')
    const [sourceFilter, setSourceFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isPaused, setIsPaused] = useState(false)
    const [isRealtime, setIsRealtime] = useState(true)
    const logContainerRef = useRef<HTMLDivElement>(null)

    // Realtime log simulation
    useEffect(() => {
        if (!isRealtime || isPaused) return
        const interval = setInterval(() => {
            const levels: LogEntry['level'][] = ['INFO', 'WARNING', 'ERROR', 'DEBUG', 'SUCCESS']
            const sources = ['system', 'application', 'api', 'database']
            const newLog: LogEntry = {
                timestamp: new Date().toLocaleString(),
                level: levels[Math.floor(Math.random() * levels.length)],
                message: realtimeMessages[Math.floor(Math.random() * realtimeMessages.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
            }
            setLogs(prev => {
                const updated = [newLog, ...prev]
                return updated.length > 100 ? updated.slice(0, 100) : updated
            })
        }, 3000 + Math.random() * 4000)
        return () => clearInterval(interval)
    }, [isRealtime, isPaused])

    // Filter logs
    const filteredLogs = logs.filter(log => {
        if (levelFilter !== 'all' && log.level.toLowerCase() !== levelFilter) return false
        if (sourceFilter !== 'all' && log.source !== sourceFilter) return false
        if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) && !log.level.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
    })

    // Statistics
    const stats = logs.reduce((acc, log) => {
        const key = log.level.toLowerCase()
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const clearLogs = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all logs?')) {
            setLogs([])
        }
    }, [])

    const refreshLogs = useCallback(() => { setLogs([...sampleLogs]) }, [])

    // Export
    const exportLogs = useCallback((format: string) => {
        let content = ''
        let filename = `system-logs-${new Date().toISOString().slice(0, 10)}`
        let mimeType = ''
        const data = filteredLogs

        if (format === 'csv') {
            content = 'Timestamp,Level,Message,Source\n'
            content += data.map(l => `"${l.timestamp}","${l.level}","${l.message}","${l.source}"`).join('\n')
            mimeType = 'text/csv'; filename += '.csv'
        } else if (format === 'json') {
            content = JSON.stringify(data, null, 2)
            mimeType = 'application/json'; filename += '.json'
        } else {
            content = data.map(l => `[${l.timestamp}] ${l.level}: ${l.message} (${l.source})`).join('\n')
            mimeType = 'text/plain'; filename += '.txt'
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename; a.click()
        URL.revokeObjectURL(url)
    }, [filteredLogs])

    const statCards = [
        { icon: <Info size={28} className="text-emerald-500" />, count: stats.info || 0, label: 'Info' },
        { icon: <AlertTriangle size={28} className="text-yellow-500" />, count: stats.warning || 0, label: 'Warnings' },
        { icon: <XCircle size={28} className="text-red-500" />, count: stats.error || 0, label: 'Errors' },
        { icon: <Bug size={28} className="text-gray-500" />, count: stats.debug || 0, label: 'Debug' },
        { icon: <CheckCircle size={28} className="text-green-500" />, count: stats.success || 0, label: 'Success' },
    ]

    return (
        <div>
            {/* ── Page Header (canonical) ── */}
            <div className="page-header">
                <h1>System Logs</h1>
                <p className="page-subtitle">Real-time event stream, error tracking, and audit trail across platform nodes.</p>
            </div>

            {/* ── Log Statistics ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statCards.map(card => (
                    <div key={card.label} className="stat-card bg-white dark:bg-slate-800" style={{
                        borderRadius: 12, padding: 20,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center',
                    }}>
                        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
                        <h3 className="text-2xl font-medium">{card.count}</h3>
                        <p style={{ fontSize: 14 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters and Controls ── */}
            <div className="bg-white dark:bg-slate-800" style={{
                borderRadius: 12, padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24,
            }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Log Level</label>
                        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px',
                                borderRadius: 6, fontSize: 14, outline: 'none',
                            }}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-foreground">
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="debug">Debug</option>
                            <option value="success">Success</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Source</label>
                        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px',
                                borderRadius: 6, fontSize: 14, outline: 'none',
                            }}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-foreground">
                            <option value="all">All Sources</option>
                            <option value="system">System</option>
                            <option value="application">Application</option>
                            <option value="api">API</option>
                            <option value="database">Database</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>From Date</label>
                        <input type="datetime-local" style={{
                            width: '100%', padding: '8px 12px',
                            borderRadius: 6, fontSize: 14, outline: 'none',
                        }}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-foreground" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>To Date</label>
                        <input type="datetime-local" style={{
                            width: '100%', padding: '8px 12px',
                            borderRadius: 6, fontSize: 14, outline: 'none',
                        }}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-foreground" />
                    </div>
                </div>

                {/* Search + Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div style={{ position: 'relative', flex: 1, maxWidth: 448 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            style={{
                                width: '100%', paddingLeft: 40, paddingRight: 16, padding: '8px 16px 8px 40px',
                                borderRadius: 6, fontSize: 14, outline: 'none',
                            }}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-foreground"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={isRealtime} onChange={e => setIsRealtime(e.target.checked)} style={{ marginRight: 8 }} />
                            <span className="flex items-center" style={{ fontSize: 14 }}>
                                <span style={{
                                    display: 'inline-block', width: 8, height: 8, background: '#10b981',
                                    borderRadius: '50%', marginRight: 6, animation: 'pulse 2s infinite',
                                }} />
                                Real-time
                            </span>
                        </label>
                        <button onClick={() => setIsPaused(!isPaused)} style={{
                            padding: '8px 16px',
                            borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                        }} className="bg-slate-200 dark:bg-slate-700 text-foreground">
                            {isPaused ? <Play size={14} /> : <Pause size={14} />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button onClick={clearLogs} style={{
                            padding: '8px 16px',
                            borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                        }} className="bg-slate-200 dark:bg-slate-700 text-foreground">
                            <Trash2 size={14} />Clear
                        </button>
                        <button onClick={refreshLogs} style={{
                            padding: '8px 16px', background: '#059669', color: 'white',
                            borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <RefreshCw size={14} />Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Log Entries ── */}
            <div className="bg-white dark:bg-slate-800" style={{
                borderRadius: 12, padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <div ref={logContainerRef} className="log-container bg-slate-50 dark:bg-slate-900" style={{
                    borderRadius: 8, padding: 16,
                    maxHeight: 384, overflowY: 'auto',
                }}>
                    {filteredLogs.map((log, i) => (
                        <div key={i} style={{
                            fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
                            fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '8px 0',
                            borderBottom: i < filteredLogs.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}>
                            <span style={{ minWidth: 180 }}>{log.timestamp}</span>
                            <span style={{ color: levelColors[log.level], fontWeight: 500, minWidth: 80 }}>{log.level}</span>
                            <span style={{ flex: 1 }}>{log.message}</span>
                        </div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <p style={{ textAlign: 'center', padding: 24, fontSize: 14 }}>No log entries match your filters</p>
                    )}
                </div>

                {/* Export Footer */}
                <div style={{
                    marginTop: 16, paddingTop: 16,
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontSize: 14 }}>
                        Showing {filteredLogs.length} entries
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => exportLogs('csv')} style={{
                            padding: '8px 16px', fontSize: 14,
                            borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        }} className="bg-slate-200 dark:bg-slate-700 text-foreground">
                            <FileText size={14} />Export CSV
                        </button>
                        <button onClick={() => exportLogs('json')} style={{
                            padding: '8px 16px', fontSize: 14,
                            borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        }} className="bg-slate-200 dark:bg-slate-700 text-foreground">
                            <FileCode size={14} />Export JSON
                        </button>
                        <button onClick={() => exportLogs('txt')} style={{
                            padding: '8px 16px', fontSize: 14,
                            borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        }} className="bg-slate-200 dark:bg-slate-700 text-foreground">
                            <FileDown size={14} />Export TXT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
