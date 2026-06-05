/**
 * Better Auth — email/password + bearer-token sessions on Elysia + Drizzle.
 *
 * Bearer (not cookie) is the default so the API stays stateless and works
 * cross-origin: the web client stores the token in localStorage and sends it as
 * `Authorization: Bearer <token>`. Apply schema with `bun run auth:migrate`.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import * as authSchema from '../db/auth-schema.ts';
import { db } from '../db/index.ts';

const localTrustedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const configuredTrustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  trustedOrigins: [...localTrustedOrigins, ...configuredTrustedOrigins],
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-secret-change-me',
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  plugins: [bearer()],
});
