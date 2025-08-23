"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  useEffect(() => {
    // Apply theme from localStorage immediately if available
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      applyTheme(savedTheme);
    } else {
      applyTheme('light'); // default theme
    }
  }, [applyTheme]);

  useEffect(() => {
    if (user && user.preferences) {
      const theme = user.preferences.theme === 'DARK' ? 'dark' : 'light';
      applyTheme(theme);
      // Also save to localStorage for quick access on next load
      localStorage.setItem('theme', theme);
    }
  }, [user, applyTheme]);

  return <>{children}</>;
}