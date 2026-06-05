import { describe, expect, it } from 'vitest';
import { app } from './index.ts';

/**
 * These exercise the routing/auth wiring without a database connection
 * (the postgres client connects lazily, only on the first query).
 */
describe('@basalt/api', () => {
  it('GET /health returns ok', async () => {
    const res = await app.handle(new Request('http://localhost/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('GET /api/me without a token is unauthorized', async () => {
    const res = await app.handle(new Request('http://localhost/api/me'));
    expect(res.status).toBe(401);
  });

  it('GET /api/projects without a token is unauthorized', async () => {
    const res = await app.handle(new Request('http://localhost/api/projects'));
    expect(res.status).toBe(401);
  });
});
