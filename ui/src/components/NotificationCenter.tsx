'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { removeNotification } from '@/store/slices/uiSlice';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X as CloseIcon,
} from 'lucide-react';

const NOTIFICATION_DURATION = 5000; // 5 seconds

export const NotificationCenter: React.FC = () => {
  const notifications = useAppSelector((state) => state.ui.notifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoClose !== false) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, NOTIFICATION_DURATION);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/50';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/50';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/50';
      default:
        return 'bg-blue-50 dark:bg-blue-900/50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`w-96 rounded-lg border shadow-lg animate-slide-up ${getBackgroundColor(
            notification.type
          )}`}
        >
            <div className="flex items-start gap-3 p-4">
              {getIcon(notification.type)}
              <div className="flex-1">
                {notification.title && (
                  <h3 className="font-semibold">{notification.title}</h3>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => dispatch(removeNotification(notification.id))}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
        </div>
      ))}
    </div>
  );
};
