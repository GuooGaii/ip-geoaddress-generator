"use client";

import { createContext, useEffect, useState, useMemo } from "react";
import { Theme } from "@radix-ui/themes";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 从 localStorage 获取主题设置
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 监听主题变化并保存到 localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <Theme appearance={theme} accentColor="cyan" radius="medium">
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </Theme>
  );
}
