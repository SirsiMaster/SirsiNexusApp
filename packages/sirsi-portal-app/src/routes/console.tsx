/**
 * System Console — Pixel-perfect port of console/index.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: Dark terminal, command input, help/status/clear commands, initial boot logs
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useRef, useEffect } from 'react'
import { Terminal, Trash2, Send } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/console',
    component: Console,
})

interface LogLine { type: 'system' | 'info' | 'error' | 'input' | 'output' | 'warning'; text: string }

const initialLogs: LogLine[] = [
    { type: 'system', text: 'SirsiNexus Console v6.0.0 — Establishing Vault Handshake...' },
    { type: 'system', text: 'Handshake Verified. Environment: production-live-01' },
    { type: 'info', text: '→ Auth Identity: Administrator (Root)' },
    { type: 'info', text: '→ Cluster Status: Operational' },
    { type: 'info', text: '→ Audit Logging: ACTIVE' },
    { type: 'system', text: 'Node ready. Authorized commands available.' },
]

const typeColors: Record<string, string> = {
    system: '#94a3b8',
    info: '#60a5fa',
    error: '#f87171',
    input: '#10b981',
    output: '#f1f5f9',
    warning: '#fbbf24',
}

function Console() {
    const [logs, setLogs] = useState<LogLine[]>([...initialLogs])
    const [cmd, setCmd] = useState('')
    const outputRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
    }, [logs])

    useEffect(() => { inputRef.current?.focus() }, [])

    const exec = () => {
        const c = cmd.trim()
        if (!c) return
        const newLogs = [...logs, { type: 'input' as const, text: `$ ${c}` }]
        const lower = c.toLowerCase()

        if (lower === 'help') {
            newLogs.push({ type: 'output', text: 'Authorized Protocols:' })
            newLogs.push({ type: 'output', text: '  status    — Retrieve cluster health metrics' })
            newLogs.push({ type: 'output', text: '  deploy    — Review rolling deployment history' })
            newLogs.push({ type: 'output', text: '  users     — Inspect authorized identity registry' })
            newLogs.push({ type: 'output', text: '  clear     — Purge console buffer' })
        } else if (lower === 'status') {
            newLogs.push({ type: 'output', text: 'System Integrity: 99.2% Operational' })
            newLogs.push({ type: 'info', text: '  Handshake Service ✓ Verified' })
            newLogs.push({ type: 'info', text: '  Vault Encryption  ✓ Active' })
        } else if (lower === 'clear') {
            setLogs([{ type: 'system', text: 'Buffer purged.' }])
            setCmd('')
            return
        } else {
            newLogs.push({ type: 'error', text: `Protocol Error: Command '${c}' not recognized.` })
        }
        setLogs(newLogs)
        setCmd('')
    }

    return (
        <div>
            <div className="page-header">
                <h1>System Console</h1>
                <p className="page-subtitle">Low-level command execution and platform orchestration interface</p>
            </div>

            {/* Console Terminal */}
            <div className="sirsi-card" style={{
                borderColor: 'transparent', background: '#020617', padding: 0,
                overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)',
            }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px', borderBottom: '1px solid #1e293b', background: 'rgba(15,23,42,0.5)',
                }}>
                    <div className="flex items-center gap-3">
                        <Terminal size={12} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sirsi Console — Nexus Node 1</span>
                    </div>
                    <button onClick={() => setLogs([{ type: 'system', text: 'Buffer purged.' }])}
                        style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }} title="Purge Buffer">
                        <Trash2 size={12} />
                    </button>
                </div>

                {/* Output */}
                <div ref={outputRef} style={{
                    flex: 1, overflowY: 'auto', padding: 24,
                    fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
                    fontSize: 13, lineHeight: 1.6, color: '#cbd5e1',
                }}>
                    {logs.map((l, i) => (
                        <div key={i} style={{
                            marginBottom: 4,
                            color: typeColors[l.type],
                            fontWeight: l.type === 'input' ? 500 : 400,
                        }}>{l.text}</div>
                    ))}
                </div>

                {/* Input */}
                <div style={{
                    borderTop: '1px solid #1e293b', background: '#0f172a',
                    padding: 16, display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#10b981', userSelect: 'none' }}>$</span>
                    <input ref={inputRef} value={cmd} onChange={e => setCmd(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && exec()}
                        placeholder="Await command..."
                        style={{
                            flex: 1, background: 'transparent', border: 'none', outline: 'none',
                            fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
                            color: '#34d399', fontSize: 13,
                        }}
                        autoComplete="off"
                    />
                    <button onClick={exec} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Send size={14} />
                    </button>
                </div>
            </div>

            {/* Context Hint */}
            <div className="mt-6 flex justify-between items-center px-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span style={{ fontSize: 9, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Write Access Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span style={{ fontSize: 9, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Log level: Debug</span>
                    </div>
                </div>
                <div style={{ fontSize: 9, fontWeight: 500, color: '#d1d5db', textTransform: 'uppercase', fontStyle: 'italic' }}>Type 'help' to review authorized protocols</div>
            </div>
        </div>
    )
}
