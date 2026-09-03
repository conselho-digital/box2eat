"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
  isDark: boolean;
  setDark: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Reads the theme the no-flash inline script (in app/layout.tsx) already
 *  applied to <html> before hydration, so this doesn't cause a mismatch. */
function getInitialIsDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setDark: setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
