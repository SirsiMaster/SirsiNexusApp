// Admin Header Component — Full-featured header with centered search
class AdminHeader extends HTMLElement {
    constructor() {
        super();
        this._searchDropdown = null;
    }

    connectedCallback() {
        const breadcrumbs = this.getAttribute('breadcrumbs') || 'Dashboard';
        const userName = this.getAttribute('user-name') || 'ADMIN';

        const base = this.getBasePath();
        const portalRoot = base + '../index.html';
        const adminRoot = base + 'index.html';
        const logoPath = base + '../assets/images/sirsi-icon.png';

        this.innerHTML = `
            <header class="admin-header">
                <div class="admin-header-inner">
                    <!-- LEFT: Brand + Live -->
                    <div class="admin-header-left">
                        <div class="admin-header-brand">
                            <div class="admin-header-logo"><img src="${logoPath}" alt="Sirsi" /></div>
                            <div class="admin-header-brand-text">
                                <span class="admin-header-brand-name">SirsiNexus</span>
                                <span class="admin-header-brand-role">ADMIN CONSOLE</span>
                            </div>
                        </div>
                        <div class="admin-header-status">
                            <span class="admin-header-dot"></span>
                            <span>Live</span>
                        </div>
                        <span style="font-size:10px;font-weight:500;color:rgba(255,255,255,0.5);letter-spacing:0.08em;text-transform:uppercase;margin-left:8px;">v0.8.0-α</span>
                    </div>

                    <!-- CENTER: Sitewide Search -->
                    <div class="admin-header-center">
                        <div class="admin-header-search" id="headerSearchContainer">
                            <svg class="admin-header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                            <input type="text" id="headerSearchInput" placeholder="Search users, documents, settings..." autocomplete="off" />
                            <span class="admin-header-search-kbd">⌘K</span>
                        </div>
                    </div>

                    <!-- RIGHT: Clock + controls -->
                    <div class="admin-header-right">
                        <span class="admin-header-clock" id="admin-header-clock">--:--</span>

                        <!-- Theme Toggle -->
                        <button class="admin-header-btn" id="admin-header-theme-toggle" aria-label="Toggle theme">
                            <svg class="admin-header-icon icon-sun" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            <svg class="admin-header-icon icon-moon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        </button>

                        <!-- Logout -->
                        <button class="admin-header-btn" id="admin-header-logout" aria-label="Logout">
                            <svg class="admin-header-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>

                        <!-- User -->
                        <div class="admin-header-user">
                            <span class="admin-header-user-label">${userName}</span>
                            <div class="admin-header-avatar">
                                <svg class="admin-header-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        this._startClock();
        this._initThemeToggle();
        this._initLogout();
        this._initSearch(base);
    }

    /** Relative path from current page TO the admin/ directory */
    getBasePath() {
        const path = window.location.pathname;
        const adminIdx = path.indexOf('/admin/');
        if (adminIdx === -1) return './';
        const afterAdmin = path.substring(adminIdx + '/admin/'.length);
        const segments = afterAdmin.split('/').filter(s => s.length > 0);
        if (segments.length <= 1) return './';
        return '../'.repeat(segments.length - 1);
    }

    _startClock() {
        const el = this.querySelector('#admin-header-clock');
        if (!el) return;
        const tick = () => {
            const now = new Date();
            el.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        };
        tick();
        setInterval(tick, 1000);
    }

    _initThemeToggle() {
        const btn = this.querySelector('#admin-header-theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
    }

    _initLogout() {
        const btn = this.querySelector('#admin-header-logout');
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/index.html';
            }
        });
    }

    // ── Comprehensive Sitewide Search ───────────────────────────────────
    _initSearch(base) {
        const input = this.querySelector('#headerSearchInput');
        const container = this.querySelector('#headerSearchContainer');
        if (!input || !container) return;

        // Full site index — every page and its content keywords
        const siteIndex = [
            // ── MAIN PAGES ──
            {
                page: 'Dashboard', url: base + 'index.html', section: 'Main',
                keywords: 'dashboard home command center welcome admin quick actions add user send invite generate qr role management security data room analytics system logs documentation settings manage team export data total users revenue active sessions server health revenue trends user growth recent activity system status resource usage api calls storage active contracts team seats maintenance mode'
            },
            {
                page: 'User Management', url: base + 'users/index.html', section: 'Main',
                keywords: 'users user management add user delete user roles permissions admin editor viewer team members email registration invite accounts profile password reset authentication access control user list table search filter sort status active inactive suspended banned'
            },
            {
                page: 'Analytics', url: base + 'dashboard/analytics.html', section: 'Main',
                keywords: 'analytics metrics reports charts graphs data visualization total users investors documents revenue sessions page views line chart bar chart donut chart pie chart traffic sources direct organic referral social trends performance kpi key performance indicators conversion rates engagement bounce rate'
            },
            {
                page: 'Data Room', url: base + 'data-room/index.html', section: 'Main',
                keywords: 'data room advanced analytics documents files uploads storage encrypted secure vault confidential investor materials due diligence financial statements contracts agreements reports presentations pitch deck board minutes cap table'
            },
            {
                page: 'Telemetry', url: base + 'dashboard/telemetry.html', section: 'Main',
                keywords: 'telemetry monitoring performance metrics server response time latency throughput error rate cpu memory disk network bandwidth requests per second uptime downtime sla service level agreement health check ping'
            },
            {
                page: 'Site Settings', url: base + 'security/index.html', section: 'Main',
                keywords: 'site settings configuration preferences system options features toggles flags environment variables deployment firebase project auth domain live url api endpoint version maintenance mode'
            },
            {
                page: 'Security', url: base + 'security/index.html', section: 'Main',
                keywords: 'security mfa multi-factor authentication totp two-factor login password policy access control rbac role based permissions encryption aes-256 kms keys certificates ssl tls soc2 compliance audit trail logs firewall intrusion detection vulnerability scanning penetration testing'
            },
            {
                page: 'System Logs', url: base + 'dashboard/system-logs.html', section: 'Main',
                keywords: 'system logs audit trail events activity log error warning info debug trace timestamp user action ip address browser session authentication authorization access denied failed login successful created updated deleted modified webhook api call grpc request response status code'
            },
            {
                page: 'Documentation', url: base + 'committee-docs/pitch-deck.html', section: 'Main',
                keywords: 'documentation docs pitch deck investor presentation committee board slides architecture design technical specification api reference deployment guide onboarding tutorial help faq knowledge base readme contributing'
            },

            // ── SYSTEM STATUS ──
            {
                page: 'Status Dashboard', url: base + 'system-status/index.html', section: 'System Status',
                keywords: 'status dashboard system health uptime availability operational degraded major outage partial maintenance scheduled incident response time server cloud infrastructure firebase hosting cloud run cloud sql firestore google cloud platform gcp'
            },
            {
                page: 'API Server', url: base + 'system-status/api-server.html', section: 'System Status',
                keywords: 'api server grpc endpoints rest http health check response time latency throughput requests errors rate limiting throttling authentication token jwt bearer cors headers middleware interceptors protobuf connect web'
            },
            {
                page: 'Notification', url: base + 'security/monitoring.html', section: 'System Status',
                keywords: 'notification alerts monitoring email sms push webhook slack discord telegram warning critical error threshold trigger rule condition escalation on-call incident response pagerduty'
            },
            {
                page: 'CDN Status', url: base + 'system-status/cache-status.html', section: 'System Status',
                keywords: 'cdn status cache cloudflare edge network content delivery hit miss ratio ttl time to live purge invalidate refresh static assets images javascript css fonts performance optimization compression gzip brotli'
            },
            {
                page: 'Email Service', url: base + 'system-status/backup-status.html', section: 'System Status',
                keywords: 'email service sendgrid smtp transactional notification template campaign delivery deliverability bounce spam open rate click rate unsubscribe suppression list domain verification dkim spf dmarc backup status restore snapshot point in time recovery disaster'
            },

            // ── QUICK ACTIONS ──
            {
                page: 'Add User', url: base + 'users/index.html', section: 'Quick Action',
                keywords: 'add user create new account registration signup form name email role permissions invite onboard'
            },
            {
                page: 'Security Settings', url: base + 'security/index.html', section: 'Quick Action',
                keywords: 'security settings configure mfa enable disable two-factor password policy session timeout ip whitelist'
            },
            {
                page: 'View Logs', url: base + 'dashboard/system-logs.html', section: 'Quick Action',
                keywords: 'view logs browse filter search export download audit trail events debug troubleshoot'
            },

            // ── NEW PAGES (Phase 1 Buildout, Mar 1, 2026) ──
            {
                page: 'Tenants', url: base + 'tenants/index.html', section: 'Main',
                keywords: 'tenants tenant registry organizations clients customers portfolio finalwishes assiduous estate planning real estate multi-tenant saas platform white label slug branding isolation provisioning configure add tenant'
            },
            {
                page: 'Contracts', url: base + 'contracts/index.html', section: 'Main',
                keywords: 'contracts contract ledger msa master service agreement sow statement of work nda non-disclosure agreement signing e-sign opensign digital signature execution payment stripe plaid ach wire transfer invoice sha-256 evidence hash value client active pending completed'
            },
            {
                page: 'Console', url: base + 'console/index.html', section: 'System Status',
                keywords: 'console terminal command line cli shell admin system version status deploy users tenants help clear uptime interactive'
            },
            {
                page: 'Portal', url: base + 'investor/portal.html', section: 'Investor',
                keywords: 'investor portal stakeholder dashboard kpi arr revenue customers savings uptime roi payback executive summary data room financial reports business metrics legal documents strategic plans communications investment terms committee quick access'
            },
            {
                page: 'KPI Metrics', url: base + 'investor/kpi-metrics.html', section: 'Investor',
                keywords: 'kpi metrics key performance indicators unit economics arr annual recurring revenue customers savings uptime roi return investment payback cac customer acquisition cost ltv lifetime value churn retention gross margin'
            },
            {
                page: 'Committee', url: base + 'investor/committee.html', section: 'Investor',
                keywords: 'committee documents executive meeting index strategy review investment series board directors product roadmap approval financial review upcoming completed calendar'
            },
            {
                page: 'Messaging', url: base + 'investor/messaging.html', section: 'Investor',
                keywords: 'messaging internal secure messaging encrypted channel communication thread messages send investment committee legal team product team series a contract review'
            },
            {
                page: 'AI Agents', url: base + 'intelligence/ai-agents.html', section: 'Intelligence',
                keywords: 'ai agents artificial intelligence guidance engine document analyzer cost optimizer compliance monitor gemini vertex ai tasks latency success rate active idle machine learning'
            },
            {
                page: 'Hypervisor', url: base + 'intelligence/hypervisor.html', section: 'Intelligence',
                keywords: 'hypervisor ai orchestration engine pipeline monitoring contract analysis cost optimization compliance audit document ingestion running completed queued latency uptime steps progress'
            },

            // ── FEATURES & CONCEPTS ──
            {
                page: 'Sirsi Sign', url: base + 'index.html', section: 'Feature',
                keywords: 'sirsi sign e-signature electronic signing opensign document execution contract payment catalog pricing vault legal compliance'
            },
            {
                page: 'AI Assistant', url: base + 'index.html', section: 'Feature',
                keywords: 'ai assistant gemini vertex guidance engine artificial intelligence machine learning recommendation prediction analysis natural language processing'
            },
            {
                page: 'Firebase Auth', url: base + 'security/index.html', section: 'Feature',
                keywords: 'firebase authentication auth login logout session token jwt custom claims mfa totp time-based one-time password enrollment verification recovery'
            },
            {
                page: 'Stripe Payments', url: base + 'index.html', section: 'Feature',
                keywords: 'stripe payments billing subscription invoice checkout credit card debit card ach bank transfer wire webhook payment intent customer charge refund dispute payout'
            },
            {
                page: 'Plaid Banking', url: base + 'index.html', section: 'Feature',
                keywords: 'plaid banking bank account verification link token balance transactions identity assets income employment'
            },
        ];

        // ⌘K / Ctrl+K shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                input.focus();
                input.select();
            }
            if (e.key === 'Escape') {
                input.blur();
                input.value = '';
                this._removeDropdown();
            }
        });

        input.addEventListener('input', () => {
            const q = input.value.toLowerCase().trim();
            this._removeDropdown();
            if (!q || q.length < 2) return;

            // Score and rank results
            const scored = siteIndex
                .map(entry => {
                    let score = 0;
                    const terms = q.split(/\s+/);
                    for (const term of terms) {
                        if (entry.page.toLowerCase().includes(term)) score += 10;
                        if (entry.section.toLowerCase().includes(term)) score += 5;
                        if (entry.keywords.includes(term)) score += 3;
                        // Partial match
                        const words = entry.keywords.split(' ');
                        for (const w of words) {
                            if (w.startsWith(term) && term.length >= 2) score += 1;
                        }
                    }
                    return { ...entry, score };
                })
                .filter(e => e.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8);

            if (scored.length === 0) {
                this._showNoResults(container, q);
                return;
            }

            this._showResults(container, scored, q);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => this._removeDropdown(), 200);
        });

        input.addEventListener('focus', () => {
            if (input.value.trim().length >= 2) {
                input.dispatchEvent(new Event('input'));
            }
        });
    }

    _removeDropdown() {
        if (this._searchDropdown) {
            this._searchDropdown.remove();
            this._searchDropdown = null;
        }
    }

    _showResults(container, results, query) {
        this._removeDropdown();
        const dd = document.createElement('div');
        dd.className = 'header-search-dropdown';

        let currentSection = '';
        results.forEach((r) => {
            if (r.section !== currentSection) {
                currentSection = r.section;
                const sectionEl = document.createElement('div');
                sectionEl.className = 'header-search-section';
                sectionEl.textContent = r.section;
                dd.appendChild(sectionEl);
            }
            const a = document.createElement('a');
            a.href = r.url;
            a.className = 'header-search-result';
            a.innerHTML = `
                <svg class="header-search-result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div class="header-search-result-text">
                    <span class="header-search-result-title">${r.page}</span>
                    <span class="header-search-result-section">${r.section}</span>
                </div>
                <svg class="header-search-result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            `;
            dd.appendChild(a);
        });

        container.appendChild(dd);
        this._searchDropdown = dd;
    }

    _showNoResults(container, query) {
        this._removeDropdown();
        const dd = document.createElement('div');
        dd.className = 'header-search-dropdown';
        dd.innerHTML = `<div class="header-search-empty">No results for "${query}"</div>`;
        container.appendChild(dd);
        this._searchDropdown = dd;
    }

    updateBreadcrumbs(text) {
        const el = this.querySelector('.admin-header-crumb-current');
        if (el) el.textContent = text;
    }
}

customElements.define('admin-header', AdminHeader);
