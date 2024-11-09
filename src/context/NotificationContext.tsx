import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  isFadingOut?: boolean;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const MAX_NOTIFICATIONS = 5;
  const timersRef = useRef<Map<string, { fadeOutTimer: number; removeTimer: number }>>(new Map());

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotifications((prev) => {
      const newNotifications = prev.length >= MAX_NOTIFICATIONS ? prev.slice(1) : prev;
      const id = uuidv4();
      const newNotification: NotificationItem = { id, message, type };
      return [...newNotifications, newNotification];
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    const timers = timersRef.current.get(id);
    if (timers) {
      clearTimeout(timers.fadeOutTimer);
      clearTimeout(timers.removeTimer);
      timersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    notifications.forEach((notif) => {
      if (!timersRef.current.has(notif.id)) {
        const fadeOutTimer = window.setTimeout(() => {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notif.id ? { ...item, isFadingOut: true } : item
            )
          );
        }, 2000); // Start fade-out after 2 seconds

        const removeTimer = window.setTimeout(() => {
          removeNotification(notif.id);
        }, 2500); // Remove after 2.5 seconds

        timersRef.current.set(notif.id, { fadeOutTimer, removeTimer });
      }
    });

    return () => {
      timersRef.current.forEach(({ fadeOutTimer, removeTimer }) => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      });
      timersRef.current.clear();
    };
  }, [notifications, removeNotification]);

  const getNotificationClasses = (type: NotificationType, isFadingOut: boolean) => {
    let baseClasses = 'flex items-center border rounded-md shadow-lg p-4 max-w-xs transition-opacity duration-500 ';
    switch (type) {
      case NotificationType.SUCCESS:
        baseClasses += 'bg-green-100 border-green-200 ';
        break;
      case NotificationType.ERROR:
        baseClasses += 'bg-red-100 border-red-200 ';
        break;
      case NotificationType.INFO:
        baseClasses += 'bg-blue-100 border-blue-200 ';
        break;
      default:
        baseClasses += 'bg-white border-gray-200 ';
    }
    baseClasses += isFadingOut ? 'opacity-0' : 'opacity-100';
    return baseClasses;
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Notification Display */}
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end space-y-2" aria-live="assertive" aria-atomic="true">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={getNotificationClasses(notif.type, notif.isFadingOut || false)}
            role="alert"
          >
            {/* Optional: Add icon based on type */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{notif.message}</p>
              <p className="text-xs text-gray-500 capitalize">{notif.type}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

