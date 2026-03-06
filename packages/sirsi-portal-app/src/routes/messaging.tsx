/**
 * Investor Messaging — Pixel-perfect port of investor/messaging.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: Thread registry sidebar, encrypted chat session, real-time compose
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useRef, useEffect } from 'react'
import { Shield, Search, Paperclip, Send, Phone, Video, Info, Edit } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/messaging',
    component: Messaging,
})

interface Message {
    sender: 'admin' | 'cylton'
    text: string
    time: string
}

const threads = [
    { name: 'Investment Committee', time: '2H AGO', preview: 'Series A timeline update shared for review...', active: true },
    { name: 'Cylton Collymore', time: '4H AGO', preview: 'Contract MSA-2026-001 finalized...' },
    { name: 'Legal Team', time: '1D AGO', preview: 'Privacy policy v2.4 approved by board...', faded: true },
]

const initialMessages: Message[] = [
    { sender: 'cylton', text: 'The Series A timeline has been updated. Please review the latest projection in the data room.', time: '2:30 PM' },
    { sender: 'admin', text: 'Thanks Cylton. I\'ll review the updated projections today. Can we schedule a follow-up call?', time: '2:45 PM' },
    { sender: 'cylton', text: 'Absolutely. Let\'s do Thursday at 3 PM EST. I\'ll send a calendar invite.', time: '3:01 PM' },
]

function Messaging() {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [draft, setDraft] = useState('')
    const chatRef = useRef<HTMLDivElement>(null)

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [messages])

    const send = () => {
        if (!draft.trim()) return
        setMessages([...messages, { sender: 'admin', text: draft.trim(), time: 'JUST NOW' }])
        setDraft('')
    }

    return (
        <div>
            <div className="page-header">
                <h1>Investor Messaging</h1>
                <p className="page-subtitle">Identity-verified secure communications with the primary investor cluster</p>
            </div>

            <div className="sirsi-card overflow-hidden flex border-none shadow-2xl" style={{ padding: 0, height: 700 }}>
                {/* Left: Thread Registry */}
                <div className="border-r border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30" style={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                    <div className="border-b border-slate-100 dark:border-slate-700" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>Registry</h3>
                        <Edit size={14} style={{ color: '#059669', cursor: 'pointer' }} />
                    </div>
                    <div className="border-b border-slate-100 dark:border-slate-700" style={{ padding: 16 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={12} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Filter threads..." className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-foreground" style={{ width: '100%', paddingLeft: 36, paddingRight: 12, padding: '8px 12px 8px 36px', borderWidth: 1, borderStyle: 'solid', borderRadius: 8, fontSize: 12, fontWeight: 500, outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {threads.map(t => (
                            <div key={t.name} style={{
                                padding: 16, cursor: 'pointer',
                                ...(t.active ? { borderLeft: '4px solid #059669' } : {}),
                            }} className={`border-b border-slate-100 dark:border-slate-700 ${t.active ? 'bg-white dark:bg-slate-700' : ''}`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: t.faded ? '#9ca3af' : 'var(--foreground, #111827)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t.name}</span>
                                    <span style={{ fontSize: 9, fontWeight: 500 }}>{t.time}</span>
                                </div>
                                <p style={{ fontSize: 10, color: t.faded ? '#9ca3af' : '#6b7280', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.preview}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="bg-white dark:bg-slate-800" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Session Header */}
                    <div className="border-b border-slate-100 dark:border-slate-700" style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600" style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={14} style={{ color: '#059669' }} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontStyle: 'italic' }}>Encrypted Session: Committee</h4>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span style={{ fontSize: 9, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Verified Protocol Level 4</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {[Phone, Video, Info].map((Icon, i) => (
                                <Icon key={i} size={16} style={{ cursor: 'pointer' }} className="hover:text-emerald-600 transition-colors" />
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 40 }} className="space-y-8">
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%', ...(msg.sender === 'admin' ? { marginLeft: 'auto' } : {}) }}>
                                <div style={{
                                    padding: '16px 20px', fontSize: 14, lineHeight: 1.7, fontWeight: 500,
                                    ...(msg.sender === 'admin'
                                        ? { background: '#059669', color: 'white', borderRadius: '16px 16px 0 16px', border: '1px solid #059669', boxShadow: '0 4px 6px rgba(5,150,105,0.1)' }
                                        : { borderRadius: '16px 16px 16px 0' }),
                                }} className={msg.sender !== 'admin' ? 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600' : ''}>{msg.text}</div>
                                <span style={{
                                    fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8,
                                    color: msg.sender === 'admin' ? '#059669' : '#9ca3af',
                                    ...(msg.sender === 'admin' ? { paddingRight: 8 } : { paddingLeft: 8 }),
                                }}>{msg.sender === 'admin' ? 'ADMIN' : 'Cylton'} • {msg.time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Compose */}
                    <div className="border-t border-slate-100 dark:border-slate-700" style={{ padding: 32 }}>
                        <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600" style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 16, padding: '8px 16px 8px 8px' }}>
                            <button style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Paperclip size={16} />
                            </button>
                            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                                placeholder="Draft encrypted message..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 500 }} />
                            <button onClick={send} style={{ width: 40, height: 40, background: '#059669', color: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(5,150,105,0.2)' }}>
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
