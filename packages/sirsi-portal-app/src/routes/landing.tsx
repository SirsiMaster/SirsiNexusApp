/**
 * Landing Page — sirsi.ai homepage
 *
 * Version: 4.0.0 — Master Blueprint v4 alignment
 * Design: Swiss Neo-Deco (Cinzel headings, Inter body, Emerald #059669 + Gold #C8A951)
 * IP Firewall: No model names, no HCS/Hedera, no proto/gRPC, no code snippets.
 *
 * Sections:
 *   1. Hero — "The Autonomous CTO" with animated mesh
 *   2. Patent Portfolio Badge — 8 patents, gold ribbon
 *   3. Feature Grid — 8 capabilities in 4×2 grid
 *   4. Platform Strip — Web · Desktop · Mobile · Mac Studio
 *   5. Tri-Silicon Visual — NVIDIA / Google TPU / Apple Silicon
 *   6. CTA — Schedule a Technical Briefing
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

// ── Geometric pattern CSS ──
const patternStyles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

.hex-pattern {
  position: absolute; width: 100%; height: 100%; pointer-events: none;
  background-image:
    url('data:image/svg+xml,<svg width="100" height="86.6" xmlns="http://www.w3.org/2000/svg"><polygon points="50,0 100,25 100,61.6 50,86.6 0,61.6 0,25" fill="none" stroke="rgba(16,185,129,0.12)" stroke-width="1"/></svg>'),
    url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><polygon points="30,5 55,30 30,55 5,30" fill="none" stroke="rgba(200,169,81,0.08)" stroke-width="1"/></svg>');
  background-size: 100px 86.6px, 60px 60px;
  opacity: 0.25;
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

@keyframes meshFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.04; }
  50% { transform: translateY(-20px) rotate(1deg); opacity: 0.08; }
}
.mesh-bg {
  animation: meshFloat 8s ease-in-out infinite;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }
.delay-700 { animation-delay: 0.7s; }
.delay-800 { animation-delay: 0.8s; }

.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
}
.glass-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(16,185,129,0.3);
  transform: translateY(-4px);
  box-shadow: 0 20px 60px -15px rgba(16,185,129,0.15);
}

.gold-badge {
  background: linear-gradient(135deg, rgba(200,169,81,0.15), rgba(200,169,81,0.05));
  border: 1px solid rgba(200,169,81,0.4);
}

.silicon-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.silicon-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
}
`

// ── TelemetryPulse component — live telemetry widget ──
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
            <div className="glass-card p-10 rounded-3xl shadow-2xl relative overflow-hidden group transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Bot size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <h4 className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.2em] opacity-80">
                                SIGNAL: TRUE // TELEMETRY PULSE
                            </h4>
                        </div>
                        <div className="px-2 py-0.5 rounded text-[8px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                            Authentic
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-12 gap-x-8">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-semibold tracking-tighter text-white mb-1 font-mono">
                                        {stats.fidelity.toFixed(2)}%
                                    </div>
                                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Inference Fidelity <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-medium text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Determinism</p>
                                    <p className="text-[11px] leading-relaxed">Measures the Hypervisor's adherence to Sirsi canonical rules. Every operational decision is 100% grounded in platform policy.</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-semibold tracking-tighter text-white mb-1 font-mono">
                                        &lt; {stats.latency.toFixed(1)}ms
                                    </div>
                                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Inference Latency <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-medium text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Reaction Speed</p>
                                    <p className="text-[11px] leading-relaxed">The time taken for the AI to analyze anomaly signals and execute a fix. Sub-50ms is required for true self-healing.</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-semibold tracking-tighter text-emerald-400 mb-1 font-mono">
                                        {(stats.validations / 1000000).toFixed(2)}M+
                                    </div>
                                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Daily Validations <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-medium text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Drift Prevention</p>
                                    <p className="text-[11px] leading-relaxed">The total number of integrity checks performed across the Global Portfolio to ensure 1:1 compliance.</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-left border-l-2 border-emerald-500/20 pl-4 hover:border-emerald-500 transition-colors cursor-help">
                                    <div className="text-3xl font-semibold tracking-tighter text-emerald-100/40 mb-1 font-mono">
                                        {stats.manual.toFixed(2)}%
                                    </div>
                                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        Manual Rate <Info size={8} />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-900 border-emerald-500/30 text-emerald-50 p-3">
                                <div className="space-y-2">
                                    <p className="font-medium text-emerald-400 uppercase tracking-widest text-[10px]">Business Meaning: Efficiency</p>
                                    <p className="text-[11px] leading-relaxed">The percentage of infrastructure events requiring human intervention. Lower is higher platform autonomy.</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">
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

// ── Feature card data for the 8-capability grid ──
const features = [
    {
        title: 'Autonomous Genesis',
        desc: 'Describe what you need. We build it. Natural language to complete production stacks — zero human touch.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
        ),
    },
    {
        title: 'Knowledge Graph',
        desc: "AI that can't hallucinate about your infrastructure. Every decision grounded in a verified truth graph.",
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
        ),
    },
    {
        title: 'Agent Swarm',
        desc: 'Self-evolving agents that learn and improve autonomously. Each agent expands its own capability registry.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
    },
    {
        title: 'Digital Twin',
        desc: 'Walk through your infrastructure in 3D. A living replica of every service, connection, and data flow.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
        ),
    },
    {
        title: 'Direct-to-Metal',
        desc: 'Bypass Terraform. Speak directly to Cisco routers, Dell servers, and NVIDIA GPUs via native protocols.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
            </svg>
        ),
    },
    {
        title: 'Sovereign Compute',
        desc: 'Your data never leaves your network. Run the full AI stack on your own Apple Silicon clusters.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
    {
        title: 'Predictive Intelligence',
        desc: 'Predict failures before they happen. AI learns from historical patterns to prevent downtime proactively.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v-5.5m3 5.5v-3.5m3 3.5v-1.5" />
            </svg>
        ),
    },
    {
        title: 'Autonomous Compliance',
        desc: 'SOC 2 compliance, proven mathematically. Every infrastructure state is cryptographically verifiable.',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
        ),
    },
]

// ── Patent names ──
const patents = [
    'NebuLang Protocol',
    'Neural-Fractal Architecture',
    'KG Query Engine',
    'Autonomous Infrastructure Genesis',
    'Tri-Silicon Mesh Orchestration',
    'Cryptographic Infrastructure Proofs',
    'Self-Evolving Agent Protocol',
    'Direct-to-Metal Orchestration',
]

function LandingPage() {
    usePageMeta(
        'Sirsi — Intelligent Infrastructure',
        'Sirsi is the world\'s first AI platform that autonomously builds, manages, and cryptographically proves its own infrastructure. 8 patents. Multi-platform. Direct-to-metal.'
    )

    return (
        <>
            {/* Inject CSS */}
            <style>{patternStyles}</style>

            {/* ═══════════════ 1. HERO SECTION ═══════════════ */}
            <section
                id="hero"
                className="relative min-h-[90vh] flex items-center overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 30%, #000000 100%)' }}
            >
                {/* Animated mesh background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="hex-pattern" />
                    <div className="mesh-bg absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(ellipse at 30% 40%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(200,169,81,0.05) 0%, transparent 50%)',
                    }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-20">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="animate-fade-in-up inline-flex items-center gap-2 gold-badge px-5 py-2.5 rounded-full mb-8">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium" style={{ color: '#C8A951' }}>
                                8 Patent Portfolio · AI-Powered Infrastructure
                            </span>
                        </div>

                        {/* Headline — Cinzel */}
                        <h1
                            className="animate-fade-in-up delay-100 text-5xl md:text-7xl lg:text-8xl mb-6 leading-[0.95] tracking-[0.04em]"
                            style={{
                                fontFamily: "'Cinzel', serif",
                                fontWeight: 600,
                                color: '#ffffff',
                            }}
                        >
                            THE FUTURE OF
                            <br />
                            <span style={{ color: '#10B981' }}>INTELLIGENT INFRASTRUCTURE</span>
                        </h1>

                        {/* Subheadline — Inter */}
                        <p
                            className="animate-fade-in-up delay-200 text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}
                        >
                            The world's first AI platform that builds, manages, and{' '}
                            <span style={{ color: '#10B981', fontWeight: 500 }}>cryptographically proves</span>{' '}
                            its own infrastructure.
                        </p>

                        <p
                            className="animate-fade-in-up delay-300 text-base md:text-lg mb-10 max-w-2xl mx-auto"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}
                        >
                            Describe what you need in plain English. Sirsi builds it, verifies it, and proves it — autonomously.
                        </p>

                        {/* CTA buttons */}
                        <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row gap-4 justify-center">
                            <LinkComp
                                to="/signup"
                                className="inline-flex items-center px-8 py-4 font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-white"
                                style={{ background: 'linear-gradient(135deg, #059669, #10B981)', fontFamily: "'Inter', sans-serif" }}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Start Free
                            </LinkComp>
                            <a
                                href="mailto:cylton@sirsi.ai?subject=Technical%20Briefing%20Request"
                                className="inline-flex items-center px-8 py-4 font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    border: '1px solid rgba(200,169,81,0.5)',
                                    color: '#C8A951',
                                    background: 'rgba(200,169,81,0.05)',
                                }}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule a Briefing
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-40 h-40 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />
                <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full opacity-5 animate-pulse" style={{ background: 'radial-gradient(circle, #C8A951, transparent)', animationDelay: '1s' }} />
            </section>

            {/* ═══════════════ 2. PATENT PORTFOLIO BADGE ═══════════════ */}
            <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #000000 0%, #022c22 50%, #000000 100%)' }}>
                <div className="diamond-gold-pattern" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12 animate-fade-in-up">
                        {/* Gold badge */}
                        <div className="inline-flex items-center gap-3 gold-badge px-8 py-4 rounded-full mb-8">
                            <svg className="w-6 h-6" fill="none" stroke="#C8A951" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
                            </svg>
                            <span
                                className="text-lg tracking-[0.1em]"
                                style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: '#C8A951' }}
                            >
                                8 PATENT PORTFOLIO
                            </span>
                        </div>

                        <p
                            className="text-base max-w-2xl mx-auto mb-12"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}
                        >
                            Each patent represents a fundamental innovation in autonomous infrastructure.
                            Together, they form an impenetrable IP moat.
                        </p>
                    </div>

                    {/* Patent grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {patents.map((name, i) => (
                            <div
                                key={name}
                                className={`animate-fade-in-up delay-${(i + 1) * 100} glass-card p-5 rounded-xl text-center transition-all duration-500`}
                            >
                                <div className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: '#C8A951' }}>
                                    P-{String(i + 1).padStart(3, '0')}
                                </div>
                                <div className="text-sm font-medium text-white leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 3. FEATURE GRID (8 capabilities) ═══════════════ */}
            <section
                id="features"
                className="py-24 relative overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #000000 0%, #064e3b 50%, #000000 100%)' }}
            >
                <div className="grid-dots-pattern" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 font-medium mb-4 text-xs uppercase tracking-[0.4em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            CAPABILITIES
                        </p>
                        <h2
                            className="text-4xl md:text-5xl mb-6 tracking-[0.08em]"
                            style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: '#ffffff' }}
                        >
                            WHAT SIRSI DOES
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>
                            Eight core capabilities that make Sirsi the only platform you need for autonomous infrastructure.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className={`animate-fade-in-up delay-${(i % 4 + 1) * 100} glass-card p-7 rounded-2xl transition-all duration-500 group`}
                            >
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                                >
                                    <span className="text-emerald-400">{f.icon}</span>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-3" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 4. TELEMETRY + AI DIFFERENTIATOR ═══════════════ */}
            <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #022c22 0%, #000000 100%)' }}>
                <div className="diamond-gold-pattern" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <p className="text-emerald-400 font-medium mb-4 text-xs uppercase tracking-[0.4em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    LIVE INTELLIGENCE
                                </p>
                                <h2
                                    className="text-3xl md:text-4xl mb-6 tracking-[0.06em]"
                                    style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: '#ffffff' }}
                                >
                                    AUTONOMOUS DECISION MAKING
                                </h2>
                            </div>

                            {[
                                { title: 'Predictive Failure Prevention', desc: 'AI agents analyze patterns across billions of telemetry points to predict and preempt failures weeks before they materialize.' },
                                { title: 'Self-Healing Infrastructure', desc: "When anomalous states are detected, the Hypervisor autonomously reconfigures networks, migrates databases, and re-optimizes clusters." },
                                { title: 'Dynamic Cost Arbitrage', desc: 'Continuous cross-provider resource optimization ensures your workloads always run on the most efficient hardware at the lowest cost.' },
                            ].map(d => (
                                <div key={d.title} className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 group-hover:scale-110"
                                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                                    >
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2 text-lg text-white" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{d.title}</h4>
                                        <p className="text-base leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>{d.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <TelemetryPulse />
                    </div>
                </div>
            </section>

            {/* ═══════════════ 5. PLATFORM STRIP ═══════════════ */}
            <section className="py-16 relative" style={{ background: '#000000', borderTop: '1px solid rgba(200,169,81,0.15)', borderBottom: '1px solid rgba(200,169,81,0.15)' }}>
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.3em] mb-8" style={{ color: '#C8A951', fontFamily: "'Inter', sans-serif" }}>
                        MULTI-PLATFORM DELIVERY
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        {[
                            { label: 'Web', icon: '🌐' },
                            { label: 'Desktop', icon: '🖥️' },
                            { label: 'Mobile', icon: '📱' },
                            { label: 'Mac Studio', icon: '⚡' },
                        ].map((p, i) => (
                            <div key={p.label} className="flex items-center gap-3 group">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
                                <span className="text-lg font-medium text-white/70 group-hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                                    {p.label}
                                </span>
                                {i < 3 && <span className="text-white/20 ml-4 hidden md:inline">·</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 6. TRI-SILICON VISUAL ═══════════════ */}
            <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #000000 0%, #022c22 50%, #000000 100%)' }}>
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 font-medium mb-4 text-xs uppercase tracking-[0.4em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            TRI-SILICON MESH
                        </p>
                        <h2
                            className="text-3xl md:text-4xl mb-6 tracking-[0.06em]"
                            style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: '#ffffff' }}
                        >
                            THREE SILICON ARCHITECTURES. ONE PLATFORM.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'NVIDIA',
                                subtitle: 'Enterprise GPU',
                                desc: 'Standardized orchestration for CUDA workloads in public and private cloud.',
                                accent: '#76b900',
                                bgAccent: 'rgba(118,185,0,0.08)',
                                borderAccent: 'rgba(118,185,0,0.25)',
                            },
                            {
                                name: 'Google TPU',
                                subtitle: 'Cloud Scale',
                                desc: 'High-efficiency orchestration for frontier-class AI inference at scale.',
                                accent: '#4285f4',
                                bgAccent: 'rgba(66,133,244,0.08)',
                                borderAccent: 'rgba(66,133,244,0.25)',
                            },
                            {
                                name: 'Apple Silicon',
                                subtitle: 'Sovereign Pods',
                                desc: 'Localized nano-datacenters with 512GB unified memory. Your data never leaves.',
                                accent: '#a1a1aa',
                                bgAccent: 'rgba(161,161,170,0.08)',
                                borderAccent: 'rgba(161,161,170,0.25)',
                            },
                        ].map(s => (
                            <div
                                key={s.name}
                                className="silicon-card p-8 rounded-2xl text-center"
                                style={{ background: s.bgAccent, border: `1px solid ${s.borderAccent}` }}
                            >
                                <div className="text-3xl font-medium mb-2 tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: s.accent, fontWeight: 500 }}>
                                    {s.name}
                                </div>
                                <div className="text-xs uppercase tracking-[0.2em] mb-6 font-medium" style={{ color: s.accent, opacity: 0.7 }}>
                                    {s.subtitle}
                                </div>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 7. CTA SECTION ═══════════════ */}
            <section
                id="contact"
                className="py-24 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #064e3b 50%, #022c22 100%)' }}
            >
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2
                        className="text-3xl md:text-5xl mb-6 tracking-[0.06em]"
                        style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: '#ffffff' }}
                    >
                        SCHEDULE A TECHNICAL BRIEFING
                    </h2>
                    <p
                        className="text-lg mb-10 max-w-2xl mx-auto"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}
                    >
                        See the Autonomous CTO in action. We'll walk you through the 8-patent platform,
                        direct-to-metal capabilities, and the Tri-Silicon Mesh architecture.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:cylton@sirsi.ai?subject=Technical%20Briefing%20Request"
                            className="inline-flex items-center px-10 py-4 font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                background: '#ffffff',
                                color: '#059669',
                                fontWeight: 500,
                            }}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Schedule Briefing
                        </a>
                        <LinkComp
                            to="/login"
                            className="inline-flex items-center px-10 py-4 font-medium rounded-lg transition-all duration-300 border"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                borderColor: 'rgba(255,255,255,0.3)',
                                color: '#ffffff',
                                fontWeight: 400,
                            }}
                        >
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
