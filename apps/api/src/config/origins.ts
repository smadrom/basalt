const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const trustedOrigins = [...new Set([...localOrigins, ...configuredOrigins])];
