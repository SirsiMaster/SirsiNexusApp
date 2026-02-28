/**
 * useKeyboardShortcuts — Global keyboard shortcut handler
 * Enables Cmd+K for CommandPalette, Cmd+/ for search, etc.
 */

import { useEffect } from 'react';

interface ShortcutConfig {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    action: () => void;
    description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't fire if user is typing in an input/textarea
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

            for (const shortcut of shortcuts) {
                const metaMatch = shortcut.metaKey ? (e.metaKey || e.ctrlKey) : true;
                const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey : true;
                const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

                if (
                    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    metaMatch &&
                    ctrlMatch &&
                    shiftMatch
                ) {
                    e.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
