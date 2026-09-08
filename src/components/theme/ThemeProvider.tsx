"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mk-theme") as Theme | null;
      if (saved === "dark" || saved === "light") apply(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function apply(t: Theme) {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try {
      window.localStorage.setItem("mk-theme", t);
    } catch {
      /* ignore */
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme: apply }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
