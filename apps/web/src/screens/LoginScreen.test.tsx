import { initI18n } from '@basalt/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthError } from '../lib/errors.ts';
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

  it('explains invalid credentials', async () => {
    mocks.signIn.mockRejectedValue(new AuthError('INVALID_EMAIL_OR_PASSWORD'));
    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'pavel@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password');
  });

  it('explains a taken email in sign-up mode', async () => {
    mocks.signUp.mockRejectedValue(new AuthError('USER_ALREADY_EXISTS'));
    render(<LoginScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Need an account? Sign up' }));
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'pavel@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This email is already registered');
  });

  it('explains when the service is unavailable', async () => {
    mocks.signIn.mockRejectedValue(new AuthError('NETWORK'));
    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'pavel@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Service unavailable — try again in a moment',
    );
  });

  it('hints password managers with autocomplete tokens', () => {
    render(<LoginScreen />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');

    fireEvent.click(screen.getByRole('button', { name: 'Need an account? Sign up' }));

    expect(screen.getByLabelText('Name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
  });
});
