import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { initI18n } from '@basalt/shared';
import { App } from '../App.tsx';
import { queryClient } from '../lib/queryClient.ts';

beforeAll(() => {
  initI18n('en');
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
});
