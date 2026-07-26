/** Narrows an unknown thrown value to an HTTP-ish error with a status code. */
export function hasHttpStatus(error: unknown, status: number): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === status
  );
}

/** Eden Treaty throws `{ status, value }` objects; 401 means the token is dead. */
export function isUnauthorized(error: unknown): boolean {
  return hasHttpStatus(error, 401);
}

export type AuthErrorCode =
  | 'INVALID_EMAIL_OR_PASSWORD'
  | 'USER_ALREADY_EXISTS'
  | 'NETWORK'
  | 'UNKNOWN';

/** Typed auth failure. Lives here (not in api.ts) so tests can mock api.ts and still construct it. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
  }
}

/** Maps an auth failure to its i18n message key (LoginScreen renders `t(authErrorKey(e))`). */
export function authErrorKey(error: unknown): string {
  if (!(error instanceof AuthError)) return 'auth.error';
  switch (error.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'auth.invalidCredentials';
    case 'USER_ALREADY_EXISTS':
      return 'auth.emailTaken';
    case 'NETWORK':
      return 'auth.unavailable';
    default:
      return 'auth.error';
  }
}
