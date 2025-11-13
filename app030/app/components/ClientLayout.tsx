'use client';

import { useEffect, useState, type ReactNode } from 'react';
import ApiKeyCheckPrompt from './ApiKeyCheckPrompt';
import InstallPrompt from './InstallPrompt';

const GEMINI_API_KEY_STORAGE = 'gemini_api_key';
const API_KEY_CHECKED_SESSION = 'api_key_checked';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }

    // Check if this is the first access in the session
    const hasChecked = sessionStorage.getItem(API_KEY_CHECKED_SESSION);

    if (!hasChecked) {
      // Check if API key is set in localStorage
      const apiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);

      if (!apiKey) {
        // API key not set, show prompt
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowPrompt(true);
      }

      // Mark as checked for this session
      sessionStorage.setItem(API_KEY_CHECKED_SESSION, 'true');
    }

    setIsChecking(false);
  }, []);

  const handleComplete = () => {
    setShowPrompt(false);
  };

  // Show nothing while checking to avoid flash
  if (isChecking) {
    return null;
  }

  if (showPrompt) {
    return <ApiKeyCheckPrompt onComplete={handleComplete} />;
  }

  return (
    <>
      {children}
      <InstallPrompt />
    </>
  );
}
