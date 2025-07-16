'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  X,
  Bell,
  Clock
} from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClear: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationColors = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
  }
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  onClear
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-dismiss notifications after their duration
  useEffect(() => {
    const timers = notifications.map(notification => {
      if (notification.duration && notification.duration > 0) {
        return setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  const unreadCount = notifications.length;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Notification Bell */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onClear}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 border-l-4 ${getNotificationColors(notification.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onDismiss(notification.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.slice(-3).map((notification) => (
            <motion.div
              key={`toast-${notification.id}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className={`pointer-events-auto p-4 rounded-lg border shadow-lg ${getNotificationColors(notification.type)} max-w-sm`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: NotificationType = 'info', duration: number = 5000) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: new Date(),
      duration
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll
  };
};
