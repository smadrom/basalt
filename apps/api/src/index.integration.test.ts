import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { user } from './db/auth-schema.ts';
import { closeDatabase, db } from './db/index.ts';
import { app } from './index.ts';

const email = `integration-${randomUUID()}@example.com`;
const password = 'integration-password-123';

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

describe('authenticated project workflow', () => {
  afterAll(async () => {
    try {
      await db.delete(user).where(eq(user.email, email));
    } finally {
      await closeDatabase();
    }
  });

  it('registers a user and completes the project CRUD flow', async () => {
    const signUpResponse = await request('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Integration Test',
        email,
        password,
      }),
    });

    expect(signUpResponse.status).toBe(200);

    const signUp = (await signUpResponse.json()) as {
      token?: string;
      user: { id: string; email: string };
    };
    const token = signUp.token ?? signUpResponse.headers.get('set-auth-token');

    expect(signUp.user.email).toBe(email);
    expect(token).toBeTruthy();

    const createResponse = await request(
      '/api/projects',
      {
        method: 'POST',
        body: JSON.stringify({ name: 'CI smoke project' }),
      },
      token!,
    );

    expect(createResponse.status).toBe(201);

    const project = (await createResponse.json()) as {
      id: string;
      name: string;
      ownerId: string;
    };

    expect(project.name).toBe('CI smoke project');
    expect(project.ownerId).toBe(signUp.user.id);

    const listResponse = await request('/api/projects', {}, token!);

    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual({
      data: [expect.objectContaining({ id: project.id, name: project.name })],
    });

    const deleteResponse = await request(
      `/api/projects/${project.id}`,
      { method: 'DELETE' },
      token!,
    );

    expect(deleteResponse.status).toBe(200);
    expect(await deleteResponse.json()).toEqual({ deleted: true });

    const emptyListResponse = await request('/api/projects', {}, token!);

    expect(emptyListResponse.status).toBe(200);
    expect(await emptyListResponse.json()).toEqual({ data: [] });

    const signOutResponse = await request('/api/auth/sign-out', { method: 'POST' }, token!);

    expect(signOutResponse.status).toBe(200);

    const authenticatedResponse = await request('/api/me', {}, token!);

    expect(authenticatedResponse.status).toBe(401);
  });
});
