import { useAuthStore } from '@basalt/shared';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isUnauthorized } from './errors.ts';

// A 401 from any query or mutation means the stored token is dead — drop the
// session so the app falls back to the login screen instead of failing quietly.
function onAuthError(error: unknown) {
  if (isUnauthorized(error)) useAuthStore.getState().clear();
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onAuthError }),
  mutationCache: new MutationCache({ onError: onAuthError }),
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
