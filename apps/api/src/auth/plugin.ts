/**
 * Elysia plugin that mounts the Better Auth HTTP handler (`/api/auth/*`) and
 * exposes an `auth: true` macro resolving the session from request headers.
 *
 * Named (`name: 'better-auth'`) so Elysia dedupes it across modules — both the
 * root app and individual protected route files can `.use(betterAuthPlugin)`.
 */
import { Elysia } from 'elysia';
import { auth } from './auth.ts';

type AuthFetchHandler = (request: Request) => Promise<Response>;

/**
 * `.mount` is a raw fetch pass-through — errors thrown inside the auth handler
 * never reach the global errorHandler plugin. Wrap it so `/api/auth/*` keeps
 * the same sanitized-500 contract as the rest of the API.
 */
export function wrapAuthHandler(handler: AuthFetchHandler): AuthFetchHandler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error(
        `[api] ${request.method} ${new URL(request.url).pathname} auth handler failed:`,
        error,
      );
      return Response.json({ error: 'internal_error' }, { status: 500 });
    }
  };
}

export const betterAuthPlugin = new Elysia({ name: 'better-auth' })
  .mount(wrapAuthHandler(auth.handler))
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401, { error: 'unauthorized' });
        return { user: session.user, session: session.session };
      },
    },
  });
