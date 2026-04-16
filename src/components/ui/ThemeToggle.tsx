"use client";

import { useState } from "react";

function getInitialDark(): boolean {
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const isDark = getInitialDark();
    document.documentElement.classList.toggle("dark", isDark);
    return isDark;
  });

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
