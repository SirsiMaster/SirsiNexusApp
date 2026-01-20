/**
 * AdminHeader Component
 * Exact migration from the original HTML - white header bar with search
 */

export function AdminHeader() {
    return (
        <header className="admin-header">
            <div className="header-left">
                <h1>Partnership Agreement</h1>
                <p>Sirsi Engineering • Strategic Partnership</p>
            </div>

            <div className="search-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Search contract terms..." />
            </div>

            <div className="header-right">
                <div className="avatar">AD</div>
            </div>
        </header>
    )
}
