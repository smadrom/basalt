import { Elysia, t } from 'elysia';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from './errors.ts';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('errorHandler', () => {
  it('returns a sanitized 500 body and logs the real error server-side', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = new Elysia().use(errorHandler).get('/boom', () => {
      throw new Error('relation "projects" does not exist');
    });

    const res = await app.handle(new Request('http://localhost/boom'));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'internal_error' });
    expect(consoleError).toHaveBeenCalled();
  });

  it('does not leak internal details to the client', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = new Elysia().use(errorHandler).get('/boom', () => {
      throw new Error('password authentication failed for user "basalt"');
    });

    const res = await app.handle(new Request('http://localhost/boom'));
    const body = await res.text();

    expect(body).not.toContain('password authentication');
    expect(body).not.toContain('basalt');
  });

  it('keeps the default response for validation errors', async () => {
    const app = new Elysia().use(errorHandler).get('/typed', () => 'ok', {
      query: t.Object({ n: t.Number() }),
    });

    const res = await app.handle(new Request('http://localhost/typed?n=abc'));

    expect(res.status).toBe(422);
    expect(await res.text()).not.toBe('internal_error');
  });

  it('returns a JSON body for unknown routes', async () => {
    const app = new Elysia().use(errorHandler).get('/typed', () => 'ok');

    const res = await app.handle(new Request('http://localhost/nope'));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });
});
