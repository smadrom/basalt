import '@testing-library/jest-dom/vitest';

// jsdom forwards script errors (React's dev-mode error re-dispatch via
// invokeGuardedCallback) to the console as jsdomErrors — pure noise in
// ErrorBoundary tests. Drop only those; real console.* calls keep forwarding,
// so spies and genuine failures are unaffected. A VirtualConsole instance
// can't be passed via vite.config environmentOptions because vitest's forks
// pool structured-clones the config into workers and EventEmitters don't
// survive that — hence mutating the live instance here instead.
(
  globalThis as {
    jsdom?: { virtualConsole?: { removeAllListeners(event: string): unknown } };
  }
).jsdom?.virtualConsole?.removeAllListeners('jsdomError');
