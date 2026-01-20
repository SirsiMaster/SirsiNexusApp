export function Header() {
    // Hardcoded values for now - we'll connect to store later
    const projectName = 'FinalWishes'
    const companyName = '111 Venture Studio'

    return (
        <header className="bg-royal-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Logo and Title */}
                    <div className="flex items-center gap-4">
                        <div className="text-gold font-serif text-xl tracking-wider">
                            PARTNERSHIP AGREEMENT
                        </div>
                        <div className="hidden md:block text-white/40 text-sm">
                            {companyName} × {projectName} Partnership
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search (placeholder) */}
                        <button className="p-2 text-white/50 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* User Avatar */}
                        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-royal-950 font-bold text-sm">
                            CC
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
