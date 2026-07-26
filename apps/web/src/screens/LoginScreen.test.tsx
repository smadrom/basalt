import { initI18n } from '@basalt/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen.tsx';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock('../lib/api.ts', () => ({
  signIn: mocks.signIn,
  signUp: mocks.signUp,
}));

beforeAll(() => {
  initI18n('en');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LoginScreen', () => {
  it('labels the sign-in fields accessibly', () => {
    render(<LoginScreen />);

    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.queryByLabelText('Name')).toBeNull();
  });

  it('reveals the labeled name field in sign-up mode', () => {
    render(<LoginScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Need an account? Sign up' }));

    expect(screen.getByLabelText('Name')).toBeTruthy();
  });

  it('announces submission errors via role="alert"', async () => {
    mocks.signIn.mockRejectedValue(new Error('nope'));
    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'pavel@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  });
});
