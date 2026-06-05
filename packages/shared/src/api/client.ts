import { treaty, type Treaty } from '@elysiajs/eden';
import type { App } from '@basalt/api';

/**
 * Typed API client (Eden Treaty) — zero codegen.
 *
 * The `App` type is imported from `@basalt/api`, so every route, body and
 * response is type-checked at compile time on the web side. Bearer-token auth
 * is threaded in via a `getToken` callback so the storage mechanism (localStorage,
 * memory, cookie) stays a concern of the host app, not this package.
 */
export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null | undefined;
}

export function createApiClient({ baseUrl, getToken }: ApiClientOptions): Treaty.Create<App> {
  return treaty<App>(baseUrl, {
    headers() {
      const token = getToken?.();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;
