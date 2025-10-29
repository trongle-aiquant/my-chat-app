import { useEffect, useState } from 'react';

/**
 * Custom hook để quản lý Dark Mode
 * 
 * Features:
 * - Lưu preference vào localStorage
 * - Auto-detect system preference lần đầu
 * - Sync với document.documentElement class
 * - Type-safe với TypeScript
 * 
 * @returns {Object} { isDarkMode, toggleDarkMode, setDarkMode }
 */
export const useDarkMode = () => {
  // Key để lưu trong localStorage
  const STORAGE_KEY = 'darkMode';

  /**
   * Initialize dark mode state
   * Priority:
   * 1. localStorage value (nếu user đã set trước đó)
   * 2. System preference (prefers-color-scheme)
   * 3. Default: false (light mode)
   */
  const getInitialDarkMode = (): boolean => {
    // Kiểm tra localStorage trước
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode !== null) {
      return savedMode === 'true';
    }

    // Nếu chưa có trong localStorage, check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Default: light mode
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDarkMode);

  /**
   * Effect để sync dark mode với DOM và localStorage
   */
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY, 'false');
    }
  }, [isDarkMode]);

  /**
   * Effect để listen system preference changes
   */
  useEffect(() => {
    // Chỉ listen nếu user chưa set preference (không có trong localStorage)
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode !== null) {
      return; // User đã có preference, không cần listen system
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      // Legacy browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, []);

  /**
   * Toggle dark mode on/off
   */
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  /**
   * Set dark mode to specific value
   */
  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };
};

