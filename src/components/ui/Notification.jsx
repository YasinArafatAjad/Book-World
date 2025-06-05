import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const notificationTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-50 dark:bg-success-900 text-success-700 dark:text-success-300 border-success-200 dark:border-success-800',
  },
  error: {
    icon: XCircle,
    className: 'bg-error-50 dark:bg-error-900 text-error-700 dark:text-error-300 border-error-200 dark:border-error-800',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-warning-50 dark:bg-warning-900 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-800',
  },
  info: {
    icon: Info,
    className: 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
  },
};

export const NotificationContext = React.createContext({
  showNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map(({ id, message, type }) => {
            const { icon: Icon, className } = notificationTypes[type];
            
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`flex items-start p-4 rounded-lg border shadow-lg ${className} max-w-sm`}
              >
                <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <p className="flex-1">{message}</p>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== id))}
                  className="ml-4 flex-shrink-0 hover:opacity-75"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};