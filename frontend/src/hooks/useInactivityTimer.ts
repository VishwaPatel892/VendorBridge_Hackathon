import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { apiClient } from '../lib/api-client';

const WARNING_MS = 28 * 60 * 1000; // 28 minutes
const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export default function useInactivityTimer() {
  const [showWarning, setShowWarning] = useState(false);
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user, logout } = useStore();

  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await logout();
    window.location.pathname = '/';
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimers = () => {
      clearTimeout(warningRef.current);
      clearTimeout(timeoutRef.current);
      setShowWarning(false);
      warningRef.current = setTimeout(() => setShowWarning(true), WARNING_MS);
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, TIMEOUT_MS);
    };

    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => document.addEventListener(e, resetTimers));
    resetTimers();

    return () => {
      clearTimeout(warningRef.current);
      clearTimeout(timeoutRef.current);
      events.forEach((e) => document.removeEventListener(e, resetTimers));
    };
  }, [isAuthenticated, logout]);

  const stayLoggedIn = async () => {
    try {
      await apiClient.post('auth/refresh-token'); // Call backend to refresh cookie token
    } catch (e) {
      handleLogout();
      return;
    }
    setShowWarning(false);
    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => document.dispatchEvent(new Event(e)));
  };

  return { showWarning, stayLoggedIn, handleLogout };
}
