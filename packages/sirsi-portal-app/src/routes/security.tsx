/**
 * Security & Settings — Pixel-perfect port of security/index.html
 *
 * Canonical CSS: page-header, page-subtitle, sirsi-card, sirsi-table-wrap,
 * sirsi-table, sirsi-badge, btn-primary, btn-secondary
 * Typography: Inter body ≤ 500 (Rule 21)
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import {
    ShieldCheck, Ban, UserCheck, Lock, Clock,
    XCircle, Trash2, Plus, History, AlertTriangle,
    Key, UserX
} from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/security',
    component: Security,
})

// ── Mock Data ──
const sessions = [
    { email: 'admin@sirsinexus.com', ip: '192.168.1.100', location: 'New York, US', time: '2 hours ago' },
    { email: 'john.doe@example.com', ip: '192.168.1.101', location: 'Los Angeles, US', time: '30 minutes ago' },
]

const initialWhitelist = [
    { ip: '192.168.1.100', label: 'Admin Office Gateway' },
    { ip: '10.0.0.0/24', label: 'Corporate Intra-Network' },
]

const firewallRules = [
    { name: 'SQL Injection Mitigation', desc: 'Real-time pattern analysis for malicious query detection', enabled: true },
]

const governanceRules = [
    { name: 'Admin Panel IP Lock', desc: 'Restrict administrative console to whitelisted secure networks', enabled: true },
]

function Security() {
    const [whitelist, setWhitelist] = useState(initialWhitelist)
    const [newIP, setNewIP] = useState('')
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        'Admin Panel IP Lock': true,
        'SQL Injection Mitigation': true,
    })

    const addIP = () => {
        if (newIP.trim()) {
            setWhitelist([...whitelist, { ip: newIP.trim(), label: '' }])
            setNewIP('')
        }
    }

    const removeIP = (ip: string) => {
        if (window.confirm('Remove this IP from whitelist?')) {
            setWhitelist(whitelist.filter(w => w.ip !== ip))
        }
    }

    const toggleRule = (name: string) => {
        setToggles(prev => ({ ...prev, [name]: !prev[name] }))
    }

    return (
        <div>
            {/* ── Page Header (canonical) ── */}
            <div className="page-header">
                <h1>Security & Settings</h1>
                <p className="page-subtitle">Access control, firewall rules, and security audit configuration</p>
            </div>

            {/* ── Threat Level Alert ── */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mb-8 flex items-center gap-5 transition-all hover:shadow-md">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: '#064e3b', margin: 0 }}>System Status: Optimal</h2>
                    <p style={{ color: '#047857', fontSize: 14, marginTop: 4 }}>No immediate security threats detected. All encryption valid and Vault protocols secured.</p>
                </div>
            </div>

            {/* ── Security Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="sirsi-card text-center" style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <div className="text-red-500 mb-3"><Ban size={28} /></div>
                    <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }} className="text-slate-900 dark:text-slate-100">23</div>
                    <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blocked Attempts</div>
                </div>
                <div className="sirsi-card text-center border-emerald-100 bg-emerald-50/20" style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <div className="text-emerald-600 mb-3"><UserCheck size={28} /></div>
                    <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }} className="text-slate-900 dark:text-slate-100">100%</div>
                    <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Users with MFA</div>
                </div>
                <div className="sirsi-card text-center" style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <div className="text-emerald-500 mb-3"><Lock size={28} /></div>
                    <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }} className="text-slate-900 dark:text-slate-100">SSL A+</div>
                    <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Encryption Rating</div>
                </div>
                <div className="sirsi-card text-center" style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <div className="text-amber-500 mb-3"><Clock size={28} /></div>
                    <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }} className="text-slate-900 dark:text-slate-100">2d</div>
                    <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Since Last Audit</div>
                </div>
            </div>

            {/* ── Access Control ── */}
            <div className="sirsi-card mb-8">
                <h3 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>Active Administrative Sessions</h3>
                <div className="sirsi-table-wrap mb-8">
                    <table className="sirsi-table">
                        <thead>
                            <tr>
                                <th>Authorized User</th>
                                <th>IP Address</th>
                                <th>Location Context</th>
                                <th>Session Start</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s) => (
                                <tr key={s.ip}>
                                    <td className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 500, fontStyle: 'italic' }}>{s.email}</td>
                                    <td><code style={{ fontSize: 12, fontFamily: 'monospace' }}>{s.ip}</code></td>
                                    <td>{s.location}</td>
                                    <td className="text-slate-500 dark:text-slate-400">{s.time}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-secondary group hover:border-red-500 hover:text-red-500"
                                            onClick={() => window.confirm('Terminate this session?') && alert('Session terminated')}>
                                            <XCircle size={14} style={{ marginRight: 4 }} /> Terminate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Governance & Access Rules</h3>
                <div className="space-y-4">
                    {governanceRules.map(rule => (
                        <div key={rule.name} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all">
                            <div>
                                <p className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 500 }}>{rule.name}</p>
                                <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{rule.desc}</p>
                            </div>
                            <ToggleSwitch checked={toggles[rule.name]} onChange={() => toggleRule(rule.name)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Firewall & IP Management ── */}
            <div className="sirsi-card mb-8">
                <h3 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>Firewall & Perimeter Defense</h3>

                <div className="mb-8">
                    <h4 className="text-slate-400 dark:text-slate-500" style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>IP Whitelist Context</h4>
                    <div className="space-y-3 mb-6">
                        {whitelist.map(w => (
                            <div key={w.ip} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-slate-700 dark:text-slate-300" style={{ fontSize: 14, fontWeight: 500, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                                    {w.ip}
                                    {w.label && <span className="text-slate-400 dark:text-slate-500" style={{ fontWeight: 400, marginLeft: 8, fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>— {w.label}</span>}
                                </span>
                                <button onClick={() => removeIP(w.ip)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text" value={newIP} onChange={e => setNewIP(e.target.value)}
                            placeholder="Enter CIDR range or specific IP"
                            style={{
                                flex: 1, padding: '8px 16px',
                                borderRadius: 8, fontSize: 14, outline: 'none',
                            }}
                            className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
                        />
                        <button className="btn-primary flex items-center gap-2" onClick={addIP}>
                            <Plus size={14} /> Authorize IP
                        </button>
                    </div>
                </div>

                <h3 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Active Firewall Protocols</h3>
                <div className="space-y-4">
                    {firewallRules.map(rule => (
                        <div key={rule.name} className="flex items-center justify-between p-5 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                            <div>
                                <p className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 500 }}>{rule.name}</p>
                                <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{rule.desc}</p>
                            </div>
                            <ToggleSwitch checked={toggles[rule.name]} onChange={() => toggleRule(rule.name)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Security Audit Log ── */}
            <div className="sirsi-card mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historical Audit Ledger</h3>
                </div>
                <div className="space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex justify-between items-start">
                        <div>
                            <h6 className="text-slate-900 dark:text-slate-100" style={{ fontWeight: 500, marginBottom: 4 }}>Failed Login Attempt</h6>
                            <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: 12, fontStyle: 'italic' }}>Multiple invalid handshakes detected from IP 45.142.182.112</p>
                            <p className="text-slate-400 dark:text-slate-500" style={{ fontSize: 10, marginTop: 8, textTransform: 'uppercase', fontWeight: 500, letterSpacing: '-0.02em' }}>10 mins ago • Vector: Brute Force</p>
                        </div>
                        <span className="sirsi-badge sirsi-badge-error">Critical</span>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <button className="btn-secondary px-8" style={{ fontWeight: 500, fontSize: 12, textTransform: 'uppercase' }}>
                        <History size={14} style={{ display: 'inline', marginRight: 8 }} />
                        Access Historical Audit Trail
                    </button>
                </div>
            </div>

            {/* ── Emergency Protocols ── */}
            <div className="sirsi-card" style={{
                borderColor: 'transparent', background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                padding: 32, color: 'white', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', right: -40, bottom: -40,
                    fontSize: 180, color: 'rgba(255,255,255,0.05)',
                }}>
                    <AlertTriangle size={180} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>Emergency Protocols</h3>
                <p style={{ color: '#fecaca', fontSize: 14, marginBottom: 32, fontWeight: 500, fontStyle: 'italic', opacity: 0.8 }}>Use these actions only in case of verified security breach.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ position: 'relative', zIndex: 10 }}>
                    {[
                        { icon: <Lock size={18} />, label: 'System Lockdown', action: 'block all non-admin access' },
                        { icon: <UserX size={18} />, label: 'Flush Sessions', action: 'terminate all active sessions' },
                        { icon: <Key size={18} />, label: 'Reset Passwords', action: 'force all users to reset their passwords' },
                    ].map(btn => (
                        <button key={btn.label}
                            onClick={() => window.confirm(`This will ${btn.action}. Are you sure?`) && alert(`${btn.label} activated!`)}
                            style={{
                                padding: '16px 24px', background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 12, fontWeight: 600, textTransform: 'uppercase',
                                fontSize: 12, letterSpacing: '0.1em', color: 'white',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
                                transition: 'all 0.2s',
                            }}
                            className="hover:bg-white dark:hover:bg-slate-100 hover:text-red-700"
                        >
                            {btn.icon} {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Toggle Switch (matches HTML .toggle-switch exactly) ──
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
            <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: checked ? '#059669' : '#e5e7eb',
                transition: '0.4s', borderRadius: 34,
            }}>
                <span style={{
                    position: 'absolute', content: '""', height: 18, width: 18,
                    left: checked ? 23 : 3, bottom: 3,
                    backgroundColor: 'white', transition: '0.4s', borderRadius: '50%',
                }} />
            </span>
        </label>
    )
}
