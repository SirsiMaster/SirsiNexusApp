import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocSection {
    id: string;
    title: string;
    content: React.ReactNode;
}

const MotionDiv = motion.div as any;
const APresence = AnimatePresence as any;

export function DocumentationPortal() {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const sections: DocSection[] = [
        {
            id: 'overview',
            title: 'Getting Started',
            content: (
                <div className="space-y-6">
                    <p className="inter text-slate-400 leading-relaxed">
                        Welcome to the SirsiNexus Admin Console documentation. This guide will help you understand and effectively use all features of the admin portal.
                    </p>
                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl bg-white/5">
                        <h3 className="cinzel text-gold text-lg mb-4 tracking-widest uppercase font-bold">Quick Start</h3>
                        <ol className="space-y-4">
                            {[
                                'Log in to the admin console with your administrator credentials',
                                'Navigate through the sidebar to access different sections',
                                'Use Quick Actions for common tasks',
                                'Monitor system health from the dashboard',
                                'Configure settings as needed for your organization'
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4 items-start inter text-sm text-slate-300">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">{i + 1}</span>
                                    <span className="mt-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard',
            title: 'Dashboard Guide',
            content: (
                <div className="space-y-6">
                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl bg-white/5">
                        <h3 className="inter text-white font-semibold mb-4 text-lg">Platform Overview</h3>
                        <p className="inter text-slate-400 text-sm mb-6 leading-relaxed">
                            The dashboard provides a real-time overview of your platform's performance, user activity, and system health.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Total Users', desc: 'Active user count and growth percentage' },
                                { label: 'Revenue', desc: 'Monthly revenue tracking and trends' },
                                { label: 'Active Sessions', desc: 'Real-time user sessions' },
                                { label: 'Server Health', desc: 'System uptime and performance' }
                            ].map((metric, i) => (
                                <div key={i} className="p-4 rounded-lg bg-black/20 border border-white/5">
                                    <h4 className="inter text-gold text-xs font-bold uppercase tracking-wider mb-1">{metric.label}</h4>
                                    <p className="inter text-slate-400 text-xs leading-relaxed">{metric.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'users',
            title: 'User Management',
            content: (
                <div className="space-y-6">
                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl bg-white/5">
                        <h3 className="inter text-white font-semibold mb-4 text-lg">Managing Access</h3>
                        <p className="inter text-slate-400 text-sm mb-6 leading-relaxed">
                            The User Management section allows you to create, edit, and manage user accounts and permissions.
                        </p>
                        <div className="space-y-4">
                            {[
                                { title: 'User Creation', desc: 'Add new users with role assignment' },
                                { title: 'Bulk Import', desc: 'Import multiple users via CSV' },
                                { title: 'Role Mapping', desc: 'Define custom roles and permissions' },
                                { title: 'Audit Trail', desc: 'Monitor user login and actions' }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_#10b981]" />
                                    <div>
                                        <p className="inter text-white text-sm font-medium">{feature.title}</p>
                                        <p className="inter text-slate-500 text-xs">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-emerald/80 space-y-1">
                        <p className="text-slate-500 italic mb-2">// Canonical Role Hierarchy</p>
                        <p>ROLE_ADMIN      = 0xFF; // Full system access</p>
                        <p>ROLE_MANAGER    = 0x40; // Department management</p>
                        <p>ROLE_ANALYST    = 0x20; // Read-only access</p>
                        <p>ROLE_VIEWER     = 0x01; // Limited viewing</p>
                    </div>
                </div>
            )
        },
        {
            id: 'security',
            title: 'Security Engine',
            content: (
                <div className="space-y-6">
                    <div className="neo-glass-panel p-6 border border-white/10 rounded-xl bg-white/5">
                        <h3 className="inter text-white font-semibold mb-4 text-lg">System Hardening</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Access Control', desc: 'IP whitelisting and blacklisting' },
                                { title: 'MFA Enforcement', desc: 'TOTP, Email, and SMS verification' },
                                { title: 'Session Vault', desc: 'Encrypted token storage and rotation' },
                                { title: 'Audit Records', desc: 'Immutable logging of security events' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald text-xs">🛡️</span>
                                        <span className="inter text-sm font-semibold text-slate-200">{item.title}</span>
                                    </div>
                                    <p className="inter text-xs text-slate-500 leading-relaxed pl-6">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex gap-4">
                        <span className="text-xl">⚠️</span>
                        <p className="inter text-xs text-yellow-200/70 leading-relaxed italic">
                            <strong>Critical Directive:</strong> Always verify security modifications in isolated staging environments before propagating to production clusters.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const filteredSections = sections.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="cinzel text-2xl text-gold tracking-[0.2em] font-bold">ADMIN DOCUMENTATION</h2>
                <p className="inter text-[10px] text-slate-500 uppercase tracking-widest font-medium">Standard Operating Procedures and System Reference</p>
            </div>

            <div className="grid grid-cols-12 gap-10">
                <aside className="col-span-3 space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Find feature..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 inter text-xs text-white focus:outline-none focus:border-gold/30 transition-all pl-10"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {filteredSections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 inter text-xs font-semibold tracking-wider uppercase ${activeSection === section.id
                                    ? 'bg-gold/10 text-gold border border-gold/20'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {section.title}
                                <span className={`transition-transform duration-300 ${activeSection === section.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100'}`}>→</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 space-y-4">
                        <h4 className="cinzel text-gold text-[10px] font-bold tracking-widest uppercase">Support Forge</h4>
                        <p className="inter text-[10px] text-slate-400 leading-relaxed">
                            Technical assistance is available 24/7 for critical system failures.
                        </p>
                        <a href="mailto:support@sirsi.ai" className="inline-block inter text-[10px] font-bold text-white uppercase tracking-wider hover:text-gold transition-colors">
                            Initialize Signal →
                        </a>
                    </div>
                </aside>

                <main className="col-span-9">
                    <APresence mode="wait">
                        <MotionDiv
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-px flex-1 bg-white/10" />
                                <h3 className="cinzel text-xl text-white tracking-[0.3em] font-medium uppercase">{sections.find(s => s.id === activeSection)?.title}</h3>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            {sections.find(s => s.id === activeSection)?.content}
                        </MotionDiv>
                    </APresence>
                </main>
            </div>
        </div>
    );
}
