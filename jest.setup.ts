import "@testing-library/jest-dom";

// jsdom does not implement window.matchMedia. Provide a minimal stub so
// components that call it (e.g. DebtChart mobile detection) don't throw.
// Guard with typeof check so Node-environment test suites don't crash.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
