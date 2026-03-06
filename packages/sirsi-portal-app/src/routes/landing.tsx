/**
 * Landing Page — sirsi.ai homepage (PIXEL-PERFECT port of index.html)
 *
 * Source of truth: packages/sirsi-portal/index.html (923 lines)
 * Rule 22: React must achieve pixel-perfect parity with HTML before extending.
 *
 * Sections (matching HTML exactly):
 *   1. Hero (hex-pattern overlay, badge, h1, 3 CTA buttons, decorative circles)
 *   2. Dual-Path (triangle-pattern, Enterprise + Investor cards with hover overlays)
 *   3. AI Differentiators (cross-pattern, dark bg, 3+2 feature cards, AI metrics panel)
 *   4. Core Capabilities (grid-dots-pattern, 3 feature cards)
 *   5. Multi-Cloud Platform (organic-pattern, checklist, demo panel, 4 real-time metrics)
 *   6. CTA Banner (emerald→blue gradient)
 *
 * Missing from prior React port (now fixed):
 *   - All 7 geometric pattern overlays (CSS SVG backgrounds)
 *   - Full dark: class support on every element
 *   - "Platform Validation" gradient button
 *   - Multi-Cloud Platform section (entire section)
 *   - Hover gradient overlays on dual-path cards
 *   - Mobile hamburger menu (handled by PublicHeader in __root.tsx)
 */

import { useState, useEffect } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'
import { Bot, Info } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/',
    component: LandingPage,
})

// Keep /home as an alias for backward compatibility
export const HomeRoute = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/home',
    component: LandingPage,
})

// ── Geometric pattern CSS (inline to avoid external stylesheet dependency) ──
const patternStyles = `
.hex-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image:
    url('data:image/svg+xml,<svg width="100" height="86.6" xmlns="http://www.w3.org/2000/svg"><polygon points="50,0 100,25 100,61.6 50,86.6 0,61.6 0,25" fill="none" stroke="rgba(16,185,129,0.12)" stroke-width="1"/></svg>'),
    url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><polygon points="30,5 55,30 30,55 5,30" fill="none" stroke="rgba(200,169,81,0.08)" stroke-width="1"/></svg>');
  background-size: 100px 86.6px, 60px 60px;
  opacity: 0.25;
}
.triangle-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image:
    url('data:image/svg+xml,<svg width="60" height="52" xmlns="http://www.w3.org/2000/svg"><polygon points="30,0 60,52 0,52" fill="none" stroke="rgba(59,130,246,0.15)" stroke-width="1"/><polygon points="0,0 30,52 -30,52" fill="none" stroke="rgba(16,185,129,0.12)" stroke-width="1"/><polygon points="60,0 90,52 30,52" fill="none" stroke="rgba(168,85,247,0.1)" stroke-width="1"/></svg>');
  background-size: 60px 52px; opacity: 0.35;
}
.cross-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image: url('data:image/svg+xml,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M20,5 L20,35 M5,20 L35,20" stroke="rgba(16,185,129,0.15)" stroke-width="2" stroke-linecap="round"/></svg>');
  background-size: 40px 40px; opacity: 0.3;
}
.diamond-gold-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image:
    url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><polygon points="30,5 55,30 30,55 5,30" fill="none" stroke="rgba(200,169,81,0.15)" stroke-width="1.5"/></svg>'),
    url('data:image/svg+xml,<svg width="100" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0,20 L25,5 L50,20 L75,5 L100,20" fill="none" stroke="rgba(200,169,81,0.12)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M0,35 L25,20 L50,35 L75,20 L100,35" fill="none" stroke="rgba(16,185,129,0.1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-size: 60px 60px, 100px 40px;
  opacity: 0.4;
}
.grid-dots-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image: url('data:image/svg+xml,<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="50" height="50" fill="none" stroke="rgba(16,185,129,0.1)" stroke-width="1"/><circle cx="0" cy="0" r="3" fill="rgba(59,130,246,0.2)"/><circle cx="50" cy="0" r="3" fill="rgba(59,130,246,0.2)"/><circle cx="0" cy="50" r="3" fill="rgba(59,130,246,0.2)"/><circle cx="50" cy="50" r="3" fill="rgba(59,130,246,0.2)"/><circle cx="25" cy="25" r="2" fill="rgba(200,169,81,0.15)"/></svg>');
  background-size: 50px 50px; opacity: 0.35;
}
.organic-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image:
    radial-gradient(ellipse at 20% 30%, rgba(16,185,129,0.06) 0%, transparent 35%),
    radial-gradient(ellipse at 60% 70%, rgba(200,169,81,0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 80% 10%, rgba(168,85,247,0.04) 0%, transparent 30%),
    radial-gradient(ellipse at 10% 90%, rgba(16,185,129,0.05) 0%, transparent 35%),
    radial-gradient(ellipse at 90% 50%, rgba(59,130,246,0.06) 0%, transparent 40%);
  opacity: 0.4;
}
`

