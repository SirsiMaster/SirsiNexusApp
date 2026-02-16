interface AdminHeaderProps {
    isLightTheme: boolean;
    onToggleTheme: () => void;
}

export function AdminHeader({ isLightTheme, onToggleTheme }: AdminHeaderProps) {
    return (
        <header className="admin-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: isLightTheme ? '#fff' : '#022c22',
            borderBottom: `1px solid ${isLightTheme ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            height: '80px'
        }}>
            <div className="header-left">
                <h1 style={{
                    fontSize: '1.25rem',
                    fontFamily: 'Cinzel, serif',
                    margin: 0,
                    color: isLightTheme ? '#022c22' : '#C8A951'
                }}>Master Service Agreement</h1>
                <p style={{
                    fontSize: '0.75rem',
                    margin: 0,
                    color: isLightTheme ? '#64748b' : 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>Sirsi Engineering • Professional Services</p>
            </div>

            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    style={{
                        background: 'transparent',
                        border: `1px solid ${isLightTheme ? '#e2e8f0' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: isLightTheme ? '#022c22' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isLightTheme ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>

                <div className="avatar" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#C8A951',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>AD</div>
            </div>
        </header>
    )
}
