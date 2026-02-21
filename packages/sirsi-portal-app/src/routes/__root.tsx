// src/routes/__root.tsx
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import {
    LayoutDashboard,
    Terminal,
    User,
    ShieldCheck,
    LogOut,
    Settings2,
    Activity
} from 'lucide-react'

const LinkComp = Link as any
const OutletComp = Outlet as any
const DevtoolsComp = TanStackRouterDevtools as any
const DashboardIcon = LayoutDashboard as any
const TerminalIcon = Terminal as any
const UserIcon = User as any
const ShieldCheckIcon = ShieldCheck as any
const LogOutIcon = LogOut as any
const SettingsIcon = Settings2 as any
const ActivityIcon = Activity as any

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
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

export const Route = createRootRoute({
    component: () => (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs ring-4 ring-emerald-600/10">S</div>
                    <div>
                        <span className="font-bold text-gray-900 dark:text-white tracking-tight">SirsiNexus</span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">Admin Console</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <NavLink to="/">
                        <DashboardIcon className="w-4 h-4" />
                        <span>Command Center</span>
                    </NavLink>
                    <NavLink to="/tenants">
                        <TerminalIcon className="w-4 h-4" />
                        <span>Tenants</span>
                    </NavLink>
                    <NavLink to="/users">
                        <UserIcon className="w-4 h-4" />
                        <span>Users</span>
                    </NavLink>
                    <NavLink to="/contracts">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Contracts</span>
                    </NavLink>
                    <NavLink to="/telemetry">
                        <ActivityIcon className="w-4 h-4" />
                        <span>Telemetry</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                    <button className="flex items-center gap-3 px-4 py-2 w-full text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors group">
                        <LogOutIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64 flex-1 min-h-screen bg-gray-50 dark:bg-slate-950">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="pulse-dot" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Integration</span>
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

            <DevtoolsComp />
        </div>
    ),
})
