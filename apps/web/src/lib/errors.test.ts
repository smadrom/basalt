import { describe, expect, it } from 'vitest';
import { hasHttpStatus, isUnauthorized } from './errors.ts';

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
