# Basalt

A solid, opinionated **Bun + Elysia + React (TypeScript)** monorepo base to start web/SaaS projects from — instead of scaffolding from zero every time.

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

## Verify

```bash
bun run typecheck   # all workspaces
bun run test        # all workspaces
bun run build
```

## The sample resource

`projects` is a sample owner-scoped CRUD slice wired end-to-end (DB → Elysia route
→ Eden client → React screen) to prove the stack. Delete `apps/api/src/db/schema.ts`,
`apps/api/src/routes/projects.ts`, `packages/shared/src/contracts/project.ts` and the
home screen UI once you start your own domain.

## Auth model

Sessions use **bearer tokens** (not cookies): the API stays stateless and
cross-origin-friendly. The web client stores the token in `localStorage`
(`@basalt/shared` auth store) and sends it as `Authorization: Bearer <token>`.
