import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit owns the full schema (Better Auth tables + app domain tables).
 *
 *   bun run db:generate   # emit SQL migrations into ./drizzle
 *   bun run db:migrate    # apply them
 *   bun run db:push       # fast push (dev only)
 */
const url = process.env.DATABASE_URL;
// drizzle-kit's subcommand is its first positional argument. Flags take values
// (`--name migrate`, `--config <path>`), and those values must not count as the
// subcommand — hence the skip list rather than a bare includes()/argv[2] check.
const VALUE_FLAGS = new Set(['--config', '--name', '--out', '--schema', '--prefix', '--driver']);
const args = process.argv.slice(2);
const command = args.find((arg, i) => !arg.startsWith('-') && !VALUE_FLAGS.has(args[i - 1]));
if (!url && command === 'migrate') {
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
