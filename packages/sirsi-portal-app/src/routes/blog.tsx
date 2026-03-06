/**
 * Blog / Engineering Updates — Real announcements from Sirsi's development
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Content sourced from ARCHITECTURE_DESIGN.md phase history, TEDCO press release,
 * DCA Live AI & Cyber Leadership Awards, and the three whitepapers in development.
 */

import { createRoute, Link } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/blog',
    component: BlogPage,
})

/* ── Blog post data — real Sirsi milestones ── */
const posts = [
    {
        date: 'February 12, 2026',
        tag: 'Press Release',
        tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        title: 'TEDCO Invests $100K in Sirsi Technologies',
        summary: 'TEDCO, Maryland\'s economic engine for technology companies, announced a $100,000 Pre-Seed Builder Fund investment in Sirsi through its Social Impact Funds. The investment supports the acceleration of Sirsi\'s AI-powered infrastructure management platform.',
        quote: '"Sirsi was created to bridge the cloud expertise gap by letting organizations build, host, optimize, and scale infrastructure through a natural conversation."',
        quoteAuthor: 'Cylton Collymore, CEO of Sirsi',
        href: 'https://www.tedcomd.com/news-events/press-releases/2026/tedco-invests-sirsi',
        external: true,
    },
    {
        date: 'March 2025',
        tag: 'Award',
        tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        title: '2025 DCA Live AI & Cyber Leadership Awards',
        summary: 'Sirsi Technologies was recognized at the 2025 DCA Live AI & Cyber Leadership Awards, the Washington DC business community\'s premier event celebrating innovation in artificial intelligence and cybersecurity.',
        href: 'https://dca-live.com/2025-ai-cyber-leadership-awards',
        external: true,
    },
    {
        date: 'Q1 2026',
        tag: 'Research',
        tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        title: 'Whitepaper: NebuLang Protocol — LLM Memory Resilience',
        summary: 'Introducing our first whitepaper on the NebuLang Protocol — a proprietary knowledge-graph grounding system that eliminates AI hallucinations in infrastructure code. By enforcing consensus-verified state mappings, NebuLang ensures 100% deterministic infrastructure-as-code, enabling organizations to trust AI-generated deployments in mission-critical environments.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'Q1 2026',
        tag: 'Research',
        tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        title: 'Whitepaper: Neural-Fractal Architecture — Recursive Infrastructure Verification',
        summary: 'Our second whitepaper explores the Neural-Fractal Architecture — a recursive AI logic system that converts business requirements into verified, silicon-native cloud solutions. The architecture provides total fault-tolerance across AWS, Azure, GCP, and on-premise clusters, automatically detecting and healing desynchronized infrastructure states with zero human intervention.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'Q1 2026',
        tag: 'Research',
        tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        title: 'Whitepaper: KG Query Engine — Predictive Infrastructure-as-Data',
        summary: 'The third whitepaper in our trilogy introduces the KG Query Engine — transitioning from reactive observability to predictive "Infrastructure-as-Data." By leveraging our proprietary knowledge graph, the engine identifies waste and technical debt in real-time, delivering 40%+ cost reductions across enterprise deployments.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'February 2026',
        tag: 'Engineering',
        tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        title: 'Tri-Silicon Orchestration: Bridging NVIDIA, TPU, and Apple Silicon',
        summary: 'Sirsi Nexus becomes the first autonomous infrastructure OS to bridge three distinct silicon architectures into a unified compute mesh. NVIDIA CUDA for enterprise datacenter racks, Google TPU v5 for massive cloud-scale training, and Apple Silicon Mac Studio clusters connected via Thunderbolt 5 RDMA for sovereign nano-datacenters with 512GB+ Unified RAM.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'January 2026',
        tag: 'Engineering',
        tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        title: 'React 19 Migration: Pixel-Perfect Admin Portal Rebuild',
        summary: 'The Sirsi Admin Portal completes its migration from static HTML to React 19 with Vite 7, TanStack Router, Zustand, and shadcn/ui. The migration achieves pixel-perfect parity with the original HTML portal while adding ConnectRPC backend integration, dark mode, and the Hypervisor Command Center instrument cluster.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'January 2026',
        tag: 'Platform',
        tagColor: 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200',
        title: 'UCS Infrastructure Layer Complete: Stripe, Plaid, SendGrid, Chase',
        summary: 'The Universal Component System (UCS) infrastructure layer reaches operational maturity. Stripe payment processing, Plaid financial data verification, SendGrid email delivery, and Chase treasury settlement are now available as global portfolio-level utilities with "integrated independence" — serving all tenant applications through standardized interfaces.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'October 2025',
        tag: 'Engineering',
        tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        title: 'Deep-Tech IP: Three Utility Submissions Codified',
        summary: 'Sirsi codifies three foundational utility submissions that define the platform\'s deep-tech moat: the NebuLang Protocol for LLM Memory Resilience, the Neural-Fractal Architecture for recursive infrastructure verification, and the KG Query Engine for predictive Infrastructure-as-Data. Together, they eliminate AI hallucinations, provide total fault tolerance, and reduce infrastructure waste by 40%+.',
        href: '/documentation',
        external: false,
    },
    {
        date: 'August 2025',
        tag: 'Milestone',
        tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        title: '$147K in Contracted Revenue Secured',
        summary: 'Sirsi secures $147K in contracted revenue with $137K scheduled for Q1/Q2 2026, validating the platform\'s commercial viability across heavy industry and sovereign cloud deployments. This milestone demonstrates enterprise demand for conversational infrastructure management and AI-driven cost optimization.',
        href: '/about',
        external: false,
    },
]

function BlogPage() {
    usePageMeta('Engineering Blog | SirsiNexus', 'Platform updates, research publications, and milestones from the Sirsi Technologies engineering team.')
    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative py-16 bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 dark:from-slate-900 dark:via-emerald-900/30 dark:to-slate-800">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Engineering <span className="text-emerald-600">Blog</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        Platform updates, research publications, and milestones from the Sirsi Technologies engineering team.
                    </p>
                </div>
            </section>

            {/* ═══════════════ POSTS ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="space-y-8">
                        {posts.map((post, i) => (
                            <article key={i} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${post.tagColor}`}>
                                        {post.tag}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{post.date}</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{post.title}</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{post.summary}</p>
                                {post.quote && (
                                    <blockquote className="border-l-4 border-emerald-400 pl-4 my-4 italic text-slate-500 dark:text-slate-400">
                                        {post.quote}
                                        <span className="block not-italic text-sm text-emerald-600 mt-1">— {post.quoteAuthor}</span>
                                    </blockquote>
                                )}
                                {post.external ? (
                                    <a href={post.href} target="_blank" rel="noopener"
                                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                                        Read Full Article
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ) : (
                                    <LinkComp to={post.href}
                                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                                        Learn More →
                                    </LinkComp>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ SUBSCRIBE CTA ═══════════════ */}
            <section className="py-16 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Stay Updated</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Follow our engineering progress and platform updates.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener"
                            className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            Star on GitHub
                        </a>
                        <a href="mailto:cylton@sirsi.ai"
                            className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
                            Subscribe to Updates
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
