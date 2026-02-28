/**
 * Notification Store — Zustand-based notification system
 * Ported from ui/src/store/slices/uiSlice (Redux → Zustand)
 */

import { create } from 'zustand';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    autoClose?: boolean;
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

let notificationId = 0;

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = `notification-${++notificationId}`;
        set((state) => ({
            notifications: [...state.notifications, { ...notification, id }],
        }));
        // Auto-remove after 5s unless autoClose is false
        if (notification.autoClose !== false) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            }, 5000);
        }
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
    clearAll: () => set({ notifications: [] }),
}));
