import { useAuthStore } from '@basalt/shared';
import { afterEach, describe, expect, it } from 'vitest';
import { queryClient } from './queryClient.ts';

const demoUser = { id: 'user-1', name: 'Pavel', email: 'pavel@example.com' };

afterEach(() => {
  useAuthStore.getState().clear();
  queryClient.clear();
});

describe('queryClient auth handling', () => {
  it('clears the session when a query fails with 401', async () => {
    useAuthStore.getState().setSession('expired-token', demoUser);

    await expect(
      queryClient.fetchQuery({
        queryKey: ['test-401'],
        queryFn: () => Promise.reject({ status: 401 }),
        retry: false,
      }),
    ).rejects.toEqual({ status: 401 });

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('keeps the session on non-auth errors', async () => {
    useAuthStore.getState().setSession('valid-token', demoUser);

    await expect(
      queryClient.fetchQuery({
        queryKey: ['test-500'],
        queryFn: () => Promise.reject({ status: 500 }),
        retry: false,
      }),
    ).rejects.toEqual({ status: 500 });

    expect(useAuthStore.getState().token).toBe('valid-token');
  });

  it('does not retry a 401', async () => {
    let calls = 0;
    await expect(
      queryClient.fetchQuery({
        queryKey: ['test-401-no-retry'],
        queryFn: () => {
          calls += 1;
          return Promise.reject({ status: 401 });
        },
      }),
    ).rejects.toEqual({ status: 401 });

    expect(calls).toBe(1);
  });

  it('retries a transient failure once', async () => {
    let calls = 0;
    await expect(
      queryClient.fetchQuery({
        queryKey: ['test-500-retry'],
        queryFn: () => {
          calls += 1;
          return Promise.reject({ status: 500 });
        },
      }),
    ).rejects.toEqual({ status: 500 });

    expect(calls).toBe(2);
  });
});
