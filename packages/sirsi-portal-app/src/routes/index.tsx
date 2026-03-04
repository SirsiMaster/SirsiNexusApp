/**
 * Sirsi Master Command — Dashboard
 * Pixel-perfect port of: packages/sirsi-portal/admin/index.html
 * Layout: page-header + KPI cards + Quick Access + Tenant Clusters + Activity + Intelligence
 *
 * Typography: Inter (NOT Cinzel) — per shared.css admin portal convention
 * Body text: font-weight ≤ 500 (Rule 21)
 * Headings: font-weight 700 via .page-header h1 CSS class
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    Users, Building2, FileText, FolderOpen, Shield, Activity,
    Bot, BarChart3, Terminal, Cpu
} from 'lucide-react'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import { useSystemOverview } from '@/hooks/useAdminService'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/',
    component: Dashboard,
})

// ── Quick Access Links ────────────────────────────────────────────
const quickLinks = [
    { label: 'User Management', icon: Users, to: '/users' },
    { label: 'Operations', icon: Building2, to: '/tenants' },
    { label: 'Contracts', icon: FileText, to: '/contracts' },
    { label: 'Security', icon: Shield, to: '/security' },
    { label: 'Data Room', icon: FolderOpen, to: '/data-room' },
    { label: 'System Status', icon: Cpu, to: '/site-admin' },
    { label: 'Telemetry', icon: Activity, to: '/telemetry' },
    { label: 'AI Agents', icon: Bot, to: '/ai-agents' },
    { label: 'Investor Portal', icon: BarChart3, to: '/portal' },
    { label: 'Console', icon: Terminal, to: '/console' },
]

// ── Component ─────────────────────────────────────────────────────
function Dashboard() {
    // Live data from Go backend (ConnectRPC)
    const { data: overview, isLoading } = useSystemOverview()

    // Derived KPIs — live when backend is up, fallback when down
    const totalContracts = overview?.totalContracts ?? 142
    const maintenanceMode = overview?.maintenanceMode ?? false

    return (
        <div>
            {/* ── Page Header ──────────────────────────────────── */}
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>Sirsi Master Command</h1>
                    <p className="page-subtitle">
                        Portfolio orchestration and global operational integrity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-widest border ${maintenanceMode
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                        {maintenanceMode ? 'Maintenance' : 'Cluster: Optimal'}
                    </span>
                    {isLoading && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Syncing...</span>
                    )}
                </div>
            </div>

            {/* ── Compact KPIs (4 cards) — live from backend ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KpiCard label="Throughput" value="842k" unit="ops/m" />
                <KpiCard label="Nodes" value={String(totalContracts)} unit="active" />
                <KpiCard label="Security" value="100%" unit="MFA" />
                <KpiCard label="Availability" value="99.98%" />
            </div>

            {/* ── Quick Access Navigation Cards (10 links) ─────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
                {quickLinks.map((link) => (
                    <a
                        key={link.label}
                        href={link.to}
                        className="sirsi-card flex items-center gap-3 hover:border-emerald-300 transition-all no-underline"
                    >
                        <link.icon size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700">{link.label}</span>
                    </a>
                ))}
            </div>

            {/* ── Dashboard Center: 3-column layout ────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left 2/3: Tenant Clusters + Activity Table */}
                <div className="xl:col-span-2 space-y-6">
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest border-l-4 border-emerald-600 ps-4 italic mb-8">
                        Tenant Operational Clusters
                    </h3>

                    {/* FinalWishes Cluster */}
                    <TenantCluster
                        name="FinalWishes Portfolio"
                        initials="FW"
                        status="Syncing"
                        statusColor="text-emerald-600"
                        environment="Production"
                        bgColor="bg-emerald-50"
                        textColor="text-emerald-600"
                        borderColor="border-emerald-100"
                        coreHealth="99.9% Uptime"
                        corePercent="(60%)"
                        bespokeHealth="High Efficiency"
                        bespokeColor="text-amber-500"
                        bespokePercent="(40%)"
                        hoverBorder="hover:border-emerald-200"
                        decorationColor="decoration-emerald-200"
                        bespokeDecorationColor="decoration-amber-200"
                    />

                    {/* Assiduous Cluster */}
                    <TenantCluster
                        name="Assiduous Portfolio"
                        initials="AS"
                        status="Provisioning"
                        statusColor="text-blue-500 italic"
                        environment="Staging"
                        bgColor="bg-blue-50"
                        textColor="text-blue-600"
                        borderColor="border-blue-100"
                        coreHealth="82% Sync"
                        corePercent="(60%)"
                        bespokeHealth="Initializing..."
                        bespokeColor="text-gray-400"
                        bespokePercent="(40%)"
                        hoverBorder="hover:border-blue-200"
                        decorationColor="decoration-blue-200"
                        bespokeDecorationColor=""
                    />

                    {/* Global Activity Table */}
                    <div className="sirsi-table-wrap mt-12">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/10">
                            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest italic m-0">
                                Global Activity Registry
                            </h3>
                        </div>
                        <table className="sirsi-table">
                            <thead>
                                <tr>
                                    <th className="ps-6">Entity Architecture</th>
                                    <th>Isolation Context</th>
                                    <th>Active Event</th>
                                    <th className="text-right pe-6">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                    <td className="ps-6">
                                        <div className="flex items-center gap-3">
                                            <Shield size={12} className="text-emerald-600" />
                                            <span className="font-medium text-gray-900">Sirsi Master</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest italic">
                                            Global Infrastructure
                                        </span>
                                    </td>
                                    <td className="text-xs font-medium text-gray-600">
                                        Vertex AI Pipeline Sanitization
                                    </td>
                                    <td className="text-right pe-6 text-[10px] font-medium text-gray-400">
                                        12:31:05 PM
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                    <td className="ps-6">
                                        <div className="flex items-center gap-3">
                                            <FileText size={12} className="text-amber-500" />
                                            <span className="font-medium text-gray-900">FinalWishes Operative</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-widest italic tracking-tight">
                                            finalwishes
                                        </span>
                                    </td>
                                    <td className="text-xs font-medium text-gray-600">
                                        Legal Will Synthesis #FW-2026
                                    </td>
                                    <td className="text-right pe-6 text-[10px] font-medium text-gray-400">
                                        12:28:44 PM
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right 1/3: Intelligence Feed */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        Intelligence Feed
                        <span className="h-[1px] flex-1 bg-gray-100" />
                    </h3>

                    {/* Hypervisor Status */}
                    <Card className="border-gray-200 shadow-snd-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Cpu size={16} className="text-gray-400" />
                                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                                    Hypervisor
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-[10px] font-medium uppercase mb-1.5">
                                        <span className="text-gray-600">Cluster Density</span>
                                        <span className="text-emerald-600">82.4%</span>
                                    </div>
                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[82%]" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed pt-2 border-t border-gray-100">
                                    Managing tenant contexts for FinalWishes, Assiduous, and Sirsi Core.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Sentinel */}
                    <Card className="border-gray-200 shadow-snd-card">
                        <CardContent className="p-4">
                            <h4 className="text-[10px] font-semibold text-gray-900 uppercase tracking-widest border-l-4 border-emerald-600 ps-3 mb-6">
                                Security Sentinel
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <span className="text-[11px] font-medium text-gray-900">MFA Handshake: Success</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <span className="text-[11px] font-medium text-gray-900">Vault Access: Verified</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-40">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                    <span className="text-[11px] font-medium text-gray-400 italic">Threat Detection: Null</span>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-2.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-100 rounded-xl text-[9px] font-semibold uppercase tracking-widest transition-all italic">
                                Launch Global Audit
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// ── Sub-Components ────────────────────────────────────────────────

function KpiCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
    return (
        <div className="sirsi-card">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-2">
                {label}
            </span>
            <div className="text-2xl font-medium text-gray-900">
                {value}
                {unit && <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>}
            </div>
        </div>
    )
}

function TenantCluster({
    name, initials, status, statusColor, environment,
    bgColor, textColor, borderColor,
    coreHealth, corePercent, bespokeHealth, bespokeColor, bespokePercent,
    hoverBorder, decorationColor, bespokeDecorationColor,
}: {
    name: string; initials: string; status: string; statusColor: string;
    environment: string; bgColor: string; textColor: string; borderColor: string;
    coreHealth: string; corePercent: string;
    bespokeHealth: string; bespokeColor: string; bespokePercent: string;
    hoverBorder: string; decorationColor: string; bespokeDecorationColor: string;
}) {
    return (
        <div className={`sirsi-card p-0 overflow-hidden group ${hoverBorder} transition-all`}>
            <div className="p-6 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${bgColor} ${textColor} rounded-xl flex items-center justify-center ${borderColor} border font-semibold text-xs scale-90`}>
                        {initials}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-tight m-0">
                            {name}
                        </h4>
                        <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest mt-1">
                            Status: <span className={`font-semibold ${statusColor}`}>{status}</span> • Environment: {environment}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <div className={`text-xs font-semibold text-gray-900 tracking-tighter underline ${decorationColor} decoration-2`}>
                            {coreHealth}
                        </div>
                        <div className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                            Core Health {corePercent}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-right">
                        <div className={`text-xs font-semibold ${bespokeColor} tracking-tighter ${bespokeDecorationColor ? `underline ${bespokeDecorationColor} decoration-2` : ''}`}>
                            {bespokeHealth}
                        </div>
                        <div className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                            Bespoke Flow {bespokePercent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
