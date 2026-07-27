import { afterEach, describe, expect, it, vi } from 'vitest';

const PRODUCTION_ENV = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://u:p@db.internal:5432/app',
  BETTER_AUTH_URL: 'https://api.example.com',
  BETTER_AUTH_SECRET: 'production-secret-at-least-32-characters',
};

async function importEnv() {
  vi.resetModules();
  return import('./env.ts');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('env config', () => {
  it('uses local fallbacks outside production', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('PORT', '');

    const { env } = await importEnv();

    expect(env.isProduction).toBe(false);
    expect(env.databaseUrl).toBe('postgres://basalt:basalt@127.0.0.1:5432/basalt');
    expect(env.port).toBe(3001);
  });

  it('throws in production when DATABASE_URL is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');

    await expect(importEnv()).rejects.toThrow('DATABASE_URL');
  });

  it('throws in production when the secret is the dev default', async () => {
    for (const [key, value] of Object.entries(PRODUCTION_ENV)) vi.stubEnv(key, value);
    vi.stubEnv('BETTER_AUTH_SECRET', 'dev-only-change-before-deploying');

    await expect(importEnv()).rejects.toThrow('BETTER_AUTH_SECRET');
  });

  it('accepts a valid production configuration', async () => {
    for (const [key, value] of Object.entries(PRODUCTION_ENV)) vi.stubEnv(key, value);

    const { env } = await importEnv();

    expect(env.isProduction).toBe(true);
    expect(env.databaseUrl).toBe('postgres://u:p@db.internal:5432/app');
    expect(env.betterAuthUrl).toBe('https://api.example.com');
  });

  it('rejects a non-numeric PORT', async () => {
    vi.stubEnv('PORT', 'abc');

    await expect(importEnv()).rejects.toThrow('PORT');
  });

  it('rejects an out-of-range PORT', async () => {
    vi.stubEnv('PORT', '70000');

    await expect(importEnv()).rejects.toThrow('PORT');
  });

  it('throws when only one Google credential is set', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    await expect(importEnv()).rejects.toThrow('GOOGLE_CLIENT');
  });

  it('exposes both Google credentials when configured', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret');

    const { env } = await importEnv();

    expect(env.google).toEqual({ clientId: 'google-id', clientSecret: 'google-secret' });
  });

  it('leaves Google OAuth disabled when neither credential is set', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    const { env } = await importEnv();

    expect(env.google).toBeUndefined();
  });
});
