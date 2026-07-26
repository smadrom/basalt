/**
 * Drizzle client. DATABASE_URL is the single connection source (see .env.example).
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.ts';
import * as authSchema from './auth-schema.ts';
import * as appSchema from './schema.ts';

const schema = { ...authSchema, ...appSchema };

const client = postgres(env.databaseUrl, { prepare: false });

export const db = drizzle(client, { schema });

export const closeDatabase = async () => {
  await client.end({ timeout: 1 });
};

export { schema };
