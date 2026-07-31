import { initI18n, useAuthStore } from '@basalt/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from '../App.tsx';
import { restoreSession } from '../lib/api.ts';
import { queryClient } from '../lib/queryClient.ts';

vi.mock('../lib/api.ts', () => ({
  restoreSession: vi.fn(),
  signOut: vi.fn(),
}));

const restoreSessionMock = vi.mocked(restoreSession);

beforeAll(() => {
  initI18n('en');
});

afterEach(async () => {
  // Wrap in act: tests unmount only in RTL's cleanup hook (which runs after
  // this one), so store updates here would otherwise hit the still-mounted
  // App outside act and trigger act() warnings.
  await act(async () => {
    useAuthStore.getState().clear();
  });
  vi.clearAllMocks();
});

describe('App', () => {
  it('renders the login screen when unauthenticated', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
    // getByText / getByRole throw if the element is absent, so reaching the
    // assertions already proves the login screen rendered.
    expect(screen.getByText('Basalt')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('offers a retry screen when the API is unavailable during session restore', async () => {
    restoreSessionMock.mockResolvedValue('unavailable');
    useAuthStore.getState().setSession('saved-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });
    useAuthStore.getState().setUser(null);

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
    await act(async () => {});

    expect(screen.getByText('Service unavailable')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await act(async () => {});

    expect(restoreSessionMock).toHaveBeenCalledTimes(2);
  });

  it('syncs the document lang with the active locale', async () => {
    document.documentElement.lang = 'ru';

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
  });

  it('disables the retry button while restoring', async () => {
    restoreSessionMock.mockResolvedValueOnce('unavailable');
    let resolveRetry: (value: 'unavailable') => void = () => {};
    restoreSessionMock.mockReturnValueOnce(
      new Promise<'unavailable'>((resolve) => {
        resolveRetry = resolve;
      }),
    );
    useAuthStore.getState().setSession('saved-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });
    useAuthStore.getState().setUser(null);

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    const retry = await screen.findByRole('button', { name: 'Retry' });
    fireEvent.click(retry);

    await waitFor(() => expect(retry).toBeDisabled());
    resolveRetry('unavailable');
    await waitFor(() => expect(retry).toBeEnabled());

    // Clear the session inside act so the shared afterEach teardown doesn't
    // fire store updates at the still-mounted App outside act.
    await act(async () => {
      useAuthStore.getState().clear();
    });
  });

  it('survives a rejected session restore', async () => {
    restoreSessionMock.mockRejectedValue(new Error('boom'));
    useAuthStore.getState().setSession('saved-token', {
      id: 'user-1',
      name: 'Pavel',
      email: 'pavel@example.com',
    });
    useAuthStore.getState().setUser(null);

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Service unavailable')).toBeTruthy();
  });
});
