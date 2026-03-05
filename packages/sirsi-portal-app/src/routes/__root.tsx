/**
 * Root Layout — Pixel-perfect port of admin-header.js + admin-sidebar.js
 *
 * Uses ONLY canonical CSS classes from common-styles.css (already in index.css):
 *  - .admin-header / .admin-header-inner / .admin-header-left / .admin-header-center / .admin-header-right
 *  - .admin-sidebar / .admin-sidebar-scroll / .sidebar-group / .admin-sidebar-link
 *  - .sidebar-content / .content-wrapper
 *
 * Layout contract (Rule 20):
 *  - Header: fixed, 60px, full-width
 *  - Sidebar: fixed, 250px, top: 60px (below header)
 *  - Content: margin-left: 250px, padding-top: 92px
 *
 * Typography: Inter (body ≤ 500, Rule 21), brand name uses font-semibold
 */

import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard, Users, Building2, FileText, Activity, FolderOpen,
    Lock, ScrollText, ShieldCheck, Landmark, BarChart3, Eye, MessageSquare,
    Bot, Sparkles, Monitor, Settings2, LogOut, Search, ChevronDown,
    Sun, Moon, PanelLeftClose, UserPlus, Upload, Sliders, HelpCircle,
    MessageCircle, User, TrendingUp, Radio, Server, Database, HardDrive, Archive,
    GitBranch
} from 'lucide-react'
import { CommandPalette } from '../components/command-palette/CommandPalette'
import { NotificationCenter } from '../components/notifications/NotificationCenter'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { AuthProvider, useAuth } from '../hooks/useAuth'
import { ProtectedRoute } from '../components/ProtectedRoute'

// Wrapped components to avoid TS generics issues
const LinkComp = Link as any
const OutletComp = Outlet as any
const DevtoolsComp = TanStackRouterDevtools as any

// ── Sidebar config (matches admin-sidebar.js nav groups exactly) ──
interface NavItem { to: string; label: string; icon: any }
interface NavGroup { title: string; items: NavItem[]; defaultOpen?: boolean }

const sidebarGroups: NavGroup[] = [
    {
        title: 'MAIN',
        defaultOpen: true,
        items: [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/users', label: 'User Management', icon: Users },
            { to: '/data-room', label: 'Data Room', icon: FolderOpen },
            { to: '/tenants', label: 'Operations', icon: Building2 },
            { to: '/contracts', label: 'Contracts', icon: FileText },
            { to: '/security', label: 'Security & Settings', icon: Lock },
            { to: '/ai-agents', label: 'AI Agents', icon: Bot },
            { to: '/hypervisor', label: 'Sirsi Hypervisor', icon: Sparkles },
        ],
    },
    {
        title: 'SYSTEM STATUS',
        defaultOpen: false,
        items: [
            { to: '/telemetry', label: 'Telemetry', icon: Activity },
            { to: '/analytics', label: 'Analytics', icon: TrendingUp },
            { to: '/system-logs', label: 'System Logs', icon: ScrollText },
            { to: '/monitoring', label: 'Monitoring', icon: Radio },
            { to: '/site-admin', label: 'System Status', icon: Server },
            { to: '/cache-status', label: 'Cache Status', icon: HardDrive },
            { to: '/api-server', label: 'API Server', icon: Server },
            { to: '/database-health', label: 'Database Health', icon: Database },
            { to: '/backup-status', label: 'Backup Status', icon: Archive },
            { to: '/console', label: 'Console', icon: Monitor },
            { to: '/development', label: 'Development', icon: GitBranch },
        ],
    },
    {
        title: 'INVESTOR',
        defaultOpen: false,
        items: [
            { to: '/portal', label: 'Portal', icon: Landmark },
            { to: '/kpi-metrics', label: 'KPI Metrics', icon: BarChart3 },
            { to: '/committee', label: 'Committee', icon: Eye },
            { to: '/messaging', label: 'Messaging', icon: MessageSquare },
        ],
    },
    {
        title: 'QUICK ACTIONS',
        defaultOpen: false,
        items: [
            { to: '/users', label: 'Add User', icon: UserPlus },
            { to: '/security', label: 'Security Settings', icon: ShieldCheck },
            { to: '/system-logs', label: 'View Logs', icon: Eye },
            { to: '/data-room', label: 'Upload Documents', icon: Upload },
            { to: '/security', label: 'Configure Site', icon: Sliders },
        ],
    },
    {
        title: 'HELP & RESOURCES',
        defaultOpen: false,
        items: [
            { to: '/', label: 'Quick Help', icon: HelpCircle },
            { to: '/', label: 'Contact Support', icon: MessageCircle },
        ],
    },
]

