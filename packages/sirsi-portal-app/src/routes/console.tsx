/** Console — System console */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import { Terminal, Play, Trash2 } from 'lucide-react'

const TerminalIcon = Terminal as any
const PlayIcon = Play as any
const Trash2Icon = Trash2 as any

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/console', component: ConsoleView })

function ConsoleView() {
    const [cmd, setCmd] = useState('')
    const [logs, setLogs] = useState([
        { type: 'system', text: 'SirsiNexus Console v6.0.0 — sirsi-nexus-live' },
        { type: 'system', text: 'Connected to production environment' },
        { type: 'info', text: '→ Firebase Auth: ✓ Connected' },
        { type: 'info', text: '→ Cloud SQL: ✓ Connected' },
        { type: 'info', text: '→ Firestore: ✓ Connected' },
        { type: 'info', text: '→ gRPC Backend: ✗ Offline' },
        { type: 'system', text: 'Type "help" for available commands' },
    ])

    const execCommand = () => {
        if (!cmd.trim()) return
        const newLogs = [...logs, { type: 'input', text: `$ ${cmd}` }]
        const c = cmd.trim().toLowerCase()
        if (c === 'help') {
            newLogs.push({ type: 'output', text: 'Available: status, deploy, users, version, clear' })
        } else if (c === 'status') {
            newLogs.push({ type: 'output', text: 'All systems operational. Uptime: 99.2%' })
        } else if (c === 'version') {
            newLogs.push({ type: 'output', text: 'SirsiNexusApp v6.0.0 | React 19 | Vite 6 | Go 1.22' })
        } else if (c === 'clear') {
            setLogs([{ type: 'system', text: 'Console cleared.' }]); setCmd(''); return
        } else {
            newLogs.push({ type: 'error', text: `Command not found: ${cmd}` })
        }
        setLogs(newLogs)
        setCmd('')
    }

    return (
        <div className="space-y-0 animate-in fade-in duration-700 -m-10">
            <div className="m-10 bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-xl"
                style={{ height: 'calc(100vh - 8rem)' }}>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sirsi Console</span>
                    </div>
                    <button onClick={() => setLogs([{ type: 'system', text: 'Console cleared.' }])} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                </div>
                {/* Output */}
                <div className="overflow-y-auto p-4 font-mono text-sm space-y-1" style={{ height: 'calc(100% - 80px)' }}>
                    {logs.map((l, i) => (
                        <div key={i} className={
                            l.type === 'system' ? 'text-gray-500' :
                                l.type === 'input' ? 'text-emerald-400' :
                                    l.type === 'error' ? 'text-red-400' :
                                        l.type === 'info' ? 'text-blue-400' : 'text-gray-300'
                        }>{l.text}</div>
                    ))}
                </div>
                {/* Input */}
                <div className="flex items-center gap-2 border-t border-gray-800 px-4 py-3">
                    <span className="text-emerald-500 font-mono text-sm">$</span>
                    <input value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={e => e.key === 'Enter' && execCommand()}
                        className="flex-1 bg-transparent text-gray-200 font-mono text-sm outline-none" placeholder="Enter command..." autoFocus />
                    <button onClick={execCommand} className="p-1.5 text-emerald-500 hover:text-emerald-400 transition-colors">
                        <PlayIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
