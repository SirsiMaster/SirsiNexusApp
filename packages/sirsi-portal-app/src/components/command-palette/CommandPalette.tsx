/**
 * CommandPalette — Swiss Neo-Deco Command Interface
 * Ported from ui/src/components/CommandPalette.tsx
 * Modernized: Next.js → Vite, Redux → Zustand, useRouter → TanStack Router
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface Command {
    id: string;
    title: string;
    description: string;
    icon: string; // SVG path or emoji
    shortcut?: string;
    category: 'Navigation' | 'Actions' | 'AI' | 'Recent';
    action: () => void;
    keywords: string[];
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const commands: Command[] = [
        {
            id: 'dashboard',
            title: 'Go to Dashboard',
            description: 'Main dashboard overview',
            icon: '🏠',
            shortcut: 'G → D',
            category: 'Navigation',
            action: () => navigate({ to: '/' }),
            keywords: ['dashboard', 'home', 'main', 'overview'],
        },
        {
            id: 'contracts',
            title: 'Contracts',
            description: 'View and manage contracts',
            icon: '📄',
            shortcut: 'G → C',
            category: 'Navigation',
            action: () => navigate({ to: '/contracts' }),
            keywords: ['contracts', 'documents', 'sign', 'agreements'],
        },
        {
            id: 'users',
            title: 'User Management',
            description: 'Manage users and permissions',
            icon: '👥',
            shortcut: 'G → U',
            category: 'Navigation',
            action: () => navigate({ to: '/users' }),
            keywords: ['users', 'team', 'permissions', 'roles'],
        },
        {
            id: 'tenants',
            title: 'Tenant Management',
            description: 'Manage portfolio tenants',
            icon: '🏢',
            shortcut: 'G → T',
            category: 'Navigation',
            action: () => navigate({ to: '/tenants' }),
            keywords: ['tenants', 'organizations', 'portfolio', 'apps'],
        },
        {
            id: 'settings',
            title: 'Settings',
            description: 'Application configuration',
            icon: '⚙️',
            shortcut: 'G → S',
            category: 'Navigation',
            action: () => navigate({ to: '/settings' }),
            keywords: ['settings', 'config', 'preferences'],
        },
        {
            id: 'telemetry',
            title: 'Telemetry & Analytics',
            description: 'System performance metrics',
            icon: '📊',
            category: 'Navigation',
            action: () => navigate({ to: '/telemetry' }),
            keywords: ['telemetry', 'analytics', 'metrics', 'performance'],
        },
        {
            id: 'new-contract',
            title: 'Create New Contract',
            description: 'Start a new contract from template',
            icon: '✨',
            shortcut: 'N → C',
            category: 'Actions',
            action: () => { navigate({ to: '/contracts' }); /* TODO: open create modal */ },
            keywords: ['new', 'create', 'contract', 'template'],
        },
        {
            id: 'ai-assistant',
            title: 'Ask AI Assistant',
            description: 'Get help from the Sirsi Guidance Engine',
            icon: '🤖',
            shortcut: '⌘ → I',
            category: 'AI',
            action: () => { /* TODO: open AI assistant panel */ },
            keywords: ['ai', 'assistant', 'help', 'gemini', 'guidance'],
        },
    ];

    // Filter commands based on query
    const filteredCommands = query
        ? commands.filter(
            (cmd) =>
                cmd.title.toLowerCase().includes(query.toLowerCase()) ||
                cmd.description.toLowerCase().includes(query.toLowerCase()) ||
                cmd.keywords.some((k) => k.includes(query.toLowerCase()))
        )
        : commands;

    // Group by category
    const groupedCommands = filteredCommands.reduce(
        (acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd);
            return acc;
        },
        {} as Record<string, Command[]>
    );

    const flatFiltered = filteredCommands;

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => Math.min(prev + 1, flatFiltered.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (flatFiltered[selectedIndex]) {
                        flatFiltered[selectedIndex].action();
                        onClose();
                    }
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        },
        [isOpen, flatFiltered, selectedIndex, onClose]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Scroll selected into view
    useEffect(() => {
        const items = listRef.current?.querySelectorAll('[data-cmd-item]');
        items?.[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isOpen) return null;

    const categoryMeta: Record<string, { label: string; color: string }> = {
        Navigation: { label: 'Navigation', color: 'text-blue-400' },
        Actions: { label: 'Actions', color: 'text-emerald-400' },
        AI: { label: 'AI & Assistance', color: 'text-purple-400' },
        Recent: { label: 'Recent', color: 'text-amber-400' },
    };

    let runningIndex = 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Palette */}
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101]">
                <div
                    className="mx-4 rounded-xl overflow-hidden shadow-2xl"
                    style={{
                        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
                        border: '1px solid rgba(200, 169, 81, 0.3)',
                    }}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-800/50">
                        <span className="text-emerald-400 text-lg">⌘</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent text-white placeholder-emerald-600 outline-none text-sm"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                        <kbd className="text-xs text-emerald-600 bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-700/50">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
                        {Object.entries(groupedCommands).map(([category, cmds]) => (
                            <div key={category}>
                                <div className="px-4 py-1.5">
                                    <span
                                        className={`text-[10px] font-semibold uppercase tracking-widest ${categoryMeta[category]?.color || 'text-slate-400'}`}
                                        style={{ fontFamily: "'Cinzel', serif" }}
                                    >
                                        {categoryMeta[category]?.label || category}
                                    </span>
                                </div>
                                {cmds.map((cmd) => {
                                    const thisIndex = runningIndex++;
                                    return (
                                        <button
                                            key={cmd.id}
                                            data-cmd-item
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${thisIndex === selectedIndex
                                                    ? 'bg-emerald-800/40 border-l-2 border-emerald-400'
                                                    : 'border-l-2 border-transparent hover:bg-emerald-900/30'
                                                }`}
                                            onClick={() => {
                                                cmd.action();
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(thisIndex)}
                                        >
                                            <span className="text-lg w-6 text-center">{cmd.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-white truncate">
                                                    {cmd.title}
                                                </div>
                                                <div className="text-xs text-emerald-500 truncate">
                                                    {cmd.description}
                                                </div>
                                            </div>
                                            {cmd.shortcut && (
                                                <kbd className="text-[10px] text-emerald-600 bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-700/50 whitespace-nowrap">
                                                    {cmd.shortcut}
                                                </kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}

                        {flatFiltered.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <div className="text-emerald-600 text-sm">No commands found</div>
                                <div className="text-emerald-700 text-xs mt-1">
                                    Try a different search term
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-emerald-800/50 text-[10px] text-emerald-700">
                        <div className="flex items-center gap-3">
                            <span>↑↓ Navigate</span>
                            <span>↵ Select</span>
                            <span>ESC Close</span>
                        </div>
                        <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
                            SIRSI
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
