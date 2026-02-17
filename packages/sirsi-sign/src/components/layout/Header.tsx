export function Header() {
    // Hardcoded values for now - we'll connect to store later
    const projectName = 'FinalWishes'
    const companyName = '111 Venture Studio'

    return (
        <header style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(2, 44, 34, 0.05)',
            zIndex: 50,
            position: 'sticky',
            top: 0
        }}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Logo and Title */}
                    <div className="flex items-center gap-4">
                        <div style={{ fontFamily: "'Cinzel', serif", color: '#A68936', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                            MASTER SERVICE AGREEMENT
                        </div>
                        <div className="hidden md:block" style={{ color: 'rgba(2, 44, 34, 0.4)', fontSize: '1rem' }}>
                            {companyName} × {projectName} Agreement
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search (placeholder) */}
                        <button style={{ background: 'none', border: 'none', padding: '8px', color: 'rgba(2, 44, 34, 0.4)', cursor: 'pointer' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* User Avatar */}
                        <div style={{
                            width: '32px', height: '32px', background: '#C8A951', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#022c22', fontWeight: 700, fontSize: '1rem'
                        }}>
                            CC
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
