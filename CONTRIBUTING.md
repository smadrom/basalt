# Contributing to Basalt

Thanks for your interest in improving Basalt! This project is a starter base, so
the bar is "clean, typed, and tested" rather than feature-complete.

## Development setup

```bash
bun install
cp .env.example .env
bun run db:up        # local Postgres via Docker
```

## Before you open a PR

Run the full check locally — CI runs the same gates:

```bash
bun run audit        # high and critical dependency advisories
bun run lint         # Biome (lint + format check)
bun run typecheck    # tsc across all workspaces
bun run test         # Vitest across all workspaces
bun run build        # tsc + vite build
```

Or run the same publication check with `bun run verify`.

Changes to authentication, migrations, or API persistence should also be checked
against a running PostgreSQL instance:

```bash
bun run db:migrate
bun run test:integration
```

Auto-fix formatting and safe lint issues:

```bash
bun run format
```

## Conventions

- **TypeScript strict** everywhere; no `any` unless justified with a comment.
- **Tests are required** for new behaviour (api routes, shared contracts, web logic).
- **Keep the boundaries clean:** `apps/web` and `apps/api` talk only through the
  `App` type exported by `@basalt/api` and re-exported via `@basalt/shared`.
- **Conventional-ish commits** are appreciated (`feat:`, `fix:`, `chore:`, `docs:`)
  but not enforced.

## Reporting bugs / requesting features

Use the issue templates. Include reproduction steps and your `bun --version`.
