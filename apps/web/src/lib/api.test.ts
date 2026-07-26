import { useAuthStore } from '@basalt/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { restoreSession, signIn, signOut, signUp } from './api.ts';

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

describe('restoreSession', () => {
  it('restores the current user from a persisted token', async () => {
    const user = {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(user), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    useAuthStore.getState().setSession('session-token', user);
    useAuthStore.getState().setUser(null);

    await expect(restoreSession()).resolves.toBe('authenticated');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/me', {
      headers: { Authorization: 'Bearer session-token' },
    });
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('clears an expired token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    useAuthStore.getState().setSession('expired-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });

    await expect(restoreSession()).resolves.toBe('unauthenticated');
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('keeps the token when the API is temporarily unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    useAuthStore.getState().setSession('session-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });

    await expect(restoreSession()).resolves.toBe('unavailable');
    expect(useAuthStore.getState().token).toBe('session-token');
  });
});

describe('signIn', () => {
  it('rejects with a typed INVALID_EMAIL_OR_PASSWORD error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid email' }),
            { status: 401 },
          ),
        ),
    );

    await expect(signIn('a@b.c', 'x')).rejects.toMatchObject({
      name: 'AuthError',
      code: 'INVALID_EMAIL_OR_PASSWORD',
    });
  });

  it('rejects with NETWORK when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(signIn('a@b.c', 'x')).rejects.toMatchObject({
      name: 'AuthError',
      code: 'NETWORK',
    });
  });

  it('rejects with UNKNOWN for unrecognized error bodies', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 500 })));

    await expect(signIn('a@b.c', 'x')).rejects.toMatchObject({ code: 'UNKNOWN' });
  });
});

describe('signUp', () => {
  it('rejects with USER_ALREADY_EXISTS when the email is taken', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'USER_ALREADY_EXISTS', message: 'taken' }), {
          status: 422,
        }),
      ),
    );

    await expect(signUp('a@b.c', 'x', 'A')).rejects.toMatchObject({
      code: 'USER_ALREADY_EXISTS',
    });
  });
});
