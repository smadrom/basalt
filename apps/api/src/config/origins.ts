/**
 * Origins the API trusts for CORS and Better Auth redirects.
 *
 * Local dev origins are added automatically outside production. In production
 * the list comes from BETTER_AUTH_TRUSTED_ORIGINS and is validated at import
 * time: an empty list or a malformed entry crashes the process with a clear
 * message instead of silently rejecting every browser request.
 */
const isProduction = process.env.NODE_ENV === 'production';

const localOrigins = isProduction ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// scheme + host + optional port — no path, credentials or whitespace.
const ORIGIN_PATTERN = /^https?:\/\/[a-z0-9.-]+(:\d+)?$/i;

function parseConfigured(): string[] {
  return (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      const normalized = origin.replace(/\/+$/, '');
      if (!ORIGIN_PATTERN.test(normalized)) {
        throw new Error(
          `[config] BETTER_AUTH_TRUSTED_ORIGINS entry "${origin}" is not a valid origin (expected e.g. https://app.example.com)`,
        );
      }
      return normalized;
    });
}

const configuredOrigins = parseConfigured();

if (isProduction && configuredOrigins.length === 0) {
  throw new Error(
    '[config] BETTER_AUTH_TRUSTED_ORIGINS must list at least one origin when NODE_ENV=production',
  );
}

export const trustedOrigins = [...new Set([...localOrigins, ...configuredOrigins])];
