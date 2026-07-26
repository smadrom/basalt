/**
 * @basalt/api — Elysia API on Bun.
 *
 * - Better Auth (email/password + bearer) mounted at /api/auth/*
 * - Drizzle ORM over Postgres (DATABASE_URL)
 * - OpenAPI + Swagger UI at /openapi (non-production only)
 * - Exports the `App` type for Eden Treaty — typed client on the web, no codegen.
 */
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { betterAuthPlugin } from './auth/plugin.ts';
import { env } from './config/env.ts';
import { trustedOrigins } from './config/origins.ts';
import { closeDatabase } from './db/index.ts';
import { errorHandler } from './plugins/errors.ts';
import { securityHeaders } from './plugins/security.ts';
import { projectsRoutes } from './routes/projects.ts';

export const app = new Elysia()
  .use(errorHandler)
  .use(securityHeaders)
  .use(
    cors({
      origin: trustedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
      credentials: false,
      maxAge: 600,
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

// API docs are a development tool — Swagger UI and the schema stay private in
// production to keep the exposed surface minimal. Registered after the chain
// so docs routes never leak into the Eden `App` type.
if (!env.isProduction) {
  app.use(
    openapi({
      documentation: {
        info: {
          title: 'Basalt API',
          version: '0.1.0',
          description: 'Elysia + Better Auth + Drizzle starter.',
        },
      },
    }),
  );
}

if (import.meta.main) {
  app.listen(env.port);
  console.log(`🪨  @basalt/api on http://localhost:${env.port}`);
  if (!env.isProduction) console.log('     OpenAPI docs: /openapi');

  const shutdown = async (signal: string) => {
    console.log(`[api] ${signal} received — closing server and database…`);
    await app.stop();
    await closeDatabase();
    process.exit(0);
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
}
