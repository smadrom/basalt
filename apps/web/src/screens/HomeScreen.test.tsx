import { initI18n, useAuthStore } from '@basalt/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HomeScreen } from './HomeScreen.tsx';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

vi.mock('../lib/api.ts', () => ({
  signOut: vi.fn(),
  api: {
    api: {
      projects: Object.assign(() => ({ delete: mocks.del }), {
        get: mocks.get,
        post: mocks.post,
      }),
    },
  },
}));

const demoProject = {
  id: 'p_1',
  ownerId: 'user-1',
  name: 'Demo',
  createdAt: '2026-07-25T00:00:00.000Z',
};

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
}

beforeAll(() => {
  initI18n('en');
});

afterEach(() => {
  useAuthStore.getState().clear();
  vi.clearAllMocks();
});

describe('HomeScreen', () => {
  it('renders the project list after loading', async () => {
    mocks.get.mockResolvedValue({ data: { data: [demoProject] }, error: undefined });

    renderHome();

    expect(await screen.findByText('Demo')).toBeTruthy();
  });

  it('shows an error with a working retry when loading fails', async () => {
    mocks.get.mockResolvedValue({ data: null, error: { status: 500, value: 'boom' } });

    renderHome();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load projects."),
    );

    mocks.get.mockResolvedValue({ data: { data: [demoProject] }, error: undefined });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Demo')).toBeTruthy();
  });

  it('shows an alert when project creation fails', async () => {
    mocks.get.mockResolvedValue({ data: { data: [] }, error: undefined });
    mocks.post.mockResolvedValue({ data: null, error: { status: 500, value: 'boom' } });

    renderHome();

    fireEvent.change(screen.getByPlaceholderText('Project name'), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent("Couldn't create the project."),
    );
  });
});
