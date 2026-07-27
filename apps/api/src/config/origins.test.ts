import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadOrigins() {
  return (await import('./origins.ts')).trustedOrigins;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('trustedOrigins', () => {
  it('adds the local dev origins outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('BETTER_AUTH_TRUSTED_ORIGINS', '');

    expect(await loadOrigins()).toEqual(['http://localhost:5173', 'http://127.0.0.1:5173']);
  });

  it('throws in production when no trusted origin is configured', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BETTER_AUTH_TRUSTED_ORIGINS', '');

    await expect(loadOrigins()).rejects.toThrow('BETTER_AUTH_TRUSTED_ORIGINS');
  });

  it('strips trailing slashes and dedupes configured origins', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BETTER_AUTH_TRUSTED_ORIGINS', 'https://app.example.com/, https://app.example.com');

    expect(await loadOrigins()).toEqual(['https://app.example.com']);
  });

  it('rejects malformed entries with a naming error', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BETTER_AUTH_TRUSTED_ORIGINS', 'app.example.com');

    await expect(loadOrigins()).rejects.toThrow('app.example.com');
  });
});
