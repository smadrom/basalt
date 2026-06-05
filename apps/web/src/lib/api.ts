import { type AuthUser, createApiClient, useAuthStore } from '@basalt/shared';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/** Typed Eden client; pulls the bearer token from the auth store per request. */
export const api = createApiClient({
  baseUrl,
  getToken: () => useAuthStore.getState().token,
});

interface AuthResponse {
  token: string;
  user: AuthUser;
}

async function authRequest(path: '/sign-in/email' | '/sign-up/email', body: object) {
  const res = await fetch(`${baseUrl}/api/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`auth_failed_${res.status}`);
  return (await res.json()) as AuthResponse;
}

export async function signIn(email: string, password: string) {
  const { token, user } = await authRequest('/sign-in/email', { email, password });
  useAuthStore.getState().setSession(token, user);
}

export async function signUp(email: string, password: string, name: string) {
  const { token, user } = await authRequest('/sign-up/email', { email, password, name });
  useAuthStore.getState().setSession(token, user);
}

export function signOut() {
  useAuthStore.getState().clear();
}
