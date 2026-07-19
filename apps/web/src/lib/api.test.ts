import { useAuthStore } from '@basalt/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { signOut } from './api.ts';

afterEach(() => {
  useAuthStore.getState().clear();
  vi.unstubAllGlobals();
});

describe('signOut', () => {
  it('revokes the server session before clearing local state', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    useAuthStore.getState().setSession('session-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });

    await signOut();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/auth/sign-out', {
      method: 'POST',
      headers: { Authorization: 'Bearer session-token' },
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('clears local state when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    useAuthStore.getState().setSession('session-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });

    await expect(signOut()).resolves.toBeUndefined();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
