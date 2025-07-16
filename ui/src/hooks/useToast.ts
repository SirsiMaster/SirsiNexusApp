import { useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

// Direct toast function export
export const toast = (options: ToastOptions) => {
  // This is a placeholder implementation
  // In a real app, this would integrate with a toast notification system
  console.log('Toast:', options);
  
  // For now, use native browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(options.title || 'Notification', {
      body: options.description,
    });
  } else {
    // Fallback to console log or alert
    const message = `${options.title ? options.title + ': ' : ''}${options.description}`;
    console.log(message);
  }
};

export function useToast() {
  return { toast };
}
