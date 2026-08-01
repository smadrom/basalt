/**
 * Elysia app assembly — kept apart from listen/signal handling so tests can
 * import the app without booting a server.
 */
import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { betterAuthPlugin } from './auth/plugin.ts';
import { trustedOrigins } from './config/origins.ts';
import { errorHandler } from './plugins/errors.ts';
import { securityHeaders } from './plugins/security.ts';
import { projectsRoutes } from './routes/projects.ts';

export function createApp() {
  return new Elysia()
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
}
