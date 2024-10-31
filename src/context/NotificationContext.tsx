import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface NotificationItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  type: 'success' | 'error' | 'info';
  isFadingOut?: boolean;
}

interface NotificationContextType {
  showNotification: (item: Omit<NotificationItem, 'id'>) => void;
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
  const idCounter = useRef(0);
  const MAX_NOTIFICATIONS = 5;

  const showNotification = (item: Omit<NotificationItem, 'id'>) => {
    if (notifications.length >= MAX_NOTIFICATIONS) {
      setNotifications((prev) => prev.slice(1));
    }

    const id = idCounter.current++;
    const newNotification: NotificationItem = { id, ...item };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  useEffect(() => {
    const timers: { id: number; fadeOutTimer: number; removeTimer: number }[] = [];

    notifications.forEach((notif) => {
      if (!timers.find((t) => t.id === notif.id)) {
        const fadeOutTimer = setTimeout(() => {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notif.id ? { ...item, isFadingOut: true } : item
            )
          );
        }, 2000); // Start fade-out after 2 seconds

        const removeTimer = setTimeout(() => {
          setNotifications((prev) => prev.filter((item) => item.id !== notif.id));
        }, 2500); // Remove after 2.5 seconds

        timers.push({ id: notif.id, fadeOutTimer, removeTimer });
      }
    });

    return () => {
      timers.forEach(({ fadeOutTimer, removeTimer }) => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      });
    };
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Notification Display */}
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center bg-white border border-gray-200 rounded-md shadow-lg p-4 max-w-xs transition-opacity duration-500 ${
              notif.isFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
            role="alert"
            aria-live="assertive"
          >
            <img
              src={notif.image}
              alt={notif.name}
              className="w-10 h-10 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{notif.name}</p>
              <p className="text-xs text-gray-500">Quantity: {notif.quantity}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

