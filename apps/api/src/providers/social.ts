/**
 * Social provider — registry of configured OAuth drivers, keyed for
 * better-auth's `socialProviders`. Adding a provider (GitHub, …) is one
 * spread line here plus its env pair in config/env.ts.
 */
import { env } from '../config/env.ts';

export interface SocialDriver {
  clientId: string;
  clientSecret: string;
}

export function social(): { google?: SocialDriver } {
  return {
    ...(env.google
      ? { google: { clientId: env.google.clientId, clientSecret: env.google.clientSecret } }
      : {}),
  };
}
