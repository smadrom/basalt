import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { user } from './db/auth-schema.ts';
import { closeDatabase, db } from './db/index.ts';
import { app } from './index.ts';

const email = `integration-${randomUUID()}@example.com`;
const password = 'integration-password-123';
const emailsToDelete = [email];

const request = (path: string, init: RequestInit = {}, token?: string) => {
  const headers = new Headers(init.headers);

  headers.set('origin', 'http://localhost:5173');

  if (init.body) {
    headers.set('content-type', 'application/json');
  }

  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }

  return app.handle(
    new Request(`http://localhost:3001${path}`, {
      ...init,
      headers,
    }),
  );
};

/** Registers a throwaway user, marks it for cleanup, returns token + profile. */
async function signUp(email: string) {
  emailsToDelete.push(email);
  const res = await request('/api/auth/sign-up/email', {
    method: 'POST',
    body: JSON.stringify({ name: 'Integration Test', email, password }),
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as {
    token?: string;
    user: { id: string; email: string };
  };
  const token = body.token ?? res.headers.get('set-auth-token');
  expect(token).toBeTruthy();
  return { token: token!, user: body.user };
}

describe('authenticated project workflow', () => {
  afterAll(async () => {
    try {
      for (const entry of emailsToDelete) {
        await db.delete(user).where(eq(user.email, entry));
      }
    } finally {
      await closeDatabase();
    }
  });

  it('registers a user and completes the project CRUD flow', async () => {
    const { token, user: signedUp } = await signUp(email);

    expect(signedUp.email).toBe(email);

    const createResponse = await request(
      '/api/projects',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'CI smoke project' }),
      },
      token,
    );

    expect(createResponse.status).toBe(201);

    const project = (await createResponse.json()) as {
      id: string;
      name: string;
      ownerId: string;
    };

    expect(project.name).toBe('CI smoke project');
    expect(project.ownerId).toBe(signedUp.id);

    const listResponse = await request('/api/projects', {}, token);

    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual({
      data: [expect.objectContaining({ id: project.id, name: project.name })],
    });

    const deleteResponse = await request(
      `/api/projects/${project.id}`,
      { method: 'DELETE' },
      token,
    );

    expect(deleteResponse.status).toBe(200);
    expect(await deleteResponse.json()).toEqual({ deleted: true });

    const emptyListResponse = await request('/api/projects', {}, token);

    expect(emptyListResponse.status).toBe(200);
    expect(await emptyListResponse.json()).toEqual({ data: [] });

    const signOutResponse = await request('/api/auth/sign-out', { method: 'POST' }, token);

    expect(signOutResponse.status).toBe(200);

    const authenticatedResponse = await request('/api/me', {}, token);

    expect(authenticatedResponse.status).toBe(401);
  });

  it('scopes projects to their owner', async () => {
    const { token: ownerToken } = await signUp(`owner-${randomUUID()}@example.com`);
    const { token: strangerToken } = await signUp(`stranger-${randomUUID()}@example.com`);

    const created = await request(
      '/api/projects',
      { method: 'POST', body: JSON.stringify({ name: 'Owner only' }) },
      ownerToken,
    );
    expect(created.status).toBe(201);
    const project = (await created.json()) as { id: string };

    const strangerList = await request('/api/projects', {}, strangerToken);
    expect(strangerList.status).toBe(200);
    expect(await strangerList.json()).toEqual({ data: [] });

    const strangerDelete = await request(
      `/api/projects/${project.id}`,
      { method: 'DELETE' },
      strangerToken,
    );
    expect(strangerDelete.status).toBe(404);

    const ownerList = await request('/api/projects', {}, ownerToken);
    expect(await ownerList.json()).toEqual({
      data: [expect.objectContaining({ id: project.id })],
    });

    const ownerDelete = await request(
      `/api/projects/${project.id}`,
      { method: 'DELETE' },
      ownerToken,
    );
    expect(ownerDelete.status).toBe(200);
  });

  it('rejects invalid project names and unknown ids', async () => {
    const { token } = await signUp(`validation-${randomUUID()}@example.com`);

    const emptyName = await request(
      '/api/projects',
      { method: 'POST', body: JSON.stringify({ name: '' }) },
      token,
    );
    expect(emptyName.status).toBe(422);

    const tooLong = await request(
      '/api/projects',
      { method: 'POST', body: JSON.stringify({ name: 'x'.repeat(121) }) },
      token,
    );
    expect(tooLong.status).toBe(422);

    const missing = await request(`/api/projects/p_${randomUUID()}`, { method: 'DELETE' }, token);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: 'not_found' });
  });

  it('rejects unauthenticated project requests', async () => {
    const res = await request('/api/projects');

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('rate limits repeated sign-in attempts from the same client', async () => {
    let lastStatus = 0;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const res = await request('/api/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({
          email: `brute-${randomUUID()}@example.com`,
          password: 'wrong-password-123',
        }),
      });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
