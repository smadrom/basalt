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

export async function restoreSession() {
  const { token, setUser, clear } = useAuthStore.getState();

  if (!token) return 'unauthenticated' as const;

  try {
    const response = await fetch(`${baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      clear();
      return 'unauthenticated' as const;
    }

    if (!response.ok) return 'unavailable' as const;

    setUser((await response.json()) as AuthUser);
    return 'authenticated' as const;
  } catch {
    return 'unavailable' as const;
  }
}

export async function signOut() {
  const { token, clear } = useAuthStore.getState();
  try {
    if (token) {
      await fetch(`${baseUrl}/api/auth/sign-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Local sign-out must still work when the API is unavailable.
  } finally {
    clear();
  }
}
