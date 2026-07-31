/**
 * Drizzle client. DATABASE_URL is the single connection source (see .env.example).
 * Implementation lives in ../providers/database.ts — this shim keeps the old
 * import path working.
 */
export { closeDatabase, db, schema } from '../providers/database.ts';
