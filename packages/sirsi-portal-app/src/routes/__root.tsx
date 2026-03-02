// src/routes/__root.tsx — Unified Sidebar with all dashboard sections
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useState } from 'react'
import {
    LayoutDashboard, Terminal, Users, ShieldCheck, LogOut, Settings2, Activity, Search,
    Building2, FileText, FolderOpen, ScrollText, Lock, Eye, Landmark, BarChart3,
    MessageSquare, Bot, Sparkles, Monitor, ChevronDown
} from 'lucide-react'
import { CommandPalette } from '../components/command-palette/CommandPalette'
import { NotificationCenter } from '../components/notifications/NotificationCenter'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

// Wrapped components to avoid TS generics issues with lucide-react
const LinkComp = Link as any
const OutletComp = Outlet as any
const DevtoolsComp = TanStackRouterDevtools as any
const SearchIcon = Search as any
const SettingsIcon = Settings2 as any
const LogOutIcon = LogOut as any
const ChevronDownIcon = ChevronDown as any

// ── Sidebar Config ─────────────────────────────────────────────
interface NavItem {
    to: string
    label: string
    icon: any
}

interface NavGroup {
    title: string
    items: NavItem[]
    defaultOpen?: boolean
}

const sidebarGroups: NavGroup[] = [
    {
        title: '',
        defaultOpen: true,
        items: [
            { to: '/', label: 'Command Center', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Operations',
        defaultOpen: true,
        items: [
            { to: '/users', label: 'Users', icon: Users },
            { to: '/tenants', label: 'Tenants', icon: Building2 },
            { to: '/contracts', label: 'Contracts', icon: FileText },
            { to: '/telemetry', label: 'Telemetry', icon: Activity },
            { to: '/data-room', label: 'Data Room', icon: FolderOpen },
        ],
    },
    {
        title: 'Security',
        defaultOpen: false,
        items: [
            { to: '/security', label: 'Security', icon: Lock },
            { to: '/system-logs', label: 'System Logs', icon: ScrollText },
            { to: '/site-admin', label: 'Site Admin', icon: ShieldCheck },
        ],
    },
    {
        title: 'Investor',
        defaultOpen: false,
        items: [
            { to: '/portal', label: 'Portal', icon: Landmark },
            { to: '/kpi-metrics', label: 'KPI Metrics', icon: BarChart3 },
            { to: '/committee', label: 'Committee', icon: Eye },
            { to: '/messaging', label: 'Messaging', icon: MessageSquare },
        ],
    },
    {
        title: 'Intelligence',
        defaultOpen: false,
        items: [
            { to: '/ai-agents', label: 'AI Agents', icon: Bot },
            { to: '/hypervisor', label: 'Hypervisor', icon: Sparkles },
            { to: '/console', label: 'Console', icon: Monitor },
        ],
    },
]

// ── NavLink ────────────────────────────────────────────────────
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <LinkComp
            to={to}
            className="sidebar-link group"
            activeProps={{ className: 'active' }}
        >
            {children}
        </LinkComp>
    )
}

// ── Collapsible Group ──────────────────────────────────────────
function SidebarGroup({ group }: { group: NavGroup }) {
    const [open, setOpen] = useState(group.defaultOpen ?? true)

    // Top-level items (no group title) render flat
    if (!group.title) {
        return (
            <div className="space-y-0.5">
                {group.items.map((item) => (
                    <NavLink key={item.to} to={item.to}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        )
    }

    return (
        <div className="mt-4">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
                <span>{group.title}</span>
                <ChevronDownIcon
                    className={`w-3 h-3 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
                />
            </button>
            {open && (
                <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => (
                        <NavLink key={item.to} to={item.to}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Root Layout ────────────────────────────────────────────────
function RootLayout() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

    useKeyboardShortcuts([
        {
            key: 'k',
            metaKey: true,
            action: () => setCommandPaletteOpen(true),
            description: 'Open Command Palette',
        },
    ])

    return (
        <div className="flex min-h-screen">
            {/* ── Sidebar ────────────────────────────────── */}
            <aside
                className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed inset-y-0 z-50"
                style={{ borderRight: '1px solid rgba(200, 169, 81, 0.15)' }}
            >
                {/* Brand */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs ring-4 ring-emerald-600/10">S</div>
                    <div>
                        <span
                            className="font-bold text-gray-900 dark:text-white tracking-tight"
                            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}
                        >
                            SirsiNexus
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">Admin Console</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-0">
                    {sidebarGroups.map((group, i) => (
                        <SidebarGroup key={i} group={group} />
                    ))}
                </nav>

                {/* Bottom: Settings + Sign Out */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
                    <NavLink to="/settings">
                        <SettingsIcon className="w-4 h-4" />
                        <span>Settings</span>
                    </NavLink>
                    <button className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors group">
                        <LogOutIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ────────────────────────────── */}
            <main className="pl-64 flex-1 min-h-screen bg-gray-50 dark:bg-slate-950">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="pulse-dot" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Integration</span>
                        </div>

                        {/* Command Palette Trigger */}
                        <button
                            onClick={() => setCommandPaletteOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-xs"
                        >
                            <SearchIcon className="w-3.5 h-3.5" />
                            <span>Search or command...</span>
                            <kbd className="text-[10px] bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 ml-2">⌘K</kbd>
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 border-r border-gray-200 dark:border-slate-800 pr-6">
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">Cylton Collymore</p>
                                <p className="text-[10px] text-gray-400 font-medium italic">Systems Administrator</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-gray-400">CC</div>
                        </div>
                        <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    <OutletComp />
                </div>
            </main>

            {/* Command Palette (⌘K) */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />

            {/* Toast Notifications */}
            <NotificationCenter />

            <DevtoolsComp />
        </div>
    )
}

export const Route = createRootRoute({
    component: RootLayout,
})
