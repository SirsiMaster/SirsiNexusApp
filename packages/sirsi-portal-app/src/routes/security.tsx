/**
 * Security — MFA, Access Control, Audit
 * Merged from: sirsinexusportal/security.html + ui/security/page.tsx
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import {
    Shield, Lock, Key, AlertTriangle, CheckCircle, Clock, Monitor, Smartphone,
    Globe, UserCheck, XCircle
} from 'lucide-react'

const ShieldIcon = Shield as any
const LockIcon = Lock as any
const KeyIcon = Key as any
const AlertTriangleIcon = AlertTriangle as any
const CheckCircleIcon = CheckCircle as any
const ClockIcon = Clock as any
const MonitorIcon = Monitor as any
const SmartphoneIcon = Smartphone as any
const GlobeIcon = Globe as any
const UserCheckIcon = UserCheck as any
const XCircleIcon = XCircle as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/security',
    component: Security,
})

const activeSessions = [
    { id: '1', device: 'MacBook Pro 16"', browser: 'Chrome 122', location: 'New York, US', ip: '192.168.1.xxx', lastActive: 'Now', current: true },
    { id: '2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', location: 'New York, US', ip: '10.0.0.xxx', lastActive: '2 min ago', current: false },
]

const securityEvents = [
    { id: '1', event: 'Successful login via MFA', time: '2 hours ago', status: 'success' as const, ip: '192.168.1.xxx' },
    { id: '2', event: 'MFA TOTP enrollment completed', time: '1 day ago', status: 'success' as const, ip: '192.168.1.xxx' },
    { id: '3', event: 'Failed login attempt (wrong password)', time: '3 days ago', status: 'warning' as const, ip: '45.33.xxx.xxx' },
    { id: '4', event: 'Password changed successfully', time: '1 week ago', status: 'success' as const, ip: '192.168.1.xxx' },
    { id: '5', event: 'API key rotated', time: '2 weeks ago', status: 'info' as const, ip: '192.168.1.xxx' },
]

function Security() {
    const [mfaEnabled] = useState(true)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
                        style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}>
                        SECURITY CENTER
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">MFA enforcement, session management, and audit trail</p>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">SOC 2 Compliant</span>
                </div>
            </header>

            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SecurityCard icon={<ShieldIcon className="w-5 h-5 text-emerald-600" />} title="Security Score" value="94/100" subtitle="Excellent" color="emerald" />
                <SecurityCard icon={<LockIcon className="w-5 h-5 text-blue-600" />} title="MFA Status" value={mfaEnabled ? 'Enabled' : 'Disabled'} subtitle="TOTP Verified" color="blue" />
                <SecurityCard icon={<ClockIcon className="w-5 h-5 text-amber-600" />} title="Last Audit" value="2 days ago" subtitle="No issues found" color="amber" />
                <SecurityCard icon={<AlertTriangleIcon className="w-5 h-5 text-red-600" />} title="Threats Blocked" value="3" subtitle="Last 30 days" color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* MFA Configuration */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}>
                        MULTI-FACTOR AUTHENTICATION
                    </h2>
                    <div className="space-y-4">
                        <MFAOption icon={<SmartphoneIcon className="w-5 h-5" />} title="TOTP Authenticator" desc="Use Google Authenticator or Authy" enabled={true} />
                        <MFAOption icon={<KeyIcon className="w-5 h-5" />} title="Hardware Security Key" desc="YubiKey or FIDO2 compatible device" enabled={false} />
                        <MFAOption icon={<GlobeIcon className="w-5 h-5" />} title="Recovery Codes" desc="One-time use backup codes" enabled={true} />
                    </div>
                    <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">MFA is enforced for all admin accounts</span>
                        </div>
                        <p className="text-xs text-emerald-600/70 mt-1">Per ADR-016 Canonical MFA Routing Hub protocol</p>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}>
                        ACTIVE SESSIONS
                    </h2>
                    <div className="space-y-3">
                        {activeSessions.map((session) => (
                            <div key={session.id} className={`p-4 rounded-xl border ${session.current ? 'border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/10' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {session.device.includes('Mac') ? <MonitorIcon className="w-5 h-5 text-gray-400" /> : <SmartphoneIcon className="w-5 h-5 text-gray-400" />}
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{session.device}</div>
                                            <div className="text-xs text-gray-500">{session.browser} • {session.location}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{session.ip}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400">{session.lastActive}</span>
                                        {session.current && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-bold mt-1">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                                Current
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!session.current && (
                                    <button className="mt-3 text-xs font-bold text-red-500 hover:text-red-600">Revoke Session</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Event Log */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}>
                        SECURITY EVENT LOG
                    </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {securityEvents.map((evt) => (
                        <div key={evt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${evt.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                        evt.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                            'bg-blue-100 dark:bg-blue-900/30'
                                    }`}>
                                    {evt.status === 'success' ? <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> :
                                        evt.status === 'warning' ? <AlertTriangleIcon className="w-4 h-4 text-amber-600" /> :
                                            <UserCheckIcon className="w-4 h-4 text-blue-600" />}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{evt.event}</div>
                                    <div className="text-[10px] text-gray-400 font-mono">{evt.ip}</div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{evt.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function SecurityCard({ icon, title, value, subtitle, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>{icon}</div>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{title}</div>
            <div className="text-[10px] text-gray-500 mt-1 italic">{subtitle}</div>
        </div>
    )
}

function MFAOption({ icon, title, desc, enabled }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <div className="text-gray-400">{icon}</div>
                <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                </div>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${enabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-200 dark:bg-slate-700 text-gray-400'}`}>
                {enabled ? 'Active' : 'Configure'}
            </div>
        </div>
    )
}
