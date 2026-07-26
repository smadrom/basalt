import { initI18n } from '@basalt/shared';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary.tsx';

beforeAll(() => {
  initI18n('en');
});

function Bomb(): ReactNode {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders the fallback instead of a crashed subtree', () => {
    // React logs boundary errors to console.error; keep the output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();

    vi.restoreAllMocks();
  });
});
