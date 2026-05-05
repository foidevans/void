"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      className="fixed right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] backdrop-blur-sm transition-all hover:border-[var(--border-focus)] hover:text-[var(--accent-text)]"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}