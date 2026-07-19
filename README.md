# Basalt

Basalt is a compact full-stack TypeScript starter built around Bun, Elysia,
PostgreSQL, and React. It provides the parts that most small web applications
need before domain work begins: authentication, database access, a typed API
client, tests, formatting, and CI.

[![CI](https://github.com/smadrom/basalt/actions/workflows/ci.yml/badge.svg)](https://github.com/smadrom/basalt/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Included

- Bun workspaces managed with Turborepo
- Elysia API with OpenAPI documentation
- Better Auth email/password sessions with bearer-token support
- PostgreSQL access through Drizzle ORM and checked-in migrations
- React, Vite, Tailwind CSS, and TanStack Query
- End-to-end API types through Eden Treaty
- English and Russian localization with i18next
- Vitest, Biome, Dependabot, and GitHub Actions
- An authenticated `projects` CRUD example that can be replaced with your own domain

## Repository layout

```text
apps/
  api/       Elysia application, authentication, routes, and database schema
  web/       React application
packages/
  shared/    API client, contracts, localization, theme tokens, and auth state
docker/      Local PostgreSQL service
```

The web workspace imports the API's `App` type. Request bodies, route parameters,
and responses are therefore checked without generating a separate client.

## Requirements

- [Bun](https://bun.sh/) 1.3.14 or newer
- Docker or another PostgreSQL 17 instance

## Quick start

```bash
bun install
cp .env.example .env
bun run db:up
bun run db:migrate
bun run dev
```

The API starts on `http://localhost:3001`, the web application on
`http://localhost:5173`, and the OpenAPI UI is available at
`http://localhost:3001/openapi`.

`db:migrate` applies the checked-in Drizzle migrations. During schema development,
you can use `bun --cwd apps/api run db:push` instead.

## Configuration

Copy `.env.example` to `.env` and review these values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port |
| `BETTER_AUTH_URL` | Public base URL of the authentication API |
| `BETTER_AUTH_SECRET` | Session-signing secret; required in production |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Additional comma-separated web origins allowed by auth and CORS |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google login credentials |
| `VITE_API_URL` | API URL embedded in the web build |

Local development automatically permits `localhost:5173` and
`127.0.0.1:5173`. Other browser origins must be listed explicitly.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the API and web development servers |
| `bun run audit` | Fail on high or critical dependency advisories |
| `bun run lint` | Run Biome without modifying files |
| `bun run format` | Apply Biome formatting and safe fixes |
| `bun run typecheck` | Type-check all workspaces |
| `bun run test` | Run the database-free unit test suites |
| `bun run test:integration` | Run the authenticated API smoke test against PostgreSQL |
| `bun run build` | Build and type-check all workspaces |
| `bun run verify` | Run the complete publication check |
| `bun run db:up` / `bun run db:down` | Start or stop local PostgreSQL |
| `bun run db:generate` | Generate a Drizzle migration |
| `bun run db:migrate` | Apply checked-in migrations |

## Authentication notes

The example web client stores a bearer token in `localStorage` and attaches it to
API requests. This keeps the API and browser application easy to run on separate
origins, but it is a deliberate starter-project tradeoff. Applications with a
larger browser attack surface should consider same-origin, HTTP-only cookie
sessions instead.

The API refuses to start in production when the example auth secret is still in
use. CORS is restricted to the configured trusted origins.

GitHub Actions runs the normal verification gates and a separate PostgreSQL 17
smoke test. The latter applies the checked-in migrations, creates a user, and
exercises the authenticated project create/list/delete flow.

## Before deploying

- Replace the example auth secret and database credentials.
- Set the final API URL and trusted browser origins.
- Decide whether bearer tokens in browser storage fit your threat model.
- Replace the sample `projects` resource with your own schema and routes.
- Run migrations as a separate deployment step.
- Add rate limiting, email verification, observability, and backups as required by
  your application.

Basalt is an application starting point, not a hosted service or a substitute for
a deployment-specific security review.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Security reports should follow
[SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © smadrom