// ── Chevron SVG (matches admin-sidebar.js exactly) ──
function ChevronIcon({ collapsed }: { collapsed: boolean }) {
    return (
        <span className={`sidebar-group-chevron ${collapsed ? 'collapsed-chevron' : ''}`}
            style={{ transition: 'transform 0.2s ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)' }}>
            <ChevronDown size={12} />
        </span>
    )
}

// ── Sidebar Group (matches sidebar-group structure) ──
function SidebarGroup({ group }: { group: NavGroup }) {
    const [collapsed, setCollapsed] = useState(!group.defaultOpen)

    return (
        <div className={`sidebar-group ${collapsed ? 'collapsed' : ''}`}>
            <button
                className="sidebar-group-header"
                onClick={() => setCollapsed(!collapsed)}
            >
                <span className="sidebar-group-header-label">{group.title}</span>
                <ChevronIcon collapsed={collapsed} />
            </button>
            <div className="sidebar-group-items">
                {group.items.map((item) => (
                    <LinkComp
                        key={`${group.title}-${item.label}`}
                        to={item.to}
                        className="admin-sidebar-link"
                        activeProps={{ className: 'admin-sidebar-link active' }}
                        activeOptions={{ exact: item.to === '/' }}
                    >
                        <span className="admin-sidebar-icon">
                            <item.icon size={16} />
                        </span>
                        <span className="admin-sidebar-link-label">{item.label}</span>
                    </LinkComp>
                ))}
            </div>
        </div>
    )
}

// ── Public page paths (no sidebar, standalone site header + footer) ──
const PUBLIC_PATHS = ['/', '/home', '/login', '/signup', '/documentation']

