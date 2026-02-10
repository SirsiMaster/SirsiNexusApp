// src/routes/__root.tsx
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const SidebarLink = Link as any
const RouterOutlet = Outlet as any
const RouterDevtools = TanStackRouterDevtools as any

export const Route = createRootRoute({
    component: () => (
        <div className="flex min-h-screen bg-royal-gradient shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
            {/* Sidebar */}
            <aside className="w-64 glass-panel m-4 flex flex-col">
                <div className="p-8 border-b border-white/10">
                    <div className="text-sirsi-gold font-heading text-xl tracking-[0.2em]">SIRSI</div>
                    <div className="text-white/40 text-[10px] font-heading tracking-[0.3em] mt-1">NEXUS · ADMIN</div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <SidebarLink to="/" className="nav-link" activeProps={{ className: 'active' }}>
                        <span>Dashboard</span>
                    </SidebarLink>
                    <SidebarLink to="/tenants" className="nav-link" activeProps={{ className: 'active' }}>
                        <span>Tenants</span>
                    </SidebarLink>
                    <SidebarLink to="/users" className="nav-link" activeProps={{ className: 'active' }}>
                        <span>Users</span>
                    </SidebarLink>
                    <SidebarLink to="/contracts" className="nav-link" activeProps={{ className: 'active' }}>
                        <span>Contracts</span>
                    </SidebarLink>
                    <div className="flex-1" />
                    <SidebarLink to="/settings" className="nav-link" activeProps={{ className: 'active' }}>
                        <span>Settings</span>
                    </SidebarLink>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 pt-12">
                <RouterOutlet />
            </main>

            <RouterDevtools />
        </div>
    ),
})
