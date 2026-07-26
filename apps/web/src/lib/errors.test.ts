import { describe, expect, it } from 'vitest';
import { AuthError, authErrorKey, hasHttpStatus, isUnauthorized } from './errors.ts';

describe('isUnauthorized', () => {
  it('matches Eden-style errors with status 401', () => {
    expect(isUnauthorized({ status: 401, value: { error: 'unauthorized' } })).toBe(true);
  });

  it('rejects other statuses and non-error shapes', () => {
    expect(isUnauthorized({ status: 500 })).toBe(false);
    expect(isUnauthorized(new Error('nope'))).toBe(false);
    expect(isUnauthorized(null)).toBe(false);
    expect(isUnauthorized(undefined)).toBe(false);
    expect(isUnauthorized('401')).toBe(false);
  });
});

describe('hasHttpStatus', () => {
  it('matches arbitrary status codes', () => {
    expect(hasHttpStatus({ status: 403 }, 403)).toBe(true);
    expect(hasHttpStatus({ status: 403 }, 401)).toBe(false);
  });
});

describe('authErrorKey', () => {
  it('maps AuthError codes to i18n keys', () => {
    expect(authErrorKey(new AuthError('INVALID_EMAIL_OR_PASSWORD'))).toBe(
      'auth.invalidCredentials',
    );
    expect(authErrorKey(new AuthError('USER_ALREADY_EXISTS'))).toBe('auth.emailTaken');
    expect(authErrorKey(new AuthError('NETWORK'))).toBe('auth.unavailable');
    expect(authErrorKey(new AuthError('UNKNOWN'))).toBe('auth.error');
  });

  it('falls back to the generic key for non-auth errors', () => {
    expect(authErrorKey(new Error('x'))).toBe('auth.error');
    expect(authErrorKey(null)).toBe('auth.error');
  });
});
