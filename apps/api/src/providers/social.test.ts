import { afterEach, describe, expect, it, vi } from 'vitest';

async function importSocial() {
  vi.resetModules();
  return import('./social.ts');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('social provider', () => {
  it('exposes the google driver when both credentials are set', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret');

    const { social } = await importSocial();

    expect(social()).toEqual({
      google: { clientId: 'google-id', clientSecret: 'google-secret' },
    });
  });

  it('returns an empty registry when unconfigured', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    const { social } = await importSocial();

    expect(social()).toEqual({});
  });
});
