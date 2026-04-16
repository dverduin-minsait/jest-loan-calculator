"use client";

import { useEffect, useSyncExternalStore } from "react";

function subscribeToTheme(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener("theme-change", callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener("theme-change", callback);
  };
}

function getThemeSnapshot(): boolean {
  const stored = localStorage.getItem("theme");
  return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggle() {
    const next = !dark;
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
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
