import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 ${
        isOnline ? 'bg-green-100' : 'bg-yellow-100'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5 text-green-600" />
          <span className="text-green-700">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-700">You're offline</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;