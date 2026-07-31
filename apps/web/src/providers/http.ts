/**
 * HTTP provider — single facade for API requests: the typed Eden client
 * (`http.api`) plus raw JSON helpers (`http.get`/`http.post`) that add the
 * baseUrl and bearer token and map network failures to AuthError('NETWORK').
 */
import { createApiClient, useAuthStore } from '@basalt/shared';
import { AuthError } from '../lib/errors.ts';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const api = createApiClient({
  baseUrl,
  getToken: () => useAuthStore.getState().token,
});

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${baseUrl}${path}`, { ...init, headers });
  } catch {
    // fetch itself rejected — DNS, connection refused, CORS.
    throw new AuthError('NETWORK');
  }
}

export const http = {
  api,
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => {
    const init: RequestInit = { method: 'POST' };
    if (body !== undefined) init.body = JSON.stringify(body);
    return request(path, init);
  },
};
