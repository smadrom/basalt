/**
 * Elysia plugin that mounts the Better Auth HTTP handler (`/api/auth/*`) and
 * exposes an `auth: true` macro resolving the session from request headers.
 *
 * Named (`name: 'better-auth'`) so Elysia dedupes it across modules — both the
 * root app and individual protected route files can `.use(betterAuthPlugin)`.
 */
import { Elysia } from 'elysia';
import { auth } from './auth.ts';

export const betterAuthPlugin = new Elysia({ name: 'better-auth' })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return { user: session.user, session: session.session };
      },
    },
  });
