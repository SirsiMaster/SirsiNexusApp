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
import { APP_VERSION_DISPLAY } from '../lib/version'
import NotFoundPage from './not-found'
import { Toaster } from 'sonner'

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
const PUBLIC_PATHS = ['/', '/home', '/login', '/signup', '/documentation', '/privacy', '/terms', '/about', '/pricing', '/blog', '/changelog']

// ── Public Site Header (pixel-perfect match to sirsi.ai index.html header) ──
function PublicHeader({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const navLinkClass = 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'

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
                            <h1 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>
                                SirsiNexus
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <LinkComp to="/changelog" className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" style={{ fontSize: 11, padding: '1px 8px', borderRadius: 4, textDecoration: 'none', cursor: 'pointer' }}>{APP_VERSION_DISPLAY}</LinkComp>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />
                                    <span className="text-slate-600 dark:text-slate-300" style={{ fontSize: 11 }}>Live</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Desktop Nav (hidden on mobile) */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="https://github.com/SirsiMaster/SirsiNexusApp/discussions" target="_blank" rel="noopener"
                            className={navLinkClass} style={{ fontSize: 14, textDecoration: 'none', fontWeight: 400 }}>Forum</a>
                        <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener"
                            className={navLinkClass} style={{ fontSize: 14, textDecoration: 'none', fontWeight: 400 }}>App Repository</a>
                        <LinkComp to="/documentation" className={navLinkClass} style={{ fontSize: 14, textDecoration: 'none', fontWeight: 400 }}>Documentation</LinkComp>
                        <LinkComp to="/login" style={{ fontSize: 14, color: '#059669', textDecoration: 'none', fontWeight: 500 }}>Login</LinkComp>
                        <button onClick={toggleTheme}
                            className="border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            style={{ padding: 8, borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Toggle theme">
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </nav>

                    {/* Mobile: Theme toggle + Hamburger */}
                    <div className="flex md:hidden items-center gap-2">
                        <button onClick={toggleTheme}
                            className="border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            style={{ padding: 8, borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Toggle theme">
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                        <button onClick={() => setMenuOpen(!menuOpen)}
                            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            style={{ padding: 8, borderRadius: 8, background: 'transparent', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="Toggle menu">
                            {menuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800/95 px-6 py-4 space-y-1" style={{ backdropFilter: 'blur(8px)' }}>
                    <a href="https://github.com/SirsiMaster/SirsiNexusApp/discussions" target="_blank" rel="noopener"
                        className={`block py-2 ${navLinkClass}`} style={{ fontSize: 14, textDecoration: 'none' }}>Forum</a>
                    <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener"
                        className={`block py-2 ${navLinkClass}`} style={{ fontSize: 14, textDecoration: 'none' }}>App Repository</a>
                    <LinkComp to="/documentation" onClick={() => setMenuOpen(false)}
                        className={`block py-2 ${navLinkClass}`} style={{ fontSize: 14, textDecoration: 'none' }}>Documentation</LinkComp>
                    <LinkComp to="/login" onClick={() => setMenuOpen(false)}
                        className="block py-2" style={{ fontSize: 14, color: '#059669', textDecoration: 'none', fontWeight: 500 }}>Login</LinkComp>
                </div>
            )}
        </header>
    )
}

// ── Public Site Footer (2-row compact) ──
function PublicFooter() {
    const lk = 'text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors no-underline'
    const dot = <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
    const label = (t: string, emerald?: boolean) => (
        <span className={`text-xs font-semibold uppercase tracking-wider ${emerald ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'} mr-2`}>{t}</span>
    )

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4">
            <div className="max-w-7xl mx-auto px-6">
                {/* Row 1: Brand + all links inline */}
                <div className="flex items-center justify-center flex-wrap gap-y-2">
                    <div className="flex items-center gap-2 mr-6">
                        <img src="/sirsi-icon.png" alt="Sirsi" className="w-5 h-5 object-contain" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">SirsiNexus</span>
                    </div>

                    {label('Platform')}
                    <a href="#features" className={lk}>Features</a>{dot}
                    <a href="#platform" className={lk}>Architecture</a>{dot}
                    <LinkComp to="/documentation" className={lk}>Docs</LinkComp>{dot}
                    <LinkComp to="/pricing" className={lk}>Get Started</LinkComp>

                    <span className="mx-3" />

                    {label('Company')}
                    <LinkComp to="/about" className={lk}>About</LinkComp>{dot}
                    <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener" className={lk}>GitHub</a>{dot}
                    <LinkComp to="/blog" className={lk}>Blog</LinkComp>{dot}
                    <a href="mailto:cylton@sirsi.ai" className={lk}>Contact</a>

                    <span className="mx-3" />

                    {label('Legal', true)}
                    <LinkComp to="/privacy" className={lk}>Privacy</LinkComp>{dot}
                    <LinkComp to="/terms" className={lk}>Terms</LinkComp>{dot}
                    <LinkComp to="/security" className={lk}>Security</LinkComp>{dot}
                    <LinkComp to="/login" className={lk}>Portal</LinkComp>
                </div>

                {/* Row 2: Copyright */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-center items-center gap-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">© 2026 Sirsi Technologies Inc. All rights reserved.</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-xs text-slate-400 dark:text-slate-600">909 Rose Avenue, Suite 400, North Bethesda, MD 20852</span>
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
        <div className="font-inter flex flex-col min-h-screen bg-background">
            <PublicHeader isDark={isDark} toggleTheme={toggleTheme} />
            <div className="flex flex-col flex-1">
                <ErrorBoundary section="Public Page">
                    <OutletComp />
                </ErrorBoundary>
            </div>
            <PublicFooter />
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
            {/* Sonner toast provider — type cast needed for React 19 compat */}
            {(Toaster as any)({
                position: 'top-right',
                toastOptions: {
                    className: 'font-inter',
                    style: { fontFamily: 'Inter, sans-serif' },
                },
                richColors: true,
                closeButton: true,
            })}
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
            {/* Skip to main content — accessibility */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
                Skip to main content
            </a>

            {/* ── HEADER (canonical: admin-header from common-styles.css) ── */}
            <header className="admin-header" role="banner">
                <div className="admin-header-inner">
                    {/* LEFT: Brand + Version + Live (matches public header layout) */}
                    <div className="admin-header-left">
                        <div className="admin-header-brand">
                            <div className="admin-header-logo">
                                <img src="/sirsi-icon.png" alt="Sirsi" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            </div>
                            <div className="admin-header-brand-text">
                                <span className="admin-header-brand-name">SirsiNexus</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <LinkComp to="/changelog" className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" style={{ fontSize: 11, padding: '1px 8px', borderRadius: 4, textDecoration: 'none', cursor: 'pointer' }}>{APP_VERSION_DISPLAY}</LinkComp>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="admin-header-dot" />
                                        <span className="text-slate-600 dark:text-slate-300" style={{ fontSize: 11, fontWeight: 500 }}>Live</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Sitewide Search */}
                    <div className="admin-header-center">
                        <div className="admin-header-search" role="search">
                            <Search size={16} className="admin-header-search-icon" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Search users, documents, settings..."
                                autoComplete="off"
                                onFocus={() => setCommandPaletteOpen(true)}
                                readOnly
                                aria-label="Search — press ⌘K to open command palette"
                            />
                            <span className="admin-header-search-kbd">⌘K</span>
                        </div>
                    </div>

                    {/* RIGHT: Clock + Controls */}
                    <div className="admin-header-right">
                        <span className="admin-header-clock" role="timer" aria-label="Current time">{clock}</span>

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
            <nav className={`admin-sidebar ${sidebarMini ? 'sidebar-mini' : ''}`} aria-label="Admin sidebar navigation">
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
            <main id="main-content" className={`sidebar-content ${sidebarMini ? 'sidebar-collapsed' : ''}`}>
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
    notFoundComponent: NotFoundPage,
})
