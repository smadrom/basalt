import { afterEach, describe, expect, it, vi } from 'vitest';
import { wrapAuthHandler } from './plugin.ts';

const request = () => new Request('http://localhost/api/auth/sign-in/email', { method: 'POST' });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('wrapAuthHandler', () => {
  it('passes through the auth response untouched', async () => {
    const handler = vi.fn().mockResolvedValue(Response.json({ ok: true }));

    const res = await wrapAuthHandler(handler)(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('returns a sanitized 500 when the auth handler throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = vi.fn().mockRejectedValue(new Error('database connection reset'));

    const res = await wrapAuthHandler(handler)(request());

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'internal_error' });
    expect(consoleError).toHaveBeenCalled();
  });
});
