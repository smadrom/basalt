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
