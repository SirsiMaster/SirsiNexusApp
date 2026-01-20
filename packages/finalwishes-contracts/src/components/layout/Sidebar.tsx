/**
 * Sidebar Component
 * Exact migration from the original HTML - Royal Blue sidebar with gold accents
 */
import { useState } from 'react'

interface NavItem {
    id: string
    label: string
    icon: React.ReactNode
    section?: string
}

const navItems: NavItem[] = [
    // MAIN
    { id: 'dashboard', label: 'Dashboard', section: 'MAIN', icon: <DashboardIcon /> },
    { id: 'proposal-contract', label: 'Proposal & Contract', section: 'MAIN', icon: <ContractIcon /> },
    { id: 'estates', label: 'Estates', section: 'MAIN', icon: <EstatesIcon /> },
    // MANAGEMENT
    { id: 'users', label: 'Users', section: 'MANAGEMENT', icon: <UsersIcon /> },
    { id: 'document-vault', label: 'Document Vault', section: 'MANAGEMENT', icon: <VaultIcon /> },
    { id: 'notifications', label: 'Notifications', section: 'MANAGEMENT', icon: <NotificationIcon /> },
    // DEVELOPMENT
    { id: 'dev-dashboard', label: 'Dev Dashboard', section: 'DEVELOPMENT', icon: <DevIcon /> },
    { id: 'analytics', label: 'Analytics', section: 'DEVELOPMENT', icon: <AnalyticsIcon /> },
    { id: 'cost-tracking', label: 'Cost Tracking', section: 'DEVELOPMENT', icon: <CostIcon /> },
    { id: 'reports', label: 'Reports', section: 'DEVELOPMENT', icon: <ReportsIcon /> },
    // SYSTEM
    { id: 'settings', label: 'Settings', section: 'SYSTEM', icon: <SettingsIcon /> },
]

export function Sidebar() {
    const [activeItem, setActiveItem] = useState('proposal-contract')

    // Group items by section
    const sections = navItems.reduce((acc, item) => {
        const section = item.section || 'OTHER'
        if (!acc[section]) acc[section] = []
        acc[section].push(item)
        return acc
    }, {} as Record<string, NavItem[]>)

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
                <span>Legacy</span>
            </div>

            {/* Navigation */}
            <nav>
                {Object.entries(sections).map(([section, items]) => (
                    <div key={section}>
                        <div className="nav-section-label">{section}</div>
                        {items.map((item) => (
                            <a
                                key={item.id}
                                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                                onClick={() => setActiveItem(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.id === 'proposal-contract' && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: '#C8A951',
                                        color: '#000',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em'
                                    }}>
                                        ACTION REQ
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                ))}
            </nav>

            {/* User Footer */}
            <div style={{
                marginTop: 'auto',
                padding: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C8A951, #D4AF37)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                }}>
                    AD
                </div>
                <div>
                    <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>Admin</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625rem' }}>System Level</div>
                </div>
            </div>
        </aside>
    )
}

// Icon Components
function DashboardIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    )
}

function ContractIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    )
}

function EstatesIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function VaultIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function NotificationIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    )
}

function DevIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    )
}

function AnalyticsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    )
}

function CostIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

function ReportsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    )
}
