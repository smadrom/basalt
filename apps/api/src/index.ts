/**
 * @basalt/api — Elysia API on Bun.
 *
 * - Better Auth (email/password + bearer) mounted at /api/auth/*
 * - Drizzle ORM over Postgres (DATABASE_URL)
 * - OpenAPI + Swagger UI at /openapi (non-production only)
 * - Exports the `App` type for Eden Treaty — typed client on the web, no codegen.
 */
import { openapi } from '@elysiajs/openapi';
import { env } from './config/env.ts';
import { createApp } from './providers/http.ts';
import { bootProviders, teardownProviders } from './providers/index.ts';

export const app = createApp();

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
  bootProviders();
  app.listen(env.port);
  console.log(`🪨  @basalt/api on http://localhost:${env.port}`);
  if (!env.isProduction) console.log('     OpenAPI docs: /openapi');

  const shutdown = async (signal: string) => {
    console.log(`[api] ${signal} received — closing server and database…`);
    // If app.stop() or a hung in-flight request stalls the close, force-exit.
    setTimeout(() => process.exit(1), 10_000).unref();
    await app.stop();
    await teardownProviders();
    process.exit(0);
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
}
