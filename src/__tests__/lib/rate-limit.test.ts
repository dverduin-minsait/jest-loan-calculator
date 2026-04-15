import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = "allow-" + Math.random();
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks the request when the limit is exceeded", () => {
    const key = "block-" + Math.random();
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    expect(checkRateLimit(key, 2, 60_000)).toBe(false);
  });

  it("different keys are tracked independently", () => {
    const key1 = "key1-" + Math.random();
    const key2 = "key2-" + Math.random();
    checkRateLimit(key1, 1, 60_000); // use up key1
    expect(checkRateLimit(key2, 1, 60_000)).toBe(true); // key2 unaffected
  });

  it("allows requests again after the window expires", () => {
    jest.useFakeTimers();
    const key = "window-" + Math.random();
    checkRateLimit(key, 1, 100); // limit of 1 per 100 ms
    expect(checkRateLimit(key, 1, 100)).toBe(false); // second call blocked
    jest.advanceTimersByTime(101); // advance past the window
    expect(checkRateLimit(key, 1, 100)).toBe(true); // now allowed again
    jest.useRealTimers();
  });

  it("returns true on first call for a new key", () => {
    expect(checkRateLimit("fresh-" + Math.random(), 5, 60_000)).toBe(true);
  });
});
