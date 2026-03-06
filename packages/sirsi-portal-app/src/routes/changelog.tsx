/**
 * Changelog — Public page showing Sirsi Nexus release history.
 * Reads version from the single source of truth (lib/version.ts).
 * No sidebar — this is a PUBLIC_PATHS page.
 *
 * Data: Curated from docs/core/CHANGELOG.md + git history.
 */

import { createRoute } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'
import { APP_VERSION_DISPLAY } from '@/lib/version'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/changelog',
    component: ChangelogPage,
})

// ── Release data ──────────────────────────────────────────────────
interface Release {
    version: string
    date: string
    title: string
    channel: 'alpha' | 'beta' | 'stable'
    highlights: string[]
    tag?: 'current' | 'major'
}

const releases: Release[] = [
    {
        version: 'v0.8.3-alpha',
        date: '2026-03-06',
        title: 'Self-Service Tenant Provisioning & Commerce Architecture',
        channel: 'alpha',
        tag: 'current',
        highlights: [
            'ADR-030: Two-path commerce architecture (SaaS Self-Service + Enterprise Bespoke)',
            'Pricing page rewrite: Free / Solo ($49) / Business ($499) with feature comparison matrix',
            'ROI-Positive from Day One section on landing page',
            '8 architectural decisions locked for onboarding engine',
            'Tenant repo scaffold spec: full canonical docs, UCS, CI/CD, GEMINI.md',
            'Versioning Standard codified (app, website, document scopes)',
            'Role-based routing fixes for Investor/Client portal independence',
        ],
    },
    {
        version: 'v0.8.2-alpha',
        date: '2026-03-05',
        title: 'Universal Dark/Light Theme Parity (40/40 Tasks)',
        channel: 'alpha',
        highlights: [
            'Complete dark/light theme parity across all 19 portal pages and 10 public pages',
            'CSS component system: badges, tables, inputs, buttons, tooltips, modals',
            'Mobile responsive header with hamburger menu',
            '404 Not Found page with Swiss Neo-Deco branding',
            'Toast notification system (sonner)',
            'React Portal CI/CD pipeline, bundle optimization (-47% main chunk)',
            'Print styles, scrollbar theming, accessibility audit',
        ],
    },
    {
        version: 'v0.8.0-alpha',
        date: '2026-03-05',
        title: 'React Migration & Public Pages',
        channel: 'alpha',
        highlights: [
            'Complete React 19 + Vite 7 migration of admin portal',
            'Pixel-perfect port of all HTML admin pages to React components',
            'Public pages: Landing, Login, Signup, Documentation, About, Pricing, Blog, Privacy, Terms, Changelog',
            'TanStack Router with conditional admin/public layout switching',
            'ConnectRPC backend (Go) — HypervisorService with 10 operational tabs',
            'Firebase Auth integration with MFA enforcement',
            'Cloud Run deployment of sirsi-admin service',
            'Centralized version badge from package.json — auto-updates on every release',
            'Swiss Neo-Deco design system parity across all pages',
        ],
    },
    {
        version: 'v0.7.10-alpha',
        date: '2025-07-14',
        title: 'Investor Portal Professional Layout',
        channel: 'alpha',
        highlights: [
            'Unified professional layout across all investor portal pages',
            'Consistent gradient headers with title and subtitle sections',
            'Standardized breadcrumb navigation with proper linking hierarchy',
            'Enhanced investor portal data room: 2 → 3 column grid layout',
            'Page-specific improvements: Market Analysis, Business Case, Product Roadmap',
            'Mobile-optimized responsive layouts across all investor documents',
        ],
    },
    {
        version: 'v0.7.9-alpha',
        date: '2025-07-14',
        title: 'GitHub Pages Portal & Investor System',
        channel: 'alpha',
        highlights: [
            'Professional GitHub Pages landing page with SirsiNexus app UI styling',
            'Lead generation portal with user registration and beta interest capture',
            'Secure investor portal with authentication-gated data room access',
            'Comprehensive business case with unit economics (CAC, LTV, NRR)',
            'Extended 5-year proforma projections ($156M ARR by Year 5)',
            'Dark/light mode theming with automatic detection',
        ],
    },
    {
        version: 'v0.7.8-alpha',
        date: '2025-07-13',
        title: 'Hypervisor Stabilization & Codebase Cleanup',
        channel: 'alpha',
        highlights: [
            'Resolved "0/5 running" → "5/5 running" service status issue',
            'Massive codebase cleanup: 7,500+ lines of redundant code removed',
            'Eliminated entire redundant sirsi/ directory with duplicate implementations',
            'Streamlined architecture while maintaining all functional capabilities',
            'Production-grade service lifecycle management',
        ],
    },
    {
        version: 'v0.7.7-alpha',
        date: '2025-07-13',
        title: 'Production Deployment Framework',
        channel: 'alpha',
        highlights: [
            'Comprehensive deployment automation with rollback capabilities',
            'Multi-service orchestration: Rust core, database, Redis, monitoring',
            'Automated health check system for all service endpoints',
            'Performance monitoring with real-time CPU, memory, disk tracking',
            'Deployment modes: deploy, test, rollback, status, stop',
        ],
    },
    {
        version: 'v0.7.6-alpha',
        date: '2025-07-13',
        title: 'Multi-Cloud Orchestration & Port Registry',
        channel: 'alpha',
        highlights: [
            'Complete multi-cloud orchestration for AWS, Azure, and GCP',
            'Cross-cloud knowledge synthesis with AI-powered integration',
            'Centralized Port Registry Service — eliminated port conflicts',
            'Dynamic port allocation with session-based tracking',
            'WebSocket real-time port status monitoring',
        ],
    },
    {
        version: 'v0.7.5-alpha',
        date: '2025-07-12',
        title: 'Consciousness System Compilation Success',
        channel: 'alpha',
        highlights: [
            'Resolved 75+ compilation errors across consciousness, persona, and communication modules',
            'Full SirsiConsciousness system with identity, personality, memory, and learning engines',
            'Agent communication retrofit with Sirsi-centric protocol',
            'Multi-type knowledge synthesis with consciousness-level integration',
            'Context-aware processing with proper type safety',
        ],
    },
    {
        version: 'v0.6.4-alpha',
        date: '2025-07-12',
        title: 'Sirsi Hypervisor Core Intelligence',
        channel: 'alpha',
        highlights: [
            'Resolved 220+ compilation errors across Rust source files',
            'Multi-agent communication with real-time coordination',
            'Knowledge synthesis with advanced AI processing',
            'Decision engine with strategic planning and risk assessment',
            'WebSocket & REST API integration for cohesive frontend/backend operation',
        ],
    },
    {
        version: 'v0.6.3-alpha',
        date: '2025-07-11',
        title: 'Sirsi Persona Service — Supreme AI',
        channel: 'alpha',
        tag: 'major',
        highlights: [
            'Natural language to infrastructure code generation (Terraform, CloudFormation, Pulumi, K8s)',
            'Omniscient system overview with real-time multi-cloud intelligence',
            'Supreme decision engine with strategic AI planning and risk assessment',
            'Real OpenAI GPT-4 + Anthropic Claude integration',
            'Complete TypeScript client with session management and WebSocket comms',
        ],
    },
    {
        version: 'v0.6.0-alpha',
        date: '2025-07-10',
        title: 'Universal Codebase Consolidation',
        channel: 'alpha',
        highlights: [
            'Removed 5 redundant directories, streamlined from 6 to 4 scripts',
            'Docker infrastructure cleanup: 10+ → 4 production Dockerfiles',
            'Clean polyglot structure: Rust core + Python analytics + TypeScript UI + Go connectors',
            'Zero functional impact — all capabilities preserved',
        ],
    },
    {
        version: 'v0.5.5-alpha',
        date: '2025-07-08',
        title: 'UI Consistency & Sirsi Assistant Enhancement',
        channel: 'alpha',
        highlights: [
            'Sirsi Assistant migrated from sidebar to header as primary AI interface',
            'Expandable chat interface with full message history',
            'Supreme AI persona responses with omniscient capabilities',
            'Platform consistency: all pages use standard ClientLayout',
        ],
    },
    {
        version: 'v0.5.4-alpha',
        date: '2025-07-08',
        title: 'Universal Dark Mode',
        channel: 'alpha',
        highlights: [
            'All 9 major pages with complete dark mode support',
            'Tailwind CSS dark: variant integration across 50+ components',
            'Automated dark mode verification system (verify-dark-mode.sh)',
            'WCAG-compliant contrast ratios maintained in both themes',
        ],
    },
    {
        version: 'v0.5.3-alpha',
        date: '2025-07-07',
        title: 'Frontend-Backend Integration Complete',
        channel: 'alpha',
        tag: 'major',
        highlights: [
            '100% frontend compilation (41 pages, zero TypeScript errors)',
            '100% backend compilation (all APIs, zero Rust errors)',
            'Complete data flow: UI → API → Database',
            'AES-256-GCM credential encryption with multi-cloud support',
        ],
    },
    {
        version: 'v0.5.0-alpha',
        date: '2025-01-07',
        title: 'Full-Stack AI Enhancement',
        channel: 'alpha',
        highlights: [
            'Real OpenAI GPT-4 + Anthropic Claude integration (no mocks)',
            'Multi-cloud SDK: AWS EC2/RDS/S3, Azure ARM, GCP Compute, DigitalOcean',
            'Enterprise security: JWT + 2FA + bcrypt + rate limiting',
            'Real-time WebSocket with Socket.IO and JWT authentication',
        ],
    },
    {
        version: 'v0.4.0',
        date: '2025-01-07',
        title: 'Professional UI Design System',
        channel: 'stable',
        highlights: [
            'Universal professional typography (Inter + SF Pro Display)',
            'Advanced glass morphism design system with 85% opacity backgrounds',
            'Emerald green accent system on all foreground elements',
            'Micro-interactions with spring-entrance and stagger animations',
        ],
    },
    {
        version: 'v0.3.2',
        date: '2025-01-07',
        title: 'Environment Setup & Semantic Routes',
        channel: 'stable',
        highlights: [
            'Reusable EnvironmentSetupStep component for credential management',
            'Migration wizard route renamed /wizard → /migration for semantic clarity',
            'Multi-scenario demo support: TVfone, Kulturio, UniEdu',
        ],
    },
    {
        version: 'v0.2.0',
        date: '2025-07-04',
        title: 'AI Hypervisor & Agent Framework',
        channel: 'stable',
        tag: 'major',
        highlights: [
            'WebSocket-to-gRPC bridge architecture',
            'Complete AI agent framework with multi-agent orchestration',
            'Redis session management with real-time tracking',
            'Sub-millisecond agent response times, 1000+ concurrent connections',
        ],
    },
    {
        version: 'v0.1.0',
        date: '2025-06-25',
        title: 'Foundation',
        channel: 'stable',
        highlights: [
            'Initial Rust + Axum server with PostgreSQL',
            'JWT authentication with Argon2 password hashing',
            'Project & resource management APIs',
            'OpenTelemetry integration for distributed tracing',
        ],
    },
]

