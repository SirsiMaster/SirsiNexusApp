/** Messaging — Internal secure messaging */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import { Send, Search, User } from 'lucide-react'

const SendIcon = Send as any
const SearchIcon = Search as any
const UserIcon = User as any

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/messaging', component: Messaging })

const threads = [
    { id: '1', name: 'Investment Committee', lastMsg: 'Series A timeline update shared', time: '2h ago', unread: 2 },
    { id: '2', name: 'Cylton Collymore', lastMsg: 'Contract MSA-2026-001 ready for review', time: '4h ago', unread: 0 },
    { id: '3', name: 'Legal Team', lastMsg: 'Privacy policy v2.4 approved', time: '1d ago', unread: 0 },
    { id: '4', name: 'Product Team', lastMsg: 'Roadmap Q2 priorities finalized', time: '2d ago', unread: 1 },
]

const messages = [
    { id: '1', sender: 'Cylton Collymore', text: 'The Series A timeline has been updated. Please review the latest projection in the data room.', time: '2:30 PM', self: false },
    { id: '2', sender: 'You', text: "Thanks Cylton. I'll review the updated projections today. Can we schedule a follow-up call?", time: '2:45 PM', self: true },
    { id: '3', sender: 'Cylton Collymore', text: "Absolutely. Let's do Thursday at 3 PM EST. I'll send a calendar invite.", time: '3:01 PM', self: false },
]

function Messaging() {
    const [selected, setSelected] = useState('1')
    const [draft, setDraft] = useState('')

    return (
        <div className="space-y-0 animate-in fade-in duration-700 -m-10">
            <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm m-10">
                {/* Thread List */}
                <div className="w-80 border-r border-gray-200 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', letterSpacing: '0.03em' }}>MESSAGES</h2>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search..." className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm outline-none" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                        {threads.map(t => (
                            <button key={t.id} onClick={() => setSelected(t.id)}
                                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${selected === t.id ? 'bg-emerald-50 dark:bg-emerald-950/20 border-l-2 border-emerald-500' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</span>
                                    <span className="text-[10px] text-gray-400">{t.time}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 truncate">{t.lastMsg}</span>
                                    {t.unread > 0 && <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{t.unread}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{threads.find(t => t.id === selected)?.name}</div>
                            <div className="text-[10px] text-gray-400">Encrypted • Secure Channel</div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md px-4 py-3 rounded-2xl ${m.self ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'}`}>
                                    <p className="text-sm">{m.text}</p>
                                    <p className={`text-[10px] mt-1 ${m.self ? 'text-emerald-200' : 'text-gray-400'}`}>{m.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex gap-2">
                            <input type="text" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Type a message..."
                                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/20" />
                            <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
