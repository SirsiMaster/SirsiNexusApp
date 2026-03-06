/**
 * Documentation — Pixel-perfect port of packages/sirsi-portal/documentation.html
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Matches the original HTML with hero, canonical docs grid, quick access links.
 */

import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/documentation',
    component: DocumentationPage,
})

// ── Document icon SVG (reusable) ──
function DocIcon({ d }: { d: string }) {
    return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
        </svg>
    )
}

// ── External link icon ──
function ExtIcon() {
    return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    )
}

// ── Canonical Documents Data ──
const canonicalDocs = [
    { title: 'README', sub: 'Project Overview', desc: 'Project introduction, setup instructions, and quick start guide for SirsiNexus platform.', href: '/README.md', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { title: 'Architecture Design', sub: 'Master Architecture', desc: 'Complete technical specification, architecture design, and development roadmap for the platform.', href: '/docs/ARCHITECTURE_DESIGN.md', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { title: 'Technical Design', sub: 'Implementation Details', desc: 'Detailed technical implementation guide covering architecture, APIs, and deployment procedures.', href: '/docs/TECHNICAL_DESIGN.md', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { title: 'Project Management', sub: 'Development Progress', desc: 'Real-time project status, milestones, and development phase tracking with completion metrics.', href: '/docs/PROJECT_MANAGEMENT.md', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { title: 'Project Scope', sub: 'Executive Overview', desc: 'High-level project summary with key achievements, current status, and strategic objectives.', href: '/docs/PROJECT_SCOPE.md', icon: 'M4 6a2 2 0 012-2h2a1 1 0 000-2 1 1 0 000 2h2a2 2 0 012 2v2a1 1 0 000 2 1 1 0 000-2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z' },
    { title: 'Version', sub: 'Release Information', desc: 'Current version information, release notes, and version history for the platform.', href: 'https://github.com/SirsiMaster/SirsiNexusApp/blob/main/docs/core/VERSION.md', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { title: 'Changelog', sub: 'Development History', desc: 'Complete development changelog with detailed release notes, features, and improvements.', href: 'https://github.com/SirsiMaster/SirsiNexusApp/blob/main/docs/core/CHANGELOG.md', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
]

function DocumentationPage() {
    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative py-12" style={{ background: 'linear-gradient(135deg, #f8fafc, #ecfdf5, #d1fae5)' }}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Core Technical <span className="text-emerald-600">Documentation</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
                        Development is governed by the 28 Canonical Documents defined in the GEMINI governance protocol.
                        All architectural and engineering decisions align with these benchmarks.
                    </p>
                </div>
            </section>

            {/* ═══════════════ CANONICAL DOCUMENTS ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">The 28 Canonical Documents</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">The definitive governance and technical framework for the Sirsi ecosystem</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {canonicalDocs.map(doc => (
                            <div key={doc.title}
                                className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                                        <DocIcon d={doc.icon} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{doc.title}</h3>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{doc.sub}</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 mb-4">{doc.desc}</p>
                                <a href={doc.href} target="_blank" rel="noopener"
                                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                                    <span>View Document</span>
                                    <ExtIcon />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ QUICK ACCESS ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Access</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">Direct links to essential platform resources</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* GitHub */}
                        <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-600 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">GitHub Repository</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">Access the complete source code and development history</p>
                            <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener"
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                                View Repository <ExtIcon />
                            </a>
                        </div>

                        {/* Business Case */}
                        <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-600 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Business Case</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">Detailed financial analysis and unit economics</p>
                            <a href="/business-case"
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                                View Business Case <ExtIcon />
                            </a>
                        </div>

                        {/* Investor Portal */}
                        <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-600 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Investor Portal</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">Secure access to investor materials and data room</p>
                            <LinkComp to="/investor-portal"
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                                Access Portal <ExtIcon />
                            </LinkComp>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
