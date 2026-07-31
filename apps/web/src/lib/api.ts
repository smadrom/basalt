import { type AuthUser, useAuthStore } from '@basalt/shared';
import { http } from '../providers/http.ts';
import { AuthError, type AuthErrorCode } from './errors.ts';

/** Typed Eden client (kept here for existing import paths; owned by providers/http.ts). */
export const api = http.api;

interface AuthResponse {
  token: string;
  user: AuthUser;
}

async function authRequest(path: '/sign-in/email' | '/sign-up/email', body: object) {
  const res = await http.post(`/api/auth${path}`, body);

  if (!res.ok) {
    let code: AuthErrorCode = 'UNKNOWN';
    try {
      const errorBody = (await res.json()) as { code?: string };
      if (
        errorBody.code === 'INVALID_EMAIL_OR_PASSWORD' ||
        errorBody.code === 'USER_ALREADY_EXISTS'
      ) {
        code = errorBody.code;
      }
    } catch {
      // Non-JSON error body — stays UNKNOWN.
    }
    throw new AuthError(code);
  }

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
    const response = await http.get('/api/me');

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
      await http.post('/api/auth/sign-out');
    }
  } catch {
    // Local sign-out must still work when the API is unavailable.
  } finally {
    clear();
  }
}
