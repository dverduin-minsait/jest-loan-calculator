"use client";

import { useSyncExternalStore, useState } from "react";

// subscribe is a no-op — Notification.permission has no change event
function subscribe() {
  return () => {};
}
function getSnapshot(): NotificationPermission | null {
  return "Notification" in window ? Notification.permission : null;
}
function getServerSnapshot(): null {
  return null;
}

export function NotificationPrompt() {
  const permission = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    await Notification.requestPermission();
    setDismissed(true);
  }

  if (dismissed || permission !== "default") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-4 px-4 py-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm mb-5"
    >
      <p className="text-blue-800 dark:text-blue-200">
        Enable notifications to get payment reminders for your loans.
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={requestPermission}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Enable
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-sm"
          aria-label="Dismiss notification prompt"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
