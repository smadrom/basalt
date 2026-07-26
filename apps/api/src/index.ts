/**
 * @basalt/api — Elysia API on Bun.
 *
 * - Better Auth (email/password + bearer) mounted at /api/auth/*
 * - Drizzle ORM over Postgres (DATABASE_URL)
 * - Built-in OpenAPI + Swagger UI at /openapi
 * - Exports the `App` type for Eden Treaty — typed client on the web, no codegen.
 */
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { betterAuthPlugin } from './auth/plugin.ts';
import { env } from './config/env.ts';
import { trustedOrigins } from './config/origins.ts';
import { projectsRoutes } from './routes/projects.ts';

export const app = new Elysia()
  .use(
    cors({
      origin: trustedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
      credentials: false,
      maxAge: 600,
    }),
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Basalt API',
          version: '0.1.0',
          description: 'Elysia + Better Auth + Drizzle starter.',
        },
      },
    }),
  )
  .get('/health', () => ({ status: 'ok' }), { detail: { summary: 'Health check' } })
  .use(betterAuthPlugin)
  .get('/api/me', ({ user }) => user, {
    auth: true,
    detail: { summary: 'Current authenticated user' },
  })
  .use(projectsRoutes);

/** App type for Eden Treaty (imported by @basalt/shared). */
export type App = typeof app;

if (import.meta.main) {
  app.listen(env.port);
  console.log(`🪨  @basalt/api on http://localhost:${env.port}  (OpenAPI: /openapi)`);
}
