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
import { trustedOrigins } from '../config/origins.ts';
import * as authSchema from '../db/auth-schema.ts';
import { db } from '../db/index.ts';

const developmentSecret = 'dev-only-change-before-deploying';
const secret = process.env.BETTER_AUTH_SECRET?.trim() || developmentSecret;

if (process.env.NODE_ENV === 'production' && secret === developmentSecret) {
  throw new Error('BETTER_AUTH_SECRET must be set to a unique value in production');
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together');
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  trustedOrigins,
  secret,
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  plugins: [bearer()],
});
