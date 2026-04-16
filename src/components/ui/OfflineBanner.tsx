"use client";

import { useState, useEffect } from "react";

export function OfflineBanner() {
  // Start as online — matches server render, avoids hydration mismatch.
  // After mount, sync with actual network state.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800"
    >
      You are offline — showing cached data. Changes will sync when you
      reconnect.
    </div>
  );
}