// ── Component ─────────────────────────────────────────────────────
function ChangelogPage() {
    usePageMeta('Changelog | SirsiNexus', 'Release history and version updates for the Sirsi Nexus platform.')
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Changelog
                    </h1>
                    <p className="text-emerald-200 text-lg max-w-2xl mx-auto leading-relaxed">
                        Every update to SirsiNexus — the autonomous AI infrastructure platform.
                        Currently on <span className="text-white font-semibold">{APP_VERSION_DISPLAY}</span>.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <span className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-500/30 rounded-full px-4 py-1.5 text-sm font-medium">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            {APP_VERSION_DISPLAY}
                        </span>
                        <a
                            href="https://github.com/SirsiMaster/SirsiNexusApp/releases"
                            target="_blank"
                            rel="noopener"
                            className="text-sm text-emerald-300 hover:text-white transition-colors no-underline"
                        >
                            GitHub Releases →
                        </a>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-slate-200 to-transparent dark:from-emerald-700 dark:via-slate-700" />

                    {releases.map((release) => (
                        <div key={release.version} className="relative pl-12 pb-12 last:pb-0">
                            {/* Dot */}
                            <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${release.tag === 'current'
                                ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/30'
                                : release.tag === 'major'
                                    ? 'bg-amber-500 border-amber-300'
                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                }`} />

                            {/* Version card */}
                            <div className={`rounded-xl border p-6 transition-all hover:shadow-md ${release.tag === 'current'
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                }`}>
                                {/* Header */}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                                        {release.version}
                                    </span>
                                    {release.tag === 'current' && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                            Current
                                        </span>
                                    )}
                                    {release.tag === 'major' && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                            Major
                                        </span>
                                    )}
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${release.channel === 'alpha'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                        : release.channel === 'beta'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        }`}>
                                        {release.channel}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                                        {release.date}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                    {release.title}
                                </h3>

                                {/* Highlights */}
                                <ul className="space-y-2">
                                    {release.highlights.map((h, j) => (
                                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                            <svg className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center border-t border-slate-200 dark:border-slate-700 pt-12">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Full commit history and release notes available on GitHub.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="https://github.com/SirsiMaster/SirsiNexusApp"
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors no-underline"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            View on GitHub
                        </a>
                    </div>
                    <p className="mt-8 text-xs text-slate-400 dark:text-slate-600">
                        Sirsi Technologies Inc. · 909 Rose Avenue, Suite 400, North Bethesda, MD 20852
                    </p>
                </div>
            </div>
        </div>
    )
}
