/**
 * Global handler for unhandled errors. The real error is logged server-side;
 * the client gets a sanitized, consistent `{ error }` body. Internal details
 * (SQL errors, connection failures, stack traces) must never leak.
 *
 * Unknown routes get a 404 `{ error: 'not_found' }` in the same shape.
 * Validation and parse errors keep Elysia's default responses — those are
 * safe and useful to callers.
 */
import { Elysia } from 'elysia';

export const errorHandler = new Elysia({ name: 'error-handler' })
  .onError(({ code, error, request, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'not_found' };
    }
    if (code === 'INTERNAL_SERVER_ERROR' || code === 'UNKNOWN') {
      console.error(`[api] ${request.method} ${new URL(request.url).pathname} failed:`, error);
      set.status = 500;
      return { error: 'internal_error' };
    }
  })
  // Elysia hooks are local to their plugin by default; cast to global so the
  // hook applies to every route of any app that `.use()`s this plugin.
  .as('global');
