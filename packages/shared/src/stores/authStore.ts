import { create } from 'zustand';

const TOKEN_KEY = 'basalt.token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

function readToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function persistToken(token: string | null) {
  if (typeof localStorage === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Bearer-token session store. The token lives in localStorage (not a cookie)
 * so the API can stay stateless and cross-origin; `createApiClient` reads it
 * through `getToken: () => useAuthStore.getState().token`.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: readToken(),
  user: null,
  setSession: (token, user) => {
    persistToken(token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    persistToken(null);
    set({ token: null, user: null });
  },
}));