// ── Public Site Header (pixel-perfect match to sirsi.ai index.html header) ──
function PublicHeader({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
    return (
        <header className="bg-white dark:bg-gray-800/95 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700" style={{ backdropFilter: 'blur(8px)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', height: 64, alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* LEFT: Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/sirsi-icon.png" alt="Sirsi Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0, lineHeight: 1.2 }}>
                                SirsiNexus
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', background: isDark ? '#1e293b' : '#f1f5f9', padding: '1px 8px', borderRadius: 4 }}>v0.7.10-alpha</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />
                                    <span style={{ fontSize: 11, color: isDark ? '#cbd5e1' : '#475569' }}>Live</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Nav Links */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <LinkComp to="/home" style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', fontWeight: 400 }}>
                            Forum
                        </LinkComp>
                        <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener"
                            style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', fontWeight: 400 }}>
                            App Repository
                        </a>
                        <LinkComp to="/documentation" style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', fontWeight: 400 }}>
                            Documentation
                        </LinkComp>
                        <LinkComp to="/login" style={{ fontSize: 14, color: '#059669', textDecoration: 'none', fontWeight: 500 }}>
                            Login
                        </LinkComp>
                        <button
                            onClick={toggleTheme}
                            style={{
                                padding: 8, border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                                borderRadius: 8, background: 'transparent', cursor: 'pointer',
                                color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            title="Toggle theme"
                        >
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    )
}

// ── Public Site Footer (2-row compact) ──
function PublicFooter({ isDark }: { isDark: boolean }) {
    const lk = `text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors no-underline`
    const dot = <span className={`mx-1.5 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
    const label = (t: string, emerald?: boolean) => (
        <span className={`text-xs font-semibold uppercase tracking-wider ${emerald ? 'text-emerald-600' : isDark ? 'text-slate-300' : 'text-slate-700'} mr-2`}>{t}</span>
    )

    return (
        <footer className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-t py-4`}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Row 1: Brand + all links inline */}
                <div className="flex items-center justify-center flex-wrap gap-y-2">
                    <div className="flex items-center gap-2 mr-6">
                        <img src="/sirsi-icon.png" alt="Sirsi" className="w-5 h-5 object-contain" />
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>SirsiNexus</span>
                    </div>

                    {label('Platform')}
                    <a href="#features" className={lk}>Features</a>{dot}
                    <a href="#platform" className={lk}>Architecture</a>{dot}
                    <LinkComp to="/documentation" className={lk}>Docs</LinkComp>{dot}
                    <a href="#pricing" className={lk}>Pricing</a>

                    <span className="mx-3" />

                    {label('Company')}
                    <a href="#about" className={lk}>About</a>{dot}
                    <a href="#careers" className={lk}>Careers</a>{dot}
                    <a href="#blog" className={lk}>Blog</a>{dot}
                    <a href="#contact" className={lk}>Contact</a>

                    <span className="mx-3" />

                    {label('Legal', true)}
                    <a href="/privacy" className={lk}>Privacy</a>{dot}
                    <a href="/terms" className={lk}>Terms</a>{dot}
                    <a href="/security" className={lk}>Security</a>{dot}
                    <LinkComp to="/login" className={lk}>Portal</LinkComp>
                </div>

                {/* Row 2: Copyright */}
                <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex justify-center items-center gap-3`}>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>© 2026 Sirsi Technologies Inc. All rights reserved.</span>
                    <span className={`${isDark ? 'text-slate-700' : 'text-slate-300'}`}>|</span>
                    <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Agent-embedded infrastructure platform</span>
                </div>
            </div>
        </footer>
    )
}

// ── Public Layout Wrapper ──
function PublicLayout() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme')
        const prefersDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', prefersDark)
        return prefersDark
    })

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    return (
        <div className="font-inter flex flex-col min-h-screen" style={{ background: isDark ? '#0f172a' : '#f8fafc' }}>
            <PublicHeader isDark={isDark} toggleTheme={toggleTheme} />
            <div className="flex flex-col flex-1">
                <ErrorBoundary section="Public Page">
                    <OutletComp />
                </ErrorBoundary>
            </div>
            <PublicFooter isDark={isDark} />
        </div>
    )
}

// ── Root Layout ──
function RootLayout() {
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname

    // Check if this is a public page (NOT inside admin/portal directory)
    const isPublicPage = PUBLIC_PATHS.some(p => currentPath === p || currentPath.startsWith(p + '/'))

    // AuthProvider MUST wrap both branches so auth state persists
    // across public→admin navigation (e.g., /login → /dashboard).
    // Previously each branch had its own AuthProvider which caused
    // remounting and auth state loss on route transitions.
    return (
        <AuthProvider>
            {isPublicPage ? (
                <>
                    <PublicLayout />
                    <DevtoolsComp />
                </>
            ) : (
                <ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>
            )}
        </AuthProvider>
    )
}

// ── Admin Layout (sidebar + header — portal pages only) ──
function AdminLayout() {
    const { user, signOut } = useAuth()
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [sidebarMini, setSidebarMini] = useState(() =>
        localStorage.getItem('sirsi_sidebar_collapsed') === 'true'
    )
    const [clock, setClock] = useState('--:--')
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme')
        const prefersDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
        // Apply immediately to avoid flash
        document.documentElement.classList.toggle('dark', prefersDark)
        return prefersDark
    })

    useKeyboardShortcuts([
        { key: 'k', metaKey: true, action: () => setCommandPaletteOpen(true), description: 'Open Command Palette' },
    ])

    // Live clock
    useEffect(() => {
        const tick = () => {
            const now = new Date()
            setClock(
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0')
            )
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    // Sidebar collapse
    const toggleSidebar = () => {
        const next = !sidebarMini
        setSidebarMini(next)
        localStorage.setItem('sirsi_sidebar_collapsed', String(next))
    }

    // Theme toggle
    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    return (
        <>
            {/* ── HEADER (canonical: admin-header from common-styles.css) ── */}
            <header className="admin-header">
                <div className="admin-header-inner">
                    {/* LEFT: Brand + Live */}
                    <div className="admin-header-left">
                        <div className="admin-header-brand">
                            <div className="admin-header-logo">
                                <img src="/sirsi-icon.png" alt="Sirsi" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            </div>
                            <div className="admin-header-brand-text">
                                <span className="admin-header-brand-name">SirsiNexus</span>
                                <span className="admin-header-brand-role">ADMIN CONSOLE</span>
                            </div>
                        </div>
                        <div className="admin-header-status">
                            <span className="admin-header-dot" />
                            <span>Live</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginLeft: 8 }}>v0.8.0-α</span>
                    </div>

                    {/* CENTER: Sitewide Search */}
                    <div className="admin-header-center">
                        <div className="admin-header-search">
                            <Search size={16} className="admin-header-search-icon" />
                            <input
                                type="text"
                                placeholder="Search users, documents, settings..."
                                autoComplete="off"
                                onFocus={() => setCommandPaletteOpen(true)}
                                readOnly
                            />
                            <span className="admin-header-search-kbd">⌘K</span>
                        </div>
                    </div>

                    {/* RIGHT: Clock + Controls */}
                    <div className="admin-header-right">
                        <span className="admin-header-clock">{clock}</span>

                        {/* Theme Toggle */}
                        <button className="admin-header-btn" onClick={toggleTheme} aria-label="Toggle theme">
                            {isDark ? <Moon size={18} className="admin-header-icon" /> : <Sun size={18} className="admin-header-icon" />}
                        </button>

                        {/* Logout */}
                        <button className="admin-header-btn" aria-label="Logout" onClick={() => {
                            signOut().finally(() => {
                                window.location.href = '/login'
                            })
                        }}>
                            <LogOut size={18} className="admin-header-icon" />
                        </button>

                        {/* User */}
                        <div className="admin-header-user">
                            <span className="admin-header-user-label">{user?.displayName || user?.email?.split('@')[0] || 'Administrator'}</span>
                            <div className="admin-header-avatar">
                                <User size={18} className="admin-header-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── SIDEBAR (canonical: admin-sidebar from common-styles.css) ── */}
            <nav className={`admin-sidebar ${sidebarMini ? 'sidebar-mini' : ''}`}>
                <div className="sidebar-top-toggle">
                    <button className="sidebar-toggle-btn" onClick={toggleSidebar}
                        title={sidebarMini ? 'Expand sidebar' : 'Collapse sidebar'}>
                        <span className="admin-sidebar-icon" style={sidebarMini ? { transform: 'scaleX(-1)' } : undefined}>
                            <PanelLeftClose size={16} />
                        </span>
                        <span className="admin-sidebar-link-label">{sidebarMini ? 'Expand' : 'Collapse'}</span>
                    </button>
                </div>
                <div className="admin-sidebar-scroll">
                    {sidebarGroups.map((group, i) => (
                        <SidebarGroup key={i} group={group} />
                    ))}
                </div>
                <div className="admin-sidebar-footer">
                    <LinkComp to="/settings" className="admin-sidebar-link" activeProps={{ className: 'admin-sidebar-link active' }}>
                        <span className="admin-sidebar-icon"><Settings2 size={16} /></span>
                        <span className="admin-sidebar-link-label">Settings</span>
                    </LinkComp>
                    <button className="admin-sidebar-link sidebar-signout" onClick={() => {
                        signOut().finally(() => {
                            window.location.href = '/login'
                        })
                    }}>
                        <span className="admin-sidebar-icon"><LogOut size={16} /></span>
                        <span className="admin-sidebar-link-label">Sign Out</span>
                    </button>
                </div>
            </nav>

            {/* ── MAIN CONTENT (canonical: sidebar-content + content-wrapper) ── */}
            <main className={`sidebar-content ${sidebarMini ? 'sidebar-collapsed' : ''}`}>
                <div className="content-wrapper">
                    <ErrorBoundary section="Admin Module">
                        <OutletComp />
                    </ErrorBoundary>
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
        </>
    )
}

export const Route = createRootRoute({
    component: RootLayout,
})
