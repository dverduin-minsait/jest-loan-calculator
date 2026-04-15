interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

/**
 * Sliding-window in-memory rate limiter.
 * Returns true if the request is allowed, false if the limit has been exceeded.
 *
 * @param key        Unique key identifying the client/action (e.g. "register:1.2.3.4")
 * @param maxRequests Maximum number of requests allowed within the window
 * @param windowMs   Length of the sliding window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const record = store.get(key) ?? { timestamps: [] };

  // Prune timestamps that have fallen outside the window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= maxRequests) {
    store.set(key, record);
    return false;
  }

  record.timestamps.push(now);
  store.set(key, record);
  return true;
}
