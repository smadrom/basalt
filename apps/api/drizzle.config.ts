import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit owns the full schema (Better Auth tables + app domain tables).
 *
 *   bun run db:generate   # emit SQL migrations into ./drizzle
 *   bun run db:migrate    # apply them
 *   bun run db:push       # fast push (dev only)
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/db/auth-schema.ts', './src/db/schema.ts'],
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://basalt:basalt@127.0.0.1:5432/basalt',
  },
});
