/**
 * Site Admin — Platform Configuration
 * Merged from: sirsinexusportal/site-admin.html
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState } from 'react'
import { Globe, Server, Database, Cloud, RefreshCw, CheckCircle } from 'lucide-react'

const GlobeIcon = Globe as any
const ServerIcon = Server as any
const DatabaseIcon = Database as any
const CloudIcon = Cloud as any
const RefreshCwIcon = RefreshCw as any
const CheckCircleIcon = CheckCircle as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/site-admin',
    component: SiteAdmin,
})

const services = [
    { name: 'Firebase Hosting', status: 'operational' as const, url: 'sirsi-sign.web.app', uptime: '99.97%', icon: CloudIcon },
    { name: 'Cloud Run (gRPC)', status: 'operational' as const, url: 'api.sirsi.ai', uptime: '99.85%', icon: ServerIcon },
    { name: 'Cloud SQL', status: 'operational' as const, url: 'postgres-primary', uptime: '99.99%', icon: DatabaseIcon },
    { name: 'Firestore', status: 'operational' as const, url: 'sirsi-nexus-live', uptime: '99.99%', icon: DatabaseIcon },
    { name: 'Custom Domains', status: 'operational' as const, url: 'sign.sirsi.ai / sirsi.ai', uptime: '100%', icon: GlobeIcon },
]

const deployments = [
    { id: '#247', target: 'sirsi-sign.web.app', status: 'success', time: '2 hours ago', commit: 'ecaf1af' },
    { id: '#246', target: 'sirsi-ai.web.app', status: 'success', time: '1 day ago', commit: '081cee6' },
    { id: '#245', target: 'Cloud Functions', status: 'success', time: '3 days ago', commit: 'a3b2c1d' },
]

function SiteAdmin() {
    const [maintenanceMode, setMaintenanceMode] = useState(false)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
                        style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}>
                        SITE ADMIN
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Platform infrastructure and deployment configuration</p>
                </div>
            </header>

            {/* Service Status Grid */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                    SERVICE STATUS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((svc) => (
                        <div key={svc.name} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svc.icon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{svc.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Operational</span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{svc.url}</div>
                            <div className="text-[10px] text-gray-400 mt-1">Uptime: {svc.uptime}</div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Deployments */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}>
                        RECENT DEPLOYMENTS
                    </h2>
                    <div className="space-y-3">
                        {deployments.map((dep) => (
                            <div key={dep.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{dep.id} → {dep.target}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">commit {dep.commit}</div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{dep.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Config */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}>
                        PLATFORM CONFIG
                    </h2>
                    <div className="space-y-4">
                        <ConfigRow label="Firebase Project" value="sirsi-nexus-live" />
                        <ConfigRow label="Auth Domain" value="sirsi-nexus-live.firebaseapp.com" />
                        <ConfigRow label="Live URL" value="sign.sirsi.ai" />
                        <ConfigRow label="API Endpoint" value="api.sirsi.ai" />
                        <ConfigRow label="Environment" value="Production" />
                        <ConfigRow label="Version" value="v6.0.0" />
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">Maintenance Mode</div>
                                <div className="text-xs text-gray-500 mt-0.5">Restrict all tenant portal access</div>
                            </div>
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-emerald-500'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${maintenanceMode ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">{value}</span>
        </div>
    )
}
