import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
  className?: string;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
};

const iconColors = {
  success: 'text-green-400 dark:text-green-500',
  error: 'text-red-400 dark:text-red-500',
  warning: 'text-yellow-400 dark:text-yellow-500',
  info: 'text-blue-400 dark:text-blue-500',
};

export function Notification({
  id,
  type,
  title,
  message,
  onClose,
  duration = 5000,
  className,
}: NotificationProps) {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [duration, id, onClose]);

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
        colors[type],
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColors[type])} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationContainer({
  notifications,
  onClose,
}: {
  notifications: NotificationProps[];
  onClose: (id: string) => void;
}) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={onClose} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
