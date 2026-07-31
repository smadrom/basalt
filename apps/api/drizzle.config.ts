import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit owns the full schema (Better Auth tables + app domain tables).
 *
 *   bun run db:generate   # emit SQL migrations into ./drizzle
 *   bun run db:migrate    # apply them
 *   bun run db:push       # fast push (dev only)
 */
const url = process.env.DATABASE_URL;
// The repo scripts call `drizzle-kit <subcommand>` directly, so the subcommand
// is argv[2]; exact match avoids false positives like `generate --name migrate`.
if (!url && process.argv[2] === 'migrate') {
  // A typo'd or missing env must never point migrations at the wrong database.
  throw new Error('[config] DATABASE_URL must be set explicitly for drizzle-kit migrate');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/db/auth-schema.ts', './src/db/schema.ts'],
  out: './drizzle',
  dbCredentials: {
    url: url ?? 'postgres://basalt:basalt@127.0.0.1:5432/basalt',
  },
});
