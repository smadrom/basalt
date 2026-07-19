/**
 * Drizzle client. DATABASE_URL is the single connection source (see .env.example).
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as authSchema from './auth-schema.ts';
import * as appSchema from './schema.ts';

const schema = { ...authSchema, ...appSchema };

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://basalt:basalt@127.0.0.1:5432/basalt';

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

export const closeDatabase = async () => {
  await client.end({ timeout: 1 });
};

export { schema };
