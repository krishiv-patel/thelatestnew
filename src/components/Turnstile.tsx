import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  action?: string;
}

declare global {
  interface Window {
    turnstile: any;
  }
}

const Turnstile: React.FC<TurnstileProps> = ({ onSuccess, onError, action = 'submit' }) => {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.error('Turnstile site key is not configured');
      onError?.();
      return;
    }

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
      if (turnstileRef.current && siteKey) {
        try {
          window.turnstile.render(turnstileRef.current, {
            sitekey: siteKey,
            action: action,
            callback: onSuccess,
            'error-callback': onError,
            theme: 'light',
          });
        } catch (error) {
          console.error('Error initializing Turnstile:', error);
          onError?.();
        }
      }
    };

    loadTurnstile();

    return () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
      }
    };
  }, [onSuccess, onError, action, siteKey]);

  if (!siteKey) {
    return null;
  }

  return <div ref={turnstileRef} className="flex justify-center"></div>;
};

export default Turnstile;