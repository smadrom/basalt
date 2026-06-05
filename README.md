<h1 align="center">🪨 Basalt</h1>

<p align="center">
  A solid, opinionated <strong>Bun + Elysia + React (TypeScript)</strong> monorepo base
  <br />to start web/SaaS projects from — instead of scaffolding from zero every time.
</p>

<p align="center">
  <a href="https://github.com/smadrom/basalt/actions/workflows/ci.yml"><img src="https://github.com/smadrom/basalt/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Bun-1.3-black?logo=bun" alt="Bun 1.3" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
</p>

---

## Why Basalt

- **End-to-end type safety, zero codegen** — the web app imports the API's `App`
  type, so every route, body and response is checked at compile time.
- **Batteries included, domain-free** — auth, database, i18n, theming, data-fetching
  and CI are wired up; the business logic is left to you.
- **Fast feedback** — Bun + Turborepo + Biome keep install, lint, test and build snappy.

```
basalt/
├── apps/
│   ├── api/      # Elysia API on Bun: Better Auth (bearer) + Drizzle + OpenAPI
│   └── web/      # React + Vite + Tailwind + TanStack Query + i18n
├── packages/
│   └── shared/   # Eden-typed API client, zod contracts, i18n, theme tokens, auth store
├── docker/       # local Postgres
└── turbo.json    # task pipeline
```

## Stack

| Layer    | Choice |
|----------|--------|
| Runtime  | Bun 1.3 |
| Monorepo | Turborepo + Bun workspaces |
| API      | Elysia, `@elysiajs/openapi`, `@elysiajs/cors` |
| Auth     | Better Auth (email/password + bearer token) |
| DB / ORM | Postgres + Drizzle ORM / Kit |
| Web      | React 18, Vite 5, Tailwind 3, TanStack Query, react-i18next, Zustand |
| Types    | Eden Treaty — end-to-end typed client, **no codegen** |
| Tests    | Vitest |
| Quality  | Biome (lint + format), GitHub Actions CI, Dependabot |

The web app imports the API's `App` type via `@basalt/shared`, so every request,
body and response is type-checked at compile time.

## Quick start

```bash
bun install
cp .env.example .env

# local Postgres (Docker)
bun run db:up
cd apps/api && bun run db:push   # or: bun run auth:migrate + db:migrate

# dev (api on :3001, web on :5173)
bun run dev
```

API docs: http://localhost:3001/openapi

## Scripts

| Command | Does |
|---------|------|
| `bun run dev` | Run api (`:3001`) and web (`:5173`) in parallel |
| `bun run lint` | Biome lint + format check (CI gate) |
| `bun run format` | Biome auto-fix and format |
| `bun run typecheck` | `tsc` across all workspaces |
| `bun run test` | Vitest across all workspaces |
| `bun run build` | Typecheck + Vite build |
| `bun run verify` | typecheck + test + build |
| `bun run db:up` / `db:down` | Local Postgres via Docker |

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on every push and PR.

## The sample resource

`projects` is a sample owner-scoped CRUD slice wired end-to-end (DB → Elysia route
→ Eden client → React screen) to prove the stack. Delete `apps/api/src/db/schema.ts`,
`apps/api/src/routes/projects.ts`, `packages/shared/src/contracts/project.ts` and the
home screen UI once you start your own domain.

## Auth model

Sessions use **bearer tokens** (not cookies): the API stays stateless and
cross-origin-friendly. The web client stores the token in `localStorage`
(`@basalt/shared` auth store) and sends it as `Authorization: Bearer <token>`.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md). For security reports, see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © smadrom