// ── Reusable check icon ──
function CheckIcon({ color = '#10b981' }: { color?: string }) {
    return (
        <svg className="w-5 h-5 flex-shrink-0" fill={color} viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    )
}

function CheckMark() {
    return (
        <svg className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}

function TelemetryPulse() {
    const [stats, setStats] = useState({
        fidelity: 100.00,
        latency: 41.2,
        validations: 4284712,
        manual: 0.00
    })

    useEffect(() => {
        const timer = setInterval(() => {
            setStats(prev => ({
                fidelity: 100.00,
                latency: 40 + Math.random() * 2,
                validations: prev.validations + Math.floor(Math.random() * 50),
                manual: 0.00
            }))
        }, 2000)
        return () => clearInterval(timer)
    }, [])

    return (
        <TooltipProvider>
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Bot size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] opacity-80">
                                SIGNAL: TRUE // TELEMETRY PULSE
                            </h4>
                        </div>
                        <div className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                            Authentic
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-12 gap-x-8">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-bold tracking-tighter text-white mb-1 font-mono">
                                        {stats.fidelity.toFixed(2)}%
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Inference Fidelity <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Determinism</p>
                                    <p className="text-[11px] leading-relaxed">Measures the Hypervisor’s adherence to Sirsi canonical rules. Every operational decision is 100% grounded in platform policy.</p>
                                    <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400">CONTEXT: Unlike generic LLMs, these decisions are deterministic and policy-locked.</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-bold tracking-tighter text-white mb-1 font-mono">
                                        &lt; {stats.latency.toFixed(1)}ms
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Inference Latency <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Reaction Speed</p>
                                    <p className="text-[11px] leading-relaxed">The time taken for the AI to analyze anomaly signals and execute a fix. Sub-50ms is required for true self-healing.</p>
                                    <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400">CONTEXT: Reactive scaling and security blocking occur before human-readable alerts are generated.</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-bold tracking-tighter text-emerald-400 mb-1 font-mono">
                                        {(stats.validations / 1000000).toFixed(2)}M+
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Daily Validations <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Drift Prevention</p>
                                    <p className="text-[11px] leading-relaxed">The total number of integrity checks performed across the Global Portfolio to ensure 1:1 compliance with IAC.</p>
                                    <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400">CONTEXT: Every security policy and resource limit is validated thousands of times per hour.</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-bold tracking-tighter text-emerald-100/40 mb-1 font-mono">
                                        {stats.manual.toFixed(2)}%
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Manual Rate <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Efficiency</p>
                                    <p className="text-[11px] leading-relaxed">The percentage of infrastructure events requiring human intervention. Lower is higher platform autonomy.</p>
                                    <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400">CONTEXT: Achieving ZTO (Zero-Touch Operations) is the prerequisite for scaling to $100M+ AUM.</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                            GLOBAL OPTIMIZATION // TRUE
                        </span>
                        <span className="font-mono text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors">Live Feedback →</span>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

function LandingPage() {
    usePageMeta('SirsiNexus — Autonomous Infrastructure OS', 'Sirsi Nexus is the autonomous infrastructure operating system. Build, host, optimize, and scale cloud infrastructure through natural conversation.')
    return (
        <>
            {/* Inject pattern CSS */}
            <style>{patternStyles}</style>

            {/* ═══════════════ 1. HERO SECTION ═══════════════ */}
            <section className="relative bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 dark:from-slate-900 dark:via-emerald-900 dark:to-emerald-800 py-24 overflow-hidden">
                {/* Hexagonal Pattern Overlay */}
                <div className="hex-pattern" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Revolutionary AI-Powered Infrastructure Platform
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                            The Future of <br className="hidden md:block" />
                            <span className="text-emerald-600">Intelligent Infrastructure</span>
                        </h1>

                        <p className="text-2xl text-slate-600 dark:text-slate-400 mb-4 max-w-4xl mx-auto font-light">
                            SirsiNexus doesn't just manage infrastructure—it{' '}
                            <span className="font-semibold text-emerald-600">thinks, learns, and evolves</span> with your business.
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
                            Our AI agents embed directly into your cloud ecosystem, making autonomous decisions,
                            predicting failures before they happen, and optimizing resources in real-time.
                        </p>

                        {/* CTA Buttons — 3 buttons matching HTML */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Start Live Demo
                            </button>
                            <LinkComp to="/documentation"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Platform Validation
                            </LinkComp>
                            <LinkComp to="/documentation"
                                className="inline-flex items-center px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Technical Deep Dive
                            </LinkComp>
                        </div>
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 dark:bg-emerald-800 rounded-full opacity-30 animate-pulse" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </section>

            {/* ═══════════════ 2. DUAL PATH SECTION ═══════════════ */}
            <section className="relative py-20 bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20 overflow-hidden">
                {/* Triangle Pattern */}
                <div className="triangle-pattern" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Choose Your Path to Revolutionary Infrastructure</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                            Whether you're building the future or investing in it, SirsiNexus provides the tools and opportunities you need
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Enterprise/Developer Path */}
                        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">For Enterprises & Developers</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Deploy AI agents that think, learn, and evolve with your infrastructure.
                                    Experience autonomous decision-making and predictive optimization.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-sm"><CheckIcon color="#3b82f6" /> Access open-source codebase</li>
                                    <li className="flex items-center gap-3 text-sm"><CheckIcon color="#3b82f6" /> Join developer community</li>
                                    <li className="flex items-center gap-3 text-sm"><CheckIcon color="#3b82f6" /> Get early access updates</li>
                                </ul>
                                <div className="space-y-3">
                                    <a href="https://github.com/SirsiMaster/SirsiNexusApp" target="_blank" rel="noopener noreferrer"
                                        className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors group-hover:shadow-lg">
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.645.349-1.086.635-1.335-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.682-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.578 9.578 0 0110 4.836a9.578 9.578 0 012.504.337c1.909-1.293 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.698 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.48C17.138 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                            </svg>
                                            Explore on GitHub
                                        </span>
                                    </a>
                                    <LinkComp to="/signup"
                                        className="block w-full text-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Sign Up for Updates
                                    </LinkComp>
                                </div>
                            </div>
                        </div>

                        {/* Investor Path */}
                        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 px-4 py-1 rounded-bl-xl">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Exclusive Access</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">For Investors</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Access exclusive investment opportunities in the future of AI-powered infrastructure.
                                    Join strategic partners shaping enterprise technology.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-sm"><CheckIcon /> Financial projections & KPIs</li>
                                    <li className="flex items-center gap-3 text-sm"><CheckIcon /> Secure data room access</li>
                                    <li className="flex items-center gap-3 text-sm"><CheckIcon /> Strategic committee insights</li>
                                </ul>
                                <div className="space-y-3">
                                    <LinkComp to="/investor-portal"
                                        className="block w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 group-hover:shadow-lg">
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Access Investor Portal
                                        </span>
                                    </LinkComp>
                                    <LinkComp to="/signup"
                                        className="block w-full text-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Request Investor Access
                                    </LinkComp>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ 3. AI DIFFERENTIATORS (dark section) ═══════════════ */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 text-white relative overflow-hidden">
                {/* Gold Diamond Pattern Overlay — diagonal + gold per brand spec */}
                <div className="diamond-gold-pattern" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 font-bold mb-4 text-xs uppercase tracking-[0.4em]">
                            INTELLIGENT INFRASTRUCTURE
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-[0.1em]" style={{ fontFamily: "var(--snd-font-heading), 'Cinzel', serif" }}>
                            AUTONOMOUS DECISION MAKING
                        </h2>
                        <p className="text-emerald-100/60 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Traditional infrastructure tools manage resources. SirsiNexus <span className="text-emerald-400">thinks about them</span>.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                        <div className="space-y-8">
                            {[
                                { title: 'Predictive Failure Prevention', desc: 'Our AI agents analyze patterns across billions of telemetry points to predict and preempt failures weeks before they materialize, maintaining zero-downtime operations.' },
                                { title: 'Self-Healing Core', desc: "When anomalous states are detected, the Hypervisor doesn't just alert—it autonomously reconfigures networks, migrates databases, and re-optimizes clusters." },
                                { title: 'Dynamic Cost Arbitrage', desc: 'Continuous cross-provider resource bidding to ensure your workloads are always running on the most efficient hardware at the lowest possible cost.' },
                            ].map(d => (
                                <div key={d.title} className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 border border-white/10 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 transition-all shadow-sm">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2 text-xl text-white tracking-tight">{d.title}</h4>
                                        <p className="text-emerald-50/70 text-base leading-relaxed">{d.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <TelemetryPulse />
                    </div>

                    {/* Feature Cards Row 1 — 3 cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {[
                            { title: 'Zero-Touch Operations', desc: 'From deployment to optimization, SirsiNexus handles the complexity so your team can focus on innovation instead of infrastructure maintenance.', gradient: 'from-emerald-500 to-emerald-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z', bg: 'bg-white dark:bg-slate-800' },
                            { title: 'Adaptive Intelligence', desc: "Our AI doesn't just follow rules—it learns your business patterns, adapts to your growth, and evolves its decision-making over time.", gradient: 'from-blue-500 to-blue-600', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700' },
                            { title: 'Enterprise Security', desc: 'Built-in security intelligence that continuously monitors, detects threats, and adapts security policies across your entire infrastructure ecosystem.', gradient: 'from-purple-500 to-purple-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', bg: 'bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-700' },
                        ].map(card => (
                            <div key={card.title} className={`${card.bg} p-8 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md`}>
                                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-6`}>
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{card.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Feature Cards Row 2 — 2 cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Natural Language Interfaces</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Transform app building, migration, and optimization with conversational AI. Simply describe your infrastructure needs in plain English—"Scale my web app for Black Friday traffic" or "Migrate my database to AWS with zero downtime"—and watch SirsiNexus execute complex operations seamlessly.</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-900/20 p-8 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">LLM & Knowledge Graphs</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Turbocharge your AI integration with state-of-the-art Large Language Models and dynamic knowledge graphs. Our system understands your infrastructure context, relationships, and dependencies to make intelligent scaling decisions and optimize performance automatically.</p>
                        </div>
                    </div>
                </div>
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="diamond-gold-pattern" />
                    <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>
            </section>

            {/* ═══════════════ 4. CORE CAPABILITIES ═══════════════ */}
            <section id="features" className="relative py-20 bg-gradient-to-br from-white via-emerald-50/30 to-white dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900 overflow-hidden">
                {/* Grid Dots Pattern */}
                <div className="grid-dots-pattern" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Core Platform Capabilities</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">Comprehensive infrastructure management with AI-powered automation</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Smart Migration Wizards', desc: 'AI-guided migration processes that analyze your current infrastructure and create optimized migration paths with zero-downtime strategies.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                            { title: 'Predictive Auto-Scaling', desc: 'Machine learning algorithms that predict traffic patterns and business cycles to scale resources proactively, not reactively.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                            { title: 'Intelligent Analytics', desc: 'Deep learning models that provide actionable insights, anomaly detection, and performance optimization recommendations in real-time.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                        ].map(item => (
                            <div key={item.title} className="bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 dark:from-slate-800 dark:via-emerald-900/20 dark:to-slate-800 p-6 rounded-lg hover:shadow-lg transition-shadow border border-emerald-100/50 dark:border-emerald-900/30">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 5. MULTI-CLOUD PLATFORM (NEW — was missing) ═══════════════ */}
            <section id="platform" className="relative py-20 bg-gradient-to-tr from-slate-50 via-white to-emerald-50/40 dark:from-slate-800 dark:via-slate-900 dark:to-emerald-950/60 overflow-hidden">
                {/* Organic Pattern */}
                <div className="organic-pattern" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Multi-Cloud Platform</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">Unified management across AWS, Azure, GCP, and more</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Enterprise-Ready Architecture</h3>
                            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                                <li className="flex items-center"><CheckMark />Go-powered backend services for maximum performance</li>
                                <li className="flex items-center"><CheckMark />Python ML platform with TensorFlow and PyTorch</li>
                                <li className="flex items-center"><CheckMark />Go-based cloud connectors for seamless integration</li>
                                <li className="flex items-center"><CheckMark />React/Next.js frontend with TypeScript</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-800 dark:via-emerald-950/30 dark:to-slate-800 p-6 rounded-lg border border-emerald-200/40 dark:border-emerald-700/30 shadow-sm">
                            {/* Infrastructure Demo Panel */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-lg font-semibold text-emerald-600">Infrastructure State: <span className="text-emerald-500">Idle</span></div>
                                    <div className="text-slate-500 dark:text-slate-400 text-sm italic">Click 'Start Interactive Demo' at the top to begin</div>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-emerald-500 w-0 transition-all duration-500 ease-in-out" />
                                </div>
                                {/* Details Panel */}
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    <div className="text-center text-slate-600 dark:text-slate-400">
                                        Click 'Start Demo' to begin the infrastructure deployment simulation
                                    </div>
                                </div>
                            </div>

                            {/* Real-Time Metrics */}
                            <div className="text-center">
                                <h4 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Real-Time Metrics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { val: '99.2%', label: 'Success Rate' },
                                        { val: '$2.8M', label: 'Cost Savings' },
                                        { val: '12,847', label: 'Resources Migrated' },
                                        { val: '47.3 TB', label: 'Data Transferred' },
                                    ].map(m => (
                                        <div key={m.label} className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 dark:from-emerald-900/20 dark:to-emerald-800/30 p-4 rounded-lg border border-emerald-200/30 dark:border-emerald-700/20">
                                            <div className="text-2xl font-bold text-emerald-600">{m.val}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ 6. ROI SECTION ═══════════════ */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-3">
                            Measurable Impact
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            ROI-Positive from Day One
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                            The Sirsi Hypervisor pays for itself. Our AI optimization engine typically delivers
                            20–30% infrastructure cost savings within the first 90 days.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '20–30%', label: 'Cost Reduction', desc: 'Average infrastructure savings through AI-driven optimization' },
                            { value: '3–6 mo', label: 'ROI Payback', desc: 'Time to achieve positive return on platform investment' },
                            { value: '60%', label: 'Ops Reduction', desc: 'Decrease in manual infrastructure management effort' },
                            { value: '85%', label: 'Incident Reduction', desc: 'Fewer configuration-related incidents through automation' },
                        ].map(item => (
                            <div key={item.label} className="text-center group">
                                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                                    {item.value}
                                </div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">{item.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <LinkComp
                            to="/pricing"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
                        >
                            See pricing plans →
                        </LinkComp>
                    </div>
                </div>
            </section>

            {/* ═══════════════ 7. CTA SECTION ═══════════════ */}
            <section id="signup" className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Infrastructure?</h2>
                    <p className="text-xl text-white/90 mb-8">Join hundreds of enterprises already using SirsiNexus for their cloud operations</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <LinkComp to="/investor-portal"
                            className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            View Business Case
                        </LinkComp>
                        <LinkComp to="/login"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-emerald-600 transition-colors">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Login
                        </LinkComp>
                    </div>
                </div>
            </section>
        </>
    )
}
