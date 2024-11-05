import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
  onSuccess: (token: string) => void;
  action?: string;
}

declare global {
  interface Window {
    turnstile: any;
  }
}

const Turnstile: React.FC<TurnstileProps> = ({ onSuccess, action = 'submit' }) => {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const loadTurnstile = () => {
      if (window.turnstile) {
        initializeTurnstile();
      } else if (!scriptLoadedRef.current) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeTurnstile();
        };
        document.body.appendChild(script);
        scriptLoadedRef.current = true;
      }
    };

    const initializeTurnstile = () => {
      if (turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          action: action,
          callback: onSuccess,
          theme: 'light', // or 'dark'
        });
      }
    };

    loadTurnstile();

    // Cleanup on unmount
    return () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
      }
    };
  }, [onSuccess, action]);

  return <div ref={turnstileRef}></div>;
};

export default Turnstile; 