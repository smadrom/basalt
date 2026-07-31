/**
 * Better Auth — email/password + bearer-token sessions on Elysia + Drizzle.
 *
 * Bearer (not cookie) is the default so the API stays stateless and works
 * cross-origin: the web client stores the token in localStorage and sends it as
 * `Authorization: Bearer <token>`. Schema is owned by Drizzle migrations
 * (`bun run db:generate` to author, `bun run db:migrate` to apply).
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { env } from '../config/env.ts';
import { trustedOrigins } from '../config/origins.ts';
import * as authSchema from '../db/auth-schema.ts';
import { db } from '../providers/database.ts';

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  trustedOrigins,
  secret: env.betterAuthSecret,
  database: drizzleAdapter(db(), { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
  // Explicit session policy (these are better-auth's defaults, pinned so they
  // can't drift silently): 7-day expiry, refreshed at most once a day. Expired
  // rows are deleted lazily — only when an expired token is presented — so
  // abandoned sessions still accumulate; if the table's growth ever matters,
  // schedule a periodic `DELETE FROM session WHERE expires_at < now()`.
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  socialProviders: env.google
    ? {
        google: {
          clientId: env.google.clientId,
          clientSecret: env.google.clientSecret,
        },
      }
    : undefined,
  plugins: [bearer()],
  // Brute-force protection on credential endpoints. `enabled: true` is
  // explicit because the default is production-only. Memory storage is
  // per-instance — for multi-instance deployments switch to secondary
  // storage (e.g. Redis) via better-auth's `secondaryStorage` option.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 10 },
      '/sign-up/email': { window: 60, max: 10 },
    },
  },
});
