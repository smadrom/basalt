/**
 * Centralized, fail-fast environment configuration.
 *
 * Every module that needs process.env reads it from here. Validation runs at
 * import time: in production a missing or invalid variable crashes the process
 * with a clear message instead of silently falling back to a local default.
 * Outside production the fallbacks keep the zero-config quick start working.
 */
const isProduction = process.env.NODE_ENV === 'production';

const developmentSecret = 'dev-only-change-before-deploying';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[config] ${name} must be set when NODE_ENV=production`);
  return value;
}

function optional(name: string, developmentFallback: string): string {
  if (isProduction) return required(name);
  return process.env[name]?.trim() || developmentFallback;
}

function parsePort(value: string | undefined): number {
  const port = Number(value?.trim() || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`[config] PORT must be an integer between 1 and 65535, got "${value}"`);
  }
  return port;
}

function betterAuthSecret(): string {
  const secret = optional('BETTER_AUTH_SECRET', developmentSecret);
  if (isProduction && secret === developmentSecret) {
    throw new Error(
      '[config] BETTER_AUTH_SECRET must not use the development default in production',
    );
  }
  return secret;
}

function googleOAuth(): { clientId: string; clientSecret: string } | undefined {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (Boolean(clientId) !== Boolean(clientSecret)) {
    throw new Error(
      '[config] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together',
    );
  }
  if (!clientId || !clientSecret) return undefined;
  return { clientId, clientSecret };
}

export const env = {
  isProduction,
  port: parsePort(process.env.PORT),
  databaseUrl: optional('DATABASE_URL', 'postgres://basalt:basalt@127.0.0.1:5432/basalt'),
  betterAuthUrl: optional('BETTER_AUTH_URL', 'http://localhost:3001'),
  betterAuthSecret: betterAuthSecret(),
  google: googleOAuth(),
} as const;
