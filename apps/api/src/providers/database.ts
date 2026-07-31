/**
 * Database provider — lazy drizzle client over postgres.js.
 * DATABASE_URL is the single connection source (see .env.example).
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.ts';
import * as authSchema from '../db/auth-schema.ts';
import * as appSchema from '../db/schema.ts';

export const schema = { ...authSchema, ...appSchema };

export type Database = PostgresJsDatabase<typeof schema>;

let client: ReturnType<typeof postgres> | undefined;
let database: Database | undefined;

/** Lazy facade — created on first call; postgres.js opens TCP only on first query. */
export function db(): Database {
  if (!database) {
    client = postgres(env.databaseUrl, { prepare: false });
    database = drizzle(client, { schema });
  }
  return database;
}

export async function closeDatabase(): Promise<void> {
  await client?.end({ timeout: 1 });
  client = undefined;
  database = undefined;
}
