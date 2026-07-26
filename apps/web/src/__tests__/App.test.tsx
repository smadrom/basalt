import { initI18n, useAuthStore } from '@basalt/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from '../App.tsx';
import { restoreSession } from '../lib/api.ts';
import { queryClient } from '../lib/queryClient.ts';

vi.mock('../lib/api.ts', () => ({
  restoreSession: vi.fn(),
}));

const restoreSessionMock = vi.mocked(restoreSession);

beforeAll(() => {
  initI18n('en');
});

afterEach(() => {
  useAuthStore.getState().clear();
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

    expect(await screen.findByText('Service unavailable')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(restoreSessionMock).toHaveBeenCalledTimes(2));
  });
});
