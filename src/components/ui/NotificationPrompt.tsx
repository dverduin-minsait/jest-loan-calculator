"use client";

import { useEffect, useState } from "react";

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  if (permission !== "default") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-4 px-4 py-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
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
          onClick={() => setPermission("denied")}
          className="px-3 py-1 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-sm"
          aria-label="Dismiss notification prompt"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
