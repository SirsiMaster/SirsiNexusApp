/**
 * NotificationCenter — Swiss Neo-Deco Toast Notifications
 * Ported from ui/src/components/NotificationCenter.tsx
 * Modernized: Redux → Zustand, 'use client' removed
 */

import { useNotificationStore } from './store';

const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

const styleMap = {
    success: {
        bg: 'bg-emerald-900/90',
        border: 'border-emerald-500/40',
        icon: 'text-emerald-400',
        text: 'text-emerald-100',
    },
    error: {
        bg: 'bg-red-900/90',
        border: 'border-red-500/40',
        icon: 'text-red-400',
        text: 'text-red-100',
    },
    warning: {
        bg: 'bg-amber-900/90',
        border: 'border-amber-500/40',
        icon: 'text-amber-400',
        text: 'text-amber-100',
    },
    info: {
        bg: 'bg-blue-900/90',
        border: 'border-blue-500/40',
        icon: 'text-blue-400',
        text: 'text-blue-100',
    },
};

export function NotificationCenter() {
    const { notifications, removeNotification } = useNotificationStore();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[200] space-y-3 max-w-sm">
            {notifications.map((notification) => {
                const styles = styleMap[notification.type];

                return (
                    <div
                        key={notification.id}
                        className={`${styles.bg} ${styles.border} border rounded-lg shadow-2xl backdrop-blur-sm`}
                        style={{
                            animation: 'slideUp 0.3s ease-out',
                            borderLeft: '3px solid',
                        }}
                    >
                        <div className="flex items-start gap-3 p-4">
                            <span className={`${styles.icon} text-lg font-bold mt-0.5`}>
                                {iconMap[notification.type]}
                            </span>
                            <div className="flex-1 min-w-0">
                                {notification.title && (
                                    <h4
                                        className="text-sm font-semibold text-white mb-0.5"
                                        style={{ fontFamily: "'Cinzel', serif" }}
                                    >
                                        {notification.title}
                                    </h4>
                                )}
                                <p className={`text-xs ${styles.text}`}>
                                    {notification.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-white/40 hover:text-white/80 transition-colors text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                );
            })}

            <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
