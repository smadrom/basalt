/**
 * Baseline security headers on every response. Intentionally no
 * Content-Security-Policy: a strict CSP breaks Swagger UI in development,
 * and an API-only service gets most of the value from the headers below.
 */
import { Elysia } from 'elysia';

export const securityHeaders = new Elysia({ name: 'security-headers' })
  // onRequest, not onAfterHandle/mapResponse: post-handler hooks are skipped
  // when the handler throws and when a resolve macro short-circuits — the
  // auth macro's 401 returns before mapResponse ever runs (verified on
  // Elysia 1.4.29). Seeding set.headers up front means every response-
  // building path — success, macro short-circuit, onError — merges them.
  .onRequest(({ set }) => {
    set.headers['x-content-type-options'] = 'nosniff';
    set.headers['x-frame-options'] = 'DENY';
    set.headers['referrer-policy'] = 'no-referrer';
    set.headers['permissions-policy'] = 'camera=(), microphone=(), geolocation=()';
  })
  // Elysia hooks are local to their plugin by default; cast to global so the
  // hook applies to every route of any app that `.use()`s this plugin.
  .as('global');
