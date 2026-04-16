"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
}

function storageKey(title: string) {
  return `collapsible:${title.toLowerCase().replace(/\s+/g, "-")}`;
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  headerExtra,
  children,
}: CollapsibleSectionProps) {
  const key = storageKey(title);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Sync from localStorage after hydration to avoid server/client mismatch.
  useEffect(() => {
    const stored = localStorage.getItem(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration sync with localStorage
    if (stored !== null) setIsOpen(stored === "true");
  }, [key]);

  function toggle() {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(key, String(next));
      return next;
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium text-gray-900">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={isOpen}
              className="flex items-center gap-2 text-left hover:text-gray-700 transition-colors"
            >
              {title}
              <ChevronIcon isOpen={isOpen} />
            </button>
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerExtra && (
          <div className="ml-4 flex-shrink-0">{headerExtra}</div>
        )}
      </div>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
